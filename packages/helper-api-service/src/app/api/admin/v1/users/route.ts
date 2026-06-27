import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import { UserCreateSchema, UserQuerySchema, UserUpdateSchema } from '@app/shared'
import { ErrorCode } from '@app/shared/constants'

/**
 * GET /api/admin/v1/users
 * 用户列表（分页 + 搜索）—— 仅 staff 可访问
 */
export async function GET(req: NextRequest) {
  const guardResult = await authGuard(req, 'staff')
  if ('error' in guardResult) return guardResult.error

  const { searchParams } = req.nextUrl

  // searchParams.get() 不存在时返回 null，Zod optional() 只接受 undefined
  const parsed = UserQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return fail(ErrorCode.VALIDATION_ERROR, '参数校验失败')
  }

  const { page, size, keyword, status } = parsed.data

  const where: Record<string, unknown> = {}
  if (keyword) {
    where.OR = [
      { nickname: { contains: keyword } },
      { phone: { contains: keyword } },
      { openId: { contains: keyword } },
    ]
  }
  if (status) where.userStatus = status

  const [list, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        userId: true,
        openId: true,
        nickname: true,
        avatarUrl: true,
        phone: true,
        userStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * size,
      take: size,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return ok({ list, total, page, size })
}

/**
 * POST /api/admin/v1/users
 * 管理员创建用户 —— 仅 staff 可访问
 */
export async function POST(req: NextRequest) {
  const guardResult = await authGuard(req, 'staff')
  if ('error' in guardResult) return guardResult.error

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(UserCreateSchema, body)
  if (!result.success) return result.error

  // 生成唯一 ID（admin 创建的用户没有微信 userId）
  const userId = Math.floor(Date.now() / 1000) * 100000 + Math.floor(Math.random() * 100000)
  const openId = `admin_${userId}`

  const user = await prisma.user.create({
    data: {
      userId,
      openId,
      nickname: result.data.name,
      avatarUrl: result.data.avatar || null,
      phone: result.data.phone,
    },
  })

  return ok({
    userId: Number(user.userId),
    openId: user.openId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    userStatus: user.userStatus,
    createdAt: user.createdAt,
  }, '创建成功')
}

/**
 * PUT /api/admin/v1/users/:id
 * 管理员更新指定用户资料 —— 仅 staff 可访问
 */
export async function PUT(req: NextRequest) {
  const guardResult = await authGuard(req, 'staff')
  if ('error' in guardResult) return guardResult.error

  // 从路径中提取目标用户 ID
  const idParam = req.nextUrl.pathname.split('/').pop()
  const targetUserId = parseInt(idParam || '', 10)
  if (!targetUserId || isNaN(targetUserId)) {
    return fail(ErrorCode.VALIDATION_ERROR, '缺少用户 ID')
  }

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(UserUpdateSchema, body)
  if (!result.success) return result.error

  const user = await prisma.user.update({
    where: { userId: targetUserId },
    data: result.data,
  })

  return ok({
    userId: Number(user.userId),
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    userStatus: user.userStatus,
    updatedAt: user.updatedAt,
  })
}

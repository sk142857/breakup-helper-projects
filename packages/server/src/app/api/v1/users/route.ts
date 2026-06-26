import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import { UserQuerySchema, UserUpdateSchema } from '@app/shared'
import { ErrorCode } from '@app/shared/constants'

/**
 * GET /api/v1/users
 * 用户列表（分页 + 搜索）—— 需要登录
 */
export async function GET(req: NextRequest) {
  const guardResult = await authGuard(req)
  if ('error' in guardResult) return guardResult.error

  const { searchParams } = req.nextUrl

  const parsed = UserQuerySchema.safeParse({
    page: searchParams.get('page'),
    size: searchParams.get('size'),
    keyword: searchParams.get('keyword'),
    status: searchParams.get('status'),
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
    ]
  }
  if (status) where.userStatus = status

  const [list, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        userId: true,
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
 * PUT /api/v1/users/:id
 * 更新当前用户资料 —— 需要登录
 */
export async function PUT(req: NextRequest) {
  const guardResult = await authGuard(req)
  if ('error' in guardResult) return guardResult.error

  const { userId } = guardResult.ctx

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(UserUpdateSchema, body)
  if (!result.success) return result.error

  const user = await prisma.user.update({
    where: { userId },
    data: result.data,
    select: {
      userId: true,
      nickname: true,
      avatarUrl: true,
      phone: true,
      userStatus: true,
      updatedAt: true,
    },
  })

  return ok(user, '更新成功')
}

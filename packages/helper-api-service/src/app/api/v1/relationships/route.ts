import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import {
  RelationshipCreateSchema,
  RelationshipQuerySchema,
  type RelationshipInfo,
} from '@app/shared'
import { ErrorCode } from '@app/shared/constants'
import { generateRelId } from '@/lib/idgen'

/**
 * 计算断联持续天数
 */
function calcBreakDays(startDate: Date, endDate: Date | null): number {
  const end = endDate || new Date()
  const diff = end.getTime() - startDate.getTime()
  return Math.max(0, Math.ceil(diff / 86400000))
}

/**
 * 序列化关系对象（BigInt → Number，Date → String）
 */
function serializeRel(rel: Record<string, unknown>): RelationshipInfo {
  const startDate = rel.startDate as Date
  const endDate = rel.endDate as Date | null
  return {
    relId: rel.relId as string,
    userId: Number(rel.userId),
    nickname: rel.nickname as string,
    avatarUrl: (rel.avatarUrl as string) || null,
    relType: rel.relType as string,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate ? endDate.toISOString().split('T')[0] : null,
    breakTargetDays: (rel.breakTargetDays as number) || 100,
    relStatus: (rel.relStatus as string) || 'active',
    note: (rel.note as string) || null,
    images: (rel.images as string[]) || [],
    breakDays: calcBreakDays(startDate, endDate),
    createdAt: (rel.createdAt as Date).toISOString(),
    updatedAt: (rel.updatedAt as Date).toISOString(),
  }
}

/**
 * GET /api/v1/relationships
 * 获取当前用户的感情关系列表
 */
export async function GET(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const { searchParams } = req.nextUrl
  const parsed = RelationshipQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
  })

  if (!parsed.success) {
    return fail(ErrorCode.VALIDATION_ERROR, '参数校验失败')
  }

  const { page, size, status, keyword } = parsed.data

  const where: Record<string, unknown> = { userId: BigInt(userId) }
  if (status && status !== 'all') {
    where.relStatus = status
  }
  if (keyword) {
    where.nickname = { contains: keyword }
  }

  const [list, total] = await Promise.all([
    prisma.relationship.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.relationship.count({ where }),
  ])

  return ok({
    list: list.map(serializeRel),
    total,
    page,
    size,
  })
}

/**
 * POST /api/v1/relationships
 * 创建新的感情关系
 */
export async function POST(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(RelationshipCreateSchema, body)
  if (!result.success) return result.error

  const data = result.data

  const rel = await prisma.relationship.create({
    data: {
      relId: generateRelId(),
      userId: BigInt(userId),
      nickname: data.nickname,
      avatarUrl: data.avatarUrl || null,
      relType: data.relType,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      breakTargetDays: data.breakTargetDays ?? 100,
      relStatus: data.relStatus || 'active',
      note: data.note || null,
      images: data.images || [],
    },
  })

  return ok(serializeRel(rel as unknown as Record<string, unknown>), '创建成功')
}

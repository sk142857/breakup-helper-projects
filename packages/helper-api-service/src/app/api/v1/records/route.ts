import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import {
  RecordCreateSchema,
  RecordQuerySchema,
  type RecordInfo,
} from '@app/shared'
import { ErrorCode } from '@app/shared/constants'

/**
 * 序列化记录对象
 */
function serializeRecord(rec: Record<string, unknown>): RecordInfo {
  return {
    recordId: rec.recordId as number,
    relId: rec.relId as string,
    userId: Number(rec.userId),
    recordDate: (rec.recordDate as Date).toISOString().split('T')[0],
    recMood: rec.recMood as string,
    recBkStatus: (rec.recBkStatus as string) || null,
    content: (rec.content as string) || null,
    images: (rec.images as string[]) || [],
    createdAt: (rec.createdAt as Date).toISOString(),
    updatedAt: (rec.updatedAt as Date).toISOString(),
  }
}

/**
 * GET /api/v1/records?relId=xxx&page=1&size=20
 * 获取某个感情关系下的记录列表
 */
export async function GET(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const { searchParams } = req.nextUrl
  const parsed = RecordQuerySchema.safeParse({
    relId: searchParams.get('relId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
  })

  if (!parsed.success) {
    return fail(ErrorCode.VALIDATION_ERROR, '参数校验失败')
  }

  const { relId, page, size } = parsed.data

  // 验证关系归属
  const rel = await prisma.relationship.findFirst({
    where: { relId, userId: BigInt(userId) },
  })
  if (!rel) return fail(ErrorCode.REL_NOT_FOUND)

  const [list, total] = await Promise.all([
    prisma.record.findMany({
      where: { relId, userId: BigInt(userId) },
      skip: (page - 1) * size,
      take: size,
      orderBy: { recordDate: 'desc' },
    }),
    prisma.record.count({ where: { relId, userId: BigInt(userId) } }),
  ])

  return ok({
    list: list.map(serializeRecord),
    total,
    page,
    size,
  })
}

/**
 * POST /api/v1/records
 * 创建新的断联记录
 */
export async function POST(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(RecordCreateSchema, body)
  if (!result.success) return result.error

  const data = result.data

  // 验证关系归属
  const rel = await prisma.relationship.findFirst({
    where: { relId: data.relId, userId: BigInt(userId) },
  })
  if (!rel) return fail(ErrorCode.REL_NOT_FOUND)

  // 检查同一天是否已有记录
  const recordDate = new Date(data.recordDate)
  const existing = await prisma.record.findFirst({
    where: {
      relId: data.relId,
      recordDate,
    },
  })
  if (existing) {
    return fail(ErrorCode.REL_DATE_EXISTS, '该日期已有记录，请勿重复打卡')
  }

  const rec = await prisma.record.create({
    data: {
      relId: data.relId,
      userId: BigInt(userId),
      recordDate,
      recMood: data.recMood,
      recBkStatus: data.recBkStatus || null,
      content: data.content || null,
      images: data.images || [],
    },
  })

  return ok(serializeRecord(rec as unknown as Record<string, unknown>), '打卡成功')
}

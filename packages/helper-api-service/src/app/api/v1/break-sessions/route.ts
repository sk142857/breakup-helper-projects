import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import {
  BreakSessionCreateSchema,
  BreakSessionQuerySchema,
  SessionStatusDict,
  InitiatorDict,
  type BreakSessionInfo,
} from '@app/shared'
import { generateSessionId } from '@/lib/idgen'
import { ErrorCode } from '@app/shared/constants'

/**
 * 序列化断联期对象
 */
function serializeSession(sess: Record<string, unknown>, recordCount = 0): BreakSessionInfo {
  const startDate = sess.startDate as Date
  const endDate = sess.endDate as Date | null
  const status = (sess.status as string) || 'active'
  const initiator = (sess.initiator as string) || 'self'
  return {
    sessionId: sess.sessionId as string,
    relId: sess.relId as string,
    userId: Number(sess.userId),
    initiator,
    initiatorLabel: (InitiatorDict as Record<string, string>)[initiator] || initiator,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate ? endDate.toISOString().split('T')[0] : null,
    targetDays: (sess.targetDays as number) || 100,
    status,
    statusLabel: (SessionStatusDict as Record<string, string>)[status] || status,
    note: (sess.note as string) || null,
    recordCount,
    createdAt: (sess.createdAt as Date).toISOString(),
    updatedAt: (sess.updatedAt as Date).toISOString(),
  }
}

/**
 * GET /api/v1/break-sessions?relId=xxx&status=active
 * 获取某个感情关系下的断联期列表
 */
export async function GET(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const { searchParams } = req.nextUrl
  const parsed = BreakSessionQuerySchema.safeParse({
    relId: searchParams.get('relId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return fail(ErrorCode.VALIDATION_ERROR, '参数校验失败')
  }

  const { relId, status } = parsed.data

  // 验证关系归属
  const rel = await prisma.relationship.findFirst({
    where: { relId, userId: BigInt(userId) },
  })
  if (!rel) return fail(ErrorCode.REL_NOT_FOUND)

  const where: Record<string, unknown> = { relId, userId: BigInt(userId) }
  if (status) where.status = status

  const sessions = await prisma.breakSession.findMany({
    where,
    orderBy: { startDate: 'desc' },
  })

  // 批量查询每个断联期的记录数
  const sessionsWithCount = await Promise.all(
    sessions.map(async (sess) => {
      const count = await prisma.record.count({
        where: { sessionId: sess.sessionId },
      })
      return serializeSession(sess as unknown as Record<string, unknown>, count)
    }),
  )

  return ok(sessionsWithCount)
}

/**
 * POST /api/v1/break-sessions
 * 创建新的断联期
 */
export async function POST(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(BreakSessionCreateSchema, body)
  if (!result.success) return result.error

  const data = result.data

  // 验证关系归属
  const rel = await prisma.relationship.findFirst({
    where: { relId: data.relId, userId: BigInt(userId) },
  })
  if (!rel) return fail(ErrorCode.REL_NOT_FOUND)

  const sessionId = generateSessionId()

  const session = await prisma.breakSession.create({
    data: {
      sessionId,
      relId: data.relId,
      userId: BigInt(userId),
      initiator: data.initiator || 'self',
      startDate: new Date(data.startDate),
      targetDays: data.targetDays || 100,
      note: data.note || null,
    },
  })

  return ok(
    serializeSession(session as unknown as Record<string, unknown>, 0),
    '断联期已创建',
  )
}

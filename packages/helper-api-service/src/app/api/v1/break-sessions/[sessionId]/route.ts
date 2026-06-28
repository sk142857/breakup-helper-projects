import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import {
  BreakSessionUpdateSchema,
  SessionStatusDict,
  InitiatorDict,
  type BreakSessionInfo,
} from '@app/shared'
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
 * GET /api/v1/break-sessions/[sessionId]
 * 获取断联期详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const sessionId = params.sessionId
  if (!sessionId) return fail(ErrorCode.BAD_REQUEST, '无效的断联期 ID')

  const session = await prisma.breakSession.findFirst({
    where: { sessionId, userId: BigInt(userId) },
  })
  if (!session) return fail(ErrorCode.SESSION_NOT_FOUND)

  const recordCount = await prisma.record.count({
    where: { sessionId },
  })

  return ok(serializeSession(session as unknown as Record<string, unknown>, recordCount))
}

/**
 * PUT /api/v1/break-sessions/[sessionId]
 * 更新断联期
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const sessionId = params.sessionId
  if (!sessionId) return fail(ErrorCode.BAD_REQUEST, '无效的断联期 ID')

  const existing = await prisma.breakSession.findFirst({
    where: { sessionId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.SESSION_NOT_FOUND)

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(BreakSessionUpdateSchema, body)
  if (!result.success) return result.error

  const data = result.data
  const updateData: Record<string, unknown> = {}

  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
  if (data.targetDays !== undefined) updateData.targetDays = data.targetDays
  if (data.status !== undefined) updateData.status = data.status
  if (data.note !== undefined) updateData.note = data.note || null

  const updated = await prisma.breakSession.update({
    where: { sessionId },
    data: updateData,
  })

  const recordCount = await prisma.record.count({
    where: { sessionId },
  })

  return ok(
    serializeSession(updated as unknown as Record<string, unknown>, recordCount),
    '更新成功',
  )
}

/**
 * DELETE /api/v1/break-sessions/[sessionId]
 * 删除断联期
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const sessionId = params.sessionId
  if (!sessionId) return fail(ErrorCode.BAD_REQUEST, '无效的断联期 ID')

  const existing = await prisma.breakSession.findFirst({
    where: { sessionId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.SESSION_NOT_FOUND)

  await prisma.breakSession.delete({ where: { sessionId } })

  return ok(null, '断联期已删除')
}

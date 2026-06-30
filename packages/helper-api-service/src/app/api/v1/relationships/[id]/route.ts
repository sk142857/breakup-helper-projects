import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { authGuard } from '@/lib/authGuard'
import { RelationshipUpdateSchema, type RelationshipInfo, type ImageInfo, SessionStatusDict, InitiatorDict, type BreakSessionInfo } from '@app/shared'
import { resolveImageList } from '@/lib/image'
import { ErrorCode } from '@app/shared/constants'

/**
 * 序列化关系对象
 */
function serializeRel(rel: Record<string, unknown>, recordCount = 0): RelationshipInfo {
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
    imageList: [],
    breakDays: recordCount,
    createdAt: (rel.createdAt as Date).toISOString(),
    updatedAt: (rel.updatedAt as Date).toISOString(),
  }
}

/**
 * 获取感情关系详情（同时返回最新里程碑）
 */
async function getRelationship(relId: string, userId: number) {
  const rel = await prisma.relationship.findFirst({
    where: { relId, userId: BigInt(userId) },
    include: { _count: { select: { records: true } } },
  })
  if (!rel) return null
  return serializeRel(rel as unknown as Record<string, unknown>, rel._count.records)
}

/**
 * GET /api/v1/relationships/[id]
 * 获取感情关系详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const relId = params.id
  if (!relId) return fail(ErrorCode.BAD_REQUEST, '无效的感情关系 ID')

  const rel = await getRelationship(relId, userId)
  if (!rel) return fail(ErrorCode.REL_NOT_FOUND)

  // 同时查询该关系下的最近里程碑
  const milestones = await prisma.userMilestone.findMany({
    where: { relId, userId: BigInt(userId) },
    include: { milestone: true },
    orderBy: { milestone: { days: 'asc' } },
  })

  // 查询该关系下的所有断联期
  const sessions = await prisma.breakSession.findMany({
    where: { relId, userId: BigInt(userId) },
    orderBy: { startDate: 'desc' },
  })

  const sessionsWithCount = await Promise.all(
    sessions.map(async (sess) => {
      const count = await prisma.record.count({
        where: { sessionId: sess.sessionId },
      })
      const startDate = sess.startDate as Date
      const endDate = sess.endDate as Date | null
      const status = (sess.status as string) || 'active'
      const initiator = (sess.initiator as string) || 'self'
      const sessInfo: BreakSessionInfo = {
        sessionId: sess.sessionId,
        relId: sess.relId,
        userId: Number(sess.userId),
        initiator,
        initiatorLabel: (InitiatorDict as Record<string, string>)[initiator] || initiator,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        targetDays: sess.targetDays,
        status,
        statusLabel: (SessionStatusDict as Record<string, string>)[status] || status,
        note: sess.note,
        recordCount: count,
        createdAt: sess.createdAt.toISOString(),
        updatedAt: sess.updatedAt.toISOString(),
      }
      return sessInfo
    }),
  )

  rel.imageList = await resolveImageList(rel.images)

  return ok({
    ...rel,
    achievedMilestones: milestones.map(um => ({
      umId: um.umId,
      msId: um.msId,
      days: um.milestone.days,
      title: um.milestone.title,
      emoji: um.milestone.emoji,
      achievedAt: um.achievedAt.toISOString(),
    })),
    breakSessions: sessionsWithCount,
  })
}

/**
 * PUT /api/v1/relationships/[id]
 * 更新感情关系
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const relId = params.id
  if (!relId) return fail(ErrorCode.BAD_REQUEST, '无效的感情关系 ID')

  // 验证关系归属
  const existing = await prisma.relationship.findFirst({
    where: { relId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.REL_NOT_FOUND)

  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(RelationshipUpdateSchema, body)
  if (!result.success) return result.error

  const data = result.data
  const updateData: Record<string, unknown> = {}

  if (data.nickname !== undefined) updateData.nickname = data.nickname
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null
  if (data.relType !== undefined) updateData.relType = data.relType
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
  if (data.breakTargetDays !== undefined) updateData.breakTargetDays = data.breakTargetDays
  if (data.relStatus !== undefined) updateData.relStatus = data.relStatus
  if (data.note !== undefined) updateData.note = data.note || null
  if (data.images !== undefined) updateData.images = data.images

  const updated = await prisma.relationship.update({
    where: { relId },
    data: updateData,
  })

  const updatedRel = serializeRel(
    updated as unknown as Record<string, unknown>,
  )
  updatedRel.imageList = await resolveImageList(updatedRel.images)

  return ok(updatedRel, '更新成功')
}

/**
 * DELETE /api/v1/relationships/[id]
 * 删除感情关系（同时删除关联记录和里程碑）
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const relId = params.id
  if (!relId) return fail(ErrorCode.BAD_REQUEST, '无效的感情关系 ID')

  const existing = await prisma.relationship.findFirst({
    where: { relId, userId: BigInt(userId) },
  })
  if (!existing) return fail(ErrorCode.REL_NOT_FOUND)

  // 级联删除：先删除里程碑和记录
  await prisma.userMilestone.deleteMany({ where: { relId } })
  await prisma.record.deleteMany({ where: { relId } })
  await prisma.relationship.delete({ where: { relId } })

  return ok(null, '删除成功')
}

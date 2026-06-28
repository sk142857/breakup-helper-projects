import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'
import type { MilestoneItem, UserMilestoneItem } from '@app/shared'

/**
 * GET /api/v1/milestones?relId=xxx
 * 获取里程碑列表及用户达成情况
 *
 * 参数：
 *   relId: 感情关系 ID（可选），传此参数可同时返回用户已达成的里程碑
 */
export async function GET(req: NextRequest) {
  const guard = await authGuard(req, 'user')
  if ('error' in guard) return guard.error
  const { userId } = guard.ctx

  const { searchParams } = req.nextUrl
  const relIdParam = searchParams.get('relId')

  // 查询所有里程碑
  const milestones = await prisma.milestone.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const milestoneList: MilestoneItem[] = milestones.map(m => ({
    msId: m.msId,
    days: m.days,
    title: m.title,
    emoji: m.emoji,
    sortOrder: m.sortOrder ?? 0,
  }))

  // 如果传了 relId，查询用户已达成情况
  let userMilestones: UserMilestoneItem[] = []
  if (relIdParam) {
    const relId = relIdParam
    if (relId) {
      const ums = await prisma.userMilestone.findMany({
        where: { relId, userId: BigInt(userId) },
        include: { milestone: true },
        orderBy: { milestone: { days: 'asc' } },
      })

      userMilestones = ums.map(um => ({
        umId: um.umId,
        userId: Number(um.userId),
        relId: um.relId,
        msId: um.msId,
        days: um.milestone.days,
        title: um.milestone.title,
        emoji: um.milestone.emoji,
        achievedAt: um.achievedAt.toISOString(),
      }))
    }
  }

  return ok({
    milestones: milestoneList,
    achieved: userMilestones,
  })
}

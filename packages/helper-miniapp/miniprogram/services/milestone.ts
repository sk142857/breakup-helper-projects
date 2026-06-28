import { get } from '../utils/request'

// ============ 类型定义 ============

export interface MilestoneItem {
  msId: number
  days: number
  title: string
  emoji: string | null
  sortOrder: number
}

export interface UserMilestoneItem {
  umId: number
  userId: number
  relId: string
  msId: number
  days: number
  title: string
  emoji: string | null
  achievedAt: string
}

export interface MilestoneResponse {
  milestones: MilestoneItem[]
  achieved: UserMilestoneItem[]
}

// ============ API 方法 ============

/**
 * 获取里程碑列表及用户达成情况
 */
export function getMilestones(relId?: string) {
  return get<MilestoneResponse>('/api/v1/milestones', relId ? { relId } : undefined)
}

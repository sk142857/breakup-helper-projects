// ============ 里程碑类型 ============

/** 里程碑定义 */
export interface MilestoneItem {
  msId: number
  days: number
  title: string
  emoji: string | null
  sortOrder: number
}

/** 用户里程碑达成 */
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

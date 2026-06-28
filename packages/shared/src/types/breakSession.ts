import { z } from 'zod'

// ============ 断联期状态 ============
export const SessionStatusDict = {
  active: '进行中',
  done: '已结束',
} as const

export type SessionStatus = keyof typeof SessionStatusDict

// ============ 发起方 ============
export const InitiatorDict = {
  self: '我分手',
  other: '被分手',
} as const

export type Initiator = keyof typeof InitiatorDict

// ============ Zod Schemas ============

/** 创建断联期请求 */
export const BreakSessionCreateSchema = z.object({
  relId: z.string().min(1, '关联感情不能为空'),
  startDate: z.string().min(1, '开始日期不能为空'),
  initiator: z.enum(['self', 'other']).optional().default('self'),
  targetDays: z.number().int().min(1).max(9999).optional().default(100),
  note: z.string().max(500).optional().nullable().or(z.literal('')),
})

export type BreakSessionCreate = z.infer<typeof BreakSessionCreateSchema>

/** 更新断联期请求 */
export const BreakSessionUpdateSchema = z.object({
  endDate: z.string().optional().nullable().or(z.literal('')),
  targetDays: z.number().int().min(1).max(9999).optional(),
  status: z.string().optional(),
  note: z.string().max(500).optional().nullable().or(z.literal('')),
})

export type BreakSessionUpdate = z.infer<typeof BreakSessionUpdateSchema>

/** 查询断联期列表 */
export const BreakSessionQuerySchema = z.object({
  relId: z.string().min(1),
  status: z.string().optional(),
})

export type BreakSessionQuery = z.infer<typeof BreakSessionQuerySchema>

// ============ 响应类型 ============

export interface BreakSessionInfo {
  sessionId: string
  relId: string
  userId: number
  initiator: string
  initiatorLabel: string
  startDate: string
  endDate: string | null
  targetDays: number
  status: string
  statusLabel: string
  note: string | null
  /** 该断联期的打卡记录数 */
  recordCount: number
  createdAt: string
  updatedAt: string
}

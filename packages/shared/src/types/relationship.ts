import { z } from 'zod'
import type { ImageInfo } from './upload'

// ============ 关系类型字典 ============
export const RelTypeDict = {
  first_love: '初恋',
  ex: '前任',
  crush: '暗恋',
  situationship: '暧昧对象',
  blind_date: '相亲对象',
  other: '其他',
} as const

export type RelType = keyof typeof RelTypeDict

// ============ 关系状态字典 ============
export const RelStatusDict = {
  active: '进行中',
  done: '已结束',
  paused: '暂停中',
  unknown: '不知道',
} as const

export type RelStatus = keyof typeof RelStatusDict

// ============ Zod Schemas ============

/** 创建感情关系请求 */
export const RelationshipCreateSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50字'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  relType: z.string().min(1, '关系类型不能为空'),
  startDate: z.string().min(1, '开始日期不能为空').refine(d => !isNaN(new Date(d).getTime()), '开始日期格式无效'),
  endDate: z.string().optional().or(z.literal('')).refine(d => !d || !isNaN(new Date(d).getTime()), '结束日期格式无效'),
  breakTargetDays: z.number().int().min(1).max(9999).optional().default(100),
  relStatus: z.string().optional().default('active'),
  note: z.string().max(500).optional().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
})

export type RelationshipCreate = z.infer<typeof RelationshipCreateSchema>

/** 更新感情关系请求 */
export const RelationshipUpdateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  relType: z.string().optional(),
  startDate: z.string().optional().refine(d => !d || !isNaN(new Date(d).getTime()), '开始日期格式无效'),
  endDate: z.string().optional().nullable().or(z.literal('')).refine(d => !d || !isNaN(new Date(d).getTime()), '结束日期格式无效'),
  breakTargetDays: z.number().int().min(1).max(9999).optional(),
  relStatus: z.string().optional(),
  note: z.string().max(500).optional().nullable().or(z.literal('')),
  images: z.array(z.string()).optional(),
})

export type RelationshipUpdate = z.infer<typeof RelationshipUpdateSchema>

/** 查询感情关系列表 */
export const RelationshipQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  keyword: z.string().optional(),
})

export type RelationshipQuery = z.infer<typeof RelationshipQuerySchema>

// ============ 响应类型 ============

export interface RelationshipInfo {
  relId: string
  userId: number
  nickname: string
  avatarUrl: string | null
  relType: string
  startDate: string
  endDate: string | null
  breakTargetDays: number
  relStatus: string
  note: string | null
  /** fileId 列表（兼容旧数据中的 URL 字符串） */
  images: string[]
  /** 图片详细信息（fileId → origUrl/thumbUrl 映射） */
  imageList: ImageInfo[]
  /** 断联持续天数（自动计算） */
  breakDays: number
  createdAt: string
  updatedAt: string
}

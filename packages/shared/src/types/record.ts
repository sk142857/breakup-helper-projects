import { z } from 'zod'
import type { ImageInfo } from './upload'

// ============ 心情字典 ============
export const MoodDict = {
  cry: { label: '难过', emoji: '😭' },
  sad: { label: '伤心', emoji: '😢' },
  meh: { label: '一般', emoji: '😐' },
  ok: { label: 'OK', emoji: '🙂' },
  happy: { label: '开心', emoji: '😊' },
  free: { label: '解放', emoji: '😄' },
  strong: { label: '坚定', emoji: '💪' },
  heartbreak: { label: '心碎', emoji: '💔' },
  great: { label: '很好', emoji: '😄' },
  good: { label: '不错', emoji: '😊' },
  bad: { label: '低落', emoji: '😔' },
  terrible: { label: '难受', emoji: '😭' },
} as const

export type MoodCode = keyof typeof MoodDict

// ============ 断联状态字典 ============
export const BreakStatusDict = {
  keeping: '保持断联中',
  almost: '差点破功（忍住了）',
  broken: '破功了（已联系）',
  contacted: '对方联系我了',
} as const

export type BreakStatusCode = keyof typeof BreakStatusDict

// ============ Zod Schemas ============

/** 创建记录请求 */
export const RecordCreateSchema = z.object({
  relId: z.string().min(1, '关联感情不能为空'),
  sessionId: z.string().optional().nullable(),
  recordDate: z.string().min(1, '记录日期不能为空').refine(d => !isNaN(new Date(d).getTime()), '记录日期格式无效'),
  recMood: z.string().min(1, '心情不能为空'),
  recBkStatus: z.string().optional().nullable(),
  content: z.string().max(2000).optional().nullable().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
})

export type RecordCreate = z.infer<typeof RecordCreateSchema>

/** 更新记录请求 */
export const RecordUpdateSchema = z.object({
  recMood: z.string().optional(),
  recBkStatus: z.string().optional().nullable(),
  content: z.string().max(2000).optional().nullable().or(z.literal('')),
  images: z.array(z.string()).optional(),
})

export type RecordUpdate = z.infer<typeof RecordUpdateSchema>

/** 查询记录列表 */
export const RecordQuerySchema = z.object({
  relId: z.string().min(1),
  sessionId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
})

export type RecordQuery = z.infer<typeof RecordQuerySchema>

// ============ 响应类型 ============

export interface RecordInfo {
  recordId: number
  relId: string
  sessionId: string | null
  userId: number
  recordDate: string
  recMood: string
  recMoodLabel: string
  recMoodEmoji: string
  recBkStatus: string | null
  recBkStatusLabel: string | null
  content: string | null
  /** fileId 列表（兼容旧数据中的 URL 字符串） */
  images: string[]
  /** 图片详细信息（fileId → origUrl/thumbUrl 映射） */
  imageList: ImageInfo[]
  createdAt: string
  updatedAt: string
}

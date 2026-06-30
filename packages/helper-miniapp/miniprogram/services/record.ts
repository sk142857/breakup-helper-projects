import { get, post, put, del } from '../utils/request'

// ============ 类型定义 ============

export interface ImageInfo {
  fileId: string
  origUrl: string
  thumbUrl: string | null
}

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
  images: string[]
  imageList: ImageInfo[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedList<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// ============ API 方法 ============

/**
 * 获取记录列表（按感情关系）
 */
export function getRecordList(params: { relId: string; sessionId?: string; page?: number; size?: number }) {
  return get<PaginatedList<RecordInfo>>('/api/v1/records', params)
}

/**
 * 创建记录（打卡）
 */
export function createRecord(data: {
  relId: string
  sessionId?: string
  recordDate: string
  recMood: string
  recBkStatus?: string
  content?: string
  images?: string[]
}) {
  return post<RecordInfo>('/api/v1/records', data as unknown as Record<string, unknown>)
}

/**
 * 更新记录
 */
export function updateRecord(id: number, data: Record<string, unknown>) {
  return put<RecordInfo>(`/api/v1/records/${id}`, data)
}

/**
 * 删除记录
 */
export function deleteRecord(id: number) {
  return del(`/api/v1/records/${id}`)
}

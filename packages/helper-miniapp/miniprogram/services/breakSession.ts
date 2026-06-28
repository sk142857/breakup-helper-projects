import { get, post, put, del } from '../utils/request'

// ============ 类型定义 ============

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
  recordCount: number
  createdAt: string
  updatedAt: string
}

// ============ API 方法 ============

/**
 * 获取断联期列表
 */
export function getBreakSessionList(params: { relId: string; status?: string }) {
  return get<BreakSessionInfo[]>('/api/v1/break-sessions', params)
}

/**
 * 创建断联期
 */
export function createBreakSession(data: {
  relId: string
  startDate: string
  initiator?: string
  targetDays?: number
  note?: string
}) {
  return post<BreakSessionInfo>('/api/v1/break-sessions', data as unknown as Record<string, unknown>)
}

/**
 * 更新断联期
 */
export function updateBreakSession(id: string, data: {
  endDate?: string | null
  targetDays?: number
  status?: string
  note?: string | null
}) {
  return put<BreakSessionInfo>(`/api/v1/break-sessions/${id}`, data as unknown as Record<string, unknown>)
}

/**
 * 删除断联期
 */
export function deleteBreakSession(id: string) {
  return del(`/api/v1/break-sessions/${id}`)
}

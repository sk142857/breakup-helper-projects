import { get, post, put, del } from '../utils/request'

// ============ 类型定义 ============

export interface ImageInfo {
  fileId: string
  origUrl: string
  thumbUrl: string | null
}

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
  images: string[]
  imageList: ImageInfo[]
  breakDays: number
  createdAt: string
  updatedAt: string
}

export interface RelationshipDetail extends RelationshipInfo {
  achievedMilestones: Array<{
    umId: number
    msId: number
    days: number
    title: string
    emoji: string | null
    achievedAt: string
  }>
}

export interface PaginatedList<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// ============ API 方法 ============

/**
 * 获取感情关系列表
 */
export function getRelationshipList(params?: {
  page?: number
  size?: number
  status?: string
  keyword?: string
}) {
  return get<PaginatedList<RelationshipInfo>>('/api/v1/relationships', params)
}

/**
 * 获取感情关系详情
 */
export function getRelationshipDetail(id: string) {
  return get<RelationshipDetail>(`/api/v1/relationships/${id}`)
}

/**
 * 创建感情关系
 */
export function createRelationship(data: {
  nickname: string
  avatarUrl?: string
  relType: string
  startDate: string
  endDate?: string
  breakTargetDays?: number
  relStatus?: string
  note?: string
  images?: string[]
}) {
  return post<RelationshipInfo>('/api/v1/relationships', data as unknown as Record<string, unknown>)
}

/**
 * 更新感情关系
 */
export function updateRelationship(id: string, data: Record<string, unknown>) {
  return put<RelationshipInfo>(`/api/v1/relationships/${id}`, data)
}

/**
 * 删除感情关系
 */
export function deleteRelationship(id: string) {
  return del(`/api/v1/relationships/${id}`)
}

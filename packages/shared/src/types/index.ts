export * from './auth'
export * from './sdk'

// ============ API 响应结构 ============

/** 统一 API 响应包裹 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// ============ 分页 ============

export interface PaginationParams {
  page: number
  size: number
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// ============ 用户 ============

export type UserStatus = 'active' | 'disabled'

/** 符合 t_users 表结构 */
export interface User {
  userId: number
  openId: string
  unionId: string | null
  nickname: string
  avatarUrl: string | null
  phone: string | null
  userStatus: UserStatus
  createdAt: string
  updatedAt: string
}

// ============ 通用类型 ============

/** 记录通用字段 */
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

/** 带状态的记录 */
export interface StatusEntity extends BaseEntity {
  status: 'active' | 'disabled'
}

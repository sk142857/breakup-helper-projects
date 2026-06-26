import api from './api'
import type { ApiResponse, PaginatedData, User, UserCreate, UserQuery } from '@app/shared'

/** 获取用户列表 */
export function getUserList(params: UserQuery) {
  return api.get<ApiResponse<PaginatedData<User>>>('/v1/users', { params })
}

/** 创建用户 */
export function createUser(data: UserCreate) {
  return api.post<ApiResponse<User>>('/v1/users', data)
}

/** 更新用户 */
export function updateUser(id: number, data: Partial<UserCreate>) {
  return api.put<ApiResponse<User>>(`/v1/users/${id}`, data)
}

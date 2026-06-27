import api from './api'
import type { ApiResponse } from '@app/shared'

export interface StaffLoginParams {
  username: string
  password: string
}

export interface StaffLoginResult {
  token: string
  staff: { id: number; username: string; displayName: string }
}

/** POST /api/admin/v1/auth/login */
export async function staffLogin(params: StaffLoginParams): Promise<StaffLoginResult> {
  const res = await api.post<ApiResponse<StaffLoginResult>>('/v1/auth/login', params)
  return res.data.data
}

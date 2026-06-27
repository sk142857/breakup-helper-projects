import api from './api'
import type { ApiResponse, PaginatedData } from '@app/shared'

/**
 * SDK 表查询参数
 */
export interface SdkQueryParams {
  table: string
  page?: number
  size?: number
  keyword?: string
}

/**
 * 通用 SDK 管理端分页查询
 */
export function getSdkList(params: SdkQueryParams) {
  return api.get<ApiResponse<PaginatedData<Record<string, unknown>>>>('/v1/sdk', { params })
}

import { NextResponse } from 'next/server'
import type { ApiResponse } from '@app/shared'
import { ErrorCode, ErrorMessage } from '@app/shared/constants'

/**
 * 统一成功响应
 */
export function ok<T>(data: T, message = '成功'): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: ErrorCode.SUCCESS,
    message,
    data,
    timestamp: Date.now(),
  })
}

/**
 * 统一失败响应
 */
export function fail(
  code: number = ErrorCode.INTERNAL_ERROR,
  message?: string,
  status = 200
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code,
      message: message ?? ErrorMessage[code] ?? '未知错误',
      data: null,
      timestamp: Date.now(),
    },
    { status }
  )
}

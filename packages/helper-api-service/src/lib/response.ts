import { NextResponse } from 'next/server'
import type { ApiResponse } from '@app/shared'
import { ErrorCode, ErrorMessage } from '@app/shared/constants'

/**
 * JSON 序列化前的安全转换：BigInt → Number，Date → ISO 字符串。
 */
function safeSerialize<T>(data: T): T {
  if (typeof data === 'bigint') return Number(data) as unknown as T
  if (data instanceof Date) return data.toISOString() as unknown as T
  if (Array.isArray(data)) return data.map(safeSerialize) as unknown as T
  if (data !== null && typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = safeSerialize(value)
    }
    return result as unknown as T
  }
  return data
}

/**
 * 统一成功响应
 */
export function ok<T>(data: T, message = '成功'): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: ErrorCode.SUCCESS,
    message,
    data: safeSerialize(data),
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

import { ZodSchema, ZodError } from 'zod'
import { fail } from './response'
import { ErrorCode } from '@app/shared/constants'

/**
 * Zod 校验封装 —— 校验请求体
 * 校验失败自动返回 422 错误响应
 */
export async function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = formatZodErrors(result.error)
    return {
      success: false,
      error: fail(ErrorCode.VALIDATION_ERROR, messages.join('; ')),
    }
  }
  return { success: true, data: result.data }
}

/**
 * 格式化 Zod 错误为可读字符串数组
 */
export function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((e) => {
    const path = e.path.join('.')
    return path ? `${path}: ${e.message}` : e.message
  })
}

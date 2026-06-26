/** API 错误码枚举 */
export const ErrorCode = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,

  // 业务错误码
  USER_NOT_FOUND: 10001,
  USER_PHONE_EXISTS: 10002,
  WECHAT_AUTH_FAILED: 10003,
  LOGIN_FAILED: 10004,
  INVALID_SIGNATURE: 20001,
  SIGNATURE_EXPIRED: 20002,
  NONCE_REPLAYED: 20003,
} as const

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode]

/** 错误码对应的消息 */
export const ErrorMessage: Record<number, string> = {
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '未登录或登录已过期',
  [ErrorCode.FORBIDDEN]: '无权限访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.VALIDATION_ERROR]: '参数校验失败',
  [ErrorCode.RATE_LIMITED]: '请求过于频繁',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_PHONE_EXISTS]: '手机号已存在',
  [ErrorCode.WECHAT_AUTH_FAILED]: '微信登录授权失败',
  [ErrorCode.LOGIN_FAILED]: '登录失败',
  [ErrorCode.INVALID_SIGNATURE]: '签名无效',
  [ErrorCode.SIGNATURE_EXPIRED]: '签名已过期',
  [ErrorCode.NONCE_REPLAYED]: '请求已处理，请勿重复提交',
}

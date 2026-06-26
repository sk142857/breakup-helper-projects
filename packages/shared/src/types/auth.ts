import { z } from 'zod'

// ============ 登录请求 & 响应 ============

/** POST /api/v1/auth/login 请求体 */
export const LoginRequestSchema = z.object({
  code: z.string().min(1, '临时 code 不能为空'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

/** 登录响应 */
export interface LoginResponse {
  token: string
  user: UserInfo // 引用同模块内的 UserInfo
}

// ============ 用户信息 ============

export interface UserInfo {
  userId: number
  openId: string
  unionId?: string
  nickname: string
  avatarUrl?: string
}

// ============ JWT 载荷 ============

export interface TokenPayload {
  userId: number
  role?: string
  iat: number
  exp: number
}

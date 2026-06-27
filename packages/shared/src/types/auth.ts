import { z } from 'zod'

// ============ 小程序登录 ============

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

// ============ 后台员工登录 ============

/** POST /api/v1/auth/staff/login 请求体 */
export const StaffLoginRequestSchema = z.object({
  username: z.string().min(1, '账号不能为空').max(50),
  password: z.string().min(1, '密码不能为空').max(128),
})

export type StaffLoginRequest = z.infer<typeof StaffLoginRequestSchema>

/** 员工登录响应 */
export interface StaffLoginResponse {
  token: string
  staff: StaffInfo
}

export interface StaffInfo {
  id: number
  username: string
  displayName: string
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

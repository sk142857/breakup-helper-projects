import { request, type LoginResponse, type UserInfo } from './request'

// ============ 登录状态管理 ============

/** Token 存储键 */
const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'
const RETRY_KEY = 'loginRetryCount'

/** 最大重试次数 */
export const MAX_LOGIN_RETRY = 3

/** 获取当前重试计数 */
export function getRetryCount(): number {
  return wx.getStorageSync(RETRY_KEY) || 0
}

/** 增加重试计数 */
export function incRetryCount(): number {
  const count = getRetryCount() + 1
  wx.setStorageSync(RETRY_KEY, count)
  return count
}

/** 重置重试计数 */
export function resetRetryCount(): void {
  wx.removeStorageSync(RETRY_KEY)
}

/**
 * 静默登录
 * 1. 调用 wx.login 获取临时 code
 * 2. 发送 code 到服务端换取 JWT + 用户信息
 * 3. 存储到本地
 *
 * @returns 是否登录成功
 */
export async function login(): Promise<boolean> {
  try {
    // 1. 获取微信临时 code
    const code = await wxLogin()

    // 2. 发送到服务端（不携带 token，因为还没登录）
    const res = await request<LoginResponse>({
      url: '/api/v1/auth/login',
      method: 'POST',
      data: { code },
      auth: false,
    })

    if (res.code !== 0) {
      console.error('[Auth] 登录失败:', res.message)
      return false
    }

    // 3. 持久化存储
    const { token, user } = res.data
    wx.setStorageSync(TOKEN_KEY, token)
    wx.setStorageSync(USER_KEY, user)

    // 4. 更新全局状态
    const app = getApp<IAppOption>()
    app.globalData.token = token
    app.globalData.appUserInfo = user
    app.globalData.loginExpired = false

    // 5. 登录成功，清零重试计数
    resetRetryCount()

    console.log('[Auth] 登录成功, userId:', user.userId)
    return true
  } catch (e) {
    console.error('[Auth] 登录异常:', e)
    return false
  }
}

/** 封装 wx.login 为 Promise */
function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error(res.errMsg || 'wx.login 失败'))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg))
      },
    })
  })
}

/** 获取本地 token */
export function getToken(): string | null {
  return wx.getStorageSync(TOKEN_KEY) || null
}

/** 获取本地用户信息 */
export function getUserInfo(): UserInfo | null {
  return wx.getStorageSync(USER_KEY) || null
}

/** 是否已登录（本地有 token 且未过期） */
export function isLoggedIn(): boolean {
  const token = getToken()
  if (!token) return false

  // 检查 JWT 是否过期（简单解析 payload）
  try {
    const payload = parseJwt(token)
    const now = Math.floor(Date.now() / 1000)
    return payload.exp > now
  } catch {
    return false
  }
}

/** 解析 JWT payload */
function parseJwt(token: string): { exp: number; userId: number } {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT')
  // 小程序不支持 atob，用 wx.base64ToArrayBuffer
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const arrayBuffer = wx.base64ToArrayBuffer(base64)
  const decoder = new TextDecoder()
  const json = decoder.decode(arrayBuffer)
  return JSON.parse(json)
}

/** 退出登录 */
export function logout(): void {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)

  const app = getApp<IAppOption>()
  app.globalData.token = ''
  app.globalData.userInfo = null
}

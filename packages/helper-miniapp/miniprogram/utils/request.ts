// ============ 配置 ============

/** 生产环境 API 域名 */
const PROD_API_BASE = 'https://api.hyqingren.com'

/** 获取 API 基础地址：开发环境 → localhost，体验/正式环境 → 生产域名 */
function getApiBaseUrl(): string {
  try {
    const account = wx.getAccountInfoSync?.()
    const envVersion = account?.miniProgram?.envVersion
    if (envVersion === 'develop') {
      //return 'http://localhost:3000'
      return 'https://api.hyqingren.com'
    }
  } catch {
    // 获取失败（低版本基础库等），安全降级到 localhost
  }
  return PROD_API_BASE
}

/** API 服务器地址 */
export const API_BASE_URL = getApiBaseUrl()

// ============ 类型 ============

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface LoginRequest {
  code: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface UserInfo {
  userId: number
  openId: string
  unionId?: string
  nickname: string
  avatarUrl?: string
}

// ============ 请求封装 ============

/** HTTP 方法 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 请求选项 */
interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: Record<string, unknown>
  header?: Record<string, string>
  /** 是否需要携带 token（默认 true） */
  auth?: boolean
}

/**
 * 通用请求函数
 * - 自动附加 Authorization header
 * - 统一错误处理
 * - 返回 Promise<ApiResponse<T>>
 */
export function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { url, method = 'GET', data, header = {}, auth = true } = options

  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...header }

  // 自动附加 token
  if (auth) {
    const token = wx.getStorageSync('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      header: headers,
      data: data || {},
      success(res) {
        const statusCode = res.statusCode
        const body = res.data as ApiResponse<T>

        if (statusCode === 401 || body.code === 401) {
          // Token 过期，清除并触发重新登录
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          // 广播登录过期事件
          getApp<IAppOption>().globalData.loginExpired = true
          reject(new Error('登录已过期'))
          return
        }

        if (statusCode >= 200 && statusCode < 300) {
          resolve(body)
        } else {
          reject(new Error(body.message || `请求失败 (${statusCode})`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

// ============ 快捷方法 ============

export function get<T = unknown>(url: string, params?: Record<string, string | number>) {
  let query = ''
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) query = `?${qs}`
  }
  return request<T>({ url: url + query, method: 'GET' })
}

export function post<T = unknown>(url: string, data?: Record<string, unknown>) {
  return request<T>({ url, method: 'POST', data })
}

export function put<T = unknown>(url: string, data?: Record<string, unknown>) {
  return request<T>({ url, method: 'PUT', data })
}

export function del<T = unknown>(url: string) {
  return request<T>({ url, method: 'DELETE' })
}

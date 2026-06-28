// ============ 配置 ============

/** 生产环境 API 域名 */
const PROD_API_BASE = 'https://api.hyqingren.com'

/** 获取 API 基础地址：开发版 → localhost，体验版/正式版/未知 → 生产域名 */
export function getApiBaseUrl(): string {
  try {
    const account = wx.getAccountInfoSync?.()
    const envVersion = account?.miniProgram?.envVersion
    console.log('[request] envVersion:', envVersion)
    if (envVersion === 'develop') {
      return 'http://localhost:3000'
    }
  } catch {
    // 获取失败（低版本基础库等），安全降级到生产域名
  }
  return PROD_API_BASE
}

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
      url: `${getApiBaseUrl()}${url}`,
      method,
      header: headers,
      data: data || {},
      success(res) {
        const statusCode = res.statusCode
        const body = res.data as ApiResponse<T>

        if (statusCode === 401 || body.code === 401) {
          // Token 过期，清除并跳转登录页
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          getApp<IAppOption>().globalData.loginExpired = true
          wx.reLaunch({ url: '/pages/launch/launch' })
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

// ============ 文件上传 ============

export interface UploadResult {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  origUrl: string
  thumbUrl: string | null
}

export type UploadMode = 'original' | 'thumbnail' | 'both'

/**
 * 上传文件到服务器
 * @param filePath 本地文件路径
 * @param mode 上传模式: original | thumbnail | both（默认 both）
 * @param bizType 业务类型: relationship | record | common（默认 common）
 */
export function uploadFile(filePath: string, mode: UploadMode = 'both', bizType: string = 'common'): Promise<ApiResponse<UploadResult>> {
  const token = wx.getStorageSync('token')
  const apiUrl = `${getApiBaseUrl()}/api/v1/upload`

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: apiUrl,
      filePath,
      name: 'file',
      formData: { mode, bizType },
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const body = JSON.parse(res.data) as ApiResponse<UploadResult>
            resolve(body)
          } catch {
            reject(new Error('解析上传响应失败'))
          }
        } else {
          reject(new Error(`上传失败 (${res.statusCode})`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传请求失败'))
      },
    })
  })
}

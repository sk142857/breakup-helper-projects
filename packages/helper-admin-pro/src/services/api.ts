import axios from 'axios'
import type { ApiResponse } from '@app/shared'
import { message } from 'antd'
import { authStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/admin',
  timeout: 15000,
})

// 请求拦截 —— 附加 JWT
api.interceptors.request.use((config) => {
  const token = authStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截 —— 统一错误提示 & 401 跳登录
api.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 0) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      authStore.logout()
      // 避免在 /login 页重复跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(new Error('登录已过期'))
    }
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default api

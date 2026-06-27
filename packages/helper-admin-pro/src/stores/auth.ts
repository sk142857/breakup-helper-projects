// ============================================================
// 后台登录状态管理（模块级单例，token 持久化到 localStorage）
// ============================================================

const TOKEN_KEY = 'admin_token'
const STAFF_KEY = 'admin_staff'

export interface StaffInfo {
  id: number
  username: string
  displayName: string
}

interface AuthSnapshot {
  isLoggedIn: boolean
  staff: StaffInfo | null
}

type Listener = () => void
const listeners = new Set<Listener>()

// ---------- 缓存快照（getSnapshot 必须返回稳定引用，否则无限循环）----------

let snapshot: AuthSnapshot = { isLoggedIn: false, staff: null }

function computeSnapshot() {
  const token = localStorage.getItem(TOKEN_KEY)
  let staff: StaffInfo | null = null
  try {
    const raw = localStorage.getItem(STAFF_KEY)
    staff = raw ? JSON.parse(raw) : null
  } catch { /* ignore */ }
  snapshot = { isLoggedIn: !!token, staff }
}

// 初始化
computeSnapshot()

function notify() {
  computeSnapshot()
  listeners.forEach((fn) => fn())
}

// ---------- 公开 API ----------

export const authStore = {
  /** 订阅变更（React 组件用） */
  subscribe(fn: Listener) {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  },

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  get staff(): StaffInfo | null {
    return snapshot.staff
  },

  get isLoggedIn(): boolean {
    return snapshot.isLoggedIn
  },

  login(token: string, staff: StaffInfo) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff))
    notify()
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STAFF_KEY)
    notify()
  },
}

// ---------- React Hook ----------

import { useSyncExternalStore } from 'react'

/** 在 React 组件中获取登录态 */
export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, () => snapshot)
}

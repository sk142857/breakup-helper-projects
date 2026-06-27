import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/stores/auth'

/** 路由守卫：未登录跳转 /login */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

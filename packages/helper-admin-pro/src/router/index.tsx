import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import BasicLayout from '@/layouts/BasicLayout'
import AuthGuard from '@/components/AuthGuard'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Users = lazy(() => import('@/pages/Users'))
const SdkInfo = lazy(() => import('@/pages/SdkInfo'))
const LoginPage = lazy(() => import('@/pages/Login'))

function LazyLoad(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<Spin style={{ width: '100%', padding: '200px 0' }} />}>
      <Component />
    </Suspense>
  )
}

export const routerConfig: RouteObject[] = [
  {
    path: '/login',
    element: LazyLoad(LoginPage),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <BasicLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: LazyLoad(Dashboard) },
      { path: 'users', element: LazyLoad(Users) },
      { path: 'sdk', element: LazyLoad(SdkInfo) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]

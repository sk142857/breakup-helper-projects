import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import BasicLayout from '@/layouts/BasicLayout'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Users = lazy(() => import('@/pages/Users'))

function LazyLoad(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<Spin style={{ width: '100%', padding: '200px 0' }} />}>
      <Component />
    </Suspense>
  )
}

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: LazyLoad(Dashboard) },
      { path: 'users', element: LazyLoad(Users) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]

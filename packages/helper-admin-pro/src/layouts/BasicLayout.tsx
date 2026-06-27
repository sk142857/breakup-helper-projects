import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout, PageContainer } from '@ant-design/pro-components'
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  MobileOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import type { MenuDataItem } from '@ant-design/pro-components'
import { Dropdown } from 'antd'
import { authStore, useAuth } from '@/stores/auth'

const menu: MenuDataItem[] = [
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: <DashboardOutlined />,
  },
  {
    path: '/users',
    name: '用户管理',
    icon: <UserOutlined />,
  },
  {
    path: '/sdk',
    name: 'SDK 信息',
    icon: <MobileOutlined />,
    children: [
      { path: '/sdk', name: '设备信息', key: 'sdk-device_info' },
      { path: '/sdk', name: 'App基础信息', key: 'sdk-app_base_info' },
      { path: '/sdk', name: '电量信息', key: 'sdk-battery_info' },
      { path: '/sdk', name: '窗口信息', key: 'sdk-window_info' },
      { path: '/sdk', name: '网络类型', key: 'sdk-network_type' },
      { path: '/sdk', name: '系统设置', key: 'sdk-system_setting' },
      { path: '/sdk', name: 'Skyline渲染', key: 'sdk-skyline_info' },
      { path: '/sdk', name: '性能信息', key: 'sdk-performance_info' },
      { path: '/sdk', name: '启动参数', key: 'sdk-launch_options' },
      { path: '/sdk', name: '事件日志', key: 'sdk-event_log' },
    ],
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: <SettingOutlined />,
  },
]

export default function BasicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  // 只保留 pathname（不含 query），ProLayout 用它匹配菜单高亮
  const [pathname, setPathname] = useState(location.pathname)
  const { staff } = useAuth()

  const handleLogout = () => {
    authStore.logout()
    navigate('/login', { replace: true })
  }

  return (
    <ProLayout
      title="管理后台"
      logo={null}
      location={{ pathname }}
      menuDataRender={() => menu}
      menuItemRender={(item, dom) => (
        <a onClick={() => {
          const key = String(item.key || '')
          if (key.startsWith('sdk-')) {
            const table = key.replace('sdk-', '')
            setPathname('/sdk')
            navigate(`/sdk?table=${table}`)
          } else {
            setPathname(item.path || '/')
            navigate(item.path || '/')
          }
        }}>
          {dom}
        </a>
      )}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: staff?.displayName || 'Admin',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'logout') handleLogout()
              },
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  )
}

import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout, PageContainer } from '@ant-design/pro-components'
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuDataItem } from '@ant-design/pro-components'

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
    path: '/settings',
    name: '系统设置',
    icon: <SettingOutlined />,
  },
]

export default function BasicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [pathname, setPathname] = useState(location.pathname)

  return (
    <ProLayout
      title="管理后台"
      logo={null}
      location={{ pathname }}
      menuDataRender={() => menu}
      menuItemRender={(item, dom) => (
        <a onClick={() => {
          setPathname(item.path || '/')
          navigate(item.path || '/')
        }}>
          {dom}
        </a>
      )}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: 'Admin',
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  )
}

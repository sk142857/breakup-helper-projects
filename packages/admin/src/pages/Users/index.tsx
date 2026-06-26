import { useRef } from 'react'
import { ProTable, ModalForm, ProFormText } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getUserList, createUser } from '@/services/user'
import type { User, UserCreate } from '@app/shared'

export default function Users() {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) =>
        record.status === 'active' ? (
          <Tag color="green">启用</Tag>
        ) : (
          <Tag color="red">禁用</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 120,
      search: false,
      render: () => <Button type="link">编辑</Button>,
    },
  ]

  return (
    <ProTable<User>
      headerTitle="用户列表"
      actionRef={actionRef}
      columns={columns}
      request={async (params) => {
        const { current, pageSize, name, ...rest } = params
        const res = await getUserList({
          page: current || 1,
          size: pageSize || 20,
          keyword: name,
          ...rest,
        })
        return {
          data: res.data.data.list,
          total: res.data.data.total,
          success: true,
        }
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      toolBarRender={() => [
        <ModalForm<UserCreate>
          key="create"
          title="新建用户"
          trigger={
            <Button type="primary" icon={<PlusOutlined />}>
              新建
            </Button>
          }
          onFinish={async (values) => {
            await createUser(values)
            message.success('创建成功')
            actionRef.current?.reload()
            return true
          }}
        >
          <ProFormText name="name" label="姓名" rules={[{ required: true }]} />
          <ProFormText name="phone" label="手机号" rules={[{ required: true }]} />
        </ModalForm>,
      ]}
    />
  )
}

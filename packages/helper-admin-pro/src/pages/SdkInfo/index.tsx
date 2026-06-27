import { useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { getSdkList } from '@/services/sdk'

// ============================================================
// 10 张 SDK 表列配置
// ============================================================

function buildColumns(tableName: string): ProColumns<Record<string, unknown>>[] {
  const idCol: ProColumns<Record<string, unknown>> = { title: '信息ID', dataIndex: 'infoId', width: 140 }
  const openCol: ProColumns<Record<string, unknown>> = { title: '微信标识', dataIndex: 'openId', width: 160, ellipsis: true }
  const userCol: ProColumns<Record<string, unknown>> = { title: '用户ID', dataIndex: 'userId', width: 80 }
  const timeCol: ProColumns<Record<string, unknown>> = { title: '创建时间', dataIndex: 'createdAt', width: 150, valueType: 'dateTime', search: false }

  switch (tableName) {
    case 'device_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: '品牌', dataIndex: 'brand', width: 80 },
        { title: '型号', dataIndex: 'model', width: 140, ellipsis: true },
        { title: '系统', dataIndex: 'systemName', width: 90 },
        { title: '平台', dataIndex: 'platform', width: 70 },
        { title: 'CPU', dataIndex: 'cpuType', width: 120, ellipsis: true },
        { title: '内存', dataIndex: 'memorySize', width: 70 },
        { title: 'abi', dataIndex: 'abi', width: 120, ellipsis: true },
        { title: 'benchmark', dataIndex: 'benchmarkLevel', width: 80 },
        timeCol,
      ]

    case 'app_base_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: 'SDK 版本', dataIndex: 'sdkVersion', width: 90 },
        { title: '语言', dataIndex: 'language', width: 70 },
        { title: '版本', dataIndex: 'version', width: 80 },
        { title: '主题', dataIndex: 'theme', width: 70 },
        { title: 'host AppId', dataIndex: 'hostAppId', width: 160, ellipsis: true },
        { title: '调试模式', dataIndex: 'enableDebug', width: 80, render: (_, r) => (r.enableDebug ? '是' : '否') },
        { title: '字号缩放', dataIndex: 'fontSizeScaleFactor', width: 80 },
        { title: '字号设置', dataIndex: 'fontSizeSetting', width: 80 },
        timeCol,
      ]

    case 'battery_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: '电量', dataIndex: 'batteryLevel', width: 70 },
        { title: '充电中', dataIndex: 'isCharging', width: 70, render: (_, r) => (r.isCharging ? '是' : '否') },
        { title: '低功耗', dataIndex: 'isLowPowerModeEnabled', width: 70, render: (_, r) => (r.isLowPowerModeEnabled ? '是' : '否') },
        timeCol,
      ]

    case 'window_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: '像素比', dataIndex: 'pixelRatio', width: 70 },
        { title: '屏幕宽', dataIndex: 'screenWidth', width: 75 },
        { title: '屏幕高', dataIndex: 'screenHeight', width: 75 },
        { title: '窗口宽', dataIndex: 'windowWidth', width: 75 },
        { title: '窗口高', dataIndex: 'windowHeight', width: 75 },
        { title: '状态栏高', dataIndex: 'statusBarHeight', width: 80 },
        { title: 'screenTop', dataIndex: 'screenTop', width: 75 },
        timeCol,
      ]

    case 'network_type':
      return [
        idCol,
        openCol,
        userCol,
        { title: '网络类型', dataIndex: 'networkType', width: 80 },
        { title: '信号强度', dataIndex: 'signalStrength', width: 80 },
        { title: '系统代理', dataIndex: 'hasSystemProxy', width: 75, render: (_, r) => (r.hasSystemProxy ? '是' : '否') },
        { title: '弱网', dataIndex: 'weakNet', width: 60, render: (_, r) => (r.weakNet ? '是' : '否') },
        timeCol,
      ]

    case 'system_setting':
      return [
        idCol,
        openCol,
        userCol,
        { title: '蓝牙', dataIndex: 'bluetoothEnabled', width: 60, render: (_, r) => (r.bluetoothEnabled ? '开' : '关') },
        { title: '定位', dataIndex: 'locationEnabled', width: 60, render: (_, r) => (r.locationEnabled ? '开' : '关') },
        { title: 'WiFi', dataIndex: 'wifiEnabled', width: 60, render: (_, r) => (r.wifiEnabled ? '开' : '关') },
        { title: '设备方向', dataIndex: 'deviceOrientation', width: 90 },
        timeCol,
      ]

    case 'skyline_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: 'Skyline', dataIndex: 'isSupported', width: 70, render: (_, r) => (r.isSupported ? '是' : '否') },
        { title: 'Skyline版本', dataIndex: 'version', width: 90 },
        { title: '小程序版本', dataIndex: 'appVersion', width: 90 },
        { title: '不支持原因', dataIndex: 'reason', width: 160, ellipsis: true },
        timeCol,
      ]

    case 'performance_info':
      return [
        idCol,
        openCol,
        userCol,
        { title: '事件类型', dataIndex: 'entryType', width: 80 },
        { title: '导航类型', dataIndex: 'navigationType', width: 80 },
        { title: '页面路径', dataIndex: 'path', width: 160, ellipsis: true },
        { title: '耗时', dataIndex: 'duration', width: 70 },
        { title: 'startTime', dataIndex: 'startTime', width: 80 },
        timeCol,
      ]

    case 'launch_options':
      return [
        idCol,
        openCol,
        userCol,
        { title: '页面路径', dataIndex: 'path', width: 160, ellipsis: true },
        { title: '场景值', dataIndex: 'scene', width: 70 },
        { title: 'appId', dataIndex: 'appId', width: 160, ellipsis: true },
        { title: 'chatType', dataIndex: 'chatType', width: 75 },
        { title: 'apiCategory', dataIndex: 'apiCategory', width: 140, ellipsis: true },
        timeCol,
      ]

    case 'event_log':
      return [
        { title: '日志ID', dataIndex: 'logId', width: 80, search: false },
        openCol,
        userCol,
        { title: '事件类型', dataIndex: 'eventType', width: 80 },
        { title: '事件名称', dataIndex: 'eventName', width: 110, ellipsis: true },
        { title: '页面路径', dataIndex: 'pagePath', width: 150, ellipsis: true },
        { title: '页面标题', dataIndex: 'pageTitle', width: 100 },
        { title: '场景值', dataIndex: 'scene', width: 70 },
        { title: '耗时', dataIndex: 'duration', width: 65 },
        { title: '设备品牌', dataIndex: 'deviceBrand', width: 80 },
        { title: '设备型号', dataIndex: 'deviceModel', width: 110 },
        { title: '平台', dataIndex: 'platform', width: 65 },
        { title: '网络', dataIndex: 'networkType', width: 65 },
        { title: '时间戳(UTC)', dataIndex: 'timestamp', width: 150, valueType: 'dateTime', search: false },
        timeCol,
      ]

    default:
      return [idCol]
  }
}

// ============================================================
// 所有表配置
// ============================================================
interface SdkTableConfig {
  table: string
  title: string
  columns: ProColumns<Record<string, unknown>>[]
}

const sdkTables: SdkTableConfig[] = [
  { table: 'device_info', title: '设备信息', columns: buildColumns('device_info') },
  { table: 'app_base_info', title: 'App基础信息', columns: buildColumns('app_base_info') },
  { table: 'battery_info', title: '电量信息', columns: buildColumns('battery_info') },
  { table: 'window_info', title: '窗口信息', columns: buildColumns('window_info') },
  { table: 'network_type', title: '网络类型', columns: buildColumns('network_type') },
  { table: 'system_setting', title: '系统设置', columns: buildColumns('system_setting') },
  { table: 'skyline_info', title: 'Skyline渲染', columns: buildColumns('skyline_info') },
  { table: 'performance_info', title: '性能信息', columns: buildColumns('performance_info') },
  { table: 'launch_options', title: '启动参数', columns: buildColumns('launch_options') },
  { table: 'event_log', title: '事件日志', columns: buildColumns('event_log') },
]

// ============================================================
// SDK 信息查询页面（通过 URL 参数 ?table=xxx 切换表）
// ============================================================

export default function SdkInfo() {
  const actionRef = useRef<ActionType>()
  const [searchParams] = useSearchParams()
  const tableName = searchParams.get('table') || 'device_info'
  const config = sdkTables.find((t) => t.table === tableName) || sdkTables[0]

  const columns = useMemo(() => config.columns, [config.table])

  return (
    <ProTable<Record<string, unknown>>
      key={tableName}
      headerTitle={config.title}
      actionRef={actionRef}
      columns={columns}
      rowKey={tableName === 'event_log' ? 'logId' : 'infoId'}
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 20, showSizeChanger: true }}
      scroll={{ x: 'max-content' }}
      request={async (params) => {
        const { current, pageSize, ...rest } = params
        const vals = Object.values(rest as Record<string, unknown>)
        const keyword = (vals.find((v) => typeof v === 'string' && v.trim()) as string) || ''
        const res = await getSdkList({
          table: config.table,
          page: current || 1,
          size: pageSize || 20,
          keyword,
        })
        return {
          data: res.data.data.list,
          total: res.data.data.total,
          success: true,
        }
      }}
    />
  )
}

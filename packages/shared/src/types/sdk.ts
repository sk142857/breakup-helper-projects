// ============ SDK 数据上报类型 ============

/** App 基础信息 */
export interface SdkAppBaseInfoPayload {
  sdkVersion?: string
  enableDebug?: boolean
  hostAppId?: string
  language?: string
  version?: string
  theme?: string
  fontSizeScaleFactor?: number
  fontSizeSetting?: number
}

/** 设备信息 */
export interface SdkDeviceInfoPayload {
  abi?: string
  deviceAbi?: string
  benchmarkLevel?: number
  modelLevel?: number
  brand?: string
  model?: string
  systemName?: string
  platform?: string
  cpuType?: string
  memorySize?: string
}

/** 电量信息 */
export interface SdkBatteryInfoPayload {
  batteryLevel?: number
  isCharging?: boolean
  isLowPowerModeEnabled?: boolean
}

/** 窗口信息 */
export interface SdkWindowInfoPayload {
  pixelRatio: number
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  statusBarHeight: number
  safeArea?: Record<string, unknown>
  screenTop: number
}

/** 网络类型 */
export interface SdkNetworkTypePayload {
  networkType?: string
  signalStrength?: number
  hasSystemProxy?: boolean
  weakNet?: boolean
}

/** 系统设置 */
export interface SdkSystemSettingPayload {
  bluetoothEnabled?: boolean
  locationEnabled?: boolean
  wifiEnabled?: boolean
  deviceOrientation?: string
}

/** Skyline 渲染引擎 */
export interface SdkSkylineInfoPayload {
  isSupported?: boolean
  version?: string
  appVersion?: string
  reason?: string
}

/** 性能条目 */
export interface SdkPerformanceEntry {
  entryType?: string
  startTime?: number
  duration?: number
  navigationType?: string
  path?: string
  pageId?: number
}

/** 启动参数 */
export interface SdkLaunchOptionsPayload {
  path?: string
  scene?: number
  appId?: string
  queryObj?: Record<string, unknown>
  shareTicket?: string
  referrerInfo?: Record<string, unknown>
  forwardMaterials?: unknown[]
  chatType?: number
  apiCategory?: string
}

/** 事件 */
export interface SdkEventPayload {
  eventType: string
  eventName?: string
  pagePath?: string
  pageTitle?: string
  pageQuery?: string
  timestamp?: string
}

/** 一次性上报全部 SDK 数据的请求体 */
export interface SdkReportPayload {
  /** 去重标识：设备信息各字段 md5 */
  md5: string
  /** 小程序启动参数 */
  launchOptions?: SdkLaunchOptionsPayload
  /** App 基础信息 */
  appBaseInfo?: SdkAppBaseInfoPayload
  /** 设备信息 */
  deviceInfo?: SdkDeviceInfoPayload
  /** 电量信息 */
  batteryInfo?: SdkBatteryInfoPayload
  /** 窗口信息 */
  windowInfo?: SdkWindowInfoPayload
  /** 网络信息 */
  networkInfo?: SdkNetworkTypePayload
  /** 系统设置 */
  systemSetting?: SdkSystemSettingPayload
  /** Skyline 渲染引擎 */
  skylineInfo?: SdkSkylineInfoPayload
  /** 性能条目列表 */
  performanceEntries?: SdkPerformanceEntry[]
  /** 事件列表 */
  events?: SdkEventPayload[]
}

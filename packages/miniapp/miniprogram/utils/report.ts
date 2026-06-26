/**
 * SDK 数据采集 — 一次性收集小程序系统信息并上报
 */
import { request } from './request'

// ============ 工具函数 ============

/** 简单 MD5 去重标识：生成设备相关字段的组合哈希 */
function makeMd5(): string {
  const info = wx.getSystemInfoSync()
  const raw = [
    info.brand, info.model, info.system,
    info.platform, info.pixelRatio,
    info.screenWidth, info.screenHeight,
  ].join('|')
  return hashStr(raw)
}

/** 简单字符串哈希 */
function hashStr(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/** Promise 化微信 API */
function promisify<T = WechatMiniprogram.GeneralCallbackResult>(
  fn: (opts: WechatMiniprogram.Callback<T>) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      fn({ success: resolve as never, fail: reject } as never)
    } catch (e) {
      reject(e)
    }
  })
}

// ============ 数据收集 ============

async function collectDeviceInfo(): Promise<Record<string, unknown>> {
  const info = wx.getSystemInfoSync()
  const deviceInfo: Record<string, unknown> = {
    brand: info.brand,
    model: info.model,
    systemName: info.system,
    platform: info.platform,
    memorySize: String(info.memorySize ?? ''),
    modelLevel: (info as Record<string, unknown>).modelLevel as number | undefined,
    benchmarkLevel: (info as Record<string, unknown>).benchmarkLevel as number | undefined,
  }
  // Android 特有字段
  if (info.platform === 'android') {
    deviceInfo.abi = (info as Record<string, unknown>).abi
    deviceInfo.deviceAbi = (info as Record<string, unknown>).deviceAbi
    deviceInfo.cpuType = (info as Record<string, unknown>).cpuType
  }
  return deviceInfo
}

async function collectBatteryInfo(): Promise<Record<string, unknown> | null> {
  try {
    const res = await promisify<WechatMiniprogram.GetBatteryInfoSuccessCallbackResult>(
      wx.getBatteryInfo,
    )
    return {
      batteryLevel: res.level,
      isCharging: res.isCharging,
    }
  } catch {
    return null
  }
}

function collectWindowInfo(): Record<string, unknown> {
  const info = wx.getWindowInfo()
  const sys = wx.getSystemInfoSync()
  return {
    pixelRatio: sys.pixelRatio,
    screenWidth: sys.screenWidth,
    screenHeight: sys.screenHeight,
    windowWidth: info.windowWidth,
    windowHeight: info.windowHeight,
    statusBarHeight: info.statusBarHeight,
    safeArea: info.safeArea as unknown as Record<string, unknown> | undefined,
    screenTop: info.screenTop,
  }
}

async function collectNetworkInfo(): Promise<Record<string, unknown>> {
  try {
    const res = await promisify<WechatMiniprogram.GetNetworkTypeSuccessCallbackResult>(
      wx.getNetworkType,
    )
    return {
      networkType: res.networkType,
      signalStrength: (res as Record<string, unknown>).signalStrength as number | undefined,
      hasSystemProxy: (res as Record<string, unknown>).hasSystemProxy as boolean | undefined,
      weakNet: (res as Record<string, unknown>).weakNet as boolean | undefined,
    }
  } catch {
    return { networkType: 'unknown' }
  }
}

async function collectAppBaseInfo(): Promise<Record<string, unknown>> {
  const info = wx.getAppBaseInfo()
  return {
    sdkVersion: info.SDKVersion,
    enableDebug: info.enableDebug,
    hostAppId: info.host?.appId,
    language: info.language,
    version: info.version,
    theme: info.theme,
    fontSizeScaleFactor: info.fontSizeScaleFactor,
    fontSizeSetting: info.fontSizeSetting,
  }
}

async function collectSystemSetting(): Promise<Record<string, unknown>> {
  try {
    const res = await promisify<WechatMiniprogram.GetSettingSuccessCallbackResult>(
      wx.getSetting as never,
    )
    return {
      bluetoothEnabled: (res as Record<string, unknown>).bluetoothEnabled as boolean | undefined,
      locationEnabled: (res as Record<string, unknown>).locationEnabled as boolean | undefined,
      wifiEnabled: (res as Record<string, unknown>).wifiEnabled as boolean | undefined,
      deviceOrientation: (res as Record<string, unknown>).deviceOrientation as string | undefined,
    }
  } catch {
    return {}
  }
}

async function collectSkylineInfo(): Promise<Record<string, unknown> | null> {
  try {
    const res = await promisify<WechatMiniprogram.GetSkylineInfoSuccessCallbackResult>(
      wx.getSkylineInfo,
    )
    return {
      isSupported: true,
      version: res.version,
      appVersion: (res as Record<string, unknown>).appVersion,
      reason: '',
    }
  } catch {
    // Skyline 不可用
    return { isSupported: false, version: '', appVersion: '', reason: (getApp() as Record<string, unknown>).skylineReason || '' }
  }
}

function collectLaunchOptions(): Record<string, unknown> {
  const opts = wx.getLaunchOptionsSync()
  return {
    path: opts.path,
    scene: opts.scene,
    appId: opts.referrerInfo?.appId,
    queryObj: opts.query as unknown as Record<string, unknown> | undefined,
    shareTicket: opts.shareTicket,
    referrerInfo: opts.referrerInfo as unknown as Record<string, unknown> | undefined,
    forwardMaterials: (opts as Record<string, unknown>).forwardMaterials as Record<string, unknown> | undefined,
    chatType: (opts as Record<string, unknown>).chatType as number | undefined,
    apiCategory: (opts as Record<string, unknown>).apiCategory as string | undefined,
  }
}

function collectPerformanceEntries(): Record<string, unknown>[] {
  try {
    const perf = wx.getPerformance()
    if (!perf) return []
    const entries = perf.getEntries()
    return entries.map(e => ({
      entryType: e.entryType,
      startTime: Math.round(e.startTime),
      duration: Math.round(e.duration),
      navigationType: (e as Record<string, unknown>).navigationType,
      path: e.name,
    }))
  } catch {
    return []
  }
}

function collectEvents(): Record<string, unknown>[] {
  const sys = wx.getSystemInfoSync()
  return [{
    eventType: 'lifecycle',
    eventName: 'appLaunch',
    timestamp: new Date().toISOString(),
    deviceBrand: sys.brand,
    deviceModel: sys.model,
    osVersion: sys.system,
    platform: sys.platform,
    appVersion: (wx.getAccountInfoSync?.() as Record<string, unknown>)?.miniProgram?.version,
    wxVersion: sys.version,
  }]
}

/** 调用一次，收集并上报所有 SDK 数据 */
export async function reportSdk(): Promise<void> {
  try {
    const md5 = makeMd5()

    const [
      deviceInfo, batteryInfo, windowInfo, networkInfo,
      appBaseInfo, systemSetting, skylineInfo, launchOptions,
      performanceEntries,
    ] = await Promise.all([
      collectDeviceInfo(),
      collectBatteryInfo(),
      Promise.resolve(collectWindowInfo()),
      collectNetworkInfo(),
      collectAppBaseInfo(),
      collectSystemSetting(),
      collectSkylineInfo(),
      Promise.resolve(collectLaunchOptions()),
      Promise.resolve(collectPerformanceEntries()),
    ])

    const payload: Record<string, unknown> = {
      md5,
      deviceInfo,
      windowInfo,
      networkInfo,
      appBaseInfo,
      systemSetting,
      launchOptions,
      performanceEntries,
    }
    if (batteryInfo) payload.batteryInfo = batteryInfo
    if (skylineInfo) payload.skylineInfo = skylineInfo

    await request({
      url: '/api/v1/sdk/report',
      method: 'POST',
      data: payload,
    })
    console.log('[Report] SDK 数据上报成功')
  } catch (e) {
    console.error('[Report] SDK 数据上报失败:', e)
  }
}

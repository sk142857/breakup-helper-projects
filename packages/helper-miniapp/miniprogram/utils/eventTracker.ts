/**
 * 事件埋点追踪器 — 全局自动 + 手动上报
 *
 * 特性：
 * - 自动拦截 Page() / Component() 生命周期，无需页面改代码
 * - 队列批量上报，5 秒或 20 条触发一次
 * - 异步 fire-and-forget，不影响页面性能
 * - 记录页面停留时长
 * - 支持自定义事件
 */
import { getApiBaseUrl } from './request'
import { EventType, EventName } from './eventEnum'
import type { EventTypeValue, EventNameValue } from './eventEnum'

// ============ 类型 ============

interface TrackEvent {
  eventType: EventTypeValue | string
  eventName?: EventNameValue | string
  pagePath?: string
  pageTitle?: string
  pageQuery?: string
  referrerPath?: string
  duration?: number
  extra?: Record<string, unknown>
}

// ============ 设备信息（一次性采集） ============

interface DeviceSnapshot {
  md5: string
  deviceInfoId: string
  deviceBrand: string
  deviceModel: string
  osVersion: string
  platform: string
  appVersion: string
  wxVersion: string
}

let device: DeviceSnapshot | null = null

function makeMd5(): string {
  const raw = [
    info.brand, info.model, info.system,
    info.platform, info.pixelRatio,
    info.screenWidth, info.screenHeight,
  ].join('|')
  let h = 0
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const info = wx.getSystemInfoSync()

function getDeviceSnapshot(): DeviceSnapshot {
  if (!device) {
    const arr = new Uint8Array(8)
    // 简单随机 — 小程序不支持 crypto.getRandomValues
    for (let i = 0; i < 8; i++) arr[i] = Math.floor(Math.random() * 256)
    const deviceInfoId = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')

    device = {
      md5: makeMd5(),
      deviceInfoId,
      deviceBrand: info.brand,
      deviceModel: info.model,
      osVersion: info.system,
      platform: info.platform,
      appVersion: (wx.getAccountInfoSync?.() as Record<string, unknown>)?.miniProgram?.version as string || '',
      wxVersion: info.version,
    }
  }
  return device
}

// ============ 页面标题映射 ============ //

const pageTitleMap: Record<string, string> = {}

/** 注册页面标题映射，建议在 app.ts 中调用 */
export function registerPageTitles(titles: Record<string, string>): void {
  Object.assign(pageTitleMap, titles)
}

// ============ 事件队列 ============

const MAX_QUEUE = 50
const FLUSH_INTERVAL = 5000
const FLUSH_THRESHOLD = 20

let queue: TrackEvent[] = []
let timer: ReturnType<typeof setInterval> | null = null

function flush(): void {
  if (queue.length === 0) return

  const batch = queue.splice(0, queue.length)
  const snap = getDeviceSnapshot()

  const token = wx.getStorageSync('token') || ''

  wx.request({
    url: `${getApiBaseUrl()}/api/v1/sdk/events`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    data: {
      md5: snap.md5,
      deviceInfoId: snap.deviceInfoId,
      events: batch.map(ev => ({
        ...ev,
        deviceBrand: snap.deviceBrand,
        deviceModel: snap.deviceModel,
        osVersion: snap.osVersion,
        platform: snap.platform,
        appVersion: snap.appVersion,
        wxVersion: snap.wxVersion,
      })),
    },
    success: () => {
      console.log(`[EventTracker] 上报 ${batch.length} 条事件`)
    },
    fail: (err) => {
      console.warn('[EventTracker] 上报失败:', err.errMsg)
      // 失败事件回队（避免丢失）
      queue = [...batch, ...queue].slice(0, MAX_QUEUE)
    },
  })
}

function enqueue(event: TrackEvent): void {
  // 自动填充 pageTitle
  if (!event.pageTitle && event.pagePath) {
    event.pageTitle = pageTitleMap[event.pagePath] || ''
  }

  queue.push(event)
  if (queue.length >= MAX_QUEUE) {
    queue = queue.slice(-MAX_QUEUE)
  }

  // 达到阈值即时 flush
  if (queue.length >= FLUSH_THRESHOLD) {
    flush()
  }

  // 启动定时器
  if (!timer) {
    timer = setInterval(flush, FLUSH_INTERVAL)
  }
}

// ============ 公开 API ============

/**
 * 手动上报自定义事件
 *
 * @example
 * eventTracker.track('tap', 'btn_submit', { pagePath: 'pages/index/index', extra: { formId: 1 } })
 */
export function track(
  eventType: EventTypeValue | string,
  eventName?: EventNameValue | string,
  opts?: { pagePath?: string; pageTitle?: string; pageQuery?: string; extra?: Record<string, unknown> },
): void {
  enqueue({
    eventType,
    eventName,
    pagePath: opts?.pagePath,
    pageTitle: opts?.pageTitle,
    pageQuery: opts?.pageQuery,
    extra: opts?.extra,
  })
}

/** 手动调用 flush（例如 App.onHide 时确保数据不丢） */
export function flushEvents(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  flush()
}

// ============ 页面导航追踪 ============

let currentPagePath = ''
let currentPageEnterTime = 0

/** 记录当前页面路径和进入时间（由 page:show 时调用） */
function pageEnter(path: string): void {
  if (currentPagePath && currentPagePath !== path) {
    // 离开上一页，记录停留时长
    const duration = currentPageEnterTime ? Date.now() - currentPageEnterTime : 0
    enqueue({
      eventType: EventType.PAGE,
      eventName: EventName.PAGE_LEAVE,
      pagePath: currentPagePath,
      duration: Math.round(duration),
    })
  }
  currentPagePath = path
  currentPageEnterTime = Date.now()
  enqueue({
    eventType: EventType.PAGE,
    eventName: EventName.PAGE_ENTER,
    pagePath: path,
  })
}

// ============ 全局 Page/Component 拦截 ============

const _Page = Page
const _Component = Component

/** 拦截 Page() — 自动注入生命周期埋点 */
;(Page as unknown) = function (options: WechatMiniprogram.Page.Options<Record<string, unknown>, Record<string, unknown>>) {
  const route = (options as Record<string, unknown>).route as string || ''

  // onLoad — 页面加载
  const _onLoad = options.onLoad
  options.onLoad = function (this: WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>>, query: Record<string, string>) {
    enqueue({
      eventType: EventType.LIFECYCLE,
      eventName: EventName.PAGE_LOAD,
      pagePath: route,
      pageQuery: JSON.stringify(query),
    })
    if (_onLoad) _onLoad.call(this, query)
  }

  // onShow — 页面显示
  const _onShow = options.onShow
  options.onShow = function (this: WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>>) {
    pageEnter(route)
    enqueue({
      eventType: EventType.LIFECYCLE,
      eventName: EventName.PAGE_SHOW,
      pagePath: route,
    })
    if (_onShow) _onShow.call(this)
  }

  // onHide — 页面隐藏
  const _onHide = options.onHide
  options.onHide = function (this: WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>>) {
    const duration = currentPageEnterTime ? Date.now() - currentPageEnterTime : 0
    enqueue({
      eventType: EventType.LIFECYCLE,
      eventName: EventName.PAGE_HIDE,
      pagePath: route,
      duration: Math.round(duration),
    })
    if (_onHide) _onHide.call(this)
  }

  // onUnload — 页面卸载
  const _onUnload = options.onUnload
  options.onUnload = function (this: WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>>) {
    enqueue({
      eventType: EventType.LIFECYCLE,
      eventName: EventName.PAGE_UNLOAD,
      pagePath: route,
    })
    if (_onUnload) _onUnload.call(this)
  }

  // onShareAppMessage — 分享
  const _onShare = options.onShareAppMessage
  options.onShareAppMessage = function (this: WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>>, opts: WechatMiniprogram.Page.IShareAppMessageOption) {
    enqueue({
      eventType: EventType.SHARE,
      eventName: EventName.SHARE_APP_MESSAGE,
      pagePath: route,
      extra: { from: opts.from, target: opts.target?.id },
    })
    if (_onShare) return _onShare.call(this, opts)
    return {}
  }

  return _Page(options)
}

/** 拦截 Component() — 自动注入生命周期埋点（包括 Page 形式的 Component） */
;(Component as unknown) = function (options: WechatMiniprogram.Component.Options<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>) {
  const o = options as Record<string, unknown>

  // 只有 page-like component 才需要 `methods` 包装
  const methods = (o.methods || {}) as Record<string, (...args: unknown[]) => unknown>

  const wrapMethod = (name: string, eventType: string, eventName: string) => {
    const original = methods[name]
    if (original) {
      methods[name] = function (this: unknown, ...args: unknown[]) {
        enqueue({ eventType, eventName, pagePath: (o as Record<string, unknown>).route as string || '' })
        return original.apply(this, args)
      }
    }
  }

  wrapMethod('onLoad', EventType.LIFECYCLE, EventName.PAGE_LOAD)
  wrapMethod('onShow', EventType.LIFECYCLE, EventName.PAGE_SHOW)
  wrapMethod('onHide', EventType.LIFECYCLE, EventName.PAGE_HIDE)
  wrapMethod('onUnload', EventType.LIFECYCLE, EventName.PAGE_UNLOAD)

  o.methods = methods
  return _Component(options)
}

// ============ 导航 API 拦截 ============

const _navigateTo = wx.navigateTo
const _redirectTo = wx.redirectTo
const _switchTab = wx.switchTab
const _navigateBack = wx.navigateBack
const _reLaunch = wx.reLaunch

function navEvent(name: EventNameValue, url: string): void {
  enqueue({
    eventType: EventType.NAVIGATION,
    eventName: name,
    pagePath: url.split('?')[0],
    pageQuery: url.includes('?') ? url.split('?')[1] : '',
    referrerPath: currentPagePath,
  })
}

wx.navigateTo = function (opts) {
  navEvent(EventName.NAVIGATE_TO, opts.url)
  return _navigateTo.call(wx, opts)
}
wx.redirectTo = function (opts) {
  navEvent(EventName.REDIRECT_TO, opts.url)
  return _redirectTo.call(wx, opts)
}
wx.switchTab = function (opts) {
  navEvent(EventName.SWITCH_TAB, opts.url)
  return _switchTab.call(wx, opts)
}
wx.reLaunch = function (opts) {
  navEvent(EventName.RE_LAUNCH, opts.url)
  return _reLaunch.call(wx, opts)
}
wx.navigateBack = function (opts) {
  enqueue({
    eventType: EventType.NAVIGATION,
    eventName: EventName.NAVIGATE_BACK,
    referrerPath: currentPagePath,
    extra: opts ? { delta: opts.delta } : undefined,
  })
  return _navigateBack.call(wx, opts || {})
}

/** 启动时需调用一次，初始化设备信息 */
export function initTracker(): void {
  getDeviceSnapshot()
  console.log('[EventTracker] 初始化完成', device)
}

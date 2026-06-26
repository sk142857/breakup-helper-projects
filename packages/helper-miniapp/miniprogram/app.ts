// app.ts
import { initTracker, registerPageTitles, track, flushEvents } from './utils/eventTracker'
import { EventType, EventName } from './utils/eventEnum'

registerPageTitles({
  'pages/launch/launch':      '启动',
  'pages/dashboard/dashboard': '首页',
  'pages/relationships/list':  '关系列表',
  'pages/relationships/detail':'关系详情',
  'pages/relationships/edit':  '编辑关系',
  'pages/records/list':        '记录列表',
  'pages/records/edit':        '编辑记录',
  'pages/records/checkin':     '打卡',
  'pages/mine/mine':           '我的',
  'pages/error/error':         '错误',
})

App<IAppOption>({
  globalData: {
    token: '',
    appUserInfo: null,
    loginExpired: false,
  },

  onLaunch(opts) {
    initTracker()
    track(EventType.LIFECYCLE, EventName.APP_LAUNCH, {
      extra: { scene: opts.scene, query: opts.query, shareTicket: opts.shareTicket },
    })
  },

  onShow(opts) {
    track(EventType.LIFECYCLE, EventName.APP_SHOW, {
      extra: { scene: opts.scene, path: opts.path },
    })
  },

  onHide() {
    track(EventType.LIFECYCLE, EventName.APP_HIDE)
    flushEvents() // 立即刷盘，防止后台被杀丢数据
  },
})
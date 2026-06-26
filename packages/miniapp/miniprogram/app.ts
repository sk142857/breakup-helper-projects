// app.ts
import { initTracker, track, flushEvents } from './utils/eventTracker'

App<IAppOption>({
  globalData: {
    token: '',
    appUserInfo: null,
    loginExpired: false,
  },

  onLaunch(opts) {
    initTracker()
    track('lifecycle', 'app_launch', {
      extra: { scene: opts.scene, query: opts.query, shareTicket: opts.shareTicket },
    })
  },

  onShow(opts) {
    track('lifecycle', 'app_show', {
      extra: { scene: opts.scene, path: opts.path },
    })
  },

  onHide() {
    track('lifecycle', 'app_hide')
    flushEvents() // 立即刷盘，防止后台被杀丢数据
  },
})
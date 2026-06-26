// pages/error/error.ts
import { resetRetryCount, MAX_LOGIN_RETRY } from '../../utils/auth'

Component({
  data: {
    maxRetry: MAX_LOGIN_RETRY,
  },

  methods: {
    /** 用户手动重试：清计数，跳回启动页重走登录流程 */
    onRetry() {
      resetRetryCount()
      wx.reLaunch({ url: '/pages/launch/launch' })
    },
  },
})

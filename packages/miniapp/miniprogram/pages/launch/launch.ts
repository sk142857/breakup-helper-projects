// pages/launch/launch.ts
import { login, isLoggedIn, getRetryCount, incRetryCount, MAX_LOGIN_RETRY } from '../../utils/auth'
import { reportSdk } from '../../utils/report'

Component({
  data: {
    loading: true,
    statusText: '正在连接...',
  },

  lifetimes: {
    attached() {
      this.checkAndLogin()
    },
  },

  methods: {
    /** 检查 token 有效性，无效则尝试登录 */
    async checkAndLogin() {
      // 已有有效 token，直接进首页
      if (isLoggedIn()) {
        console.log('[Launch] Token 有效，进入首页')
        const token = wx.getStorageSync('token')
        const userInfo = wx.getStorageSync('userInfo')
        const app = getApp<IAppOption>()
        if (token) app.globalData.token = token
        if (userInfo) app.globalData.appUserInfo = userInfo
        wx.reLaunch({ url: '/pages/dashboard/dashboard' })
        return
      }

      // 检查重试次数
      const retryCount = getRetryCount()
      if (retryCount >= MAX_LOGIN_RETRY) {
        console.warn('[Launch] 重试已达上限，跳转错误页')
        wx.reLaunch({ url: '/pages/error/error' })
        return
      }

      this.setData({
        statusText: `正在授权登录... (${retryCount + 1}/${MAX_LOGIN_RETRY})`,
      })

      const success = await login()

      if (success) {
        this.setData({ statusText: '登录成功' })
        // 后台上报 SDK 数据（不阻塞跳转）
        reportSdk()
        wx.reLaunch({ url: '/pages/dashboard/dashboard' })
        return
      }

      // 失败，递增计数
      const newCount = incRetryCount()
      console.warn(`[Launch] 登录失败 (${newCount}/${MAX_LOGIN_RETRY})`)

      if (newCount >= MAX_LOGIN_RETRY) {
        this.setData({ loading: false, statusText: '登录失败' })
        wx.reLaunch({ url: '/pages/error/error' })
        return
      }

      // 未达上限，3 秒后重试
      this.setData({ statusText: `登录失败，${3}秒后重试...` })
      setTimeout(() => {
        this.checkAndLogin()
      }, 3000)
    },
  },
})

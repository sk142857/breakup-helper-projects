/// <reference path="./types/index.d.ts" />

import type { UserInfo } from '../miniprogram/utils/request'

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    /** 自服务端登录后获得的用户信息 */
    token: string
    appUserInfo: UserInfo | null
    /** 登录是否已过期 */
    loginExpired: boolean
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
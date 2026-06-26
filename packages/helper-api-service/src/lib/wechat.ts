import { redis, cacheKey } from './redis'
import { prisma } from './prisma'

const WECHAT_BASE = 'https://api.weixin.qq.com'

// ============ 类型 ============

export interface Code2SessionResult {
  openid: string
  session_key: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

export interface AccessTokenResult {
  access_token: string
  expires_in: number // 7200
  errcode?: number
  errmsg?: string
}

export interface WechatAppConfig {
  appId: string
  appSecret: string
  appType: string
  appName?: string | null
}

// ============ 数据库查询 ============

/**
 * 从 t_wechat_apps 表查询微信应用配置
 */
export async function getWechatAppConfig(appId: string): Promise<WechatAppConfig | null> {
  const app = await prisma.wechatApp.findUnique({ where: { appId } })
  if (!app || app.appStatus !== 'active') return null

  return {
    appId: app.appId,
    appSecret: app.appSecret,
    appType: app.appType,
    appName: app.appName,
  }
}

// ============ code2Session ============

/**
 * 用临时 code 换取 openid + session_key
 * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 */
export async function code2Session(
  appId: string,
  appSecret: string,
  code: string,
): Promise<Code2SessionResult> {
  const url = `${WECHAT_BASE}/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

  const res = await fetch(url)
  const data: Code2SessionResult = await res.json()

  if (data.errcode && data.errcode !== 0) {
    console.error('[WeChat] code2Session 失败:', data)
    throw new Error(`code2Session failed: ${data.errmsg || 'unknown error'} (${data.errcode})`)
  }

  return data
}

// ============ access_token 管理（Redis 缓存） ============

/**
 * 获取 / 刷新 access_token（自动缓存到 Redis）
 */
export async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  const key = cacheKey('wechat:token', appId)

  // 1. 从 Redis 读取
  const cached = await redis.get(key)
  if (cached) return cached

  // 2. 调微信 API 获取
  const url = `${WECHAT_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`

  const res = await fetch(url)
  const data: AccessTokenResult = await res.json()

  if (data.errcode && data.errcode !== 0) {
    console.error('[WeChat] 获取 access_token 失败:', data)
    throw new Error(`getAccessToken failed: ${data.errmsg || 'unknown error'} (${data.errcode})`)
  }

  // 3. 写入 Redis，提前 5 分钟过期防止边界情况
  const ttl = data.expires_in - 300
  await redis.setex(key, ttl, data.access_token)

  return data.access_token
}

/**
 * 主动清除 token 缓存
 */
export async function clearAccessTokenCache(appId: string): Promise<void> {
  await redis.del(cacheKey('wechat:token', appId))
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { validate } from '@/lib/validator'
import { signToken } from '@/lib/auth'
import { code2Session, getWechatAppConfig } from '@/lib/wechat'
import { LoginRequestSchema } from '@app/shared'
import { ErrorCode } from '@app/shared/constants'

/** 默认小程序 AppID */
const DEFAULT_APPID = 'wx7c3dc180b9b9dc51'

/**
 * 生成随机 10 位数字用户 ID（BIGINT 范围）
 */
function generateUserId(): number {
  // 10 位：1,000,000,000 ~ 9,999,999,999
  const min = 1_000_000_000
  const max = 9_999_999_999
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * POST /api/v1/auth/login
 * 微信小程序静默登录
 *
 * Body: { code: string }
 * Response: { token: string, user: UserInfo }
 */
export async function POST(req: NextRequest) {
  // ---- 校验参数 ----
  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const result = await validate(LoginRequestSchema, body)
  if (!result.success) return result.error

  const { code } = result.data

  // ---- 1. 从 t_wechat_apps 表查询小程序配置 ----
  const appConfig = await getWechatAppConfig(DEFAULT_APPID)
  if (!appConfig) {
    console.error('[Login] 未找到微信应用配置, appId:', DEFAULT_APPID)
    return fail(ErrorCode.INTERNAL_ERROR, '服务器配置缺失')
  }

  if (appConfig.appType !== 'mp_miniapp') {
    console.error('[Login] 应用类型不是小程序, appId:', DEFAULT_APPID, 'type:', appConfig.appType)
    return fail(ErrorCode.INTERNAL_ERROR, '应用配置错误')
  }

  // ---- 2. code2Session 获取 openid ----
  let session: { openid: string; session_key: string; unionid?: string }
  try {
    session = await code2Session(appConfig.appId, appConfig.appSecret, code)
  } catch (e: unknown) {
    console.error('[Login] code2Session 失败:', e)
    return fail(ErrorCode.WECHAT_AUTH_FAILED, '微信登录授权失败')
  }

  const { openid, unionid } = session

  // ---- 3. 查找或创建用户 ----
  let user = await prisma.user.findUnique({ where: { openId: openid } })

  if (!user) {
    // 生成不重复的 10 位 userId
    let userId = generateUserId()
    let retries = 0
    while (retries < 10) {
      const exists = await prisma.user.findUnique({ where: { userId } })
      if (!exists) break
      userId = generateUserId()
      retries++
    }

    user = await prisma.user.create({
      data: {
        userId,
        openId: openid,
        unionId: unionid || null,
        nickname: '断联者',
      },
    })
  }

  // ---- 3. 签发 JWT ----
  const token = await signToken({ userId: Number(user.userId) })

  return ok(
    {
      token,
      user: {
        userId: Number(user.userId),
        openId: user.openId,
        unionId: user.unionId,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    },
    '登录成功',
  )
}

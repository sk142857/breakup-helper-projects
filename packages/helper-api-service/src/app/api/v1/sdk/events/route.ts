import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { ErrorCode } from '@app/shared/constants'

/** 16 位随机 hex */
function randomId16(): string {
  const arr = new Uint8Array(8)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

let seq = 0
function snowflakeId(): bigint {
  const ts = BigInt(Date.now())
  seq = (seq + 1) & 0xFFF
  return (ts << 12n) | BigInt(seq)
}

interface EventItem {
  eventType: string
  eventName?: string
  pagePath?: string
  pageTitle?: string
  pageQuery?: string
  referrerPath?: string
  duration?: number
  scene?: number
  deviceBrand?: string
  deviceModel?: string
  osVersion?: string
  platform?: string
  appVersion?: string
  wxVersion?: string
  networkType?: string
  extra?: Record<string, unknown>
}

/**
 * POST /api/v1/sdk/events
 *
 * 独立事件上报 — 接收批量事件，异步写入不阻塞
 *
 * Body: { md5: string, deviceInfoId?: string, events: EventItem[] }
 */
export async function POST(req: NextRequest) {
  // 不要求强制鉴权 — token 可选，有则关联用户
  let userId: bigint | null = null
  let openId: string | null = null

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { jwtVerify } = await import('jose')
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '')
      const token = authHeader.slice(7)
      const { payload } = await jwtVerify(token, secret)
      userId = BigInt(payload.userId as number)
      const user = await prisma.user.findUnique({ where: { userId } })
      openId = user?.openId || null
    } catch {
      // token 无效，继续匿名上报
    }
  }

  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.events) || body.events.length === 0) {
    return fail(ErrorCode.BAD_REQUEST, '缺少 events 数组')
  }

  const md5 = body.md5 as string | undefined
  const deviceInfoId = body.deviceInfoId as string | undefined

  try {
    const writes: Promise<unknown>[] = []

    for (const ev of body.events as EventItem[]) {
      if (!ev.eventType) continue

      const ts = new Date()
      ts.setMilliseconds(0)

      writes.push(
        prisma.sdkEventLog.create({
          data: {
            logId: snowflakeId(),
            timestamp: ts,
            userId: userId ?? undefined,
            openId,
            deviceInfoId,
            eventType: ev.eventType,
            eventName: ev.eventName,
            pagePath: ev.pagePath,
            pageTitle: ev.pageTitle,
            pageQuery: ev.pageQuery,
            referrerPath: ev.referrerPath,
            duration: ev.duration,
            scene: ev.scene,
            sessionId: md5,
            deviceBrand: ev.deviceBrand,
            deviceModel: ev.deviceModel,
            osVersion: ev.osVersion,
            platform: ev.platform,
            appVersion: ev.appVersion,
            wxVersion: ev.wxVersion,
            networkType: ev.networkType,
            extra: ev.extra ?? undefined,
          },
        }).catch(e => console.error('[SDK-Events] 写入失败:', e)),
      )
    }

    // 异步写入，不阻塞
    Promise.all(writes).catch(e => console.error('[SDK-Events] 批量写入异常:', e))

    return ok({ accepted: body.events.length })
  } catch (e) {
    console.error('[SDK-Events] 异常:', e)
    return fail(ErrorCode.INTERNAL_ERROR, '事件上报失败')
  }
}

// 支持 OPTIONS 预检（dev 环境跨域）
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

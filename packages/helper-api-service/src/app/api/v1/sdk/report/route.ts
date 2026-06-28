import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'

/** 16 位随机 hex 字符串 */
function randomId16(): string {
  const arr = new Uint8Array(8)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

/** 基于时间戳的雪花 ID（毫秒级） */
let seq = 0
function snowflakeId(): bigint {
  const ts = BigInt(Date.now())
  seq = (seq + 1) & 0xFFF
  return (ts << 12n) | BigInt(seq)
}

/**
 * POST /api/v1/sdk/report
 * 微信小程序 SDK 数据采集 — 一次性上报全部信息
 */
export async function POST(req: NextRequest) {
  // ---- 鉴权 ----
  const auth = await authGuard(req)
  if ('error' in auth) return auth.error
  const { userId } = auth.ctx

  // ---- 解析 ----
  const body = await req.json().catch(() => null)
  if (!body) return fail(ErrorCode.BAD_REQUEST, '请求体不能为空')

  const md5 = body.md5 as string | undefined

  // 查 openId
  const user = await prisma.user.findUnique({ where: { userId: BigInt(userId) } })
  const openId = user?.openId || null

  try {
    const writes: Promise<unknown>[] = []

    // 生成统一设备标识，所有子表通过 deviceInfoId 关联
    const deviceInfoId = randomId16()

    // 1. 设备信息
    if (body.deviceInfo) {
      const di = body.deviceInfo
      writes.push(
        prisma.sdkDeviceInfo.create({
          data: {
            infoId: deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            abi: di.abi, deviceAbi: di.deviceAbi,
            benchmarkLevel: di.benchmarkLevel, modelLevel: di.modelLevel,
            brand: di.brand, model: di.model, systemName: di.systemName,
            platform: di.platform, cpuType: di.cpuType, memorySize: di.memorySize,
          },
        }).catch(e => console.error('[SDK] deviceInfo 写入失败:', e)),
      )
    }

    // 2. App 基础信息
    if (body.appBaseInfo) {
      const ai = body.appBaseInfo
      writes.push(
        prisma.sdkAppBaseInfo.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            sdkVersion: ai.sdkVersion, enableDebug: ai.enableDebug,
            hostAppId: ai.hostAppId, language: ai.language,
            version: ai.version, theme: ai.theme,
            fontSizeScaleFactor: ai.fontSizeScaleFactor,
            fontSizeSetting: ai.fontSizeSetting,
          },
        }).catch(e => console.error('[SDK] appBaseInfo 写入失败:', e)),
      )
    }

    // 3. 电量信息
    if (body.batteryInfo) {
      const bi = body.batteryInfo
      writes.push(
        prisma.sdkBatteryInfo.create({
          data: {
            infoId: randomId16(), deviceInfoId, userId: BigInt(userId), md5Str: md5, openId: openId!,
            batteryLevel: bi.batteryLevel, isCharging: bi.isCharging,
            isLowPowerModeEnabled: bi.isLowPowerModeEnabled,
          },
        }).catch(e => console.error('[SDK] batteryInfo 写入失败:', e)),
      )
    }

    // 4. 窗口信息
    if (body.windowInfo) {
      const wi = body.windowInfo
      writes.push(
        prisma.sdkWindowInfo.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            pixelRatio: wi.pixelRatio, screenWidth: wi.screenWidth,
            screenHeight: wi.screenHeight, windowWidth: wi.windowWidth,
            windowHeight: wi.windowHeight, statusBarHeight: wi.statusBarHeight,
            safeArea: wi.safeArea ?? undefined, screenTop: wi.screenTop ?? 0,
          },
        }).catch(e => console.error('[SDK] windowInfo 写入失败:', e)),
      )
    }

    // 5. 网络信息
    if (body.networkInfo) {
      const ni = body.networkInfo
      writes.push(
        prisma.sdkNetworkType.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            networkType: ni.networkType, signalStrength: ni.signalStrength,
            hasSystemProxy: ni.hasSystemProxy ? 1 : 0,
            weakNet: ni.weakNet ? 1 : 0,
          },
        }).catch(e => console.error('[SDK] networkInfo 写入失败:', e)),
      )
    }

    // 6. 系统设置
    if (body.systemSetting) {
      const ss = body.systemSetting
      writes.push(
        prisma.sdkSystemSetting.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            bluetoothEnabled: ss.bluetoothEnabled,
            locationEnabled: ss.locationEnabled,
            wifiEnabled: ss.wifiEnabled,
            deviceOrientation: ss.deviceOrientation,
          },
        }).catch(e => console.error('[SDK] systemSetting 写入失败:', e)),
      )
    }

    // 7. Skyline 信息
    if (body.skylineInfo) {
      const si = body.skylineInfo
      writes.push(
        prisma.sdkSkylineInfo.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            isSupported: si.isSupported, version: si.version,
            appVersion: si.appVersion, reason: si.reason,
          },
        }).catch(e => console.error('[SDK] skylineInfo 写入失败:', e)),
      )
    }

    // 8. 启动参数
    if (body.launchOptions) {
      const lo = body.launchOptions
      writes.push(
        prisma.sdkLaunchOptions.create({
          data: {
            infoId: randomId16(), deviceInfoId, openId: openId!, userId: BigInt(userId), md5Str: md5,
            path: lo.path, scene: lo.scene, appId: lo.appId,
            queryObj: lo.queryObj ?? undefined,
            shareTicket: lo.shareTicket,
            referrerInfo: lo.referrerInfo ?? undefined,
            forwardMaterials: lo.forwardMaterials ?? undefined,
            chatType: lo.chatType, apiCategory: lo.apiCategory,
          },
        }).catch(e => console.error('[SDK] launchOptions 写入失败:', e)),
      )
    }

    // 9. 性能条目（批量）
    if (body.performanceEntries && body.performanceEntries.length > 0) {
      for (const pe of body.performanceEntries) {
        writes.push(
          prisma.sdkPerformanceInfo.create({
            data: {
              infoId: randomId16(), deviceInfoId, userId: BigInt(userId), md5Str: md5, openId,
              entryType: pe.entryType, startTime: pe.startTime ? BigInt(pe.startTime) : undefined,
              duration: pe.duration, navigationType: pe.navigationType,
              path: pe.path, pageId: pe.pageId ? BigInt(pe.pageId) : undefined,
            },
          }).catch(e => console.error('[SDK] performanceInfo 写入失败:', e)),
        )
      }
    }

    // 10. 事件日志（批量） — 无 deviceInfoId
    if (body.events && body.events.length > 0) {
      for (const ev of body.events) {
        if (!ev.eventType) continue
        const ts = ev.timestamp ? new Date(ev.timestamp) : new Date()
        ts.setMilliseconds(0)
        writes.push(
          prisma.sdkEventLog.create({
            data: {
              logId: snowflakeId(),
              timestamp: ts,
              userId: BigInt(userId),
              openId,
              eventType: ev.eventType,
              eventName: ev.eventName,
              pagePath: ev.pagePath,
              pageTitle: ev.pageTitle,
              pageQuery: ev.pageQuery,
              sessionId: md5,
            },
          }).catch(e => console.error('[SDK] eventLog 写入失败:', e)),
        )
      }
    }

    // 异步写入，不阻塞响应
    Promise.all(writes).catch(e => console.error('[SDK] 批量写入异常:', e))
  } catch (e) {
    console.error('[SDK] 数据上报异常:', e)
    return fail(ErrorCode.INTERNAL_ERROR, '数据上报失败')
  }

  return ok(null, '上报成功')
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'

// ============================================================
// SDK 表名 → Prisma 委托映射（白名单）
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDelegate = any

const tableMap: Record<string, {
  delegate: AnyDelegate
  searchFields: string[]
  defaultOrderBy: Record<string, 'asc' | 'desc'>
}> = {
  device_info: {
    delegate: prisma.sdkDeviceInfo,
    searchFields: ['openId', 'brand', 'model', 'platform'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  app_base_info: {
    delegate: prisma.sdkAppBaseInfo,
    searchFields: ['openId', 'sdkVersion', 'language'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  battery_info: {
    delegate: prisma.sdkBatteryInfo,
    searchFields: ['openId'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  window_info: {
    delegate: prisma.sdkWindowInfo,
    searchFields: ['openId'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  network_type: {
    delegate: prisma.sdkNetworkType,
    searchFields: ['openId', 'networkType'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  system_setting: {
    delegate: prisma.sdkSystemSetting,
    searchFields: ['openId'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  skyline_info: {
    delegate: prisma.sdkSkylineInfo,
    searchFields: ['openId', 'appVersion'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  performance_info: {
    delegate: prisma.sdkPerformanceInfo,
    searchFields: ['openId', 'entryType', 'path'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  launch_options: {
    delegate: prisma.sdkLaunchOptions,
    searchFields: ['openId', 'path'],
    defaultOrderBy: { createdAt: 'desc' },
  },
  event_log: {
    delegate: prisma.sdkEventLog,
    searchFields: ['openId', 'eventType', 'eventName', 'pagePath'],
    defaultOrderBy: { createdAt: 'desc' },
  },
}

/**
 * GET /api/admin/v1/sdk?table=device_info&page=1&size=20&keyword=xxx
 *
 * SDK 数据管理端分页查询 —— 仅 staff token 可访问
 */
export async function GET(req: NextRequest) {
  // 鉴权：必须是 staff 角色
  const auth = await authGuard(req, 'staff')
  if ('error' in auth) return auth.error

  const { searchParams } = req.nextUrl
  const table = searchParams.get('table')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '20', 10)))
  const keyword = searchParams.get('keyword') || ''

  if (!table || !tableMap[table]) {
    return fail(ErrorCode.VALIDATION_ERROR, `无效的表名: ${table || '(空)'}`)
  }

  const { delegate, searchFields, defaultOrderBy } = tableMap[table]

  // 构建搜索条件
  const where: Record<string, unknown> = {}
  if (keyword && searchFields.length > 0) {
    const orConditions: Record<string, unknown>[] = []
    for (const field of searchFields) {
      // user_id / scene 尝试数字精确匹配
      if (field === 'userId' || field === 'scene') {
        const num = parseInt(keyword, 10)
        if (!isNaN(num)) {
          orConditions.push({ [field]: num })
        }
      }
      orConditions.push({ [field]: { contains: keyword } })
    }
    where.OR = orConditions
  }

  try {
    const [list, total] = await Promise.all([
      delegate.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: defaultOrderBy,
      }),
      delegate.count({ where }),
    ])

    return ok({ list, total, page, size })
  } catch (error) {
    console.error(`[SDK Admin] 查询 ${table} 失败:`, error)
    return fail(ErrorCode.INTERNAL_ERROR, '查询失败')
  }
}

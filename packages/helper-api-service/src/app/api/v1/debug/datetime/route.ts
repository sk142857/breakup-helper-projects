import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { ErrorCode } from '@app/shared/constants'

/** BigInt → Number，JSON 可序列化 */
function sanitize(v: unknown): unknown {
  return typeof v === 'bigint' ? Number(v) : v
}

/**
 * GET /api/v1/debug/datetime
 * 测试日期时间 —— 对比 Node.js 与 MySQL 时间
 */
export async function GET() {
  try {
    // Node.js 侧时间
    const nodeNow = new Date()
    const nodeIso = nodeNow.toISOString()
    const nodeLocale = nodeNow.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

    // MySQL 侧时间
    const rows = await prisma.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(
      `SELECT
        NOW()                AS mysqlNow,
        CURDATE()            AS mysqlDate,
        CURTIME()            AS mysqlTime,
        @@session.time_zone  AS sessionTz,
        @@global.time_zone   AS globalTz,
        UNIX_TIMESTAMP()     AS unixTs
      `
    )
    const m = rows[0]

    return ok({
      node: {
        iso: nodeIso,
        locale: nodeLocale,
        timestamp: nodeNow.getTime(),
        timezoneOffset: nodeNow.getTimezoneOffset(),
      },
      mysql: {
        now:       sanitize(m.mysqlNow),
        date:      sanitize(m.mysqlDate),
        time:      sanitize(m.mysqlTime),
        sessionTimezone: sanitize(m.sessionTz),
        globalTimezone:  sanitize(m.globalTz),
        unixTimestamp:   sanitize(m.unixTs),
      },
    })
  } catch (e) {
    return fail(ErrorCode.INTERNAL_ERROR, (e as Error).message)
  }
}

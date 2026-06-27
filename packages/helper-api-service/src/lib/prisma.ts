import { PrismaClient } from '@prisma/client'

// ── Prisma 客户端（全局单例）────────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ── 启动诊断（由 instrumentation.ts 调用）───────────────────
const G = '\x1b[32m' // green
const R = '\x1b[31m' // red
const Y = '\x1b[33m' // yellow
const B = '\x1b[36m' // cyan
const N = '\x1b[0m'  // reset

function parseDbUrl(url: string) {
  try {
    const u = new URL(url)
    return {
      host: u.hostname,
      port: u.port || '3306',
      database: u.pathname.replace(/^\//, ''),
    }
  } catch {
    return { host: 'unknown', port: 'unknown', database: 'unknown' }
  }
}

export async function printStartupInfo() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  const db = parseDbUrl(dbUrl)

  console.log('')
  console.log(`${B}══════════════════════════════════════════${N}`)
  console.log(`  Project : @app/helper-api-service v0.0.1`)
  console.log(`  Env     :`, process.env.NODE_ENV ?? 'development')
  console.log(`  DB Host :`, `${db.host}:${db.port}`)
  console.log(`  DB Name :`, db.database)
  console.log(`${B}──────────────────────────────────────────${N}`)

  // 确保连接后再查询
  await prisma.$connect()

  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT VERSION() AS version, NOW() AS serverTime, @@session.time_zone AS timezone`
    )
    const r = rows[0]
    console.log(`  ${G}✓ DB 连接成功${N}`)
    console.log(`  MySQL   :`, r.version)
    console.log(`  Time    :`, r.serverTime)
    console.log(`  TZ      :`, r.timezone)
  } catch (e) {
    console.log(`  ${R}✗ DB 连接失败${N}:`, (e as Error).message)
  }

  console.log(`${B}══════════════════════════════════════════${N}`)
  console.log('')
}

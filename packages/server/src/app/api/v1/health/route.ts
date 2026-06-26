import { ok } from '@/lib/response'

/**
 * GET /api/v1/health
 * 健康检查接口
 */
export async function GET() {
  return ok({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
}

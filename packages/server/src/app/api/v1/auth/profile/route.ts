import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/response'
import { authGuard } from '@/lib/authGuard'
import { ErrorCode } from '@app/shared/constants'

/**
 * GET /api/v1/auth/profile
 * 获取当前登录用户信息
 */
export async function GET(req: NextRequest) {
  const guardResult = await authGuard(req)
  if ('error' in guardResult) return guardResult.error

  const { userId } = guardResult.ctx

  const user = await prisma.user.findUnique({ where: { userId } })
  if (!user) {
    return fail(ErrorCode.USER_NOT_FOUND)
  }

  return ok({
    userId: Number(user.userId),
    openId: user.openId,
    unionId: user.unionId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    userStatus: user.userStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

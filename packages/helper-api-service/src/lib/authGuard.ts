import { NextRequest } from 'next/server'
import { verifyToken, type JwtPayload } from './auth'
import { fail } from './response'
import { ErrorCode } from '@app/shared/constants'

export interface AuthContext {
  userId: number
  role?: string
}

/**
 * 从请求中验证 JWT，返回用户上下文
 * 失败时返回 NextResponse（直接 return 即可阻断请求）
 */
export async function authGuard(req: NextRequest): Promise<{ ctx: AuthContext } | { error: Response }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: fail(ErrorCode.UNAUTHORIZED) }
  }

  const token = authHeader.slice(7)

  try {
    const payload: JwtPayload = await verifyToken(token)
    return { ctx: { userId: payload.userId, role: payload.role } }
  } catch {
    return { error: fail(ErrorCode.UNAUTHORIZED, '登录已过期，请重新登录') }
  }
}

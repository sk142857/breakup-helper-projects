import { NextRequest } from 'next/server'
import { verifyToken, type JwtPayload } from './auth'
import { fail } from './response'
import { ErrorCode } from '@app/shared/constants'

export interface AuthContext {
  userId: number
  role?: string
}

/**
 * 从请求中验证 JWT，返回用户上下文。
 *
 * @param requiredRole - 'staff'：仅 staff token 通过
 *                       'user'：仅非 staff token（普通用户/小程序）通过
 *                       不传：不校验角色（慎用）
 */
export async function authGuard(
  req: NextRequest,
  requiredRole?: 'staff' | 'user',
): Promise<{ ctx: AuthContext } | { error: Response }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: fail(ErrorCode.UNAUTHORIZED, '请先登录', 401) }
  }

  const token = authHeader.slice(7)

  try {
    const payload: JwtPayload = await verifyToken(token)

    // 角色校验 —— 防止 token 混用
    if (requiredRole === 'staff' && payload.role !== 'staff') {
      return { error: fail(ErrorCode.UNAUTHORIZED, '后台账号才能访问此接口', 401) }
    }
    if (requiredRole === 'user' && payload.role === 'staff') {
      return { error: fail(ErrorCode.UNAUTHORIZED, '请使用小程序登录', 401) }
    }

    return { ctx: { userId: payload.userId, role: payload.role } }
  } catch {
    return { error: fail(ErrorCode.UNAUTHORIZED, '登录已过期，请重新登录', 401) }
  }
}

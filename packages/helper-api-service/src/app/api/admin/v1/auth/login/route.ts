import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { validate } from '@/lib/validator'
import { ok, fail } from '@/lib/response'
import { StaffLoginRequestSchema } from '@app/shared'
import { ErrorCode } from '@app/shared/constants'

/**
 * POST /api/admin/v1/auth/login
 *
 * 后台员工登录：验证用户名密码，签发 staff JWT
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await validate(StaffLoginRequestSchema, body)
    if (!result.success) return result.error

    const { username, password } = result.data

    // 查找员工
    const staff = await prisma.staff.findUnique({ where: { username } })
    if (!staff || staff.status !== 'active') {
      return fail(ErrorCode.UNAUTHORIZED, '账号或密码错误', 401)
    }

    // 验证密码
    const valid = await bcrypt.compare(password, staff.passwordHash)
    if (!valid) {
      return fail(ErrorCode.UNAUTHORIZED, '账号或密码错误', 401)
    }

    // 签发 JWT（role: 'staff' —— 与小程序的 token 隔离）
    const token = await signToken({ userId: staff.id, role: 'staff' })

    return ok({
      token,
      staff: {
        id: staff.id,
        username: staff.username,
        displayName: staff.displayName,
      },
    })

  } catch (e) {
    console.error('[StaffLogin]', e)
    return fail(ErrorCode.INTERNAL_ERROR, '登录失败，请稍后重试')
  }
}

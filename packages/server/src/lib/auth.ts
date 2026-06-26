import { SignJWT, jwtVerify } from 'jose'
import { ErrorCode } from '@app/shared/constants'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET 未配置')
  return new TextEncoder().encode(secret)
}

export interface JwtPayload {
  userId: number
  role?: string
}

/**
 * 签发 JWT Token
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7200'
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSecret())
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JwtPayload
  } catch {
    throw new AuthError('Token 无效或已过期', ErrorCode.UNAUTHORIZED)
  }
}

export class AuthError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

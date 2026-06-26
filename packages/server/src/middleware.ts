import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 全局中间件 —— CORS + 日志
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'

  // CORS 预检请求直接放行
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-App-Key,X-Timestamp,X-Nonce,X-Signature',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = NextResponse.next()

  // CORS 头
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // 安全头
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  matcher: '/api/:path*',
}

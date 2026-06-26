import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

/** 统一缓存前缀 */
export const CACHE_PREFIX = 'breakup_helper:'

/** 生成带前缀的缓存键 */
export function cacheKey(scope: string, key: string): string {
  return `${CACHE_PREFIX}${scope}:${key}`
}

/** Redis 单例 —— 无密码本地模式 */
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null // 停止重试
    return Math.min(times * 200, 2000)
  },
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[Redis] 连接错误:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] 已连接')
})

// 懒连接：首次使用时自动连接

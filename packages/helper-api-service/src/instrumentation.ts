/**
 * Next.js instrumentation hook —— 服务器启动时执行
 * 打印环境信息 + 数据库连接诊断
 */
export const runtime = 'nodejs'

export async function register() {
  // 动态 import，避免 instrumentation 影响 Tree-shaking
  const { printStartupInfo } = await import('./lib/prisma')

  try {
    await printStartupInfo()
  } catch (e) {
    console.error('❌ 启动诊断失败:', (e as Error).message)
  }
}

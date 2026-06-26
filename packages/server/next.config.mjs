/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯 API 模式，不需要图片优化
  images: { unoptimized: true },
  // 不需要严格模式（生产环境由 Prisma/DB 保证数据安全）
  reactStrictMode: true,
  // 跨域配置由 middleware 处理
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
}

export default nextConfig

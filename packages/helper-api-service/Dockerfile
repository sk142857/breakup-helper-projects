# ============================================
# helper-api-service  (Next.js 14 standalone)
# 构建上下文：项目根目录
# ============================================

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 1. 安装依赖（利用 Docker 层缓存）
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json        ./packages/shared/
COPY packages/helper-api-service/package.json ./packages/helper-api-service/
RUN pnpm install --frozen-lockfile

# 2. 复制源码 & 构建
COPY packages/shared       ./packages/shared
COPY packages/helper-api-service ./packages/helper-api-service
RUN pnpm --filter @app/helper-api-service build

# ---- 生产运行 ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/helper-api-service/.next/standalone ./
COPY --from=builder /app/packages/helper-api-service/.next/static   ./.next/static
COPY --from=builder /app/packages/helper-api-service/prisma          ./prisma

EXPOSE 3000
CMD ["node", "server.js"]

# ============================================
# helper-api-service  (Next.js 14 standalone)
# 构建上下文：项目根目录
# ============================================

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /app

# 1. 复制全部依赖描述文件 & 源码
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json        ./packages/shared/
COPY packages/helper-api-service/package.json ./packages/helper-api-service/
COPY packages/shared       ./packages/shared
COPY packages/helper-api-service ./packages/helper-api-service

# 2. 安装依赖 & 生成 Prisma Client & 构建
RUN pnpm install --frozen-lockfile && \
    cd packages/helper-api-service && npx --no prisma generate && cd /app && \
    pnpm --filter @app/helper-api-service build

# ---- 生产运行 ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# ============ 环境变量（构建时写入镜像） ============
ENV DATABASE_URL="mysql://hy_root:hY#20220104@rm-bp1d1504arsj5sndh.mysql.rds.aliyuncs.com:3306/aliyun_breakup_helper"
ENV REDIS_URL="redis://helper-redis:6379"
ENV JWT_SECRET="breakup-helper-jwt-secret-prod-2026"
# TODO: 生产环境建议运行时注入: docker run -e JWT_SECRET="xxx" 或使用 Docker secrets
ENV JWT_EXPIRES_IN="7200"
ENV SIGNATURE_TTL="300"

COPY --from=builder /app/packages/helper-api-service/.next/standalone ./
COPY --from=builder /app/packages/helper-api-service/.next/static   ./.next/static
COPY --from=builder /app/packages/helper-api-service/prisma          ./prisma

EXPOSE 3000
CMD ["node", "packages/helper-api-service/server.js"]

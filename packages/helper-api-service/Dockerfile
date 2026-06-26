# ============================================
# helper-api-service  (Next.js 14 standalone)
# ============================================

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @app/helper-api-service db:generate
RUN pnpm --filter @app/helper-api-service build

# ---- 生产运行 ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# ============ 环境变量（构建时写入镜像） ============
ENV DATABASE_URL="mysql://hy_root:hY#20220104@rm-bp1d1504arsj5sndh.mysql.rds.aliyuncs.com:3306/aliyun_breakup_helper?useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci&useSSL=false&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true"
ENV REDIS_URL="redis://helper-redis:6379"
ENV JWT_SECRET="breakup-helper-jwt-secret-prod-2026"
ENV JWT_EXPIRES_IN="7200"
ENV SIGNATURE_TTL="300"

COPY --from=builder /app/packages/helper-api-service/.next/standalone ./
COPY --from=builder /app/packages/helper-api-service/.next/static   ./.next/static
COPY --from=builder /app/packages/helper-api-service/prisma          ./prisma

EXPOSE 3000
CMD ["node", "packages/helper-api-service/server.js"]

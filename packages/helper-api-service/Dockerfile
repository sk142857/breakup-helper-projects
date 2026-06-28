# ============================================
# helper-api-service  (Next.js 14 standalone)
# ============================================

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11 --activate
RUN pnpm config set registry https://registry.npmmirror.com
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @app/helper-api-service db:generate
RUN --mount=type=cache,target=/app/packages/helper-api-service/.next/cache \
    pnpm --filter @app/helper-api-service build

# ---- 生产运行 ----
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/helper-api-service/.next/standalone ./
COPY --from=builder /app/packages/helper-api-service/.next/static   ./.next/static
COPY --from=builder /app/packages/helper-api-service/prisma          ./prisma
COPY packages/helper-api-service/.env.production                     ./packages/helper-api-service/.env

EXPOSE 3000
CMD ["node", "packages/helper-api-service/server.js"]

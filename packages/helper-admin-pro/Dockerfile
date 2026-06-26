# ============================================
# helper-admin-pro  (Vite SPA → Nginx)
# ============================================

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @app/helper-admin-pro build

# ---- Nginx 运行 ----
FROM nginx:alpine AS runner

COPY --from=builder /app/packages/helper-admin-pro/dist /usr/share/nginx/html
COPY packages/helper-admin-pro/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

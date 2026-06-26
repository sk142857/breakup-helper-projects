# ============================================
# helper-admin-pro  (Vite SPA → Nginx)
# 构建上下文：项目根目录
# ============================================

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 1. 安装依赖
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json        ./packages/shared/
COPY packages/helper-admin-pro/package.json ./packages/helper-admin-pro/
RUN pnpm install --frozen-lockfile

# 2. 复制源码 & 构建
COPY packages/shared       ./packages/shared
COPY packages/helper-admin-pro ./packages/helper-admin-pro
RUN pnpm --filter @app/helper-admin-pro build

# ---- Nginx 运行 ----
FROM nginx:alpine AS runner

COPY --from=builder /app/packages/helper-admin-pro/dist /usr/share/nginx/html
COPY packages/helper-admin-pro/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

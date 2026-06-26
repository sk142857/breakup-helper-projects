# ============================================
# helper-admin-pro  (Vite SPA → Nginx)
# 构建上下文：项目根目录
# ============================================

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /app

# 1. 复制全部依赖描述文件 & 源码
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json        ./packages/shared/
COPY packages/helper-admin-pro/package.json ./packages/helper-admin-pro/
COPY packages/shared       ./packages/shared
COPY packages/helper-admin-pro ./packages/helper-admin-pro

# 2. 安装依赖 & 构建
RUN pnpm install --frozen-lockfile && pnpm --filter @app/helper-admin-pro build

# ---- Nginx 运行 ----
FROM nginx:alpine AS runner

COPY --from=builder /app/packages/helper-admin-pro/dist /usr/share/nginx/html
COPY packages/helper-admin-pro/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

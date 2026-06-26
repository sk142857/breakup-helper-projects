# breakup-helper · 分手小助手

全栈 TypeScript Monorepo，包含 Open API 服务、后台管理系统、微信小程序三个子项目。

## 🏗️ 项目结构

```
breakup-helper-projects/
├── packages/
│   ├── server/                  # Open API 服务 (Next.js + Prisma + Zod)
│   ├── admin/                   # 后台管理系统 (React + Vite + Ant Design Pro)
│   ├── miniapp/                 # 微信小程序
│   └── shared/                  # 三项目共享（类型、常量、校验 Schema）
├── docker-compose.yml           # 开发环境说明（不使用 Docker）
├── docker-compose.prod.yml      # 生产环境部署 (Redis + Server)
└── pnpm-workspace.yaml
```

## ⚡ 环境隔离

| | 开发环境 | 生产环境 |
|------|---------|----------|
| MySQL | `localhost:3306` `root` / `123456` | 阿里云 RDS `rm-bp1d15...mysql.rds.aliyuncs.com` |
| Redis | `localhost:6379` | Docker 容器 `redis-server:6379` |
| 网络 | — | `hongyan-net` |
| 配置文件 | `.env.development` | `.env.production` |

## 🚀 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 切换开发环境配置
pnpm env:dev               # copies .env.development → .env

# 3. 初始化数据库（确保本地 MySQL 已启动）
pnpm db:generate           # 生成 Prisma Client
pnpm db:push               # 同步表结构到数据库

# 4. 启动各服务
pnpm dev:server            # API 服务 → http://localhost:3000
pnpm dev:admin             # 管理后台 → http://localhost:5173
```

## 🚢 生产环境部署

```bash
# 切换生产环境配置
pnpm env:prod               # copies .env.production → .env

# 构建
pnpm build:server

# 启动（Docker Compose）
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm env:dev` | 切换为开发环境配置 |
| `pnpm env:prod` | 切换为生产环境配置 |
| `pnpm dev:server` | 启动 API 服务 (port 3000) |
| `pnpm dev:admin` | 启动管理后台 (port 5173) |
| `pnpm db:push` | 同步 Prisma Schema 到数据库 |
| `pnpm db:studio` | 打开 Prisma 数据管理界面 |
| `pnpm db:generate` | 重新生成 Prisma Client |

## 🛠️ 技术栈

| 项目 | 技术 |
|------|------|
| **接口服务** | Next.js 14 + TypeScript + Prisma + Zod + jose |
| **后台管理** | React 18 + Vite + Ant Design 5 + ProComponents |
| **微信小程序** | 原生 TypeScript + Less |
| **共享层** | TypeScript + Zod（类型定义一次，三端复用） |
| **数据库** | MySQL 8.0 |
| **缓存** | Redis 7 |
| **包管理** | pnpm workspace |

## 🔑 核心设计

### 统一响应格式
```json
{
  "code": 0,
  "message": "成功",
  "data": {},
  "timestamp": 1719360000000
}
```

### 类型共享
`packages/shared` 中的类型和 Zod Schema 同时被 server（校验请求）、admin（表单校验）、miniapp（表单校验）引用，一处定义，三处生效。

### API 路由
Next.js App Router 文件路由：`src/app/api/v1/users/route.ts` → `GET/POST /api/v1/users`

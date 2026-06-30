# 分手小助手 — 产品白皮书

> 版本：v2.0 | 最后更新：2026-06-30

---

## 目录

1. [产品概述](#1-产品概述)
2. [产品架构](#2-产品架构)
3. [功能矩阵](#3-功能矩阵)
4. [用户旅程](#4-用户旅程)
5. [技术架构](#5-技术架构)
6. [数据模型](#6-数据模型)
7. [安全与合规](#7-安全与合规)
8. [部署运维](#8-部署运维)
9. [共享 SDK 层](#9-共享-sdk-层)
10. [路线图](#10-路线图)

---

## 1. 产品概述

### 1.1 产品定位

**分手小助手**是一款以微信小程序为载体的断联期打卡与情感记录工具，帮助用户在情感修复期间量化自律进度、记录心情波动、可视化断联成果。

产品围绕"一段感情的断联旅程"这一核心场景，提供从关系建档 → 断联期规划 → 每日打卡 → 里程碑成就的完整闭环。

### 1.2 目标用户

| 用户画像 | 痛点 | 产品价值 |
|---------|------|---------|
| 刚经历分手的年轻用户 | 情绪波动、难以坚持断联 | 量化自律进度、获得成就感 |
| 处于暧昧关系中的用户 | 需要控制联系频率 | 记录情绪变化、提供冷静空间 |
| 正在尝试挽回的用户 | 无法客观评估断联效果 | 数据化追踪、里程碑激励机制 |

### 1.3 产品理念

- **量化情感**：将抽象的情感修复过程转化为可量化的打卡记录与进度追踪
- **自律赋能**：通过里程碑系统与进度条，将大目标拆解为可达成的小节点
- **隐私优先**：所有数据归属用户个人，微信授权体系天然保障身份安全

---

## 2. 产品架构

```
┌─────────────────────────────────────────────────────────────┐
│                    微信小程序 (Skyline)                       │
│  ┌───────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 首页   │ │ 感情列表  │ │ 断联综合  │ │ 个人中心  │          │
│  │ 仪表盘 │ │ iOS卡片UI │ │ 档案+统计  │ │ 我的页面  │          │
│  └───────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────────────────────────────────────────────┐       │
│  │  断联打卡 (4步向导: 日期→心情→状态→记录)           │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  断联记录列表 (档案卡片 + iOS 风格记录卡)           │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / JWT
┌──────────────────────────▼──────────────────────────────────┐
│                 Next.js API 服务 (App Router)                 │
│  ┌──────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │
│  │ 用户  │ │ 感情   │ │ 断联期   │ │ 记录   │ │ 里程碑   │  │
│  │ 认证  │ │ CRUD   │ │ CRUD     │ │ 打卡   │ │ 成就系统  │  │
│  └──────┘ └────────┘ └──────────┘ └────────┘ └──────────┘  │
│  ┌──────┐ ┌────────┐ ┌──────────────────┐                   │
│  │ 上传  │ │ 字典   │ │ SDK 数据采集     │                   │
│  │ 服务  │ │ 服务   │ │ (设备/网络/设置) │                   │
│  └──────┘ └────────┘ └──────────────────┘                   │
└────────┬──────────────────────┬─────────────────────────────┘
         │                      │
    ┌────▼─────┐          ┌─────▼──────┐
    │  MySQL 8 │          │  Redis 7   │
    │  RDS     │          │  缓存/限流  │
    └──────────┘          └────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 后台管理系统 (React + Ant Design Pro)        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 仪表盘   │ │ 用户管理  │ │ SDK信息   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 子系统职责

| 子系统 | 技术栈 | 职责 |
|--------|--------|------|
| 微信小程序 | Skyline + TypeScript + tdesign-miniprogram | 用户端核心交互（打卡、列表、统计） |
| API 服务 | Next.js 14 + Prisma + Zod | RESTful 接口、业务逻辑、数据持久化 |
| 后台管理 | React 18 + Vite + Ant Design Pro 5 | 用户管理、SDK 信息查看 |
| 共享层 | TypeScript + Zod | 类型定义、校验 Schema、常量（三端共用） |

---

## 3. 功能矩阵

### 3.1 微信小程序

#### 3.1.1 首页仪表盘 (`pages/dashboard`)

| 功能 | 描述 |
|------|------|
| 概览统计 | 显示总关系数、进行中数量、已结束数量、总打卡次数 |
| 关系卡片列表 | 展示所有感情关系的摘要信息卡片 |
| 快捷入口 | 点击卡片进入断联综合页、底部 FAB 新增关系 |

#### 3.1.2 感情列表 (`pages/relationships/list`)

| 功能 | 描述 |
|------|------|
| iOS 风格卡片布局 | 圆角卡片、阴影、渐变头像背景 |
| 个人头像 | 上传头像或自动取昵称首字作为默认头像（带风格渐变背景） |
| 信息栏 | 状态标签 / 持续天数 / 断联天数（三栏分隔） |
| 日期区间 | 开始日期 → 结束日期（仍在进行中不显示结束日期） |
| 进度条 | 断联天数 / 目标天数，完成度百分比可视化 |
| 备注预览 | 引用图标 + 两行文字截断 |
| 图片墙 | flex:1 三列布局，超过 3 张显示 +N 角标 |
| 状态标签 | 进行中（红）/ 已结束（绿）/ 暂停中（橙） |
| 删除关系 | 右上角删除图标，二次确认弹窗 |

#### 3.1.3 断联综合 (`pages/break-sessions/index`)

| 功能 | 描述 |
|------|------|
| 感情档案卡片 | 与感情列表一致的 iOS 卡片风格 |
| 编辑关系 | 右下角编辑图标，跳转至关系编辑页 |
| 删除关系 | 右上角删除图标，二次确认弹窗 |
| 综合统计 | 总断联次数 / 进行中 / 总打卡次数 |
| 断联期列表 | 按时间排序，每段断联期包含日期范围、状态、进度条 |
| 查看记录 | 点击断联期跳转到该期的打卡记录列表 |
| 新增断联 | 底部"新增断联"按钮，跳转到断联期创建向导 |

#### 3.1.4 断联记录列表 (`pages/records/list`)

| 功能 | 描述 |
|------|------|
| 感情档案卡片 | 顶部展示当前感情的昵称、头像、类型、统计（记录数/持续天数） |
| iOS 风格记录卡 | 圆角白卡片、情绪颜色圆点 |
| 第 N 天标注 | 根据断联期起始日期自动计算并显示"第N天"标签 |
| 状态标签 | 保持断联中（绿）/ 差点破功（橙）/ 破功了（红）/ 对方联系（蓝） |
| 情绪 Emoji | 8 种心情对应的 Emoji 大图标展示 |
| 文字内容 | 打卡时的心情记录文字 |
| 图片墙 | flex:1 三列缩略图，+N 角标 |
| 删除记录 | 点击删除图标，二次确认 |
| 加载骨架屏 | 数据加载中显示 shimmer 动画 |
| 空状态 | 无记录时显示引导提示 |
| 新增记录 | 底部固定按钮跳转到打卡页面 |

#### 3.1.5 断联打卡 (`pages/records/checkin`)

| 功能 | 描述 |
|------|------|
| 4 步向导 | 关联信息 → 此刻心情 → 断联状态 → 心情记录 |
| 步骤指示器 | 圆点进度指示，已完成/当前/未完成状态区分 |
| Step 1: 日期选择 | picker-view 三列滚轮（年月日），默认当天 |
| Step 2: 心情选择 | 8 种情绪卡片网格布局（难过/伤心/一般/OK/开心/解放/坚定/心碎） |
| Step 3: 断联状态 | 4 种状态选项（保持/差点破功/破功/对方联系） |
| Step 4: 文字记录 | t-textarea 多行输入，最长 500 字 |
| Step 4: 图片上传 | 6 格图片槽位，点击选择/上传，支持删除 |
| 逐表单项校验 | 每一步完成前校验必填项 |
| 保存提交 | 一次性提交所有数据（图片上传已提前完成） |

#### 3.1.6 关系编辑 (`pages/relationships/edit`)

| 功能 | 描述 |
|------|------|
| 分步创建/编辑 | 向导式表单 |
| 日期选择器 | picker-view 独立日期控件（保持 hidden 不销毁） |
| 关系类型 | 初恋/前任/暗恋/暧昧对象/相亲对象/其他 |
| 目标天数 | 默认 100 天 |

#### 3.1.7 其他页面

| 页面 | 功能 |
|------|------|
| 启动页 (`launch`) | 微信登录处理、静默授权 |
| 错误页 (`error`) | 通用错误状态展示 |
| 个人中心 (`mine`) | 用户信息展示 |

### 3.2 后台管理系统

| 模块 | 功能 |
|------|------|
| 仪表盘 | 数据概览、运营指标 |
| 用户管理 | 用户列表、详情查看、状态管理 |
| SDK 信息查看 | 用户设备/网络/系统信息采集数据查阅 |

### 3.3 API 服务

| 路由组 | 功能 |
|--------|------|
| `POST /api/v1/auth/login` | 微信静默登录（code → JWT） |
| `POST /api/v1/auth/refresh` | Token 续期 |
| `GET/POST /api/v1/users` | 用户查询/创建 |
| `GET/PUT /api/v1/users/[id]` | 用户详情/更新 |
| `GET/POST /api/v1/relationships` | 感情关系列表/创建 |
| `GET/PUT/DELETE /api/v1/relationships/[id]` | 感情关系详情/更新/删除 |
| `GET/POST /api/v1/break-sessions` | 断联期列表/创建 |
| `GET/PUT/DELETE /api/v1/break-sessions/[id]` | 断联期详情/更新/删除 |
| `GET/POST /api/v1/records` | 打卡记录列表/创建 |
| `GET/PUT/DELETE /api/v1/records/[id]` | 打卡记录详情/更新/删除 |
| `GET /api/v1/milestones` | 里程碑列表及用户达成情况 |
| `GET /api/v1/dict` | 数据字典查询 |
| `POST /api/v1/upload` | 图片上传（压缩/裁剪/缩略图） |
| `POST /api/v1/sdk/report` | SDK 设备/网络/系统信息上报 |
| `GET /api/v1/health` | 健康检查 |

---

## 4. 用户旅程

### 4.1 核心路径

```
首次启动 → 微信授权登录 → 首页仪表盘（空状态）
  ↓
新增感情关系 → 填写昵称/类型/日期/目标天数
  ↓
感情列表页 → 卡片展示
  ↓
断联综合页 → 查看档案 → 新增断联期
  ↓
每日打卡 → 选择日期 → 选择心情 → 选择状态 → 写记录
  ↓
记录列表 → 查看历史打卡 → 持续坚持
  ↓
里程碑达成 → 获得成就徽章
```

### 4.2 打卡场景

```
场景：用户决定开始断联
  1. 在感情列表点击"新增关系"，填写基本信息
  2. 进入断联综合页，点击"新增断联"设定断联期
  3. 每天打开小程序打卡：
     - 选择当天日期
     - 记录此刻心情（8 种情绪 Emoji）
     - 标记断联状态（保持中 / 差点破功等）
     - 写下心情文字/上传图片
  4. 在记录列表查看打卡历史
  5. 进度条不断增长直至达成目标天数
```

---

## 5. 技术架构

### 5.1 技术栈详表

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端框架（小程序） | Skyline 渲染引擎 | — | 高性能原生渲染，自定义导航 |
| UI 库（小程序） | tdesign-miniprogram | 1.15.2 | 组件库（navbar/button/progress/icon/tag/textarea/empty） |
| 前端框架（后台） | React | 18.x | 管理后台 UI |
| UI 库（后台） | Ant Design 5 + ProComponents | 5.x | 企业级后台组件 |
| 构建（后台） | Vite | 5.x | 快速开发构建 |
| API 框架 | Next.js | 14.2.35 | App Router, 文件路由 |
| 语言 | TypeScript | 5.x | 全栈类型安全 |
| ORM | Prisma | 6.19.3 | 数据库 ORM，engine=none 模式 |
| 数据库 | MySQL | 8.0.44 | 阿里云 RDS |
| 缓存 | Redis | 7 | 会话缓存、限流 |
| 校验 | Zod | 最新 | 运行时类型校验，三端共享 |
| 认证 | jose | 最新 | JWT 签发与验证 |
| 图片处理 | sharp | 最新 | 缩略图生成 |
| 包管理 | pnpm | >=9 | Monorepo workspace |

### 5.2 类型共享体系

`packages/shared` 包是类型安全的基石，所有类型定义和 Zod Schema 在此定义一次，三端复用：

```
┌───────────────────────────────────────────────┐
│              packages/shared                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 类型定义  │  │ Zod Schema│  │  常量    │     │
│  │ (interface)│  │ (校验规则)│  │ (枚举)   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└────────────┬──────────┬──────────┬─────────────┘
             │          │          │
       ┌─────▼──┐ ┌────▼───┐ ┌───▼─────┐
       │ API    │ │ 小程序  │ │ 管理后台 │
       │ 服务端  │ │ 前端   │ │ 前端     │
       └────────┘ └────────┘ └─────────┘
```

- **类型定义**：`User`、`RelationshipInfo`、`RecordInfo`、`BreakSessionInfo`、`DictItem`、`MilestoneItem` 等
- **Zod Schema**：`RelationshipCreateSchema`、`RecordCreateSchema`、`BreakSessionCreateSchema` 等 — 前端做表单预校验，后端做请求参数校验
- **常量**：`ErrorCode` 枚举、`ErrorMessage` 映射、`RelTypeDict`、`MoodDict`、`BreakStatusDict` 等

### 5.3 统一响应格式

所有 API 接口统一响应结构：

```json
{
  "code": 0,
  "message": "成功",
  "data": {},
  "timestamp": 1719360000000
}
```

### 5.4 认证机制

- **微信静默登录**：`wx.login()` → 服务端 `code` 换 `openId` → 签发 JWT
- **Token 生命周期**：自动续期机制，过期自动重新登录
- **请求拦截**：axios 拦截器统一注入 Authorization header
- **服务端验证**：`authGuard()` 中间件，支持 `user`/`admin` 角色

### 5.5 文件上传

- 支持 `avatar`（头像 1:1 裁剪）、`record`（记录图片）、`both`（综合）
- 自动生成缩略图（sharp 处理）
- 文件写入磁盘后 `fs.access()` 验证写入成功
- Docker 卷挂载确保数据持久化

---

## 6. 数据模型

### 6.1 核心 E-R 关系

```
User (1) ──── (N) Relationship (1) ──── (N) BreakSession (1) ──── (N) Record
  │
  └── UserMilestone (N) ──── Milestone (1)
```

### 6.2 主要数据表

| 表 | 说明 | 关键字段 |
|----|------|---------|
| `t_users` | 用户表 | userId, openId, nickname, avatarUrl, phone, userStatus |
| `t_relationships` | 感情关系表 | relId, userId, nickname, avatarUrl, relType, startDate, endDate, breakTargetDays, relStatus, note, images |
| `t_break_sessions` | 断联期表 | sessionId, relId, initiator, startDate, endDate, targetDays, status, note |
| `t_records` | 打卡记录表 | recordId, relId, sessionId, recordDate, recMood, recBkStatus, content, images |
| `t_user_milestones` | 用户里程碑 | umId, relId, msId, days, achievedAt |
| `t_milestones` | 里程碑定义 | msId, days, title, emoji, sortOrder |
| `t_dict_data` | 数据字典 | dictId, dictType, dictCode, dictLabel, dictEmoji |

### 6.3 字段命名规范

- **列名**：驼峰式（nickname, avatarUrl, startDate）
- **主键**：自增 `id`（用户表/里程碑）或 UUID `xxxId`（关系/断联期/记录）
- **外键**：`xxxId` 格式
- **@map 注解**：所有字段使用 `@map` 映射到数据库列名
- **时间戳**：`createdAt` / `updatedAt`

---

## 7. 安全与合规

### 7.1 传输安全

- API 仅通过 HTTPS 443 端口提供服务
- Nginx 反向代理，配置 HTTP/2、TLS 1.2/1.3
- 安全响应头：`X-Content-Type-Options`、`X-Frame-Options`、`X-XSS-Protection`、`Referrer-Policy`

### 7.2 请求安全

- **限流**：API 10r/s，突发 20（Nginx `limit_req`）
- **方法限制**：仅允许 WHITELIST HTTP 方法
- **JWT 认证**：接口层 `authGuard` 中间件校验

### 7.3 数据校验

- **前端**：Zod Schema 表单提交前校验
- **后端**：Zod Schema 请求参数二次校验
- **日期校验**：所有日期字段 `.refine(d => !isNaN(new Date(d).getTime()), '日期格式无效')`
- **错误码体系**：统一 `ErrorCode` + `ErrorMessage`

### 7.4 文件安全

- 上传文件类型校验（仅允许图片）
- 文件大小限制（10MB）
- 自动缩略图生成（不暴露原图 URL 风险）
- 图片目录 Docker 卷挂载，宿主机关联目录只读保护

### 7.5 用户隐私

- 微信授权体系：用户 ID 基于 openId，不收集手机号等敏感信息
- 数据隔离：用户仅能访问自己的感情关系、记录
- 删除机制：关系删除级联删除下属断联期和记录

---

## 8. 部署运维

### 8.1 生产环境拓扑

```
用户 → 微信小程序
         ↓ HTTPS
Nginx (反向代理/SSL 终止)
    ├── api.hyqingren.com → helper-api-service:3000 (API)
    └── admin.hyqingren.com → helper-admin-pro:8080 (管理后台)
         ↓ Inner Docker Network (hongyan-net)
helper-api-service ─── MySQL (阿里云 RDS)
                   ─── Redis (Docker 容器)
                   ─── uploads (Docker Volume)
```

### 8.2 容器化

| 服务 | 镜像 | 暴露端口 |
|------|------|---------|
| API 服务 | registry.cn-hangzhou.aliyuncs.com/hongyan-service/helper-api:latest | 3000 |
| 管理后台 | registry.cn-hangzhou.aliyuncs.com/hongyan-service/helper-admin:latest | 8080 |
| Redis | registry.cn-hangzhou.aliyuncs.com/hongyan-service/redis:7-alpine | 6379 |
| Nginx | registry.cn-hangzhou.aliyuncs.com/hongyan-service/nginx:alpine | 80/443 |

### 8.3 数据持久化

```yaml
volumes:
  - /root/docker_home/helper-api-service/uploads:/app/uploads   # 图片文件
  - /root/docker_home/helper-redis/data:/data                   # Redis 持久化
```

### 8.4 部署流程

```bash
# 1. 构建镜像
docker build -t helper-api:latest -f packages/helper-api-service/Dockerfile .
docker build -t helper-admin:latest -f packages/helper-admin-pro/Dockerfile .

# 2. 推送镜像
docker tag helper-api:latest registry.cn-hangzhou.aliyuncs.com/.../helper-api:latest
docker push registry.cn-hangzhou.aliyuncs.com/.../helper-api:latest

# 3. 服务器拉取并启动
ssh root@server "docker pull ... && cd /root && bash deploy.sh"
```

### 8.5 域名服务

| 域名 | 用途 | 证书 |
|------|------|------|
| `api.hyqingren.com` | API 服务 | SSL（阿里云免费/Let's Encrypt） |
| `admin.hyqingren.com` | 管理后台 | HTTP（仅内网） |

---

## 9. 共享 SDK 层

### 9.1 SDK 数据采集接口

小程序内置数据采集功能，用于运营分析和问题排查：

| 信息类型 | 采集内容 |
|---------|---------|
| App 基础信息 | SDK 版本、语言、主题、字体大小 |
| 设备信息 | 品牌、型号、系统、CPU、内存 |
| 网络信息 | 网络类型、信号强度、代理状态 |
| 窗口信息 | 分辨率、安全区域、状态栏高度 |
| 系统设置 | 蓝牙、定位、WiFi 状态 |
| 电量信息 | 电量百分比、充电状态 |

### 9.2 事件追踪

- 用户行为事件上报（eventEnum 定义）
- 支持自定义事件属性
- 用于产品数据分析和功能优化

---

## 10. 路线图

### 当前版本 (v2.0)

- [x] 感情关系 CRUD（iOS 卡片风格 UI）
- [x] 断联期管理（创建/删除/进度追踪）
- [x] 每日打卡（4 步向导：日期→心情→状态→记录）
- [x] 打卡记录列表（档案卡片 + 情绪展示）
- [x] 图片上传与缩略图（Docker 卷持久化）
- [x] 里程碑成就系统
- [x] 微信静默登录与 JWT 认证
- [x] 后台用户管理与 SDK 信息查看
- [x] 生产环境 Docker 部署

### 即将上线

- [ ] 打卡记录编辑功能
- [ ] 断联期统计图表（周/月趋势）
- [ ] 关系时间线（可视化感情历程）
- [ ] 数据导出功能
- [ ] 多语言支持

### 远期规划

- [ ] AI 情感分析建议
- [ ] 断联社区（匿名分享）
- [ ] 第三方登录（手机号/邮箱）
- [ ] 桌面端 PWA

---

## 附录

### A. 项目结构

```
breakup-helper-projects/
├── data/
│   └── init.sql                  # 数据库初始化脚本（21 表）
├── docs/
│   ├── deploy.md                 # 部署文档
│   ├── utc-rationale.md          # UTC 时间选择说明
│   └── whitepaper.md             # 本白皮书
├── packages/
│   ├── helper-api-service/       # Next.js API 服务
│   │   ├── prisma/               # Schema + 迁移 SQL
│   │   ├── src/app/api/v1/       # RESTful 路由
│   │   ├── src/lib/              # 通用库（auth/prisma/redis/image）
│   │   └── Dockerfile
│   ├── helper-admin-pro/         # React 管理后台
│   │   ├── src/pages/            # Dashboard/Users/SdkInfo/Login
│   │   ├── src/router/           # 路由配置
│   │   └── Dockerfile
│   ├── helper-miniapp/           # 微信小程序
│   │   ├── miniprogram/pages/    # 11 个页面
│   │   ├── miniprogram/services/ # API 调用层
│   │   ├── miniprogram/utils/    # 工具（auth/request/util）
│   │   └── miniprogram/components/ # 自定义组件
│   └── shared/                   # 共享类型/Schema/常量
│       ├── src/types/            # 9 个类型模块
│       └── src/constants/        # 错误码等常量
├── deploy.sh                     # 服务器部署脚本
├── dev.ps1                       # 本地开发启动脚本
└── pnpm-workspace.yaml
```

### B. 技术栈版本要求

| 工具 | 最低版本 |
|------|---------|
| Node.js | >= 20 |
| pnpm | >= 9 |
| Docker | 24+ |
| MySQL | 8.0 |
| Redis | 7 |

---

> **分手小助手** — 用数据记录每一次成长，用自律穿越每一段时光。
>
> © 2026 分手小助手团队. All rights reserved.

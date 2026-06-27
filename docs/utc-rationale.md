# 采用 UTC 时间方案的理由

> 项目：breakup-helper-projects  
> 数据库：MySQL 8.0  
> ORM：Prisma 6.19  
> 方案：数据库统一存储 UTC 时间，前端展示层转换为本地时区

---

## 一、问题背景

时间处理是每个多时区应用的"暗坑"。本项目虽然当前主要面向中国用户，但系统架构已具备以下特征：

- 微信小程序 SDK 埋点数据涉及设备上报时间戳
- 后端 API 服务可能被不同时区的客户端调用
- 数据库 `DATETIME` 类型不携带时区信息

此前曾考虑两种方案：

| 方案 | 描述 | 结论 |
|------|------|------|
| 北京时间直存 | 所有时间字段存 Asia/Shanghai | **否决** |
| VARCHAR 时间 | `created_at` 改为 `VARCHAR(25)` 存 ISO 8601 | **否决**（丧失数据库时间函数能力） |
| **UTC 方案** | 统一存 UTC，展示层转换 | ✅ **采纳** |

---

## 二、核心理由

### 2.1 时区无关性（Time-Zone Agnostic）

UTC 是全球唯一公认的参考基准，不随地理位置、夏令时、政策调整而改变。

```
北京时间 = UTC + 8 小时
北京时间的夏令时？不存在。
但某些地区有夏令时（如美国 PDT ↔ PST），
如果存本地时间，排序和比对会直接出错。
```

**示例：**

```
事件 A：2025-11-02 01:30 America/New_York (EDT, UTC-4)
事件 B：2025-11-02 01:30 America/New_York (EST, UTC-5)
```

如果存本地时间，两条记录都是 `01:30`，但实际间隔 1 小时。存 UTC 则无此歧义。

### 2.2 排序与比较的正确性

数据库 `ORDER BY created_at`、`WHERE created_at > ?` 等操作直接基于 UTC 时间戳，语义明确。如果混合存储不同时区时间，排序结果将是错误的。

```sql
-- UTC 方案：永远正确
SELECT * FROM t_records ORDER BY created_at DESC;

-- 本地时间方案：如果混入其他时区数据，顺序不可信
```

### 2.3 数据库时间函数的可靠性

Prisma `@default(now())` 和 `@updatedAt` 调用的是 MySQL 的 `NOW()` / `CURRENT_TIMESTAMP`，返回值取决于数据库服务器的 `time_zone` 设置。

- 服务器 `time_zone = '+00:00'`（UTC）→ `NOW()` 返回 UTC → 入库即 UTC ✅
- 服务器 `time_zone = '+08:00'` → `NOW()` 返回北京时间 → 需要额外转换 ⚠️

**本项目的保障措施：**

1. MySQL 连接字符串建议配置 `time_zone=+00:00`
2. Prisma 生成的 `DateTime` 字段是 JavaScript `Date` 对象（UTC 毫秒时间戳）
3. 应用代码永远不手动加减时区偏移

### 2.4 跨服务一致性

微服务 / 多端架构中，不同服务可能部署在不同时区的服务器上：

```
┌─────────────────┐     ┌─────────────────┐
│  API Service     │     │  Admin Service   │
│  (UTC 时区)      │     │  (UTC 时区)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │   MySQL 8.0      │
            │   ALL DATETIME   │
            │   IN UTC         │
            └─────────────────┘
```

所有服务读写同一个数据库时，无需猜测对方存的是什么时区。

### 2.5 SDK 埋点数据的天然适配

微信小程序 `wx.getSystemInfo` 等 API 不直接提供时区信息，但设备上报的**时间戳本身就是 UTC 基准**。本项目有 10 张 SDK 子表（`t_wechat_miniprogram_*`），字段命名 `created_at` / `modified_at` / `timestamp` 统一存 UTC 与 SDK 语义对齐。

### 2.6 前端展示的灵活性

UTC 存储并未牺牲用户体验。转换在前端完成，一行代码即可：

```typescript
// 将 UTC 时间转为用户本地时间显示
const localTime = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(new Date(utcString));
```

如果将来需要支持多语言 / 多时区，只需调整 `timeZone` 参数，数据库零改动。

### 2.7 行业标准与最佳实践

UTC 存储是几乎所有主流系统的共识：

| 组织 / 项目 | 做法 |
|-------------|------|
| W3C | 推荐 ISO 8601，UTC 为首选 |
| RFC 3339 | 日期时间格式以 `Z` 结尾表示 UTC |
| Google Cloud / AWS | 所有 API 返回 UTC 时间戳 |
| MySQL 官方 | 推荐 `TIMESTAMP` 存 UTC，`DATETIME` 也建议统一时区 |
| Prisma 文档 | `DateTime` 映射为 JavaScript `Date`（UTC 语义） |

---

## 三、架构决策记录（ADR）

```
标题：统一采用 UTC 时间方案
日期：2025-06-27
状态：已接受

上下文：
  - 项目使用 MySQL DATETIME 类型存储时间字段
  - 数据来源包括用户操作、SDK 埋点上报
  - 时间字段需支持排序、筛选、统计

决策：
  所有 DATETIME 列存储 UTC 时间，数据库层不感知时区。
  
  - created_at / updated_at 由数据库 NOW() 自动生成
  - SDK 上报时间以 UTC 存入
  - 前端负责展示时区转换

后果：
  ✅ 排序、比较、聚合结果正确
  ✅ 跨服务时间语义一致
  ✅ 未来多时区扩展零成本
  ⚠️ 直接查库看到的时间比北京时间少 8 小时（需习惯）
  ⚠️ 已有数据需评估是否需要迁移转换
```

---

## 四、相关文件

| 文件 | 说明 |
|------|------|
| `data/init.sql` | 建表 DDL，DATETIME 列均已标注（UTC）注释 |
| `packages/helper-api-service/prisma/schema.prisma` | Prisma Schema，`@db.DateTime` + `@default(now())` / `@updatedAt` |
| `docs/utc-alter.sql` | ALTER 语句，为现有表添加 UTC 注释 |

---

## 五、常见疑问

**Q：直接看数据库，时间少了 8 小时，不直观？**  
A：是的，这是 UTC 方案唯一的代价。可以通过 `SELECT CONVERT_TZ(created_at, '+00:00', '+08:00')` 临时查看北京时间，或使用 Navicat / DBeaver 等工具设置显示时区。

**Q：如果有历史数据是北京时间怎么办？**  
A：需执行一次性迁移：`UPDATE t SET created_at = DATE_SUB(created_at, INTERVAL 8 HOUR)`。务必在维护窗口内操作，并提前备份。

**Q：Prisma 的 `DateTime` 和 JavaScript `Date` 如何配合？**  
A：JavaScript `Date` 对象本质是 UTC 时间戳（毫秒）。存入 MySQL 的 `DATETIME` 时，MySQL Connector 会按服务器时区转换字符串。只要 MySQL `time_zone` 设为 UTC，整个过程无需手动干预。

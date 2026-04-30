# PicGen 开发指南

> 本文档面向 AI 编码助手和开发者，说明项目架构、数据流和常见修改路径。修改代码前请先阅读本指南和 `AGENTS.md`。

## 1. 项目概述

**PicGen** 是一个基于 Vercel + Supabase + Cloudflare R2 的小红书风格图文卡片生成器。用户通过 AI（登录用户）或手动方式创建多页卡片内容，调整配色与背景，最终导出为 1242×1660 像素的 PNG 图片。

核心工作流：
1. **输入** → 选题、人群、风格、页数、模板
2. **生成** → LLM 两阶段调用（大纲 → 内容）产出 `NoteDocument`（仅登录用户，消耗 1 点）
3. **编辑** → 可视化编辑器调整页面顺序、文本、配图（游客和登录用户均可）
4. **导出** → 前端 `html-to-image` 逐页截图上传 R2

### 1.1 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Supabase   │     │ Cloudflare  │
│  (Vercel)   │◄────│ PostgreSQL  │     │     R2      │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │                                          ▲
       │         documents/{taskId}.json          │
       └──────────────────────────────────────────┘
```

- **Vercel**：Next.js 16 应用托管
- **Supabase PostgreSQL**：用户认证、任务元数据、点数余额、充值流水、订阅信息
- **Cloudflare R2**：文档 JSON 本体、导出 PNG 图片（S3 兼容对象存储）

## 2. 用户系统

### 2.1 双身份模型

| 身份 | 标识方式 | AI 生成 | 历史任务 | 点数 |
|------|---------|---------|---------|------|
| **游客** | `guestId`（`localStorage` 中的 UUID） | ❌ 禁止 | ✅（仅自己 guest） | 无 |
| **登录用户** | Supabase Auth `user.id` | ✅ 消耗点数 | ✅（完整历史） | 免费 3 点/天，Pro 100 点/天 |

### 2.2 认证流程

使用 **Supabase Auth 邮件 OTP**（一次性验证码）：
1. 用户输入邮箱 → 前端调用 `supabase.auth.signInWithOtp({ email })`
2. Supabase 自动发送 6 位验证码邮件
3. 用户输入验证码 → 前端调用 `supabase.auth.verifyOtp({ email, token, type: "email" })`
4. 登录成功后，`AuthContext` 自动调用 `/api/auth/merge-guest` 将游客的 `tasks` 合并到用户账户

### 2.3 点数系统

数据库表 `user_credits` 存储每个用户的余额和配额：
- **免费用户**：`daily_quota = 3`，`plan_type = "free"`
- **Pro 用户**：`daily_quota = 100`，`plan_type = "pro"`
- **自然日重置**：通过 PostgreSQL 函数 `grant_daily_credits()`，在 UTC+8 零点自动重置

扣点/回滚逻辑：
- `consume_credit(userId, taskId)`：原子性检查余额 → 扣 1 点 → 记录 `consume` 流水
- `refund_credit(userId, taskId)`：生成/重写失败时回滚 1 点 → 记录 `refund` 流水
- 点数不足时 API 返回 **402** 状态码

### 2.4 游客合并

用户从游客状态登录时：
1. `AuthContext` 监听 `onAuthStateChange` 的 `SIGNED_IN` 事件
2. 调用 `POST /api/auth/merge-guest`（携带当前 `guestId`）
3. 后端将 `tasks` 表中 `guest_id = guestId` 的记录的 `user_id` 设为当前用户，`guest_id` 设为 null
4. 前端清除 `localStorage` 中的 `guestId`

## 3. 核心数据模型

### NoteDocument
定义在 `core/schema/note.schema.ts`：

```ts
{
  taskId: string;               // 标准 UUID v4（crypto.randomUUID()）
  version: number;              // 乐观锁版本号，每次保存递增
  createdAt: string;            // ISO 8601
  meta: {
    topic: string;
    audience: string;
    tone: string;
    noteType: string;
    pageCount: number;          // 1–64（AI 生成限制 12 页内）
  },
  theme: {
    template: TemplateId;       // template-a ... template-h
    primaryColor: string;
    secondaryColor: string;
    backgroundType?: BackgroundType;  // "solid" | "gradient" | "dots" | "lines"
    fontScale: "small" | "medium" | "large";
  },
  slides: Slide[]               // 页面数组
}
```

### Slide
```ts
{
  id: string;
  type: SlideType;              // cover / content / prose / image / summary / tips / comparison / step / stats / faq / checklist / timeline / quote / cta
  title: string;
  subtitle?: string | null;
  bullets: string[];            // 最多 8 条
  highlight?: string | null;
  labelLeft?: string | null;    // comparison 专用
  labelRight?: string | null;   // comparison 专用
  comparisonStyle?: "good-bad" | "ab" | null;
  textAlign?: "left" | "center" | "right" | null;
  use_real_image: boolean;
  image_query?: string | null;
  image?: SlideImage | null;    // 图库搜索结果或本地上传
  imagePosition?: "top" | "bottom" | "background";
}
```

### Theme（运行时渲染主题）
定义在 `components/templates/shared/theme.ts`，包含完整的色卡、圆角风格、字体偏好。`BackgroundType` 类型也从该文件导出（基于 `backgroundTypeEnum` 推导）。

### 枚举统一
所有运行时枚举定义在 `core/schema/request.schema.ts`：
- `slideTypeEnum`、`backgroundTypeEnum`、`sourceEnum`、`pageCountSchema`、`templateEnum`、`toneEnum`、`noteTypeEnum`

## 4. 渲染架构

### 4.1 分派链路
```
app/page.tsx 中的 PreviewCanvas
  → mapSlideToComponent(slide, templateId, backgroundType, options)
    → getThemeSafe(templateId) 获取 Theme 对象（注意：用 `getThemeSafe` 而非 `getTheme`，因为 templateId 是原始字符串）
    → switch(slide.type) 返回对应卡片组件
      → <XxxCard slide theme backgroundType pageIndex pageTotal />
        → <CardContainer> 统一容器 + 背景层 + 页码徽章
```

### 4.2 卡片组件契约
每个卡片组件接收的 props 结构（定义在 `theme.ts` 的 `CardProps` 接口）：
```ts
interface CardProps {
  slide: Slide;
  theme: Theme;
  backgroundType?: BackgroundType;
  pageIndex?: number;
  pageTotal?: number;
  fontScale?: FontScale;
}
```

卡片内部**禁止**直接读取 `templateId`，必须通过 `theme` 对象获取颜色和样式参数。颜色+透明度使用 `withAlpha(hex, alpha)` 辅助函数，不要拼接 hex。

### 4.3 背景层
`CardContainer` 负责根据 `backgroundType` 渲染：
- `solid`：纯色背景（`theme.background`）
- `gradient`：双色柔和渐变
- `dots`：规则点阵纹理（CSS background-image）
- `lines`：等距水平线（CSS background-image）

## 5. AI 生成链路

### 5.1 两阶段生成
1. **generateOutline** (`core/llm/generate-outline.ts`)：根据用户输入产出每页的 `type` + `title` + `coreMessage`，通过 `outlineResultSchema` Zod 校验
2. **generateNoteDocument** (`core/llm/generate-note.ts`)：根据大纲产出完整的 `Slide[]`，taskId 使用 `crypto.randomUUID()`

### 5.2 Prompt 设计
Prompt 构建在 `core/llm/prompt.ts`：
- `buildOutlinePrompt`：要求输出 JSON，第一页必须是 `cover`，最后一页必须是 `cta`
- `buildContentPrompt`：约束标题长度、bullet 长度、字段格式（如 stats 写 "数值：标签"）
- `buildRewritePrompt`：单页重写，保持字段结构不变。输入先经 `sanitizeSlideForPrompt()` 清理
- 用户输入安全：`core/llm/sanitize.ts` 的 `sanitizeUserInput()` 在注入 prompt 前清除控制字符并截断长度

### 5.3 LLM Provider
`core/llm/provider.ts` 提供 OpenAI-compatible 封装，支持：
- Qwen（默认）：`QWEN_API_KEY`, `QWEN_BASE_URL`, `QWEN_MODEL`
- DeepSeek：`DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`
- 切换：`DEFAULT_LLM_PROVIDER` 环境变量
- 重试策略：401 立即失败；超时、429、5xx 自动重试
- API Key 检查：`core/llm/check-api-key.ts` 在请求前校验 Key 是否已配置，未配置时返回友好错误

### 5.4 JSON 解析安全
`core/llm/json-utils.ts` 使用平衡花括号字符扫描算法（`extractFirstJsonObject`）提取 LLM 输出中的 JSON，能正确处理字符串内的花括号转义。

### 5.5 AI 权限与点数控制
- `/api/generate` 和 `/api/rewrite-slide` **拒绝游客**（返回 403）
- 调用前通过 `consumeCredit()` 扣点，点数不足返回 402
- LLM 调用失败时通过 `refundCredit()` 自动回滚点数

## 6. 编辑器架构

### 6.1 状态管理
主页面 `app/page.tsx` 使用 React `useState` 管理唯一的 `document` 状态。所有子组件通过回调修改，不存在全局状态库。

### 6.2 自动保存
`useEffect` 监听 `document` 变化，800ms debounce + AbortController 后调用 `POST /api/save-document`（通过 `fetchWithAuth` 自动携带 `x-guest-id`）。保存成功后从响应中同步 `version` 字段。

### 6.3 版本并发控制
- `NoteDocument.version` 字段递增式版本号
- `saveTaskDocument` 每次写入时递增 version 并返回新版本号
- `rewrite-slide` 和 `save-slide` 在写入前校验版本号是否一致，不一致返回 409
- 客户端从 API 响应同步 version，自动保存响应也会更新 version

### 6.4 编辑面板
`SlideEditor` 接收当前 `slide`，本地维护 `editing` 副本，保存时回传父组件。
- `CardEditor` (`components/editor/card-editors/index.tsx`)：根据 `slide.type` 渲染对应的表单字段；通用字段在 `common.tsx`，结构化编辑器（FAQ 对、统计数据对、对比列）在 `structured-editors.tsx`
- `ImageCandidatePicker` (`components/editor/image-candidate-picker.tsx`)：图库搜索与本地上传选择 UI
- 溢出检查：`checkSlideOverflow(editing)` 实时给出文本过长警告
- AI 重写：调用 `/api/rewrite-slide`，传入 `taskId` + `slideId` + 可选指令，成功后同步版本号
- 新建文档入口：`AIGenerateDialog`（AI 模式）和 `ManualStartDialog`（手动模式）

## 7. 导出链路

### 7.1 前端逐页导出
`ExportButton` 组件逐页操作：
1. 通过 `onRenderTarget(index)` 设置 `exportTargetIndex`，仅挂载目标 slide 的 DOM
2. 等待两帧 `requestAnimationFrame` 确保渲染完成
3. 使用 `html-to-image` 的 `toPng` 截取（`pixelRatio: 1.5`，`cacheBust: true`）
4. 将 base64 数据 POST 到 `/api/export`
5. 清除导出容器，进入下一页
6. 所有页面完成后汇报结果

### 7.2 服务端上传
`app/api/export/route.ts`：
- 校验 taskId 格式和图片大小（≤ 5MB）
- **鉴权**：检查当前用户/游客是否有权访问该 task
- 从 base64 前缀解析真实 MIME 类型动态设置扩展名
- 上传到 R2 `exports/{taskId}/slide-{n}.{ext}`
- 生成 1 小时有效预签名 URL 返回前端

### 7.3 预览页面
`app/preview/[taskId]/[slideId]/page.tsx` 是服务端组件，直接从 R2 读取 `NoteDocument`，渲染对应 slide，**必须保持 `dynamic = "force-dynamic"`**。

## 8. 图库搜索

`core/stock/search.ts` 统一接口，策略为：
1. 先搜 Pexels（`PEXELS_API_KEY`）
2. 结果不足时，用 Pixabay（`PIXABAY_API_KEY`）补足
- 搜索结果通过 `stockSearchResultSchema` Zod 校验
- 外部图片经 `/api/proxy-image` 代理为同源地址，代理有白名单和重定向验证

## 9. 存储与数据库架构

### 9.1 双存储模型

| 数据类型 | 存储位置 | 说明 |
|---------|---------|------|
| 文档 JSON 本体 | R2 `documents/{taskId}.json` | 完整的 `NoteDocument`，版本控制 |
| 导出 PNG | R2 `exports/{taskId}/slide-{n}.png` | 预签名 URL 下载 |
| 本地上传素材 | R2 `assets/{taskId}/{uuid}.{ext}` | 用户上传的图片，通过 `/api/assets` 代理访问 |
| 任务元数据 | PostgreSQL `tasks` 表 | task_id ↔ user_id/guest_id 关联，用于按身份过滤 |
| 用户点数 | PostgreSQL `user_credits` 表 | 余额、每日配额、重置时间、计划类型 |
| 点数流水 | PostgreSQL `credit_logs` 表 | 消费/回滚/每日重置/订阅奖励记录 |
| 订阅信息 | PostgreSQL `subscriptions` 表 | Stripe customer/subscription ID、状态 |
| 用户身份 | Supabase Auth `auth.users` | 邮箱 OTP 认证，由 Supabase 管理 |

### 9.2 R2 存储
- 所有文件存储操作统一使用 `core/storage/task-store.ts`（底层为 R2 S3 SDK）
- S3 客户端通过 Proxy 懒初始化（`core/storage/s3-client.ts`），bucket 名通过 `getPrivateBucket()` / `getExportBucket()` 函数获取
- `saveTaskDocument` 入口处做 `noteDocumentSchema.safeParse()` 校验，并递增 `version` 字段
- 导出预签名 URL 有效 1 小时，bucket 白名单校验

### 9.3 PostgreSQL 元数据
- `core/db/task-meta.ts`：任务元数据的 CRUD 和权限检查
- `core/db/credits.ts`：点数消费/回滚/查询封装
- 服务端通过 Service Role Key 绕过 RLS 直接操作

## 10. 认证与鉴权中间件

### 10.1 Middleware
`middleware.ts` 使用 `@supabase/ssr` 的 `updateSession`：
- 自动刷新 Supabase Session Cookie
- 覆盖所有非静态资源路由

### 10.2 请求身份解析
`lib/auth-server.ts` 提供 `getRequestIdentity(req)`：
1. 先尝试从 Supabase Session 获取 `user`
2. 无用户时，读取 `x-guest-id` Header 作为游客身份

### 10.3 API 鉴权矩阵

| API | 游客 | 免费用户 | Pro 用户 |
|-----|------|---------|---------|
| `POST /api/save-document` | ✅ | ✅ | ✅ |
| `POST /api/save-slide` | ✅ | ✅ | ✅ |
| `POST /api/export` | ✅ | ✅ | ✅ |
| `POST /api/upload-image` | ✅ | ✅ | ✅ |
| `GET /api/assets/[taskId]/[filename]` | ✅（仅自己 guest） | ✅（仅自己） | ✅ |
| `GET /api/tasks` | ✅（仅自己 guest） | ✅（仅自己） | ✅ |
| `GET /api/tasks/[id]` | ✅（仅自己 guest） | ✅（仅自己） | ✅ |
| `POST /api/generate` | ❌ 403 | ✅ 扣 1 点 | ✅ 扣 1 点 |
| `POST /api/rewrite-slide` | ❌ 403 | ✅ 扣 1 点 | ✅ 扣 1 点 |
| `POST /api/stripe/*` | ❌ | ✅ | ✅ |

### 10.4 前端认证封装
- `lib/auth-context.tsx`：全局 AuthProvider，提供 `user`、`guestId`、`isLoggedIn`、`login()`、`logout()`
- `lib/auth-client.ts`：浏览器端 OTP 发送/验证/登出/游客合并封装
- `lib/fetch-with-auth.ts`：自动附加 `x-guest-id` Header 的 fetch 封装

## 11. 支付系统（Stripe）

### 11.1 架构
- **Checkout**：`/api/stripe/create-checkout-session` 创建 Stripe Checkout Session
- **Webhook**：`/api/stripe/webhook` 接收 Stripe 事件
- **支持事件**：
  - `checkout.session.completed` → 激活 Pro，提升 `daily_quota` 到 100
  - `customer.subscription.deleted` → 降级回免费，恢复 `daily_quota` 到 3

### 11.2 前端
- `components/auth/upgrade-dialog.tsx`：Pro 升级弹窗
- `components/auth/user-menu.tsx`：显示当前计划类型和剩余点数，提供升级入口

## 12. 常见修改路径

| 目标 | 文件 |
|---|---|
| 新增/修改配色主题 | `components/templates/shared/theme.ts` + `core/schema/request.schema.ts` |
| 新增 slide 类型 | `core/schema/request.schema.ts` → `components/templates/shared/{xxx}-card.tsx` → `core/render/map-slide-to-component.tsx` → `components/editor/card-type-meta.ts` → `components/editor/card-editors/index.tsx` |
| 修改 AI 生成风格 | `core/llm/prompt.ts` 中的 `TONE_MAP` / `NOTE_TYPE_MAP` / prompt 文本 |
| 修改溢出检查规则 | `core/qa/overflow-check.ts` |
| 修改卡片尺寸 | 只需改 `core/render/card-dimensions.ts`（`CARD_WIDTH` / `CARD_HEIGHT`）|
| 添加新的 LLM 提供商 | `core/llm/provider.ts` 中实现新的 `LLMProvider` 并在 `createProvider()` 注册 |
| 修改卡片容器样式 | `components/templates/shared/card-container.tsx` |
| 修改点数配额 | `supabase/migrations/001_initial_schema.sql` 中的默认值 + `core/db/credits.ts` |
| 新增支付方式 | `app/api/stripe/` 目录下新增路由，参考现有 Checkout/Webhook 实现 |

## 13. 注意事项

- **Next.js 版本特殊**：本项目使用 Next.js 16，API 和约定可能与训练数据不同。写 Next.js 相关代码前，查看 `node_modules/next/dist/docs/` 中的最新文档。
- **Tailwind CSS v4**：使用 `@tailwindcss/postcss` 而非传统插件配置。全局样式在 `app/globals.css` 中使用 `@import "tailwindcss"`。
- **React 19**：使用 React 19，注意 Server Actions 和新的 Hook 行为。
- **Supabase 配置是部署前提**：需要正确配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，并在 Dashboard 中执行 migration SQL。
- **R2 配置是部署前提**：如果未正确配置 R2 环境变量，应用将无法保存文档和导出图片。
- **两个 bucket 均保持私有**：文档 JSON 通过 S3 SDK 读写；导出 PNG 通过预签名 URL 临时授权下载。
- **预签名 URL 有效 1 小时**：如需调整修改 `core/storage/s3-client.ts` 中的 `getSignedDownloadUrl` 默认值。
- **素材图片不存 R2**：Pexels / Pixabay 图片经 `/api/proxy-image` 代理加载，代理有域名白名单和重定向验证。
- **环境变量**：`.env.local` 包含 API Key，**切勿提交到版本控制**。
- **预览路由禁用缓存**：`/preview/[taskId]/[slideId]` 保持 `dynamic = "force-dynamic"`。
- **Stripe 为可选**：不配置 Stripe 环境变量时，Pro 升级按钮会提示"支付功能尚未配置完成"，不影响免费用户使用。

## 14. 相关文档

- `AGENTS.md` — AI 编码助手的速查手册
- `README.md` — 部署指南和功能说明
- `docs/adding-new-template.md` — 新增「模板家族」的架构规划

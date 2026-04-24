# 小红书图文卡片生成器

AI 驱动的小红书风格图文卡片设计与导出工具。

**核心架构**：Next.js (Vercel) + Supabase (PostgreSQL + Auth) + Cloudflare R2（对象存储）。截图由前端 `html-to-image` 直出并上传 R2，无需服务端 Playwright。

---

## 功能特性

- **AI 智能生成**：输入选题、目标人群、风格语调，AI 自动完成大纲策划与内容填充（登录用户每日免费 3 次，Pro 会员 100 次）
- **游客友好**：未登录也可编辑卡片、导出 PNG、保存文档和历史记录
- **双模式工作流**：支持「AI 生成」全自动产出，也支持「手动搭建」从零编辑
- **13 种卡片类型**：封面、正文、图文、重点总结、小贴士、对比参考、操作步骤、关键数据、常见问答、检查清单、时间线、金句、结尾页
- **8 套配色主题**：温润桃粉、雾蓝商务、奶油琥珀、素雅极简、薰衣草灰、陶土暖褐、深林墨绿、柔粉日常
- **4 种背景纹理**：纯色、渐变、波点、横线
- **可视化编辑器**：实时预览、拖拽调整页面顺序、单页 AI 重写、文本溢出检查
- **一键导出 PNG**：前端 `html-to-image` 逐页截图（1242×1660，pixelRatio 1.5），上传至 R2 并返回预签名下载链接
- **自动保存**：文档变更自动持久化到 R2，version 字段乐观锁防并发冲突
- **可选真实图片**：集成 Pexels / Pixabay 图库搜索（需配置 API Key）
- **用户系统**：邮箱验证码登录，自动合并游客数据
- **点数消费**：每次 AI 生成/重写消耗 1 点，每日自然日重置，失败自动回滚
- **Pro 会员**：Stripe 订阅制，每日 100 次 AI 生成配额

---

## 部署指南（必读）

本项目设计为部署到 **Vercel Hobby（免费）**，数据库使用 **Supabase（免费额度）**，数据存储在 **Cloudflare R2（免费额度内长期 $0）**。以下是部署前你必须手动完成的步骤。

### 前置要求

- Node.js 20+
- GitHub 账号（用于 Vercel 导入）
- Supabase 账号
- Cloudflare 账号
- （可选）Stripe 账号（用于 Pro 会员支付）

### 步骤 1：注册并配置 Supabase

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**，填写项目名称和密码，等待数据库创建完成
3. 进入项目的 **Project Settings → API**，复制以下信息：
   - **Project URL**（如 `https://abcdefgh12345678.supabase.co`）
   - **anon public** API Key
   - **service_role secret** API Key（注意保密，只在服务端使用）
4. 进入 **Authentication → Providers → Email**，确保 Email provider 已启用（默认开启）
5. 进入 **SQL Editor**，新建一个 Query，将 `supabase/migrations/001_initial_schema.sql` 的全部内容粘贴进去并点击 **Run**
   - 这会创建 `tasks`、`user_credits`、`credit_logs`、`subscriptions` 表和相关的 PostgreSQL 函数

### 步骤 2：注册并配置 Cloudflare R2

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入左侧菜单 **R2 Object Storage**
3. 创建 **两个 bucket**，均**保持默认（关闭 public access）**：
   - `picgen-data` —— 存放文档 JSON（私有，仅服务端访问）
   - `picgen-exports` —— 存放导出的 PNG（私有，通过**预签名 URL**临时授权下载）
4. 进入 **Manage R2 API Tokens**，点击 **Create API token**
   - 权限选择：**Object Read & Write**
   - 指定 bucket：选择 **两个 bucket**（或选择"所有 buckets"）
   - 保存后得到 **Access Key ID** 和 **Secret Access Key**（后者只显示一次，务必保存）
5. 在 R2 概览页找到 **S3 API** 的 Endpoint（类似 `https://<account-id>.r2.cloudflarestorage.com`）

### 步骤 3：（可选）配置 Stripe

如果你不需要 Pro 会员功能，可以跳过此步骤。免费用户系统（每日 3 点）完全不受影响。

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 进入 **Products → Add Product**，创建订阅产品：
   - 名称：PicGen Pro
   - 价格模式：Recurring → Monthly（或 Yearly）
   - 保存后复制 **Price ID**（格式如 `price_xxxxxxxx`）
3. 进入 **Developers → API Keys**，复制 **Secret Key**（以 `sk_test_` 或 `sk_live_` 开头）
4. 进入 **Developers → Webhooks → Add endpoint**：
   - Endpoint URL：`https://your-domain.com/api/stripe/webhook`
   - 选择事件：`checkout.session.completed`、`invoice.paid`、`customer.subscription.deleted`
   - 保存后复制 **Signing Secret**（格式如 `whsec_xxxxxxxx`）
5. 在 Vercel 部署完成后，将 Webhook URL 中的 `your-domain.com` 替换为实际域名

### 步骤 4：部署到 Vercel

1. 将代码推送到 GitHub / GitLab
2. 在 [Vercel Dashboard](https://vercel.com/) 导入项目
3. 在 **Settings → Environment Variables** 中配置以下变量：

#### 必需环境变量

| 变量名 | 来源 / 示例 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh12345678.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase service_role key（保密） |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` | R2 S3 API Endpoint |
| `R2_ACCESS_KEY_ID` | R2 API Token ID | |
| `R2_SECRET_ACCESS_KEY` | R2 API Token Secret | |
| `R2_PRIVATE_BUCKET_NAME` | `picgen-data` | 文档 JSON bucket |
| `R2_EXPORT_BUCKET_NAME` | `picgen-exports` | 导出 PNG bucket |
| `DEFAULT_LLM_PROVIDER` | `qwen` 或 `deepseek` | LLM 提供商选择 |
| `QWEN_API_KEY` | 阿里百炼 / 灵积 API Key | 二选一（与 DeepSeek） |
| `QWEN_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 二选一 |
| `QWEN_MODEL` | `qwen3.5-flash` | 二选一 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 二选一（与 Qwen） |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 二选一 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 二选一 |

#### 可选环境变量

| 变量名 | 来源 / 示例 | 说明 |
|---|---|---|
| `PEXELS_API_KEY` | Pexels API Key | 真实图片搜索 |
| `PIXABAY_API_KEY` | Pixabay API Key | 真实图片搜索 |
| `STRIPE_SECRET_KEY` | `sk_test_...` 或 `sk_live_...` | Stripe 支付（可选） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Webhook 签名密钥 |
| `STRIPE_PRO_PRICE_ID` | `price_...` | Pro 订阅 Price ID |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | 应用域名（用于 Stripe 回调） |

4. 点击 **Deploy**

> **⚠️ 安全说明**：
> - **两个 bucket 都保持关闭 public access**。文档 JSON 只允许服务端 API 通过 S3 SDK 读写；导出的 PNG 由服务端在上传后生成**预签名 URL**（默认 1 小时有效）返回给前端，过期后自动失效。
> - `SUPABASE_SERVICE_ROLE_KEY` 和 `STRIPE_SECRET_KEY` 是敏感密钥，**切勿暴露到前端**。
> - 素材图片（Pexels / Pixabay）不存 R2，直接走 `/api/proxy-image` 代理加载，代理有域名白名单和重定向验证。

### 步骤 5：验证部署

部署完成后，打开应用域名进行以下验证：

1. **游客模式**：不登录，尝试编辑卡片、导出 PNG、保存文档，确认功能正常
2. **登录测试**：点击右上角"登录"，输入邮箱，检查是否收到验证码邮件，输入验证码后确认登录成功
3. **AI 生成**：登录后，在左侧 AI 生成面板填写参数并点击"生成内容"，确认能正常产出卡片
4. **点数检查**：点击右上角用户头像，确认显示"今日剩余 AI 生成次数"为 3/3
5. **历史任务**：保存文档后，点击左下角"历史任务"，确认能加载历史记录
6. **Pro 升级**（如配置了 Stripe）：点击"升级 Pro"，确认能跳转到 Stripe Checkout

---

## 技术栈

- **框架**：Next.js 16.2.4 (App Router)
- **前端**：React 19.2.4, TypeScript, Tailwind CSS v4
- **UI 组件**：Radix UI + 自定义组件（shadcn/ui "new-york" 风格）
- **数据校验**：Zod
- **认证**：Supabase Auth（邮箱 OTP）
- **数据库**：Supabase PostgreSQL
- **AI 调用**：OpenAI SDK（兼容 Qwen / DeepSeek 等 OpenAI-compatible 服务）
- **截图导出**：`html-to-image`（前端直出，无服务端依赖）
- **对象存储**：Cloudflare R2（S3 兼容）via `@aws-sdk/client-s3`
- **支付**：Stripe Checkout + Webhook（可选）
- **图库搜索**：Pexels API + Pixabay API

---

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制或创建 `.env.local`，填入上述所有必需环境变量（Supabase + R2 + LLM 至少各配一个）。参考项目根目录下的 `.env.local` 模板。

### 3. 初始化本地数据库（可选）

如果你使用本地 Supabase 或远程 Supabase，需要在 SQL Editor 中执行：
```bash
# 将 supabase/migrations/001_initial_schema.sql 的内容粘贴到 Supabase SQL Editor 并执行
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 使用应用。

### 5. 构建生产版本

```bash
npm run build
npm start
```

---

## 项目结构

```
picgen/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 主编辑器页面
│   ├── layout.tsx                # 根布局（含 AuthProvider）
│   ├── globals.css               # 全局样式
│   ├── middleware.ts             # Supabase Session 刷新中间件
│   ├── preview/[taskId]/[slideId]/page.tsx  # 单页预览（SSR，供前端截图用）
│   └── api/                      # API 路由
│       ├── generate/route.ts     # AI 生成内容（登录用户，扣点）
│       ├── rewrite-slide/route.ts # AI 重写单页（登录用户，扣点）
│       ├── export/route.ts       # 接受前端 PNG 上传至 R2
│       ├── proxy-image/route.ts  # 外部图片同源代理
│       ├── save-document/route.ts # 保存文档（游客+登录）
│       ├── save-slide/route.ts   # 保存单页（游客+登录）
│       ├── tasks/route.ts        # 历史任务列表（按身份过滤）
│       ├── tasks/[taskId]/route.ts # 读取单个任务
│       ├── auth/merge-guest/route.ts # 合并游客数据
│       ├── user/credits/route.ts # 查询用户点数
│       ├── stripe/create-checkout-session/route.ts # Stripe 结账
│       └── stripe/webhook/route.ts # Stripe Webhook
├── components/
│   ├── auth/                     # 认证相关组件
│   │   ├── auth-dialog.tsx       # 邮箱 OTP 登录弹窗
│   │   ├── user-menu.tsx         # 右上角用户菜单（点数/升级/登出）
│   │   └── upgrade-dialog.tsx    # Pro 升级弹窗
│   ├── editor/                   # 编辑器面板
│   │   ├── topic-form.tsx        # AI 生成参数表单
│   │   ├── slide-editor.tsx      # 单页内容编辑器
│   │   ├── manual-builder.tsx    # 手动搭建模式
│   │   ├── export-button.tsx     # 前端截图导出按钮
│   │   ├── history-task-list.tsx # 历史任务列表
│   │   ├── card-editors/         # 各类型卡片表单
│   │   └── card-type-meta.ts     # 13 种卡片元数据
│   ├── preview/                  # 预览相关
│   │   ├── preview-canvas.tsx    # 自适应缩放画布
│   │   └── thumbnail-strip.tsx   # 缩略图列表
│   ├── templates/shared/         # 卡片渲染组件（13 种）
│   │   ├── theme.ts              # 8 套配色主题定义
│   │   ├── card-container.tsx    # 统一容器 + 背景层
│   │   ├── atoms.tsx             # 原子组件（Tag / Highlight 等）
│   │   ├── cover-card.tsx        # 封面
│   │   ├── text-card.tsx         # 正文
│   │   ├── text-image-card.tsx   # 图文
│   │   └── ...（其余 10 种卡片）
│   └── ui/                       # 基础 UI 组件（Button / Input / Select 等）
├── core/
│   ├── llm/                      # AI 调用层
│   │   ├── provider.ts           # LLM Provider 工厂（Qwen / DeepSeek）
│   │   ├── generate-outline.ts   # 阶段 1：生成大纲
│   │   ├── generate-note.ts      # 阶段 2：补全内容
│   │   ├── rewrite-slide.ts      # 单页重写
│   │   └── prompt.ts             # Prompt 构建器
│   ├── render/                   # 渲染层
│   │   ├── map-slide-to-component.tsx  # slide.type -> 组件分派
│   │   ├── template-registry.ts  # 模板配置注册
│   │   └── card-dimensions.ts    # 卡片尺寸常量（1242×1660）
│   ├── schema/                   # Zod Schema
│   │   ├── note.schema.ts        # NoteDocument / Slide 结构
│   │   ├── request.schema.ts     # GenerateRequest 结构
│   │   └── stock.schema.ts       # 图库搜索结构
│   ├── storage/                  # 存储层（R2）
│   │   ├── s3-client.ts          # R2 S3 客户端封装
│   │   ├── task-store.ts         # 文档读写（S3 对象操作）
│   │   └── mock-data.ts          # 演示数据
│   ├── db/                       # 数据库层（Supabase PG）
│   │   ├── task-meta.ts          # 任务元数据 CRUD
│   │   └── credits.ts            # 点数消费/回滚/查询
│   ├── stock/                    # 图库搜索
│   │   ├── search.ts             # 统一搜索接口
│   │   ├── pexels.ts             # Pexels 实现
│   │   └── pixabay.ts            # Pixabay 实现
│   └── qa/
│       └── overflow-check.ts     # 文本溢出检查
├── lib/                          # 通用工具
│   ├── utils.ts                  # 工具函数（cn 等）
│   ├── proxy-image.ts            # 图片代理 URL 转换
│   ├── auth-context.tsx          # 全局认证上下文
│   ├── auth-client.ts            # 浏览器端认证工具
│   ├── auth-server.ts            # 服务端身份解析
│   ├── fetch-with-auth.ts        # 带 x-guest-id 的 fetch 封装
│   ├── guest-id.ts               # 浏览器 guestId 管理
│   └── supabase/                 # Supabase 客户端
│       ├── server.ts             # 服务端 SSR Client
│       ├── client.ts             # 浏览器端 Client
│       ├── middleware.ts         # 中间件刷新逻辑
│       └── service-role.ts       # Service Role Client
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # 数据库初始 Schema
├── docs/
│   ├── adding-new-template.md    # 新增模板家族架构规划
│   └── vercel-deployment-plan.md # 部署重构计划
├── output/                       # 本地开发保留目录（仅 .gitkeep）
│   ├── json/
│   ├── assets/
│   └── export/
├── README.md
├── CLAUDE.md
└── AGENTS.md
```

---

## 使用说明

### AI 生成
1. 在左侧「AI 生成」面板填写选题、目标人群、风格、内容类型、页数、配色模板
2. 可选：展开「大纲草稿」写入自定义大纲，AI 会优先按你的思路扩写
3. 点击「生成内容」，等待两阶段 LLM 调用完成（消耗 1 点数）
4. 生成后可在右侧「页面」列表查看全部页面，点击任意页面进入「编辑」模式修改

> 游客无法使用 AI 生成功能，需先登录。

### 手动搭建
1. 切换到「手动搭建」模式
2. 填写文档主题，或点击「新建空白文档」
3. 在预览区顶部点击「＋ 添加页面」选择卡片类型
4. 在右侧「编辑」面板修改标题、要点、副标题等内容
5. 使用「配色」和「背景」切换视觉风格

### 导出 PNG
- 点击顶部「导出 PNG」按钮，前端会逐页渲染目标 slide 的 DOM（同一时间仅挂载一页），截图后立即卸载
- 每页截图使用 `html-to-image`（`pixelRatio: 1.5`，实际渲染 1242×1660），自动上传 R2 私有 bucket
- 导出完成后左侧面板显示每张图片的**预签名下载链接**（1 小时有效）
- 所有外部图片（Pexels / Pixabay）在截图前会自动经 `/api/proxy-image` 代理为同源地址，避免 canvas 跨域污染

### 登录与点数
- 点击右上角「登录」，输入邮箱后查收验证码邮件，输入 6 位验证码即可登录
- 登录后右上角显示今日剩余 AI 生成次数（免费用户每日 3 点，Pro 用户每日 100 点）
- 点数每日自然日（UTC+8 零点）自动重置
- 登录后，之前以游客身份保存的文档会自动合并到账户中

---

## 可用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器（Turbopack） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run typecheck` | 运行 TypeScript 类型检查（不输出文件） |

---

## 数据持久化

### 文档存储
所有生成的文档自动保存为 JSON 对象到 R2 私有 bucket 的 `documents/{taskId}.json`，每次保存递增 `version` 字段用于并发冲突检测。

同时，PostgreSQL `tasks` 表存储任务元数据（`task_id`、`user_id`/`guest_id`、`topic`、`page_count`），用于按用户身份过滤历史任务列表。

### 导出存储
导出的 PNG 保存到独立的 R2 bucket：`exports/{taskId}/slide-{n}.{ext}`。该 bucket 同样保持私有，前端通过服务端生成的**预签名 URL**（1 小时有效）下载。

### 数据库表结构
```
tasks              —— 任务元数据（user_id / guest_id 关联）
user_credits       —— 用户点数（balance、daily_quota、plan_type）
credit_logs        —— 点数流水（consume / refund / daily_grant / subscription_bonus）
subscriptions      —— Stripe 订阅信息（customer_id、subscription_id、status）
auth.users         —— Supabase Auth 管理的用户（邮箱 OTP）
```

R2 bucket 结构：
```
picgen-data/           # 私有 bucket（R2_PRIVATE_BUCKET_NAME）
└── documents/
    └── {uuid}.json

picgen-exports/        # 私有 bucket（R2_EXPORT_BUCKET_NAME）
└── exports/
    └── {uuid}/
        ├── slide-1.png
        └── slide-2.png
```

---

## 扩展指南

- **新增配色主题**：修改 `components/templates/shared/theme.ts` 中的 `THEMES` 对象，同时在 `core/schema/request.schema.ts` 的 `templateEnum` 中追加 ID
- **新增卡片类型**：参考 `docs/adding-new-template.md` 中的架构规划。当前 13 种卡片由 `slideTypeEnum` 定义，渲染分派在 `core/render/map-slide-to-component.tsx`，编辑表单在 `components/editor/card-editors/`
- **更换 LLM 提供商**：修改 `.env.local` 中的 `DEFAULT_LLM_PROVIDER`，或直接在 `core/llm/provider.ts` 中添加新的 Provider 实现
- **修改点数配额**：编辑 `supabase/migrations/001_initial_schema.sql` 中的默认值，或直接在 Supabase SQL Editor 中修改 `user_credits` 表的记录
- **接入其他支付方式**：在 `app/api/stripe/` 目录下新增路由，或参考现有实现添加新的支付提供商（如支付宝、微信）

---

## 注意事项

- **Supabase 配置是部署前提**：需要正确配置 Supabase 环境变量并执行 migration SQL，否则用户系统、历史任务、点数功能将无法工作
- **R2 配置是部署前提**：如果未正确配置 R2 环境变量，应用将无法保存文档和导出图片
- **两个 bucket 均保持私有**：`picgen-data` 和 `picgen-exports` 都不需要开启 public access。导出的 PNG 通过预签名 URL 临时授权下载，过期后自动失效
- **预签名 URL 有效期**：导出链接默认 1 小时有效。如需调整，修改 `core/storage/s3-client.ts` 中 `getSignedDownloadUrl` 的 `expiresIn` 参数
- **素材图片不存 R2**：Pexels / Pixabay 图片直接走外部 URL，经 `/api/proxy-image` 代理加载，无需 R2 公开访问
- **AI 生成调用为同步长请求**：已设置 `maxDuration = 600` 秒
- **预览路由禁用缓存**：`/preview/[taskId]/[slideId]` 保持 `dynamic = "force-dynamic"`，确保截图时内容最新
- **Stripe 为可选**：不配置 Stripe 环境变量时，Pro 升级功能不可用，但不影响其他所有功能

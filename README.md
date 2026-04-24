# 小红书图文卡片生成器

AI 驱动的小红书风格图文卡片设计与导出工具。

**核心架构**：Next.js (Vercel) + Cloudflare R2（对象存储），截图由前端 `html-to-image` 直出并上传 R2，无需服务端 Playwright。

---

## 部署指南（必读）

本项目设计为部署到 **Vercel Hobby（免费）**，数据存储在 **Cloudflare R2（免费额度内长期 $0）**。以下是部署前你必须手动完成的步骤。

### 1. 注册并配置 Cloudflare R2

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

### 2. 部署到 Vercel

1. 将代码推送到 GitHub / GitLab
2. 在 [Vercel Dashboard](https://vercel.com/) 导入项目
3. 在 **Settings → Environment Variables** 中配置以下变量：

| 变量名 | 来源 / 示例 | 必需 |
|---|---|---|
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com`（从 R2 概览页获取） | ✅ |
| `R2_ACCESS_KEY_ID` | 上一步创建的 API Token ID | ✅ |
| `R2_SECRET_ACCESS_KEY` | 上一步创建的 API Token Secret | ✅ |
| `R2_PRIVATE_BUCKET_NAME` | 私有 bucket 名，如 `picgen-data` | ✅ |
| `R2_EXPORT_BUCKET_NAME` | 导出 bucket 名，如 `picgen-exports` | ✅ |
| `DEFAULT_LLM_PROVIDER` | `qwen` 或 `deepseek` | ✅ |
| `QWEN_API_KEY` | 阿里百炼 / 灵积 API Key | 二选一 |
| `QWEN_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 二选一 |
| `QWEN_MODEL` | `qwen3.5-flash` | 二选一 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 二选一 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 二选一 |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 二选一 |
| `PEXELS_API_KEY` | Pexels API Key（可选，用于真实图片搜索） | ❌ |
| `PIXABAY_API_KEY` | Pixabay API Key（可选） | ❌ |

4. 点击 **Deploy**

> **⚠️ 安全说明**：
> - **两个 bucket 都保持关闭 public access**。文档 JSON 只允许服务端 API 通过 S3 SDK 读写；导出的 PNG 由服务端在上传后生成**预签名 URL**（默认 1 小时有效）返回给前端，过期后自动失效。
> - 素材图片（Pexels / Pixabay）不存 R2，直接走 `/api/proxy-image` 代理加载，代理有域名白名单和重定向验证。

---

## 功能特性

- **AI 智能生成**：输入选题、目标人群、风格语调，AI 自动完成大纲策划与内容填充
- **双模式工作流**：支持「AI 生成」全自动产出，也支持「手动搭建」从零编辑
- **13 种卡片类型**：封面、正文、图文、重点总结、小贴士、对比参考、操作步骤、关键数据、常见问答、检查清单、时间线、金句、结尾页
- **8 套配色主题**：温润桃粉、雾蓝商务、奶油琥珀、素雅极简、薰衣草灰、陶土暖褐、深林墨绿、柔粉日常
- **4 种背景纹理**：纯色、渐变、波点、横线
- **可视化编辑器**：实时预览、拖拽调整页面顺序、单页 AI 重写、文本溢出检查
- **一键导出 PNG**：前端 `html-to-image` 逐页截图（1242×1660，pixelRatio 1.5），上传至 R2 并返回预签名下载链接
- **自动保存**：文档变更自动持久化到 R2，version 字段乐观锁防并发冲突
- **可选真实图片**：集成 Pexels / Pixabay 图库搜索（需配置 API Key）

## 技术栈

- **框架**：Next.js 16.2.4 (App Router)
- **前端**：React 19.2.4, TypeScript, Tailwind CSS v4
- **UI 组件**：Radix UI + 自定义组件
- **数据校验**：Zod
- **AI 调用**：OpenAI SDK（兼容 Qwen / DeepSeek 等 OpenAI-compatible 服务）
- **截图导出**：`html-to-image`（前端直出，无服务端依赖）
- **对象存储**：Cloudflare R2（S3 兼容）via `@aws-sdk/client-s3`
- **图库搜索**：Pexels API + Pixabay API

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制或创建 `.env.local`，填入上述所有环境变量（R2 + LLM 至少各配一个）。

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 使用应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
picgen/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 主编辑器页面
│   ├── layout.tsx                # 根布局
│   ├── globals.css               # 全局样式
│   ├── preview/[taskId]/[slideId]/page.tsx  # 单页预览（SSR，供前端截图用）
│   └── api/                      # API 路由
│       ├── generate/route.ts     # AI 生成内容
│       ├── export/route.ts       # 接受前端 PNG 上传至 R2
│       ├── proxy-image/route.ts  # 外部图片同源代理（解决跨域）
│       ├── rewrite-slide/route.ts
│       ├── save-document/route.ts
│       ├── save-slide/route.ts
│       ├── tasks/route.ts
│       └── stock-search/route.ts
├── components/
│   ├── editor/                   # 编辑器面板
│   │   ├── topic-form.tsx        # AI 生成参数表单
│   │   ├── slide-editor.tsx      # 单页内容编辑器
│   │   ├── manual-builder.tsx    # 手动搭建模式
│   │   ├── export-button.tsx     # 前端截图导出按钮
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
│   ├── stock/                    # 图库搜索
│   │   ├── search.ts             # 统一搜索接口
│   │   ├── pexels.ts             # Pexels 实现
│   │   └── pixabay.ts            # Pixabay 实现
│   └── qa/
│       └── overflow-check.ts     # 文本溢出检查
├── lib/
│   ├── utils.ts                  # 工具函数（cn 等）
│   └── proxy-image.ts            # 图片代理 URL 转换
├── docs/
│   ├── adding-new-template.md    # 新增模板家族架构规划
│   └── vercel-deployment-plan.md # 部署重构计划
├── output/                       # 本地开发保留目录（仅 .gitkeep）
│   ├── json/
│   ├── assets/
│   └── export/
└── README.md
```

## 使用说明

### AI 生成
1. 在左侧「AI 生成」面板填写选题、目标人群、风格、内容类型、页数、配色模板
2. 可选：展开「大纲草稿」写入自定义大纲，AI 会优先按你的思路扩写
3. 点击「生成内容」，等待两阶段 LLM 调用完成
4. 生成后可在右侧「页面」列表查看全部页面，点击任意页面进入「编辑」模式修改

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

## 可用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器（Turbopack） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run typecheck` | 运行 TypeScript 类型检查（不输出文件） |

## 数据持久化

所有生成的文档自动保存为 JSON 对象到 R2 私有 bucket 的 `documents/{taskId}.json`，每次保存递增 `version` 字段用于并发冲突检测。历史任务列表支持游标分页，随时加载继续编辑。

导出的 PNG 保存到独立的 R2 bucket：`exports/{taskId}/slide-{n}.{ext}`。该 bucket 同样保持私有，前端通过服务端生成的**预签名 URL**（1 小时有效）下载。

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

## 扩展指南

- **新增配色主题**：修改 `components/templates/shared/theme.ts` 中的 `THEMES` 对象，同时在 `core/schema/request.schema.ts` 的 `templateEnum` 中追加 ID
- **新增卡片类型**：参考 `docs/adding-new-template.md` 中的架构规划。当前 13 种卡片由 `slideTypeEnum` 定义，渲染分派在 `core/render/map-slide-to-component.tsx`，编辑表单在 `components/editor/card-editors/`
- **更换 LLM 提供商**：修改 `.env.local` 中的 `DEFAULT_LLM_PROVIDER`，或直接在 `core/llm/provider.ts` 中添加新的 Provider 实现

## 注意事项

- **R2 配置是部署的前提**：如果未正确配置 R2 环境变量，应用将无法保存文档和导出图片
- **两个 bucket 均保持私有**：`picgen-data` 和 `picgen-exports` 都不需要开启 public access。导出的 PNG 通过预签名 URL 临时授权下载，过期后自动失效
- **预签名 URL 有效期**：导出链接默认 1 小时有效。如需调整，修改 `core/storage/s3-client.ts` 中 `getSignedDownloadUrl` 的 `expiresIn` 参数
- **素材图片不存 R2**：Pexels / Pixabay 图片直接走外部 URL，经 `/api/proxy-image` 代理加载，无需 R2 公开访问
- **AI 生成调用为同步长请求**：已设置 `maxDuration = 600` 秒
- **预览路由禁用缓存**：`/preview/[taskId]/[slideId]` 保持 `dynamic = "force-dynamic"`，确保截图时内容最新

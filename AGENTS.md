<!-- BEGIN:nextjs-agent-rules -->
# 这不是你所熟知的 Next.js

Next.js 16 存在破坏性变更——在使用训练数据中的 API 之前，请先阅读 `node_modules/next/dist/docs/` 中的相关文档。注意弃用警告。
<!-- END:nextjs-agent-rules -->

---

# PicGen — Agent 速查手册

## 开发命令

```bash
npm run dev          # 启动 Turbopack 开发服务器
npm run build        # 生产构建
npm run typecheck    # tsc --noEmit（无测试套件）
npm run lint         # ESLint（flat 配置，eslint-config-next）
```

任何 schema 或类型变更后都需运行 `typecheck`。本项目未配置测试运行器。

## 框架/工具链特性

- **Tailwind CSS v4**：不存在 `tailwind.config.js`。在 `app/globals.css` 中通过 `@import "tailwindcss"` 导入。PostCSS 插件为 `@tailwindcss/postcss`。
- **React 19**：全局使用；hooks 和 JSX 转换遵循 React 19 语义。
- **路径别名**：`@/*` 映射到 `./*`（tsconfig）。所有导入均使用此别名。
- **shadcn/ui**："new-york" 风格，RSC + TSX。如需新增组件，通过 shadcn CLI 添加；基础已配置好（`components.json`）。
- **字体**：`next/font/google` 加载 Noto Sans SC 和 Geist Mono 作为 CSS 变量。霞鹜文楷（`font-wenkai`）来自 `@chinese-fonts/lxgwwenkai`。
- **Next.js 图片**：`next.config.ts` 中设置 `unoptimized: true`；远程主机白名单包含 Pexels / Pixabay / Unsplash。
- **开发指示器已禁用**：`devIndicators: false` + CSS 隐藏 `nextjs-portal` 等，避免 Playwright 截图时捕获到 UI 浮标。

## 应用架构

### 入口点
- **编辑器 UI**：`app/page.tsx` —— 主客户端页面，使用 `useState` 管理唯一的 `document`。
- **预览（截图目标）**：`app/preview/[taskId]/[slideId]/page.tsx` —— 服务端组件，读取 R2 并渲染单页。**必须保持 `dynamic = "force-dynamic"`**。
- **API 路由**：`app/api/{generate,export,proxy-image,rewrite-slide,save-document,save-slide,stock-search,upload-image,tasks,tasks/[taskId],assets/[taskId],auth/merge-guest,user/credits,stripe/create-checkout-session,stripe/webhook}/route.ts`。

### 卡片渲染流水线
1. `mapSlideToComponent(slide, templateId, backgroundType, options)` 按 `slide.type` 分派组件。
2. `getTheme(templateId)` 返回 `Theme` 对象（颜色 + 圆角 + 字体）。
3. 每个卡片组件接收**完全一致**的 props 结构：
   ```ts
   { slide: Slide; theme: Theme; backgroundType?: BackgroundType; pageIndex?: number; pageTotal?: number }
   ```
4. `CardContainer` 应用背景层（`solid` | `gradient` | `dots` | `lines`）。
5. 画布尺寸为 **1242 × 1660 px**（定义在 `core/render/card-dimensions.ts`）。不要在其他位置硬编码这些值。
6. 导出时仅渲染目标 slide 的 DOM（`exportTargetIndex` 控制，截图后立即卸载），避免常驻 12 页子树。

### 数据流
- `NoteDocument` 是单一数据源；状态存储在 `app/page.tsx` 中。
- 自动保存：800 ms 防抖 → `POST /api/save-document` → R2 `documents/{taskId}.json` + PostgreSQL `tasks` 元数据。保存成功后同步 `version` 字段。
- AI 生成：两段式 LLM（大纲 → 内容）产出完整的 `NoteDocument`，`version` 初始为 1。仅登录用户可用，消耗 1 点数，失败自动回滚。
- 重写：`POST /api/rewrite-slide` 修改单页，采用 version-based 乐观锁防止并发冲突，返回新 `version`。仅登录用户可用，消耗 1 点数。
- 历史任务：`GET /api/tasks` 从 PostgreSQL 按 `user_id` 或 `guest_id` 过滤，不再全量 ListObjectsV2。

## 类型/schema 规范

- **Zod 是强制的**：所有运行时数据结构均定义在 `core/schema/*.schema.ts` 中。
- 从 schema 文件导出 `type`；业务逻辑中绝不使用 `any`。
- 枚举统一定义在 `core/schema/request.schema.ts`：`slideTypeEnum`、`backgroundTypeEnum`、`sourceEnum`、`pageCountSchema`、`templateEnum`、`toneEnum`、`noteTypeEnum`。
- `BackgroundType` 类型定义在 `components/templates/shared/theme.ts`（通过 `z.infer<typeof backgroundTypeEnum>` 推导），card-container 等文件从 `theme.ts` 导入。
- API 请求体必须通过 `schema.safeParse()` 校验；失败时返回 `{ error: string, details?: unknown }`。

## 文件/存储规则

- 所有文件存储操作统一使用 `core/storage/task-store.ts`（底层为 R2 S3 SDK）。
- S3 客户端通过 Proxy 懒初始化（`core/storage/s3-client.ts`），bucket 名通过 `getPrivateBucket()` / `getExportBucket()` 函数获取。
- `saveTaskDocument` 在写入前会校验文档结构（`noteDocumentSchema.safeParse()`），并递增 `version` 字段后返回新版本号。
- 输出路径：`documents/{taskId}.json`（文档）、`exports/{taskId}/slide-{n}.{ext}`（PNG）、`assets/{taskId}/`（素材图片）。这些是 R2 对象键前缀。
- 不要向版本控制提交 `output/*` 中的任何内容，除了 `.gitkeep`。这些目录已被 `.gitignore` 排除。
- 数据库操作统一使用 `core/db/` 目录下的模块（`task-meta.ts`、`credits.ts`），底层为 Supabase PostgreSQL。

## API 路由约定

- 导出 `maxDuration`（例如生成接口使用 `export const maxDuration = 600`）。
- 预览和导出路由需导出 `dynamic = "force-dynamic"`，避免缓存导致截图过期。
- 日志前缀使用 `[模块名]`，便于本地 grep 排查。
- 并发写保护：`rewrite-slide` 和 `save-slide` 使用 `version` 字段做乐观锁，写入时递增 version，冲突时返回 409。
- 所有写操作 API 需鉴权：使用 `getRequestIdentity(req)` 获取 `userId`/`guestId`，再调用 `canAccessTask()` 校验权限。
- AI 接口（`generate`、`rewrite-slide`）拒绝游客（返回 401），点数不足返回 402，失败时回滚点数。

## LLM 配置

- Provider 工厂：`core/llm/provider.ts`。OpenAI 兼容 SDK。
- 通过 `DEFAULT_LLM_PROVIDER=qwen|deepseek` 切换。
- 必需环境变量：`QWEN_API_KEY`（默认）或 `DEEPSEEK_API_KEY`。可选：`PEXELS_API_KEY`、`PIXABAY_API_KEY`（用于素材图片）。
- `.env.local` 已加入 `.gitignore`；切勿提交。
- LLM 输出经过 `parseLLMJson` 解析（平衡花括号算法处理嵌套 JSON），然后通过 Zod schema 校验。

## 新增 slide 类型（当前已有 14 种）

按以下顺序编辑文件：
1. `core/schema/request.schema.ts` —— 添加到 `slideTypeEnum`
2. `components/templates/shared/{xxx}-card.tsx` —— 渲染组件，遵守 `CardProps`
3. `core/render/map-slide-to-component.tsx` —— 在 switch 中注册
4. `components/editor/card-type-meta.ts` —— 添加 `CARD_TYPES` 条目
5. `components/editor/card-editors/` —— 添加编辑表单

新增主题配色：编辑 `components/templates/shared/theme.ts` + `core/schema/request.schema.ts` 的 `templateEnum`。

## 样式约束

- 不要在卡片组件中硬编码颜色。从 `theme.*` 读取。
- 不要在 Tailwind 中使用 `@apply`。
- 圆角使用 `radius(theme, size)`，字体使用 `fontClass(theme)`。
- 颜色+透明度使用 `withAlpha(hex, alpha)`，不要用 `${color}60` 这种 hex 拼接。
- 布局尺寸使用 `CARD_WIDTH` / `CARD_HEIGHT` 常量（`core/render/card-dimensions.ts`），不要硬编码。
- 生产代码中不要使用 `debugger`。

## 说明文件备注

`AGENTS.md` 和 `CLAUDE.md` 已列入 `.gitignore`（第 2–3 行）。它们被故意排除在版本控制之外。
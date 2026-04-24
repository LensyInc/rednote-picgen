# Vercel + R2 部署重构计划

> 目标：将当前基于本地文件系统 + Playwright 截图的架构，改造为适配 Vercel Serverless 的架构。
> 核心策略：存储上 Cloudflare R2（S3 兼容），截图从前端 html-to-image 直出。

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Hobby（$0）                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 前端编辑器    │  │ /api/*       │  │ /preview/* SSR   │   │
│  │ html-to-image │  │ Next.js API  │  │ 读取 R2 JSON     │   │
│  │ 导出 PNG     │  │ Routes       │  │ 渲染卡片         │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
└─────────┼──────────────────┼────────────────────────────────┘
          │                  │
          │  上传 PNG        │  读写 JSON
          │  获取图片        │
          ▼                  ▼
┌─────────────────────────────────────────┐
│     Cloudflare R2（S3 兼容对象存储）      │
│  ├── bucket/documents/*.json            │
│  ├── bucket/exports/*.png               │
│  └── bucket/assets/*.jpg                │
└─────────────────────────────────────────┘
```

**成本预估**：
- Vercel Hobby：免费（个人项目够用）
- Cloudflare R2：免费额度 10GB 存储 + 100 万次操作/月，个人项目长期 $0
- 如需绑自定义域名：Vercel Pro $20/月 或单独买域名

---

## 2. 核心改造决策

| 模块 | 现状 | 改造后 | 原因 |
|---|---|---|---|
| **数据存储** | `fs/promises` 写本地 `output/json/` | `@aws-sdk/client-s3` 读写 R2 | Vercel 无状态，本地磁盘不可靠 |
| **截图导出** | Playwright 服务端截图 | `html-to-image` 前端截图 + 直传 R2 | Playwright bundle 体积超 Serverless 限制，启动慢 |
| **外部图片** | 直接引用 Pexels/Pixabay URL | 经 `/api/proxy-image` 同源代理 | 解决 html-to-image 跨域污染 canvas 问题 |
| **素材图片** | 下载到 `output/assets/` | 下载到 R2 `assets/` 前缀 | 与存储统一，支持 CDN |

---

## 3. 依赖变更

### 3.1 新增依赖

```bash
npm install html-to-image
npm install @aws-sdk/client-s3
```

### 3.2 可移除依赖

```bash
npm uninstall playwright
# 以及任何仅用于截图的辅助包
```

> **注意**：`playwright` 卸载后，`core/export/` 目录整体废弃。如果未来需要回归测试或其他用途，可保留为 devDependency，但生产构建不应包含。

---

## 4. 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 中配置：

| 变量名 | 说明 | 示例 |
|---|---|---|
| `R2_ENDPOINT` | R2 S3 API 端点 | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 API Token ID | 从 Cloudflare 控制台生成 |
| `R2_SECRET_ACCESS_KEY` | R2 API Token Secret | 从 Cloudflare 控制台生成 |
| `R2_BUCKET_NAME` | R2 Bucket 名称 | `picgen` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 公开访问域名（用于前端直接读取图片） | `https://pub-<hash>.r2.dev` 或自定义域名 |

> `NEXT_PUBLIC_R2_PUBLIC_URL` 是前端可用的公开 URL，用于显示已导出 PNG 和素材图片。R2 默认是私有的，需要配公开访问或预签名 URL。

---

## 5. 文件改造清单

### 5.1 新增文件

#### `core/storage/s3-client.ts`
封装 R2 S3 客户端，供 task-store 和其他模块复用。

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
```

#### `core/storage/task-store.ts`（整体重写）
保持 API 签名不变（`saveTaskDocument`、`loadTaskDocument`、`listTasks`、`getExportDir`、`getAssetsDir`），内部改为 S3 操作。

关键变更点：
- `saveTaskDocument` → `PutObject` 到 `documents/{taskId}.json`
- `loadTaskDocument` → `GetObject` 从 `documents/{taskId}.json`
- `listTasks` → `ListObjectsV2` 从 `documents/` 前缀
- `getExportDir` → 返回 R2 前缀路径（逻辑路径，不再对应本地文件系统）
- `getAssetsDir` → 同上

> **约束**：对外接口签名不变，调用方（API Routes、Preview Page）无需修改调用方式。

#### `app/api/proxy-image/route.ts`
新增图片代理 API，解决外部图片跨域。

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        // 模拟浏览器请求，部分图库会拒绝无 User-Agent 的请求
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "图片获取失败" }, { status: 502 });
    }

    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "代理失败" }, { status: 500 });
  }
}
```

前端使用方式：
```tsx
// 原来
<img src={imageUrl} />

// 改造后
<img src={`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`} />
```

### 5.2 修改文件

#### `app/api/export/route.ts`（重写职责）
从「服务端 Playwright 截图」变为「接受前端 PNG，直传 R2」。

```ts
import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/core/storage/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, slideIndex, base64Image } = body;

    if (!taskId || slideIndex == null || !base64Image) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // base64 -> Buffer
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const key = `exports/${taskId}/slide-${slideIndex}.png`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: "image/png",
      })
    );

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e) {
    console.error("Export API error:", e);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
```

#### `app/api/generate/route.ts`
- LLM 生成逻辑不变
- 生成后的 `NoteDocument` 改为通过 `saveTaskDocument`（已重写为 S3）保存
- 无需本地 `output/json/` 目录

#### `app/api/save-document/route.ts`
- 逻辑不变，继续调用 `saveTaskDocument`
- 内部自动走 R2，无需修改本文件代码

#### `app/api/save-slide/route.ts`
- 逻辑不变，继续调用 `loadTaskDocument` + `saveTaskDocument`

#### `app/api/tasks/route.ts`
- 逻辑不变，继续调用 `listTasks`

#### `app/api/tasks/[taskId]/route.ts`
- 逻辑不变，继续调用 `loadTaskDocument`

#### `app/preview/[taskId]/[slideId]/page.tsx`
- `loadTaskDocument` 接口不变，本文件无需逻辑修改
- 但签名需要更新为新的 `familyId + themeId`（来自 family 重构，见 `docs/adding-new-template.md`）
- 如果 family 重构和部署改造并行进行，注意同步更新

### 5.3 前端导出功能（新增组件）

在编辑器 UI 中新增导出按钮和逻辑。假设添加在 `components/editor/export-button.tsx`：

```tsx
"use client";

import { useState, useCallback } from "react";
import { toPng } from "html-to-image";

interface ExportButtonProps {
  taskId: string;
  slideRefs: React.RefObject<HTMLDivElement | null>[];
}

export function ExportButton({ taskId, slideRefs }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setProgress(0);

    // 等待字体加载完成
    await document.fonts.ready;

    const results: string[] = [];

    for (let i = 0; i < slideRefs.length; i++) {
      const node = slideRefs[i].current;
      if (!node) continue;

      const dataUrl = await toPng(node, {
        pixelRatio: 2, // 2484x3320，高清
        cacheBust: true,
        // 如果卡片内有跨域图片未走代理，这里会抛出 SecurityError
      });

      // 上传到后端
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          slideIndex: i + 1,
          base64Image: dataUrl,
        }),
      });

      if (res.ok) {
        const { url } = await res.json();
        results.push(url);
      }

      setProgress(i + 1);
    }

    setExporting(false);
    // 可弹窗展示 results 中的下载链接
  }, [taskId, slideRefs]);

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? `导出中 ${progress}/${slideRefs.length}` : "导出 PNG"}
    </button>
  );
}
```

**前端使用 html-to-image 的关键约束**：
- 导出前必须 `await document.fonts.ready`
- 所有外部图片必须通过 `/api/proxy-image` 代理（同源）
- 卡片 DOM 节点内**不能有未加载完成的图片**（建议预加载所有图片后再导出）
- `pixelRatio: 2` 产出 2484×3320，画质足够；如需更大可配 3

### 5.4 可删除/废弃的文件

| 文件 | 操作 | 原因 |
|---|---|---|
| `core/export/screenshot.ts` | **删除** | Playwright 截图不再需要 |
| `core/export/batch-export.ts` | **删除** | 批量服务端截图不再需要 |
| `core/export/` 目录 | **删除** | 空后可删 |
| `output/json/*.json` | **删除** | 历史数据已清空 |
| `output/export/` | **删除** | 历史导出已清空 |
| `playwright` (package.json) | **卸载** | 生产构建不再需要 |

> **注意**：`output/` 目录本身保留，放 `.gitkeep`，防止本地开发时相关路径报错（如果有硬编码路径残留）。

---

## 6. R2 Bucket 结构设计

```
picgen-bucket/
├── documents/
│   ├── task-xxx.json
│   └── task-yyy.json
├── exports/
│   └── task-xxx/
│       ├── slide-1.png
│       ├── slide-2.png
│       └── ...
└── assets/
    └── task-xxx/
        ├── photo-1.jpg
        └── ...
```

**权限配置**：
- `documents/` 前缀：**私有**（通过服务端 API 读写，不直接暴露）
- `exports/` 前缀：**公开读取**（用户需要下载 PNG，走 CDN 更快）
- `assets/` 前缀：**公开读取**（素材图片展示用）

> R2 公开读取配置：Cloudflare Dashboard → R2 → Bucket → Settings → Allow public access。或者使用自定义域名 + Cloudflare CDN。

---

## 7. 改造实施顺序

### Step 1 — 基础设施（不动业务代码）
- [ ] 注册 Cloudflare R2，创建 bucket，生成 API Token
- [ ] 在 `.env.local` 填入 R2 环境变量（本地测试用）
- [ ] 安装依赖：`npm install html-to-image @aws-sdk/client-s3`
- [ ] 新建 `core/storage/s3-client.ts`
- [ ] 重写 `core/storage/task-store.ts`（保持 API 签名不变，内部换 S3）
- [ ] 校验点：`npm run typecheck`，本地 `npm run dev` 能正常读写（需配 VPN 或代理确保 R2 可访问）

### Step 2 — API 层适配
- [ ] 新建 `app/api/proxy-image/route.ts`
- [ ] 重写 `app/api/export/route.ts`（接受 base64 PNG）
- [ ] 修改 `app/api/generate/route.ts`（确认生成后走新版 task-store）
- [ ] 校验点：本地用 Postman/curl 测试 `POST /api/save-document`、`GET /api/tasks`、`POST /api/export`

### Step 3 — 前端截图改造
- [ ] 在编辑器组件中引入 `html-to-image`
- [ ] 新增 `ExportButton` 组件或改造现有导出入口
- [ ] 确保所有外部图片引用改为 `/api/proxy-image?url=...`
- [ ] 导出前调用 `document.fonts.ready`
- [ ] 校验点：本地导出 8 页卡片，检查画质、字体、图片完整性

### Step 4 — 清理旧代码
- [ ] 删除 `core/export/screenshot.ts` 和 `batch-export.ts`
- [ ] 卸载 `playwright`：`npm uninstall playwright`
- [ ] 清理 `output/` 下的历史文件（保留 `.gitkeep`）
- [ ] 校验点：`npm run build` 通过，产物体积显著减小

### Step 5 — Vercel 部署
- [ ] Push 到 GitHub/GitLab
- [ ] Vercel Dashboard 导入项目
- [ ] 配置 Environment Variables（R2 相关）
- [ ] 首次 Deploy
- [ ] 校验点：线上生成文档、保存、预览、导出全链路跑通

---

## 8. 风险与 fallback

| 风险 | 影响 | fallback |
|---|---|---|
| html-to-image 在特定卡片上崩溃（如超大图片、复杂 CSS） | 导出失败 | 该卡片降级为「跳过导出」，前端提示用户；保留服务端截图代码作为可选开关（不删，只 disable） |
| R2 免费额度用完 | 写失败 | 监控用量；真用完时 R2 费用极低（$0.015/GB/月），基本可忽略 |
| 霞鹜文楷字体加载超时 | 截图字体 fallback | 导出前增加 `document.fonts.ready` 超时检测（>5s 报错提示刷新重试） |
| 跨域图片代理被 Pexels 限流 | 图片加载失败 | 代理请求加 `User-Agent` + 错误 fallback（显示占位图） |

---

## 9. 性能预估（Vercel Hobby + R2）

| 指标 | 预估 |
|---|---|
| 冷启动时间 | <1s（无 Playwright，bundle 小） |
| 单页导出耗时 | 前端 0.5-2s + 上传 0.3-1s |
| 8 页串行导出总耗时 | 6-20s（取决于图片大小和网速） |
| 并发导出能力 | 无限制（纯前端计算 + 独立 HTTP 上传） |
| API 请求响应 | <200ms（R2 读取 JSON） |
| 月度费用 | **$0**（Hobby + R2 免费额度内） |

---

## 10. 相关文档

- `docs/adding-new-template.md` —— Template Family 架构规划（如与本次部署改造并行，注意 `mapSlideToComponent` 签名同步更新）
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- html-to-image Docs: https://github.com/bubkoo/html-to-image
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables

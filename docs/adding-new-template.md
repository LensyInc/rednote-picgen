# 新增真正模板（Template Family）规划

> 写作时间：2026-04-23
>
> 目标：把当前"8 套配色 = 8 个模板"的现状，演进为"N 个模板家族（结构性不同的布局）× M 套配色主题（正交）"。

---

## 1. 当前现状

### 1.1 已有结构
```
components/templates/
└── shared/
    ├── theme.ts                 # 8 套 Theme（color + corner + font + mood）
    ├── card-container.tsx       # 统一容器 + 页码徽章 + 背景层
    ├── atoms.tsx                # Tag / SectionTitle / NumberBadge / Highlight / SurfaceCard
    ├── prose-card.tsx           # 14 种卡片，全部主题参数化
    ├── content / image / summary / cta / quote / tips /
    │   comparison / step / stats / faq / checklist / timeline / prose
    └── index.ts

路由点：`core/render/map-slide-to-component.tsx`，根据 `slide.type` 分派到上述 14 个组件，并把 `getThemeSafe(templateId)` 的颜色注入。

### 1.2 局限
- 所有 14 种卡片只有**一套排版**——只能用颜色、字体、圆角区分风格
- 无法做「杂志式左图右字」「大字报」「极简一句话封面」这种**结构性**差异
- 已有 `templateEnum` 的 8 个 id 都被占用作为配色名，新增 id 会让"模板"与"配色"概念耦合更深

---

## 2. 目标架构

### 2.1 核心概念

把原来的一维 `templateId` 拆成正交两维：

| 维度 | 叫法 | 例子 | 存在形式 |
|---|---|---|---|
| **布局族** | **Template Family**（`familyId`） | `classic`（当前）/ `magazine` / `bigtype` / `grid` | 每家一个目录，含 14 个卡片组件 |
| **配色主题** | **Theme**（`themeId`） | `warm-rose` / `foggy-blue` / `midnight` ... | 一份 `Theme` 对象（色卡 + 圆角 + 字体） |

**产物**：任意 family × theme 组合都能独立渲染，正交性 = 真正意义上的"模板不同"+"配色不同"。

### 2.2 目录演进

```
components/templates/
├── shared/                      ← ❄️ 冻结区：Classic 的唯一渲染源
│   ├── theme.ts                 # 8 套 Theme（classic 直接读取）
│   ├── card-container.tsx       # 容器 + 页码 + 背景层
│   ├── atoms.tsx                # Tag / Highlight / SurfaceCard 等原子
│   ├── (14 cards).tsx           # Classic 的 14 张卡片
│   └── index.ts                 # 导出，供 classic family 引用
├── themes/
│   └── theme.ts                 # Theme 对象集合（所有 family 的配色 truth source）
├── families/
│   ├── classic/                 # 薄封装，直接 re-export shared/ 内容
│   │   ├── index.ts             # export { CoverCard } from "../../shared/cover-card" ...
│   │   └── family-meta.ts       # name / description / defaultTheme / capabilities
│   ├── magazine/                # 新 family 示例（后续加）
│   │   ├── index.ts             # 导出 14 个卡片 + family 元信息
│   │   └── (14 cards).tsx       # 全新排版
│   └── ...
├── shared-new/                  # 新基础设施（不侵入 shared/）
│   └── card-types.ts            # CardProps / CardComponents / TemplateFamily 类型
└── registry.ts                  # familyId -> CardComponents 的注册表
```

**关键原则**：
- `shared/` 目录是 **冻结资产**，现有 16 个文件（14 卡片 + container + theme + atoms + index）的源代码**禁止修改**
- `atoms.tsx` 如需补充新原子，以**追加导出**形式添加，不得改动已有代码
- `shared/index.ts` 只能追加新导出，不得删除或改名现有导出
- `themes/theme.ts` 初始内容是 `shared/theme.ts` 的完整复制，作为未来唯一 truth source；原有 8 套配色的 id 和值不可变更
- Classic family 的渲染路径和今天**完全一致**，`families/classic/index.ts` 只做 re-export，不封装任何逻辑

### 2.3 类型骨架（`shared-new/card-types.ts`）
```ts
import type { Slide } from "@/core/schema/note.schema";
import type { Theme } from "../themes/theme";

export interface CardProps {
  slide: Slide;
  theme: Theme;
  backgroundType?: string;
  pageIndex?: number;
  pageTotal?: number;
}

// 每个 family 必须导出完整的 14 个卡片组件
export interface CardComponents {
  CoverCard: React.ComponentType<CardProps>;
  TextCard: React.ComponentType<CardProps>;
  TextImageCard: React.ComponentType<CardProps>;
  SummaryCard: React.ComponentType<CardProps>;
  CTACard: React.ComponentType<CardProps>;
  QuoteCard: React.ComponentType<CardProps>;
  TipsCard: React.ComponentType<CardProps>;
  ComparisonCard: React.ComponentType<CardProps>;
  StepCard: React.ComponentType<CardProps>;
  StatsCard: React.ComponentType<CardProps>;
  FaqCard: React.ComponentType<CardProps>;
  ChecklistCard: React.ComponentType<CardProps>;
  TimelineCard: React.ComponentType<CardProps>;
  ProseCard: React.ComponentType<CardProps>;
}

export interface TemplateFamily {
  id: string;
  name: string;                 // 中文展示名
  description: string;          // 一句话特点
  cards: CardComponents;
  defaultTheme?: string;        // 建议的默认配色
  supportsBackgrounds?: Array<"solid" | "gradient" | "dots" | "lines">;
  capabilities?: {
    comparisonStyles?: Array<"good-bad" | "ab">;
    imagePositions?: Array<"top" | "bottom" | "left" | "right" | "background">;
    maxBulletCount?: number;
    supportsPageNumbers?: boolean;
  };
}
```

### 2.4 Schema 变化（直接替换，不兼容旧数据）

本项目为自用，**不保留旧数据兼容**。旧 JSON 无法直接读取，重新生成即可。

```ts
// request.schema.ts
export const familyEnum = z.enum(["classic", /* 后续追加 */]);
export const themeEnum = z.enum([
  "template-a", "template-b", "template-c", "template-d",
  "template-e", "template-f", "template-g", "template-h",
]);

// 废弃 templateEnum 作为独立概念；themeEnum 即为配色列表
export const generateRequestSchema = z.object({
  topic: z.string().min(1, "选题不能为空"),
  audience: z.string().min(1, "目标人群不能为空"),
  tone: toneEnum,
  noteType: noteTypeEnum,
  pageCount: pageCountEnum,
  family: familyEnum.default("classic"),   // 新增
  theme: themeEnum,                        // 替代原 template
  includeRealImages: z.boolean(),
  userOutline: z.string().max(4000, "大纲过长").optional(),
});
```

`noteDocumentSchema.theme` 对应替换：
```ts
theme: z.object({
  family: familyEnum.default("classic"),
  themeId: themeEnum,           // 替代原 template 字段
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundType: z.enum(["solid","gradient","dots","lines"]).optional(),
  fontScale: z.enum(["small","medium","large"]),
}),
```

### 2.5 分派改造
`core/render/map-slide-to-component.tsx`：
```ts
import { FAMILY_REGISTRY } from "@/components/templates/registry";
import { getTheme } from "@/components/templates/themes/theme";

export function mapSlideToComponent(
  slide: Slide,
  familyId: string = "classic",
  themeId: string = "template-a",
  backgroundType?: string,
  options: MapOptions = {}
) {
  const family = FAMILY_REGISTRY[familyId] ?? FAMILY_REGISTRY.classic;
  const theme = getTheme(themeId);
  const C = family.cards;
  const props = { slide, theme, backgroundType: backgroundType || "solid", ...options };
  // switch (slide.type) 原逻辑不变
}
```

**调用点清单**（必须全部同步修改）：
- `app/preview/[taskId]/[slideId]/page.tsx`
- `app/api/export/route.ts`
- `components/editor/preview-pane.tsx`（或编辑器内联预览，如有）

---

## 3. 实施顺序

### Step 0 — 基础设施（不碰任何 frozen 文件）
- 新建 `components/templates/shared-new/card-types.ts`（类型定义）
- 新建 `components/templates/themes/theme.ts`（复制 `shared/theme.ts` 全部内容，作为未来唯一 truth source）
- 新建 `components/templates/families/classic/family-meta.ts` + `index.ts`（薄封装，直接 re-export `shared/` 内容）
- 新建 `components/templates/registry.ts`（只注册 `classic`）
- **校验点**：`npm run typecheck` 通过；`shared/` 目录下无任何文件变更

### Step 1 — 分派层改造
- 修改 `core/render/map-slide-to-component.tsx`：改为从 registry 取 family，从 `themes/theme.ts` 取 theme
- 修改所有调用点（preview page、export API、编辑器内联预览）传入 `familyId + themeId`
- **校验点**：`npm run build`，classic 渲染路径 visually 1:1 不变

### Step 2 — Schema 直接替换
- `request.schema.ts`：加 `familyEnum`，`generateRequestSchema` 用 `family` + `theme` 替代旧 `template`
- `note.schema.ts`：`theme.template` 改为 `theme.family + theme.themeId`
- `generate-note.ts` 等 LLM 产出层适配新 schema
- `app/api/generate/route.ts`、`app/api/save-document/route.ts` 等适配新字段名
- **校验点**：端到端生成一次 8 页文档，classic 下视觉效果和之前像素级一致

### Step 3 — UI 暴露
- 编辑器中间工具条：「配色」下拉旁边加「模板」下拉（列出 registry 里全部 family）
- `TopicForm`（AI 生成）加 `family` 字段
- 切换 family 时 `document.theme.family = newId`，autosave 落盘
- **校验点**：classic 的 8 套配色下拉保持原样；切换 family 后预览正常刷新

### Step 4 — 新建第二个 family（magazine）
- 新建 `families/magazine/` 目录
- 14 张卡片全新排版（必须完整实现，不可只复用部分）
- 在 `registry.ts` 注册
- 如果卡片间有大量复用逻辑（如 header、footer、image frame），抽到 `shared/atoms.tsx`（追加导出）或 `shared-new/` 中
- **校验点**：mock 数据覆盖 14 种 slide type，4 种背景 × 至少 2 套 theme，目视无溢出

### Step 5 — Prompt 层可选优化（P3 / 暂不做）
不同 family 对信息密度需求不同，可给 `buildContentPrompt` 传入当前 family，允许 family 定义内容偏好。先不做。

---

## 4. Family 候选方向与差异要点

| Family 名 | 视觉关键词 | 跟 classic 的主要差异 |
|---|---|---|
| `classic` | 现有 | — |
| `magazine` 杂志 | 左图右字、栏间分隔线、正文 justify | 内容/图文页做成左右两栏；tips/stats 走带序号的"文章段落"排版；不用大色块 |
| `bigtype` 大字报 | 标题占 60% 高、极简副文 | 所有页标题放到 150–200px；bullets 缩小为注释；quote 页整屏一句话 |
| `grid` 卡片网格 | 要点分格展示 | tips/summary/checklist 用 2×N 小卡片网格；封面用 1:1 大图 + 角落标题 |
| `paper` 便笺风 | 纸张质感、手写字、轻微旋转 | 整体用 `font-wenkai`；卡片加纸张纹理 + 订书针/胶带角；stats 图形化 |
| `bento` 日式分格 | 多区域拼贴 | 单张卡片内拼贴多个子区域（封面放 3 个子格子展示主要卖点） |

### 4.1 哪个先做
推荐 **magazine**：
1. 用户最容易感知到"这是另一个模板"
2. 现有 atoms（Tag / Highlight / SurfaceCard）大部分能复用，工作量可控
3. 不需要新字体/纹理资源

---

## 5. 约束与风险

### 5.1 Classic 文件级冻结（铁律）

以下文件为**冻结资产**，其源代码在任何重构步骤中都**禁止修改**（包括修 bug、改样式、重命名变量、删代码）：

```
components/templates/shared/
├── cover-card.tsx
├── text-card.tsx
├── text-image-card.tsx
├── summary-card.tsx
├── cta-card.tsx
├── quote-card.tsx
├── tips-card.tsx
├── comparison-card.tsx
├── step-card.tsx
├── stats-card.tsx
├── faq-card.tsx
├── checklist-card.tsx
├── timeline-card.tsx
├── prose-card.tsx
├── card-container.tsx
├── theme.ts
└── atoms.tsx      # 允许追加新导出，禁止修改现有代码
```

`shared/index.ts` 只能追加新导出，现有导出保持不动。

### 5.2 画布尺寸不可变

所有 family 必须使用 `core/render/card-dimensions.ts` 定义的 **1242 × 1660 px** 画布尺寸。

- 禁止任何 family 私自改变单页尺寸
- 如果某个 family（如 `bigtype`）需要更大字号，通过 `fontScale` 或 family 内部排版调节，不得扩大容器

### 5.3 样式隔离

- 每个 family 目录下允许有一个 `family.css`，在 `app/globals.css` 中通过 `@import` 引入
- **禁止**在组件文件里写 `<style jsx>` 或内联 `<style>` 标签
- 需要全局动画/关键帧的，统一注册到 `app/globals.css`

### 5.4 图片处理

- 每个 family 在 `family-meta.ts` 中通过 `capabilities.imagePositions` 声明支持的图片位置
- 编辑器根据当前 family 的能力动态展示/隐藏图片位置选项

### 5.5 编辑器联动

- `card-editors/` 操作的是 slide 内容字段，与 family 无关，不受影响
- 如果某 family 不支持某种内容样式（如 magazine 不支持 `good-bad` comparison），编辑器应根据 `capabilities` 动态隐藏该选项

### 5.6 导出与截图

- `app/preview/[taskId]/[slideId]/page.tsx` 需把 `document.theme.family` 传给 `mapSlideToComponent`
- Playwright 截图路径不变
- 所有 family 的预览路由必须使用服务端渲染，禁止在卡片组件里用 `useEffect` 做延迟布局

---

## 6. Classic 回归检查（每次重构后必做）

由于 classic 是已开始创作的冻结资产，每次 build 后必须执行：

1. 生成一份 8 页标准文档（固定 topic，便于对比）
2. 目视检查 cover / content / image / comparison 四页
3. 与重构前的截图做像素对比（可用 Playwright 截图后对比）
4. 在 classic + 每套 theme（8 套）× 4 种背景下各抽查一页，确认无溢出、无字体缺失
5. **如有任何视觉差异，立即回滚，不得强行修复**

> 建议维护 `docs/classic-baseline.spec.ts` 或 `docs/classic-regression.png` 作为基线。

---

## 7. 新增 family checklist

每新增一个 family 必须完成：

- [ ] 14 张卡片组件全部实现，没有遗漏 slide type（参考 `slideTypeEnum` 当前列表）
- [ ] 在 `registry.ts` 中注册，并填写 name / description / defaultTheme / capabilities
- [ ] 在 `request.schema.ts` 的 `familyEnum` 中追加 id
- [ ] 编辑器「模板」下拉能自动展示该 family（由 registry 驱动，无需额外代码）
- [ ] mock 数据覆盖 14 种 slide type，4 种背景 × 2 套 theme，目视无溢出
- [ ] `/api/export` 截图 8 张，确认无 dev 浮标、无空白、字体正常加载
- [ ] 检查该 family 是否有特殊字体需求，如需则在 `layout.tsx` 或 `globals.css` 中预加载
- [ ] 更新本文档「Family 候选方向」表格，标记该 family 为已实现

---

## 8. 工作量粗估（magazine 家族为例）

| 任务 | 规模 |
|---|---|
| Step 0 基础设施（类型 + registry + classic 封装） | ~150 行，1 小时 |
| Step 1 分派层改造 + 调用点同步 | ~100 行，1 小时 |
| Step 2 Schema 直接替换 + LLM 层适配 | ~120 行，1.5 小时 |
| Step 3 UI 下拉 + 自动保存联动 | ~80 行，30 分钟 |
| Step 4 magazine 14 张卡片重画 | **主工作量**，合计 ~1000 行，1–1.5 天 |
| 回归测试 + 微调 | 半天 |

> 后续每加一个 family，只有 Step 4 会重复（1 天左右），其余基础设施一次性完成。

---

## 9. 决策记录

- ✅ 选「Template Family + Theme」正交拆分，而非「每家自带配色」—— 理由：8 套配色是重要资产，不想为每个新 family 重新调色
- ✅ 选目录隔离而非单文件 switch —— 理由：14 张卡片 × 每家 60~120 行，写一起会爆炸
- ✅ **Classic `shared/` 目录冻结不动** —— 理由：已开始基于 classic 创作，任何改动都会破坏已有作品
- ❌ **不向前兼容旧 JSON 数据** —— 理由：项目自用，旧数据重新生成即可
- ❌ 不引入插件化 family（动态 import / manifest） —— 理由：当前规模用不上，一个 registry 就够
- ❌ 不把 theme 合进 family —— 理由：用户反复在"想换配色"但不想换结构

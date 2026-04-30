# Template Families 开发进度

> 记录 `fea/more-template` 分支上已完成的工作，以及后续可实现的 Family 候选方案。

---

## 一、架构改造（已完成）

从「8 个配色 = 8 个模板」迁移到「Family（布局）× Theme（配色）」二维系统。

### 核心变更

| 文件 | 改动 |
|------|------|
| `core/schema/note.schema.ts` | `theme.template` → `theme.family + theme.themeId` |
| `core/schema/request.schema.ts` | `templateEnum` → `familyEnum`；新增 `familyEnum` |
| `core/render/map-slide-to-component.tsx` | 分派参数改为 `familyId + themeId`，从 `FAMILY_REGISTRY` 取卡片组件 |
| `components/templates/registry.ts` | 新增 `FAMILY_REGISTRY`、`getFamily()`、`getFamilyList()` |
| `components/templates/shared-new/card-types.ts` | 新增 `TemplateFamily` 接口（含 `requiresPro`） |
| `components/templates/themes/theme.ts` | 独立的主题文件（从 shared/ 复制），供新 Family 引用 |
| `app/page.tsx` | Family 选择 UI；Pro 锁图标；AI 对话框透传当前 family/theme |
| `app/api/generate/route.ts` | 服务端 Pro 检查：`requiresPro` Family 拒绝非 Pro 用户 |
| `app/api/save-document/route.ts` | 服务端 Pro 检查：保存文档时校验 family 权限 |
| `lib/use-plan-type.ts` | 新增 `usePlanType()` hook，前端读取用户计划类型 |
| `components/editor/ai-generate-dialog.tsx` | 新增 `defaultFamily` / `defaultTheme` props |
| `components/editor/topic-form.tsx` | 同上 |

### 约定
- `components/templates/shared/` 目录**冻结**，classic family 纯转发它
- 新 Family 从 `themes/theme.ts` 引入类型和工具函数
- 所有新 Family 均设 `requiresPro: true`

---

## 二、已实现的 Family

### 1. Classic（经典）
- **路径**：`components/templates/families/classic/`
- **Pro 要求**：否（所有用户可用）
- **默认主题**：template-a（温润桃粉）
- **特征**：纯转发 `shared/` 的 14 张卡片，保持原有渲染逻辑
- **视觉**：圆角卡片、彩色标签、传统小红书风格

### 2. Magazine（杂志）
- **路径**：`components/templates/families/magazine/`
- **Pro 要求**：是
- **默认主题**：template-b（雾蓝商务）
- **特征**：编辑型顶栏（分类 + 期号规则线 + 页码）；左图右文分栏；细线分割；页边序号装饰
- **原子**：`MagHeader`、`MagDivider`、`MagVDivider`、`MagMarginNum`、`MagHighlight`、`MagPageBadge`

### 3. Bigtype（大字报）
- **路径**：`components/templates/families/bigtype/`
- **Pro 要求**：是
- **默认主题**：template-d（素雅极简）
- **特征**：左侧 14px 主色竖条；标题 140–172px 超大字；Bullet 降为小注；Tips/Steps 使用巨型序号
- **原子**：`BtTopBar`、`BtAccentBar`、`BtTitle`、`BtAnnotation`、`BtHighlight`

### 4. Grid（方格）
- **路径**：`components/templates/families/grid/`
- **Pro 要求**：是
- **默认主题**：template-b（雾蓝商务）
- **特征**：内容排布在带边框的方格单元中；列表型（Tips/Stats/Checklist/Summary）用 2 列网格；文字型（Step/FAQ/Timeline/Prose）用 1 列单元格；Cover 顶部 55% 为主色块 + 网格线纹理
- **原子**：`GdTopBar`（彩色方块标记 + 横线）、`GdCell`（带边框方格）、`GdHighlight`

### 5. Paper（手账纸）
- **路径**：`components/templates/families/paper/`
- **Pro 要求**：是
- **默认主题**：template-f（陶土暖褐）
- **特征**：米白/米黄纸张底；虚线边框；胶带、折角、便签块装饰；标题和正文优先使用文楷手写感
- **原子**：`PaperShell`、`PaperHeader`、`PaperNote`、`PaperHighlight`、`PaperBulletGrid`

### 6. Bento（便当格）
- **路径**：`components/templates/families/bento/`
- **Pro 要求**：是
- **默认主题**：template-h（柔粉日常）
- **特征**：6 列不对称 Bento 网格；大块标题、小块要点、图片/高亮混排；重点内容以大色块突出
- **原子**：`BentoShell`、`BentoTile`、`BentoTitle`、`BentoBadge`、`HighlightTile`

---

## 三、后续可实现的 Family

以下按实现难度和视觉差异度排列。

### A. Neon（霓虹）
- **视觉**：深色背景（强制暗色模式）；主色发光边框（`box-shadow: 0 0 12px primary`）；文字带发光效果
- **关键元素**：`box-shadow` 发光；只能搭配 template-g（深林墨绿）或新增暗色主题
- **难度**：低（主要是装饰 CSS）
- **备注**：需新增 1–2 个暗色系主题配合

### B. Minimal（极简留白）
- **视觉**：大量空白，内容居中，无边框，字号层级极分明；标题占整张卡片 60% 视觉重量
- **关键元素**：超大 padding；去掉所有 border 和背景装饰；靠字号和颜色建立层级
- **难度**：低（比 bigtype 更极简）
- **与 bigtype 区别**：bigtype 有左侧粗条和固定排版；minimal 无任何装饰，依靠空间说话

### C. Photo（图片优先）
- **视觉**：全图背景（不透明度 100%，不是 8% 的遮罩）；文字用半透明浮层卡片叠加；Cover 是纯全图
- **关键元素**：强依赖 `use_real_image: true`；无图时降级为渐变色块；浮层卡片用 `backdrop-filter: blur`
- **难度**：中（无图降级体验需要仔细设计）
- **适合场景**：旅行/美食/生活类内容

### D. Stripe（条纹分块）
- **视觉**：每张卡片分成水平色块条带：顶部主色条（约 30%）+ 中间内容区 + 底部次色条（约 15%）；条带之间无边框
- **关键元素**：固定高度的色块 div；内容区浮在色块分界处
- **难度**：低

---

## 四、主题扩展建议

目前 8 个主题（template-a 到 template-h）均为浅色系，建议补充：

| 建议主题 | 特征 | 适合 Family |
|---------|------|------------|
| 纯黑极简 | `#000000` 背景，白色文字，红色点缀 | Minimal、Neon |
| 靛蓝夜空 | 深蓝背景，金色文字 | Neon、Photo |
| 草木绿 | 中饱和绿，米白底 | Paper、Classic |

新主题只需在 `components/templates/themes/theme.ts` 的 `THEMES` 对象中追加，并在 `templateEnum`（`core/schema/request.schema.ts`）中注册。

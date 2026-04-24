# PicGen 已知问题清单

> 最后更新：2026-04-24，三轮全量代码审查后整理

本文件记录了经过代码审查识别但**暂不修复**的问题。已修复的问题不在此列。

---

## 🟡 中优先级

### 1. R2+PG 保存非原子性

**文件:** `app/api/generate/route.ts:87-91`

R2 写入文档成功后，PG 写入元数据可能失败，导致 R2 中存在孤儿文档（PG 无对应记录，任务列表不可见）。

**暂不修复原因:** 完整修复需要分布式事务或补偿机制（如定时清理孤儿文档），改动复杂度高且影响范围大。当前依赖 R2 写入的高可靠性，PG 失败概率极低。

---

## 🟢 低优先级

### 2. `fontScale` 字段存储但从未使用

**文件:** `core/schema/note.schema.ts:46`

`fontScale: z.enum(["small", "medium", "large"])` 存储在文档中，但没有任何卡片组件或主题函数读取该字段。所有代码路径都忽略它。

**暂不修复原因:** 删除字段会影响已有数据兼容性（Zod 校验会拒绝旧文档）。实现功能需要修改所有卡片组件的字体计算逻辑，工作量较大。保留字段为未来扩展预留。

### 3. HTTP 499 非标准状态码

**文件:** `app/api/generate/route.ts:69,80`

请求取消时返回 HTTP 499（nginx 扩展码）。部分 HTTP 客户端或 CDN 可能不识别此状态码。

**暂不修复原因:** 改为 408/204 需要前端适配，且此路径极少触发（用户在 LLM 调用期间主动取消）。

### 4. CSS `url()` 模板字符串未转义

**文件:** `components/templates/shared/cover-card.tsx:20`

```tsx
backgroundImage: `url("${imgSrc}")`
```

如果 `imgSrc` 含双引号或右括号，可能破坏 CSS 语法。

**暂不修复原因:** `proxyImageUrl` 会对远程 URL 做 `encodeURIComponent`，`localPath` 由系统生成不含特殊字符。实际风险极低。

### 5. `parseLLMJson` 不支持顶层 JSON 数组

**文件:** `core/llm/json-utils.ts:6-43`

`extractFirstJsonObject` 只处理 `{...}`，如果 LLM 返回 `[...]` 顶层数组会返回 null。但当前所有 prompt 都要求返回 `{"slides": [...]}` 格式。

**暂不修复原因:** 当前永远不会触发。如未来需要支持数组输出，再扩展该函数。

### 6. `next.config.ts` 缺少安全响应头

**文件:** `next.config.ts`

未配置 `X-Frame-Options`、`Content-Security-Policy`、`X-Content-Type-Options` 等安全头。应用处理用户认证和内容，缺少这些头存在 clickjacking 等风险。

**暂不修复原因:** 属于部署加固配置而非代码 bug。可通过 Next.js `headers()` 配置或反向代理（Vercel/Cloudflare）统一设置。
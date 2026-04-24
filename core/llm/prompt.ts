import { GenerateRequest } from "@/core/schema/request.schema";
import { sanitizeUserInput } from "./sanitize";

const TONE_MAP: Record<string, string> = {
  professional: "专业严谨",
  gentle: "温柔亲切",
  sharp: "犀利直接",
  casual: "轻松随意",
};

const NOTE_TYPE_MAP: Record<string, string> = {
  listicle: "清单合集",
  tutorial: "教程攻略",
  warning: "避坑提醒",
  comparison: "对比测评",
  summary: "总结复盘",
};

export function buildOutlinePrompt(request: GenerateRequest): string {
  const { topic, audience, tone, noteType, pageCount, includeRealImages, userOutline } = request;

  const userOutlineBlock = userOutline?.trim()
    ? `

用户已提供的大纲草稿（优先以此为准，补齐到 ${pageCount} 页并润色）：
"""
${sanitizeUserInput(userOutline.trim())}
"""`
    : "";

  return `请为以下选题生成小红书图文内容大纲：

选题：${sanitizeUserInput(topic)}
目标人群：${sanitizeUserInput(audience)}
风格：${TONE_MAP[tone] ?? tone}
内容类型：${NOTE_TYPE_MAP[noteType] ?? noteType}
总页数：${pageCount} 页
${includeRealImages ? "需要插入真实图片" : "不需要真实图片"}${userOutlineBlock}

请输出 JSON 格式的大纲，包含每页的类型和标题：

{
  "slides": [
    {
      "type": "cover",
      "title": "封面标题（信息清晰）",
      "coreMessage": "这一页的核心信息"
    },
    {
      "type": "content",
      "title": "内容页标题",
      "coreMessage": "核心信息（一句话讲清这页要说什么）"
    }
    // ... 总共 ${pageCount} 页
  ]
}

要求：
- 第一页必须是 cover
- 最后一页必须是 cta
- 中间页使用 content / summary / image / quote / tips / comparison / step / stats / faq / checklist / timeline 类型
  · quote: 金句引用页，适合放名言或核心观点
  · tips: 小贴士页，适合放多个实用建议
  · comparison: 对比页，适合"推荐做 vs 别踩坑"、正反对照
  · step: 步骤教程页，适合分步讲解
  · stats: 数据统计页，每条写成 "数值：标签" 或 "数值 - 标签" 形式（如 "83%：用户满意度"）
  · faq: 问答页，每条写成 "问题？答案" 形式
  · checklist: 检查清单页，适合待办事项
  · timeline: 时间线页，适合发展阶段或流程顺序
- 每页标题控制在 16 字以内，但不要过度精简到像电报体；要能独立成为一个有信息量的标题
- coreMessage 用 1-2 句话把这一页要讲的事说清楚，避免空话
- 各页内容主题不要重复，覆盖不同角度${userOutline?.trim() ? "\n- 如果用户大纲已指定某页的主题，保留其原意" : ""}
- 只输出 JSON，不要其他内容`;
}

export function buildContentPrompt(
  request: GenerateRequest,
  outline: Array<{ type: string; title: string; coreMessage: string }>
): string {
  const { topic, audience, tone, noteType, pageCount, includeRealImages, userOutline } = request;

  const userOutlineBlock = userOutline?.trim()
    ? `

用户大纲原文（请在不违反字段约束的前提下吸收其中的具体事实、例子、措辞偏好）：
"""
${sanitizeUserInput(userOutline.trim())}
"""`
    : "";

  return `请根据以下大纲，为选题「${sanitizeUserInput(topic)}」补全每页的详细内容。每页要有充实、具体的信息量，不要空话套话。请使用中性、客观的表述，避免"最好"、"必备"、"绝对"、"稳赚"、"全网最"这类夸大或绝对化的词语，也不要做未经证实的承诺。

目标人群：${sanitizeUserInput(audience)}
风格：${TONE_MAP[tone]}
内容类型：${NOTE_TYPE_MAP[noteType]}

大纲：
${outline.map((s, i) => `${i + 1}. [${s.type}] ${s.title} — ${s.coreMessage}`).join("\n")}${userOutlineBlock}

请为每一页输出完整的 Slide JSON：

{
  "slides": [
    {
      "id": "slide-1",
      "type": "cover",
      "title": "封面标题",
      "subtitle": "副标题（可选，一句话说明核心价值）",
      "bullets": [],
      "highlight": null,
      "use_real_image": false,
      "image_query": null
    }
    // ... 总共 ${pageCount} 页
  ]
}

字段说明：
- id: 使用 slide-1, slide-2, ... slide-${pageCount}
- type: cover / content / summary / cta / image / quote / tips / comparison / step / stats / faq / checklist / timeline
- title: 页面标题
- subtitle: 副标题/说明句（可选，长度 15-25 字）
- bullets: 要点列表，每页 4-6 条为佳（最多 7 条）
- highlight: 一句亮点/结论/金句（可选，20-35 字），不需要时设为 null
- use_real_image: ${includeRealImages ? "图文页、封面可以设为 true" : "全部设为 false"}
- image_query: 如果 use_real_image 为 true，填写英文或中英混合的搜索关键词

内容约束（请严格遵守）：
- 标题：不超过 18 字，要有信息量，不要只写"总结"、"技巧"这种空壳
- 副标题：15-25 字，承接标题做补充说明
- 每条 bullet：18-35 字，要有具体动作/数字/例子，不要只写"要注意"、"很重要"这种空话
- 每页 4-6 条 bullet（封面 / quote / cta 页可以为空数组）
- highlight：20-35 字，作为这页的金句或行动号召
- stats 类型的 bullet：写成 "数值：标签" 或 "数值 — 标签"，如 "83%：下班后仍查邮件的白领比例"
- faq 类型的 bullet：写成 "问题？答案"，问号后紧接答案
- comparison 类型的 bullet：前一半是"推荐方案"，后一半是"需留意的做法"
- timeline / step 类型：bullet 按时间或操作顺序排列

输出格式：
- 不需要的字段设为 null，不要设为空字符串
- 只输出 JSON，不要 Markdown 包裹，不要解释性文字`;
}

export function buildRewritePrompt(
  slideJson: string,
  instruction?: string
): string {
  return `请重写以下小红书图文页面的内容，保持原有结构不变。

原始内容：
${slideJson}

${instruction ? `重写要求：${sanitizeUserInput(instruction)}` : "要求：让内容更精炼、更有吸引力，保持原有字段结构"}

请输出重写后的完整 JSON，保持相同的字段结构。只输出 JSON。`;
}

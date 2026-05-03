import { type LucideIcon } from "lucide-react";
import {
  Tag,
  FileText,
  ImageIcon,
  Pin,
  Lightbulb,
  ArrowLeftRight,
  ListOrdered,
  BarChart3,
  CircleHelp,
  ListChecks,
  Clock,
  Quote,
  Send,
  AlignLeft,
} from "lucide-react";
import { Slide } from "@/core/schema/note.schema";

export interface CardTypeMeta {
  type: Slide["type"];
  label: string;
  description: string;
  icon: LucideIcon;
}

export const CARD_TYPES: CardTypeMeta[] = [
  { type: "cover", label: "封面", description: "首页，突出主题", icon: Tag },
  { type: "content", label: "正文", description: "标题 + 要点列表（可插图）", icon: FileText },
  { type: "prose", label: "纯文本", description: "无标题正文段落（可插图）", icon: AlignLeft },
  { type: "image", label: "图文", description: "大图 + 简短说明", icon: ImageIcon },
  { type: "summary", label: "重点总结", description: "分条总结结论", icon: Pin },
  { type: "tips", label: "小贴士", description: "多条实用提示", icon: Lightbulb },
  { type: "comparison", label: "对比参考", description: "两栏正反对照", icon: ArrowLeftRight },
  { type: "step", label: "操作步骤", description: "按顺序分步说明", icon: ListOrdered },
  { type: "stats", label: "关键数据", description: "数值 + 标签网格", icon: BarChart3 },
  { type: "faq", label: "常见问答", description: "Q&A 对", icon: CircleHelp },
  { type: "checklist", label: "检查清单", description: "待办/必做项", icon: ListChecks },
  { type: "timeline", label: "时间线", description: "按时间推进的节点", icon: Clock },
  { type: "quote", label: "金句", description: "突出一句引用", icon: Quote },
  { type: "cta", label: "结尾页", description: "收束、引导讨论", icon: Send },
];

export const CARD_TYPE_META: Record<Slide["type"], CardTypeMeta> = Object.fromEntries(
  CARD_TYPES.map((c) => [c.type, c])
) as Record<Slide["type"], CardTypeMeta>;

/** 创建一个空白 slide（用于手动添加页面） */
export function createEmptySlide(type: Slide["type"], id: string): Slide {
  const base: Slide = {
    id,
    type,
    title: "未命名标题",
    subtitle: undefined,
    bullets: [],
    highlight: undefined,
    use_real_image: false,
    image_query: undefined,
    image: null,
  };

  switch (type) {
    case "cover":
      return { ...base, title: "新的话题笔记" };
    case "content":
      return { ...base, title: "内容标题", bullets: ["第一条要点", "第二条要点"] };
    case "prose":
      return { ...base, title: "", bullets: ["第一段正文内容", "第二段正文内容"] };
    case "image":
      return { ...base, title: "图片主题", use_real_image: true };
    case "summary":
      return {
        ...base,
        title: "本篇重点",
        bullets: ["结论一", "结论二"],
      };
    case "tips":
      return { ...base, title: "小贴士", bullets: ["一条实用建议"] };
    case "comparison":
      return {
        ...base,
        title: "对比参考",
        bullets: ["推荐做法 A", "推荐做法 B", "需留意 X", "需留意 Y"],
      };
    case "step":
      return { ...base, title: "操作步骤", bullets: ["第一步", "第二步"] };
    case "stats":
      return {
        ...base,
        title: "关键数据",
        bullets: ["数值A：标签A", "数值B：标签B"],
      };
    case "faq":
      return {
        ...base,
        title: "常见问答",
        bullets: ["问题？简短答案"],
      };
    case "checklist":
      return {
        ...base,
        title: "检查清单",
        bullets: ["检查项 1", "检查项 2"],
      };
    case "timeline":
      return { ...base, title: "时间线", bullets: ["第一阶段", "第二阶段"] };
    case "quote":
      return { ...base, title: "要突出的那句话", subtitle: "出处" };
    case "cta":
      return { ...base, title: "结尾", subtitle: "欢迎在评论区交流你的看法" };
    default:
      return base;
  }
}

import { z } from "zod";

export const toneEnum = z.enum(["professional", "gentle", "sharp", "casual"]);
export const noteTypeEnum = z.enum([
  "listicle",
  "tutorial",
  "warning",
  "comparison",
  "summary",
]);
export const pageCountSchema = z.number().int().min(1).max(64);

// AI 生成时页数限制
const generatePageCountSchema = pageCountSchema.max(12);
export const templateEnum = z.enum([
  "template-a",
  "template-b",
  "template-c",
  "template-d",
  "template-e",
  "template-f",
  "template-g",
  "template-h",
]);
export const slideTypeEnum = z.enum([
  "cover",
  "content",
  "summary",
  "cta",
  "image",
  "quote",
  "tips",
  "comparison",
  "step",
  "stats",
  "faq",
  "checklist",
  "timeline",
  "prose",
]);
export const backgroundTypeEnum = z.enum(["solid", "gradient", "dots", "lines"]);
export type BackgroundType = z.infer<typeof backgroundTypeEnum>;

export const sourceEnum = z.enum(["pexels", "pixabay"]);

export const generateRequestSchema = z.object({
  projectName: z.string().min(1, "项目名称不能为空").max(200),
  topic: z.string().min(1, "选题主题不能为空").max(200),
  audience: z.string().min(1, "受众不能为空").max(200),
  tone: toneEnum,
  noteType: noteTypeEnum,
  pageCount: generatePageCountSchema,
  template: templateEnum.default("template-a"),
  includeRealImages: z.boolean().optional(),
  userOutline: z.string().max(4000).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

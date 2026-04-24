import { z } from "zod";

export const toneEnum = z.enum(["professional", "gentle", "sharp", "casual"]);
export const noteTypeEnum = z.enum([
  "listicle",
  "tutorial",
  "warning",
  "comparison",
  "summary",
]);
export const pageCountSchema = z.number().int().min(4).max(12);
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
]);
export const backgroundTypeEnum = z.enum(["solid", "gradient", "dots", "lines"]);
export type BackgroundType = z.infer<typeof backgroundTypeEnum>;

export const sourceEnum = z.enum(["pexels", "pixabay"]);

export const generateRequestSchema = z.object({
  topic: z.string().min(1, "主题不能为空").max(200),
  audience: z.string().min(1, "受众不能为空").max(200),
  tone: toneEnum,
  noteType: noteTypeEnum,
  pageCount: pageCountSchema,
  template: templateEnum,
  includeRealImages: z.boolean().optional(),
  userOutline: z.string().max(4000).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

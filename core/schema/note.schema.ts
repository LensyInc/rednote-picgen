import { z } from "zod";
import { slideTypeEnum, templateEnum, pageCountSchema, sourceEnum, backgroundTypeEnum } from "./request.schema";

export const imageSchema = z
  .object({
    source: sourceEnum,
    previewUrl: z.string().url(),
    fullUrl: z.string().url(),
    pageUrl: z.string().url().optional(),
    author: z.string().optional(),
    localPath: z.string().optional(),
  })
  .nullable();

export const slideSchema = z.object({
  id: z.string(),
  type: slideTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  subtitle: z.string().nullish(),
  bullets: z.array(z.string()).max(8, "每页最多 8 条内容"),
  highlight: z.string().nullish(),
  labelLeft: z.string().nullish(),
  labelRight: z.string().nullish(),
  comparisonStyle: z.enum(["good-bad", "ab"]).nullish(),
  use_real_image: z.boolean(),
  image_query: z.string().nullish(),
  image: imageSchema.default(null),
});

export const noteDocumentSchema = z.object({
  taskId: z.string(),
  version: z.number().int().min(1).default(1),
  createdAt: z.string().datetime(),
  meta: z.object({
    topic: z.string(),
    audience: z.string(),
    tone: z.string(),
    noteType: z.string(),
    pageCount: pageCountSchema,
  }),
  theme: z.object({
    template: templateEnum,
    primaryColor: z.string(),
    secondaryColor: z.string(),
    backgroundType: backgroundTypeEnum.optional(),
    fontScale: z.enum(["small", "medium", "large"]),
  }),
  slides: z
    .array(slideSchema)
    .min(4, "至少 4 页")
    .max(12, "最多 12 页"),
});

export type Slide = z.infer<typeof slideSchema>;
export type NoteDocument = z.infer<typeof noteDocumentSchema>;
export type SlideImage = z.infer<typeof imageSchema>;

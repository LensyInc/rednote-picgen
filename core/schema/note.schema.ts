import { z } from "zod";
import { slideTypeEnum, templateEnum, pageCountSchema, sourceEnum, backgroundTypeEnum, toneEnum, noteTypeEnum } from "./request.schema";

export const imageSchema = z
  .object({
    source: sourceEnum,
    previewUrl: z.string().url().or(z.literal("")),
    fullUrl: z.string().url().or(z.literal("")),
    pageUrl: z.string().url().or(z.literal("")).optional(),
    author: z.string().optional(),
    localPath: z.string().optional(),
  })
  .nullable()
  .transform((val) => {
    if (!val) return null;
    if (!val.previewUrl && !val.fullUrl && !val.localPath) return null;
    return val;
  });

export const slideSchema = z.object({
  id: z.string(),
  type: slideTypeEnum,
  title: z.string().min(0),
  subtitle: z.string().nullish(),
  bullets: z.array(z.string()).max(8, "每页最多 8 条内容"),
  highlight: z.string().nullish(),
  labelLeft: z.string().nullish(),
  labelRight: z.string().nullish(),
  comparisonStyle: z.enum(["good-bad", "ab"]).nullish(),
  textAlign: z.enum(["left", "center", "right"]).nullish(),
  use_real_image: z.boolean(),
  image_query: z.string().nullish(),
  image: imageSchema.default(null),
  imagePosition: z.enum(["top", "bottom", "background"]).optional(),
});

export const noteDocumentSchema = z.object({
  taskId: z.string(),
  version: z.number().int().min(1).default(1),
  createdAt: z.string().datetime(),
  meta: z.object({
    topic: z.string(),
    audience: z.string().min(1, "受众不能为空"),
    tone: toneEnum,
    noteType: noteTypeEnum,
    pageCount: pageCountSchema,
  }),
  theme: z.object({
    template: templateEnum,
    primaryColor: z.string(),
    secondaryColor: z.string(),
    backgroundType: backgroundTypeEnum.default("solid"),
    fontScale: z.enum(["small", "medium", "large"]),
  }),
  slides: z
    .array(slideSchema)
    .min(1, "至少 1 页")
    .max(64, "最多 64 页"),
});

export type Slide = z.infer<typeof slideSchema>;
export type NoteDocument = z.infer<typeof noteDocumentSchema>;
export type SlideImage = z.infer<typeof imageSchema>;

import { z } from "zod";
import { sourceEnum } from "./request.schema";

export const stockSearchResultSchema = z.object({
  source: sourceEnum,
  id: z.string().min(1),
  previewUrl: z.string().url(),
  fullUrl: z.string().url(),
  pageUrl: z.string().url().optional(),
  author: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type StockSearchResult = z.infer<typeof stockSearchResultSchema>;

export const stockSearchRequestSchema = z.object({
  query: z.string().min(1, "搜索词不能为空").max(200),
});

export type StockSearchRequest = z.infer<typeof stockSearchRequestSchema>;

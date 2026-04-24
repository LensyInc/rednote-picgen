import { createProvider } from "./provider";
import { buildOutlinePrompt } from "./prompt";
import { parseLLMJson } from "./json-utils";
import { GenerateRequest, slideTypeEnum } from "@/core/schema/request.schema";
import { z } from "zod";

export interface OutlineSlide {
  type: string;
  title: string;
  coreMessage: string;
}

export interface OutlineResult {
  slides: OutlineSlide[];
}

const outlineSlideSchema = z.object({
  type: slideTypeEnum,
  title: z.string().min(1, "大纲标题不能为空"),
  coreMessage: z.string().min(1, "核心信息不能为空"),
});

const outlineResultSchema = z.object({
  slides: z.array(outlineSlideSchema).min(1),
});

/**
 * 阶段 1：生成大纲
 * 输出每页类型、标题、核心信息
 */
export async function generateOutline(
  request: GenerateRequest
): Promise<OutlineResult> {
  const provider = createProvider();
  const prompt = buildOutlinePrompt(request);

  const response = await provider.chat(
    [
      { role: "system", content: "你是一位专业的小红书内容策划师。" },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7, maxTokens: 2048 }
  );

  const rawParsed = parseLLMJson(response);
  const schemaResult = outlineResultSchema.safeParse(rawParsed);
  if (!schemaResult.success) {
    console.error("[generate-outline] 大纲校验失败:", schemaResult.error.format());
    throw new Error("大纲格式异常，请重试");
  }
  const parsed: OutlineResult = schemaResult.data;
  validateOutline(parsed, request.pageCount);
  return parsed;
}

function validateOutline(outline: OutlineResult, expectedCount: number): void {
  if (outline.slides.length !== expectedCount) {
    throw new Error(
      `大纲页数不匹配: 期望 ${expectedCount} 页，实际 ${outline.slides.length} 页`
    );
  }

  // 验证第一页是 cover
  if (outline.slides.length > 1 && outline.slides[0]?.type !== "cover") {
    throw new Error("大纲第一页必须是 cover 类型");
  }

  // 验证最后一页是 cta（仅 2 页以上时要求）
  if (outline.slides.length > 1 && outline.slides[outline.slides.length - 1]?.type !== "cta") {
    throw new Error("大纲最后一页必须是 cta 类型");
  }
}

import { createProvider } from "./provider";
import { buildContentPrompt } from "./prompt";
import { parseLLMJson } from "./json-utils";
import { GenerateRequest } from "@/core/schema/request.schema";
import { NoteDocument, slideSchema } from "@/core/schema/note.schema";
import { OutlineResult } from "./generate-outline";
import { getTemplateConfig } from "@/core/render/template-registry";
import { z } from "zod";

const contentResponseSchema = z.object({
  slides: z.array(slideSchema),
});

/**
 * 阶段 2：根据大纲补全内容
 * 输出完整的 NoteDocument
 */
export async function generateNoteDocument(
  request: GenerateRequest,
  outline: OutlineResult,
  pregeneratedTaskId?: string
): Promise<NoteDocument> {
  const provider = createProvider();
  const prompt = buildContentPrompt(request, outline.slides);

  const response = await provider.chat(
    [
      { role: "system", content: "你是一位专业的小红书内容策划师。" },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7, maxTokens: 8192 }
  );

  const parsed = parseLLMJson(response);
  const validated = validateSlides(parsed, request.pageCount);

  const taskId = pregeneratedTaskId || crypto.randomUUID();
  const config = getTemplateConfig(request.template);

  return {
    taskId,
    version: 1,
    createdAt: new Date().toISOString(),
    meta: {
      topic: request.topic,
      audience: request.audience,
      tone: request.tone,
      noteType: request.noteType,
      pageCount: request.pageCount,
    },
    theme: {
      template: request.template,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      backgroundType: "solid",
      fontScale: "medium",
    },
    slides: validated.slides,
  };
}

function validateSlides(data: unknown, expectedCount: number) {
  const result = contentResponseSchema.safeParse(data);
  if (!result.success) {
    console.error("[generate-note] 内容校验失败:", result.error.format());
    throw new Error("内容校验失败，请重试");
  }

  if (result.data.slides.length !== expectedCount) {
    throw new Error(
      `内容页数不匹配: 期望 ${expectedCount} 页，实际 ${result.data.slides.length} 页`
    );
  }

  return result.data;
}

import { createProvider } from "./provider";
import { buildRewritePrompt } from "./prompt";
import { parseLLMJson } from "./json-utils";
import { Slide, slideSchema } from "@/core/schema/note.schema";
import { sanitizeUserInput } from "./sanitize";

function sanitizeSlideForPrompt(slide: Slide): string {
  const safe: Record<string, unknown> = {
    type: slide.type,
    title: sanitizeUserInput(slide.title, 200),
    subtitle: slide.subtitle ? sanitizeUserInput(slide.subtitle, 200) : null,
    highlight: slide.highlight ? sanitizeUserInput(slide.highlight, 200) : null,
    bullets: slide.bullets.map((b) => sanitizeUserInput(b, 200)),
  };
  return JSON.stringify(safe, null, 2);
}

/**
 * 单页重写
 * 保留 slide 结构，只重写文案
 */
export async function rewriteSlide(
  slide: Slide,
  instruction?: string
): Promise<Slide> {
  const provider = createProvider();
  const prompt = buildRewritePrompt(sanitizeSlideForPrompt(slide), instruction);

  const response = await provider.chat(
    [
      { role: "system", content: "你是一位专业的小红书文案编辑。" },
      { role: "user", content: prompt },
    ],
    { temperature: 0.8, maxTokens: 2048 }
  );

  const parsed = parseLLMJson(response);
  const validated = slideSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("[rewrite-slide] LLM output validation failed:", validated.error.format());
    throw new Error("LLM 输出格式异常");
  }

  return {
    ...validated.data,
    id: slide.id,
    image: slide.image,
  };
}

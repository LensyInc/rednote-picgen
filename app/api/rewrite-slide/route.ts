import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rewriteSlide } from "@/core/llm/rewrite-slide";
import { loadTaskDocument, saveTaskDocument } from "@/core/storage/task-store";
import { checkLLMAPIKey } from "@/core/llm/check-api-key";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const rewriteRequestSchema = z.object({
  taskId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  slideId: z.string().min(1),
  instruction: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = rewriteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.format() }, { status: 400 });
    }

    const { taskId, slideId, instruction } = parsed.data;

    // 检查 API Key
    const apiKeyError = checkLLMAPIKey();
    if (apiKeyError) {
      return NextResponse.json({ error: apiKeyError }, { status: 400 });
    }

    // 加载文档
    const document = await loadTaskDocument(taskId);
    if (!document) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const slideIndex = document.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) {
      return NextResponse.json({ error: "页面不存在" }, { status: 404 });
    }

    try {
      const rewritten = await rewriteSlide(document.slides[slideIndex], instruction);

      const currentDoc = await loadTaskDocument(taskId);
      if (currentDoc && currentDoc.version !== document.version) {
        return NextResponse.json(
          { error: "文档已被修改，请刷新后重试" },
          { status: 409 }
        );
      }

      document.slides[slideIndex] = rewritten;
      const newVersion = await saveTaskDocument(document);

      return NextResponse.json({ slide: rewritten, version: newVersion });
    } catch (llmError) {
      const message = llmError instanceof Error ? llmError.message : String(llmError);
      return NextResponse.json(
        { error: "重写失败", details: message },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("[rewrite-slide] API error:", e);
    return NextResponse.json({ error: "重写失败" }, { status: 500 });
  }
}

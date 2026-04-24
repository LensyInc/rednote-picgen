import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rewriteSlide } from "@/core/llm/rewrite-slide";
import { loadTaskDocument, saveTaskDocument } from "@/core/storage/task-store";
import { checkLLMAPIKey } from "@/core/llm/check-api-key";
import { getRequestIdentity, requireLogin } from "@/lib/auth-server";
import { canAccessTask } from "@/core/db/task-meta";
import { consumeCredit, refundCredit } from "@/core/db/credits";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const rewriteRequestSchema = z.object({
  taskId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  slideId: z.string().min(1),
  instruction: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);

    // 游客禁止使用 AI 重写
    const loginCheck = requireLogin(identity);
    if (!loginCheck.ok) {
      return loginCheck.response;
    }

    const body = await req.json();
    const parsed = rewriteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.format() }, { status: 400 });
    }

    const { taskId, slideId, instruction } = parsed.data;

    // 鉴权
    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
    }

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

    const userId = identity.userId!;
    let consumed = false;

    try {
      // 扣点
      const creditOk = await consumeCredit(userId, taskId);
      if (!creditOk) {
        return NextResponse.json(
          { error: "今日 AI 生成次数已用完，请明天再来或升级 Pro 会员" },
          { status: 402 }
        );
      }
      consumed = true;

      const rewritten = await rewriteSlide(document.slides[slideIndex], instruction);

      const currentDoc = await loadTaskDocument(taskId);
      if (currentDoc && currentDoc.version !== document.version) {
        await refundCredit(userId, taskId);
        return NextResponse.json(
          { error: "文档已被修改，请刷新后重试" },
          { status: 409 }
        );
      }

      document.slides[slideIndex] = rewritten;
      const newVersion = await saveTaskDocument(document);

      return NextResponse.json({ slide: rewritten, version: newVersion });
    } catch (llmError) {
      if (consumed) {
        await refundCredit(userId, taskId);
      }
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

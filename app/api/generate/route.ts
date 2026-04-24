import { NextRequest, NextResponse } from "next/server";
import { generateRequestSchema } from "@/core/schema/request.schema";
import { generateOutline } from "@/core/llm/generate-outline";
import { generateNoteDocument } from "@/core/llm/generate-note";
import { saveTaskDocument } from "@/core/storage/task-store";
import { checkLLMAPIKey } from "@/core/llm/check-api-key";

// 允许长时间运行（两段 LLM 调用在慢模型上可能超过 1 分钟）
export const maxDuration = 600;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = generateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "参数校验失败", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 检查 API Key 是否配置
    const apiKeyError = checkLLMAPIKey();
    if (apiKeyError) {
      return NextResponse.json({ error: apiKeyError }, { status: 400 });
    }

    const startedAt = Date.now();
    try {
      console.log(
        `[generate] start topic="${data.topic}" pages=${data.pageCount} template=${data.template}`
      );

      if (req.signal.aborted) {
        return NextResponse.json({ error: "请求已取消" }, { status: 499 });
      }

      // 阶段 1：生成大纲
      const outline = await generateOutline(data);
      console.log(
        `[generate] outline ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
      );

      if (req.signal.aborted) {
        return NextResponse.json({ error: "请求已取消" }, { status: 499 });
      }

      // 阶段 2：补全内容
      const document = await generateNoteDocument(data, outline);
      console.log(
        `[generate] content ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
      );

      // 保存到本地文件系统
      const newVersion = await saveTaskDocument(document);
      console.log(`[generate] saved taskId=${document.taskId} version=${newVersion}`);

      return NextResponse.json({ ...document, version: newVersion });
    } catch (llmError) {
      const message = llmError instanceof Error ? llmError.message : String(llmError);
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.error(`[generate] failed after ${elapsed}s:`, message);
      return NextResponse.json(
        { error: "内容生成失败", details: message },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("[generate] API error:", e);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}

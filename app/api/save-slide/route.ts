import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadTaskDocument, saveTaskDocument } from "@/core/storage/task-store";
import { slideSchema } from "@/core/schema/note.schema";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, slide } = body;

    if (!taskId || !slide) {
      return NextResponse.json(
        { error: "缺少 taskId 或 slide" },
        { status: 400 }
      );
    }

    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }

    // 校验 slide 结构
    const parseResult = slideSchema.safeParse(slide);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Slide 结构校验失败", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // 加载文档
    const document = await loadTaskDocument(taskId);
    if (!document) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const clientVersion = body.version;
    if (typeof clientVersion === "number" && clientVersion !== document.version) {
      return NextResponse.json(
        { error: "文档已被修改，请刷新后重试" },
        { status: 409 }
      );
    }

    const slideIndex = document.slides.findIndex((s) => s.id === parseResult.data.id);
    if (slideIndex === -1) {
      return NextResponse.json({ error: "页面不存在" }, { status: 404 });
    }

    document.slides[slideIndex] = parseResult.data;
    const newVersion = await saveTaskDocument(document);

    return NextResponse.json({ success: true, slide: parseResult.data, version: newVersion });
  } catch (e) {
    console.error("[save-slide] 保存失败:", e);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

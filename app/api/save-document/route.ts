import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveTaskDocument } from "@/core/storage/task-store";
import { noteDocumentSchema } from "@/core/schema/note.schema";
import { getRequestIdentity } from "@/lib/auth-server";
import { upsertTaskMeta, canAccessTask, taskExists } from "@/core/db/task-meta";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

export async function POST(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);
    const body = await req.json();
    const { taskId, document: rawDocument } = body;

    if (!taskId || !rawDocument) {
      return NextResponse.json(
        { error: "缺少 taskId 或 document" },
        { status: 400 }
      );
    }

    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }

    // 校验文档结构
    const parseResult = noteDocumentSchema.safeParse(rawDocument);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "文档结构校验失败", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // 确保 taskId 匹配
    if (parseResult.data.taskId !== taskId) {
      return NextResponse.json(
        { error: "taskId 不匹配" },
        { status: 400 }
      );
    }

    // 鉴权：已保存的任务必须属于自己
    const existing = await taskExists(taskId);
    if (existing) {
      const hasAccess = await canAccessTask(taskId, identity);
      if (!hasAccess) {
        return NextResponse.json(
          { error: "无权保存此任务" },
          { status: 403 }
        );
      }
    }

    const newVersion = await saveTaskDocument(parseResult.data);

    // 写入/更新 PG 元数据
    await upsertTaskMeta(parseResult.data, identity);

    return NextResponse.json({ success: true, version: newVersion });
  } catch (e) {
    console.error("[save-document] 保存失败:", e);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { loadTaskDocument } from "@/core/storage/task-store";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { taskId } = await params;
    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }
    const doc = await loadTaskDocument(taskId);
    if (!doc) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (e) {
    console.error("[tasks] 加载任务失败:", e);
    return NextResponse.json({ error: "加载失败" }, { status: 500 });
  }
}

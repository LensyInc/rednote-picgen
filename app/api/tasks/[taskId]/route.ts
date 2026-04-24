import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadTaskDocument } from "@/core/storage/task-store";
import { getRequestIdentity } from "@/lib/auth-server";
import { canAccessTask } from "@/core/db/task-meta";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const identity = await getRequestIdentity(req);
    const { taskId } = await params;

    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }

    // 鉴权
    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
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

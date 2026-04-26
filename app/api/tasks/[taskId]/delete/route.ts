import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity } from "@/lib/auth-server";
import { canAccessTask, softDeleteTaskMeta } from "@/core/db/task-meta";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const identity = await getRequestIdentity(req);
    const { taskId } = await params;

    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }

    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
    }

    await softDeleteTaskMeta(taskId, identity);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[tasks/delete] 删除失败:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

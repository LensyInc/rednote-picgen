import { NextRequest, NextResponse } from "next/server";
import { listTaskMeta } from "@/core/db/task-meta";
import { getRequestIdentity } from "@/lib/auth-server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);

    const params = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!params.success) {
      return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
    }

    const { limit, cursor } = params.data;

    // 直接使用 PG 元数据，不再逐个读取 R2 文档
    const { items, nextCursor } = await listTaskMeta({
      userId: identity.userId,
      guestId: identity.guestId,
      limit,
      cursor,
    });

    const tasks = items.map((meta) => ({
      id: meta.task_id,
      topic: meta.topic,
      date: new Date(meta.updated_at).toISOString(),
      pageCount: meta.page_count,
    }));

    return NextResponse.json({
      tasks,
      nextCursor,
    });
  } catch (e) {
    console.error("[tasks] 加载任务列表失败:", e);
    return NextResponse.json({ error: "加载任务列表失败" }, { status: 500 });
  }
}

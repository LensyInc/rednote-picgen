import { NextRequest, NextResponse } from "next/server";
import { loadTaskDocument } from "@/core/storage/task-store";
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

    // 从 PostgreSQL 查询任务元数据
    const { items, nextCursor } = await listTaskMeta({
      userId: identity.userId,
      guestId: identity.guestId,
      limit,
      cursor,
    });

    // 并发读取 R2 中的文档以获取最新 topic / pageCount
    const concurrency = 5;
    const tasks: Array<{ id: string; topic: string; date: string; pageCount: number } | null> = [];
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (meta) => {
          const doc = await loadTaskDocument(meta.task_id);
          return doc
            ? {
                id: doc.taskId,
                topic: doc.meta.topic,
                date: new Date(doc.createdAt).toLocaleString("zh-CN"),
                pageCount: doc.slides.length,
              }
            : {
                id: meta.task_id,
                topic: meta.topic,
                date: new Date(meta.created_at).toLocaleString("zh-CN"),
                pageCount: meta.page_count,
              };
        })
      );
      tasks.push(...batchResults);
    }

    return NextResponse.json({
      tasks: tasks.filter(Boolean),
      nextCursor,
    });
  } catch (e) {
    console.error("[tasks] 加载任务列表失败:", e);
    return NextResponse.json({ error: "加载任务列表失败" }, { status: 500 });
  }
}

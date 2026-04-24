import { NextRequest, NextResponse } from "next/server";
import { listTasks, loadTaskDocument } from "@/core/storage/task-store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const params = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!params.success) {
      return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
    }

    const { limit, cursor } = params.data;
    const { keys, nextCursor } = await listTasks({ limit, cursor });

    const concurrency = 5;
    const tasks: Array<{ id: string; topic: string; date: string; pageCount: number } | null> = [];
    for (let i = 0; i < keys.length; i += concurrency) {
      const batch = keys.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (id) => {
          const doc = await loadTaskDocument(id);
          return doc
            ? {
                id: doc.taskId,
                topic: doc.meta.topic,
                date: new Date(doc.createdAt).toLocaleString("zh-CN"),
                pageCount: doc.slides.length,
              }
            : null;
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

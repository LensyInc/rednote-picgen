import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { NoteDocument } from "@/core/schema/note.schema";

const supabase = createServiceRoleClient();

export interface TaskMeta {
  id: string;
  task_id: string;
  user_id: string | null;
  guest_id: string | null;
  topic: string;
  page_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * 保存或更新任务元数据到 PostgreSQL
 */
export async function upsertTaskMeta(
  document: NoteDocument,
  identity: { userId: string | null; guestId: string | null }
): Promise<void> {
  const { error } = await supabase.from("tasks").upsert(
    {
      task_id: document.taskId,
      user_id: identity.userId,
      guest_id: identity.guestId,
      topic: document.meta.topic,
      page_count: document.slides.length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "task_id" }
  );

  if (error) {
    console.error("[task-meta] upsert error:", error);
    throw new Error("保存任务元数据失败");
  }
}

/**
 * 列出指定身份的任务元数据
 */
export async function listTaskMeta(options: {
  userId?: string | null;
  guestId?: string | null;
  limit?: number;
  cursor?: string;
}): Promise<{ items: TaskMeta[]; nextCursor?: string }> {
  const limit = options.limit ?? 20;
  let query = supabase
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit + 1);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else if (options.guestId) {
    query = query.eq("guest_id", options.guestId);
  } else {
    // 没有任何身份时返回空
    return { items: [] };
  }

  if (options.cursor) {
    query = query.lt("updated_at", options.cursor);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[task-meta] list error:", error);
    throw new Error("查询任务列表失败");
  }

  const rows = (data ?? []) as TaskMeta[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.updated_at : undefined;

  return { items, nextCursor };
}

/**
 * 检查 task 是否存在于 PG 中
 */
export async function taskExists(taskId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .select("task_id")
    .eq("task_id", taskId)
    .maybeSingle();
  if (error) {
    console.error("[task-meta] exists error:", error);
    return false;
  }
  return !!data;
}

/**
 * 检查指定身份是否有权访问某个 task
 */
export async function canAccessTask(
  taskId: string,
  identity: { userId: string | null; guestId: string | null }
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .select("user_id, guest_id")
    .eq("task_id", taskId)
    .maybeSingle();

  if (error || !data) return false;

  if (identity.userId && data.user_id === identity.userId) return true;
  if (identity.guestId && data.guest_id === identity.guestId) return true;

  return false;
}

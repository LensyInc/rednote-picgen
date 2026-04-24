import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { NoteDocument } from "@/core/schema/note.schema";
import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createServiceRoleClient();
  return _supabase!;
}

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
 * 仅在 guestId 有值时写入 guest_id 字段，避免空值覆盖已有关联
 */
export async function upsertTaskMeta(
  document: NoteDocument,
  identity: { userId: string | null; guestId: string | null }
): Promise<void> {
  const row: Record<string, unknown> = {
    task_id: document.taskId,
    user_id: identity.userId,
    topic: document.meta.topic,
    page_count: document.slides.length,
    updated_at: new Date().toISOString(),
  };
  if (identity.guestId) {
    row.guest_id = identity.guestId;
  }

  const { error } = await getSupabase().from("tasks").upsert(row, { onConflict: "task_id" });

  if (error) {
    console.error("[task-meta] upsert error:", error);
    throw new Error("保存任务元数据失败");
  }
}

/**
 * 列出指定身份的任务元数据
 * 当 userId 和 guestId 都有时，使用 OR 查询以包含合并前后的所有任务
 */
export async function listTaskMeta(options: {
  userId?: string | null;
  guestId?: string | null;
  limit?: number;
  cursor?: string;
}): Promise<{ items: TaskMeta[]; nextCursor?: string }> {
  const limit = options.limit ?? 20;
  let query = getSupabase()
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit + 1);

  if (options.userId && options.guestId) {
    query = query.or(`user_id.eq.${options.userId},guest_id.eq.${options.guestId}`);
  } else if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else if (options.guestId) {
    query = query.eq("guest_id", options.guestId);
  } else {
    // 没有任何身份时返回空
    return { items: [] };
  }

  if (options.cursor) {
    const [cursorTime, cursorId] = options.cursor.split("|");
    if (cursorId) {
      query = query.lt("updated_at", cursorTime).or(`updated_at.eq.${cursorTime},id.lt.${cursorId}`);
    } else {
      query = query.lt("updated_at", cursorTime);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("[task-meta] list error:", error);
    throw new Error("查询任务列表失败");
  }

  const rows = (data ?? []) as TaskMeta[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? `${items[items.length - 1]!.updated_at}|${items[items.length - 1]!.id}` : undefined;

  return { items, nextCursor };
}

/**
 * 检查 task 是否存在于 PG 中
 * 数据库出错时抛出异常，避免鉴权被绕过
 */
export async function taskExists(taskId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("task_id")
    .eq("task_id", taskId)
    .maybeSingle();
  if (error) {
    console.error("[task-meta] exists error:", error);
    throw new Error("查询任务是否存在时数据库出错");
  }
  return !!data;
}

/**
 * 检查指定身份是否有权访问某个 task
 * 返回 "not_found" | "allowed" | "forbidden"
 */
export async function checkTaskAccess(
  taskId: string,
  identity: { userId: string | null; guestId: string | null }
): Promise<"not_found" | "allowed" | "forbidden"> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("user_id, guest_id")
    .eq("task_id", taskId)
    .maybeSingle();

  if (error) {
    console.error("[task-meta] checkTaskAccess error:", error);
    throw new Error("查询任务权限时数据库出错");
  }
  if (!data) return "not_found";

  if (identity.userId && data.user_id === identity.userId) return "allowed";
  if (identity.guestId && data.guest_id === identity.guestId) return "allowed";

  return "forbidden";
}

/**
 * 检查指定身份是否有权访问某个 task
 * @deprecated Use checkTaskAccess for more granular results
 */
export async function canAccessTask(
  taskId: string,
  identity: { userId: string | null; guestId: string | null }
): Promise<boolean> {
  const result = await checkTaskAccess(taskId, identity);
  return result === "allowed";
}

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createServiceRoleClient();
  return _supabase!;
}

/**
 * 消费点数（原子操作）
 * 返回 { ok: true } 或 { ok: false, reason: "insufficient" | "error" }
 */
export async function consumeCredit(
  userId: string,
  taskId: string
): Promise<{ ok: true } | { ok: false; reason: "insufficient" | "error" }> {
  const { data, error } = await getSupabase().rpc("consume_credit", {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (error) {
    console.error("[credits] consume error:", error);
    return { ok: false, reason: "error" };
  }
  return data ? { ok: true } : { ok: false, reason: "insufficient" };
}

/**
 * 回滚点数（生成失败时使用）
 * 抛出异常以便调用方感知失败
 */
export async function refundCredit(
  userId: string,
  taskId: string
): Promise<void> {
  const { error } = await getSupabase().rpc("refund_credit", {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (error) {
    console.error("[credits] refund error:", error);
    throw new Error(`退款失败: ${error.message}`);
  }
}

/**
 * 获取用户点数信息
 */
export async function getUserCreditInfo(userId: string): Promise<{
  balance: number;
  daily_quota: number;
  daily_reset_at: string;
  plan_type: string;
  plan_expires_at: string | null;
} | null> {
  const { data, error } = await getSupabase().rpc("get_user_credit_info", {
    p_user_id: userId,
  });
  if (error) {
    console.error("[credits] get info error:", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

import { createServiceRoleClient } from "@/lib/supabase/service-role";

const supabase = createServiceRoleClient();

/**
 * 消费点数（原子操作），返回是否成功
 */
export async function consumeCredit(
  userId: string,
  taskId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_credit", {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (error) {
    console.error("[credits] consume error:", error);
    return false;
  }
  return !!data;
}

/**
 * 回滚点数（生成失败时使用）
 */
export async function refundCredit(
  userId: string,
  taskId: string
): Promise<void> {
  const { error } = await supabase.rpc("refund_credit", {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (error) {
    console.error("[credits] refund error:", error);
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
} | null> {
  const { data, error } = await supabase.rpc("get_user_credit_info", {
    p_user_id: userId,
  });
  if (error) {
    console.error("[credits] get info error:", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

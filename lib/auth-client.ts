import { createClient } from "@/lib/supabase/client";
import { ensureGuestId, clearGuestId, getGuestId } from "@/lib/guest-id";

// 返回 supabase 客户端实例（浏览器端）
export function getSupabaseClient() {
  return createClient();
}

// 发送 OTP 验证码
export async function sendOtp(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  return { error };
}

// 验证 OTP 并登录
export async function verifyOtp(email: string, token: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  return { data, error };
}

// 退出登录
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// 获取当前用户
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}

// 合并游客数据
export async function mergeGuestTasks(guestId: string) {
  const res = await fetch("/api/auth/merge-guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestId }),
  });
  return res.ok;
}

export { ensureGuestId, clearGuestId, getGuestId };

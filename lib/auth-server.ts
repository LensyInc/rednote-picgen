import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RequestIdentity {
  userId: string | null;
  guestId: string | null;
  isLoggedIn: boolean;
}

/**
 * 从请求中解析身份：优先读取 Supabase Session（登录用户），
 * 其次读取 x-guest-id header（游客），仅接受 UUID 格式的 guest ID。
 * 如果 getUser 返回错误（例如过期 JWT），不静默降级为游客，
 * 而是记录日志后按未登录处理。
 */
export async function getRequestIdentity(
  req: NextRequest
): Promise<RequestIdentity> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.warn("[auth] getUser error:", error.message);
  }

  if (user) {
    return { userId: user.id, guestId: null, isLoggedIn: true };
  }

  const rawGuestId = req.headers.get("x-guest-id");
  const guestId = rawGuestId && UUID_RE.test(rawGuestId) ? rawGuestId : null;
  return { userId: null, guestId, isLoggedIn: false };
}

/**
 * 从请求头部获取游客 ID（仅 UUID 格式有效）
 * 导出供中间件或其他场景复用
 */
export function parseGuestId(header: string | null): string | null {
  return header && UUID_RE.test(header) ? header : null;
}

/**
 * 要求必须已登录，否则返回 401 Response
 */
export function requireLogin(
  identity: RequestIdentity
): { ok: true } | { ok: false; response: Response } {
  if (!identity.isLoggedIn) {
    const resp = new Response(
      JSON.stringify({ error: "请先登录以使用此功能" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
    return { ok: false, response: resp };
  }
  return { ok: true };
}

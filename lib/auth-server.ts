import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface RequestIdentity {
  userId: string | null;
  guestId: string | null;
  isLoggedIn: boolean;
}

/**
 * 从请求中解析身份：优先读取 Supabase Session（登录用户），
 * 其次读取 x-guest-id header（游客）。
 */
export async function getRequestIdentity(
  req: NextRequest
): Promise<RequestIdentity> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { userId: user.id, guestId: null, isLoggedIn: true };
  }

  const guestId = req.headers.get("x-guest-id");
  return { userId: null, guestId: guestId || null, isLoggedIn: false };
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

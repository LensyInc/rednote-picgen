import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("get_user_credit_info", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("[user/credits] rpc error:", error);
      return NextResponse.json({ error: "查询失败" }, { status: 500 });
    }

    // data 是数组
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      // 如果用户刚创建，credit 记录可能不存在，返回默认值
      return NextResponse.json({
        balance: 3,
        daily_quota: 3,
        daily_reset_at: new Date().toISOString(),
        plan_type: "free",
      });
    }

    return NextResponse.json(row);
  } catch (e) {
    console.error("[user/credits] error:", e);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

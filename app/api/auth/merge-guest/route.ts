import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const mergeSchema = z.object({
  guestId: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mergeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { error } = await supabase
      .from("tasks")
      .update({ user_id: user.id, guest_id: null })
      .eq("guest_id", parsed.data.guestId);

    if (error) {
      console.error("[merge-guest] update error:", error);
      return NextResponse.json({ error: "合并失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[merge-guest] error:", e);
    return NextResponse.json({ error: "合并失败" }, { status: 500 });
  }
}

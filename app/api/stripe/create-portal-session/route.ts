import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "支付功能尚未配置完成" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
    const serviceSupabase = createServiceRoleClient();
    const { data: sub } = await serviceSupabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "未找到订阅信息" },
        { status: 404 }
      );
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });

    const returnUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe/portal] error:", e);
    return NextResponse.json({ error: "创建管理会话失败" }, { status: 500 });
  }
}

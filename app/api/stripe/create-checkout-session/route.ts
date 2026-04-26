import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL;

    if (!stripeSecretKey || !priceId) {
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

    // 动态导入 stripe，避免服务端打包问题
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });

    // 查找或创建 Stripe Customer
    const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
    const serviceSupabase = createServiceRoleClient();
    const { data: sub } = await serviceSupabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      // 仅当用户尚无订阅记录时才创建，避免覆盖已有 Pro 记录
      const { data: existingSub } = await serviceSupabase
        .from("subscriptions")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existingSub) {
        await serviceSupabase.from("subscriptions").upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_type: "free",
        }, { onConflict: "user_id" });
      } else {
        // 已有记录但缺少 stripe_customer_id，更新之但不改 plan_type
        await serviceSupabase.from("subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/?upgrade=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/?upgrade=cancel`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe/checkout] error:", e);
    return NextResponse.json({ error: "创建支付会话失败" }, { status: 500 });
  }
}

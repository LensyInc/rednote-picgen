import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutTypeSchema = z.enum(["subscription", "onetime"]);

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const subPriceId = process.env.STRIPE_PRO_PRICE_ID;
    const onetimePriceId = process.env.STRIPE_PRO_ONETIME_PRICE_ID;
    const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "支付功能尚未配置完成" },
        { status: 503 }
      );
    }

    let body: { type?: string };
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const parsed = checkoutTypeSchema.safeParse(body.type || "subscription");
    const paymentType = parsed.success ? parsed.data : "subscription";

    const priceId = paymentType === "onetime" ? onetimePriceId : subPriceId;

    if (!priceId) {
      return NextResponse.json(
        { error: "该支付方式尚未配置" },
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

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });

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
        await serviceSupabase.from("subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: paymentType === "onetime" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${baseUrl}/?upgrade=success`,
      cancel_url: cancelUrl || `${baseUrl}/?upgrade=cancel`,
      metadata: { user_id: user.id, payment_type: paymentType },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe/checkout] error:", e);
    return NextResponse.json({ error: "创建支付会话失败" }, { status: 500 });
  }
}

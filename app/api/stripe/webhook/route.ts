import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      return NextResponse.json(
        { error: "支付功能尚未配置完成" },
        { status: 503 }
      );
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });

    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe/webhook] signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = createServiceRoleClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer: string;
          subscription?: string;
          mode: string;
          metadata?: { user_id?: string; payment_type?: string };
        };
        const userId = session.metadata?.user_id;
        if (!userId) break;

        const paymentType = session.metadata?.payment_type || session.mode;
        const eventId = event.id;
        const logType = paymentType === "onetime" ? "onetime_bonus" : "subscription_bonus";

        const { data: existingLog } = await supabase
          .from("credit_logs")
          .select("id")
          .eq("description", `${logType}:${eventId}`)
          .maybeSingle();

        if (existingLog) break;

        if (paymentType === "onetime") {
          // 一次性 30 天会员
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            status: "active",
            plan_type: "pro",
          }, { onConflict: "user_id" });

          await supabase.from("user_credits").update({
            balance: 100,
            daily_quota: 100,
            plan_type: "pro",
            plan_expires_at: expiresAt,
          }).eq("user_id", userId);

          await supabase.from("credit_logs").insert({
            user_id: userId,
            amount: 100,
            type: "onetime_bonus",
            description: `${logType}:${eventId}`,
          });
        } else {
          // 订阅模式
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
            plan_type: "pro",
          }, { onConflict: "user_id" });

          await supabase.from("user_credits").update({
            balance: 100,
            daily_quota: 100,
            plan_type: "pro",
            plan_expires_at: null,
          }).eq("user_id", userId);

          await supabase.from("credit_logs").insert({
            user_id: userId,
            amount: 100,
            type: "subscription_bonus",
            description: `${logType}:${eventId}`,
          });
        }
        break;
      }
      case "invoice.paid":
        break;
      case "customer.subscription.deleted": {
        const subscription = event.data.object as { customer: string };
        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer)
          .maybeSingle();

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", plan_type: "free" })
          .eq("stripe_customer_id", subscription.customer);

        if (subRow?.user_id) {
          await supabase.from("user_credits").update({
            daily_quota: 3,
            plan_type: "free",
            plan_expires_at: null,
          }).eq("user_id", subRow.user_id);
        }
        break;
      }
      default:
        console.log(`[stripe/webhook] unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[stripe/webhook] error:", e);
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 });
  }
}

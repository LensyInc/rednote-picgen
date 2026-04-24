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
          subscription: string;
          metadata?: { user_id?: string };
        };
        const userId = session.metadata?.user_id;
        if (userId) {
          // 幂等：先检查是否已处理过此事件
          const eventId = event.id;
          const { data: existingLog } = await supabase
            .from("credit_logs")
            .select("id")
            .eq("description", `subscription_bonus:${eventId}`)
            .maybeSingle();

          if (!existingLog) {
            await supabase.from("subscriptions").upsert({
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: "active",
              plan_type: "pro",
            }, { onConflict: "user_id" });

            // 升级用户点数为 Pro 配额（100/天）
            await supabase.rpc("grant_daily_credits", { p_user_id: userId });
            await supabase.from("user_credits").update({
              daily_quota: 100,
              plan_type: "pro",
            }).eq("user_id", userId);

            await supabase.from("credit_logs").insert({
              user_id: userId,
              amount: 100,
              type: "subscription_bonus",
              description: `subscription_bonus:${eventId}`,
            });
          }
        }
        break;
      }
      case "invoice.paid":
        // 续费成功，可更新 current_period_end
        break;
      case "customer.subscription.deleted": {
        const subscription = event.data.object as { customer: string };
        // 先查 user_id，再更新 subscription（顺序与之前不同，确保更新前能拿到 user_id）
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

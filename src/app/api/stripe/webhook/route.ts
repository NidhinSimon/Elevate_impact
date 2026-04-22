import { headers } from "next/headers";
import { getStripeServerClient, syncDonationCheckout, syncSubscriptionCheckout } from "@/lib/stripe-sync";
import { toIsoStringSafe } from "@/lib/date";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = getStripeServerClient();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.kind === "subscription") {
          await syncSubscriptionCheckout(session);
        }

        if (session.metadata?.kind === "donation" && session.payment_status === "paid") {
          await syncDonationCheckout(session);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
        );
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
        );
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "lapsed" })
          .eq("stripe_subscription_id", typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end: number;
        };
        const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
        );
        const billing = subscription.metadata?.billing || (subscription.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly");
        await supabaseAdmin
          .from("profiles")
          .update({ 
            subscription_status: subscription.status === "active" || subscription.status === "trialing" ? "active" : "lapsed",
            subscription_period: billing,
            subscription_tier: billing,
            renewal_date: toIsoStringSafe(subscription.current_period_end * 1000),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Handler Error:", err);
    return NextResponse.json({ error: "Webhook Handler Failed" }, { status: 500 });
  }
}

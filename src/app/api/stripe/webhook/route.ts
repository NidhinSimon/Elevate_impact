import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24-preview",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Use service role to bypass RLS for background updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
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
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        
        if (userId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_tier: subscription.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID ? "monthly" : "yearly",
              renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
            })
            .eq("id", userId);
            
          if (error) throw error;
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "lapsed" })
          .eq("stripe_subscription_id", invoice.subscription as string);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("profiles")
          .update({ 
            renewal_date: new Date(subscription.current_period_end * 1000).toISOString() 
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

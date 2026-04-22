import { createClient } from "@/utils/supabase/server";
import { getStripeServerClient } from "@/lib/stripe-sync";
import { NextResponse } from "next/server";

const planCatalog = {
  silver: { name: "Silver Impact", monthly: 19, yearly: 180 },
  gold: { name: "Gold Champion", monthly: 49, yearly: 470 },
  elite: { name: "Elite Visionary", monthly: 99, yearly: 950 },
} as const;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, billing } = await req.json();

    if (!plan || !billing || !(plan in planCatalog) || !["monthly", "yearly"].includes(billing)) {
      return NextResponse.json({ error: "Invalid subscription selection" }, { status: 400 });
    }

    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json({ isMock: true });
    }

    const selectedPlan = planCatalog[plan as keyof typeof planCatalog];
    const interval = billing === "yearly" ? "year" : "month";
    const amount = billing === "yearly" ? selectedPlan.yearly : selectedPlan.monthly;
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const params = new URLSearchParams({
      plan,
      billing,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            recurring: {
              interval,
            },
            product_data: {
              name: selectedPlan.name,
              description: `${selectedPlan.name} ${billing} membership`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "subscription",
        userId: user.id,
        tier: plan,
        billing,
      },
      subscription_data: {
        metadata: {
          kind: "subscription",
          userId: user.id,
          tier: plan,
          billing,
        },
      },
      success_url: `${origin}/checkout?${params.toString()}&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?${params.toString()}&canceled=true`,
    });

    return NextResponse.json({ url: session.url, isMock: false });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

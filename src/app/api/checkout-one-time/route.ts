import { NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/stripe-sync";

export async function POST(req: Request) {
  try {
    const { amount, charityId, userId, charityName, userEmail } = await req.json();

    if (!amount || !charityId || !charityName) {
      return NextResponse.json({ error: "Missing donation details" }, { status: 400 });
    }

    const stripe = getStripeServerClient();

    if (!stripe) {
      return NextResponse.json({
        clientSecret: "mock_secret_donation_" + Math.random().toString(36).slice(2),
        isMock: true
      });
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: {
              name: `Donation to ${charityName}`,
              description: "One-time charitable contribution",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { 
        kind: "donation",
        charityId: charityId.toString(), 
        userId: userId || "guest",
        charityName,
        amount: amount.toString(),
      },
      payment_intent_data: {
        metadata: {
          kind: "donation",
          charityId: charityId.toString(),
          userId: userId || "guest",
          charityName,
          amount: amount.toString(),
        },
      },
      success_url: `${origin}/charity/${charityId}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/charity/${charityId}?donation=cancelled`,
    });

    return NextResponse.json({
      url: session.url,
      isMock: false
    });
  } catch (err: any) {
    console.error("Donation Stripe Error:", err);
    return NextResponse.json({
      clientSecret: "mock_secret_fallback",
      isMock: true
    });
  }
}

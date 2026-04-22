import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe ONLY if a valid-looking key is provided
const isRealKey = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sjYvWzS1y2mXyK9Z5eR8qW4p7aC9xV2mN5qP8rT2uV5wY8xZ1aB2c3d4e5f6g7h8i9j0');

const stripe = isRealKey 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!)
  : null;


export async function POST(req: Request) {
  try {
    const { amount, planId, userId } = await req.json();

    // If no real Stripe key, return a mock client secret for the demo flow
    if (!stripe) {
      console.log("⚠️ Using Mock Stripe Flow (No valid API key found)");
      return NextResponse.json({
        clientSecret: "mock_secret_" + Math.random().toString(36).slice(2),
        isMock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { planId, userId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      isMock: false
    });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    // Fallback to mock if Stripe fails (e.g. during dev/simulation)
    return NextResponse.json({
      clientSecret: "mock_secret_fallback",
      isMock: true
    });
  }
}

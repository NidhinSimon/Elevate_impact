import {
  syncDonationCheckout,
  syncSubscriptionCheckout,
  syncSubscriptionCheckoutForUser,
  getStripeServerClient,
  hasSupabaseAdminEnv,
} from "@/lib/stripe-sync";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const kind = session.metadata?.kind;

    if (kind === "subscription") {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || session.metadata?.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (hasSupabaseAdminEnv()) {
        await syncSubscriptionCheckout(session);
      } else {
        await syncSubscriptionCheckoutForUser(session, supabase);
      }

      return NextResponse.json({ success: true, kind });
    }

    if (kind === "donation") {
      await syncDonationCheckout(session);
      return NextResponse.json({ success: true, kind });
    }

    return NextResponse.json({ error: "Unsupported Stripe session" }, { status: 400 });
  } catch (err: any) {
    console.error("Stripe session verification failed:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}

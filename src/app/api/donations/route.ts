import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { amount, charityId, userId, stripePaymentIntentId } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
  );

  try {
    // 1. Record the donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        user_id: userId || null,
        charity_id: charityId,
        amount: amount,
        stripe_payment_intent_id: stripePaymentIntentId,
        donated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (donationError) throw donationError;

    // 2. Update charity's "Funds Allocated" metric
    // Fetch current raised_amount first
    const { data: charity } = await supabase
      .from('charities')
      .select('raised_amount')
      .eq('id', charityId)
      .single();

    if (charity) {
      const newAmount = Number(charity.raised_amount || 0) + Number(amount);
      await supabase
        .from('charities')
        .update({ 
          raised_amount: newAmount,
          funds_allocated: `$${(newAmount / 1000000).toFixed(1)}M`
        })
        .eq('id', charityId);
    }

    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    console.error("Donation Recording Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

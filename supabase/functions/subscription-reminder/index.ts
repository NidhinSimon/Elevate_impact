import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Find profiles renewing in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const dateString = threeDaysFromNow.toISOString().split('T')[0];

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, subscription_tier, renewal_date')
      .eq('subscription_status', 'active')
      .filter('renewal_date', 'gte', `${dateString}T00:00:00`)
      .filter('renewal_date', 'lte', `${dateString}T23:59:59`);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No renewals found for this date." }), { status: 200 })
    }

    // 2. Send emails via Resend
    const results = await Promise.all(profiles.map(async (profile) => {
      const amount = profile.subscription_tier === 'yearly' ? '£89.99' : '£9.99';
      
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Elevated Impact <billing@elevated-impact.com>',
          to: [profile.email],
          subject: "Your Elevated Impact subscription renews in 3 days",
          html: `
            <div style="font-family: sans-serif; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
              <h2 style="color: #0F0A4A;">Subscription Renewal Notice</h2>
              <p>Hi ${profile.full_name},</p>
              <p>This is a friendly reminder that your <strong>${profile.subscription_tier}</strong> plan will automatically renew on ${new Date(profile.renewal_date).toLocaleDateString()}.</p>
              <p>The renewal amount of <strong>${amount}</strong> will be charged to your card on file.</p>
              <p>You can manage your subscription or update your billing details at any time in your dashboard.</p>
              <a href="${Deno.env.get('NEXT_PUBLIC_BASE_URL')}/subscribe" style="display: inline-block; padding: 12px 24px; background: #0F0A4A; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 20px;">Manage Subscription</a>
            </div>
          `,
        }),
      })
    }));

    return new Response(JSON.stringify({ processed: profiles.length }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

import { createClient as createSupabaseAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { toIsoStringSafe } from "@/lib/date";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion = "2026-03-25.dahlia";

export function getStripeServerClient() {
  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: stripeApiVersion,
  });
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey);
}

export function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function formatMembershipTier(tier: string) {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Impact`;
}

function mapStripeStatusToProfileStatus(status?: string) {
  if (!status) return "active";
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled") return "cancelled";
  if (status === "past_due" || status === "unpaid" || status === "incomplete" || status === "incomplete_expired") {
    return "lapsed";
  }

  return "inactive";
}

function getBillingFromSubscription(subscription?: Stripe.Subscription | null) {
  const interval = subscription?.items.data[0]?.price.recurring?.interval;
  return interval === "year" ? "yearly" : "monthly";
}

type SubscriptionSyncDetails = {
  userId: string;
  tier: string;
  billing: string;
  subscriptionId: string | null;
  email?: string;
  customerId: string | null;
  profileStatus: string;
  renewalDate: string | null;
};

async function getSubscriptionSyncDetails(session: Stripe.Checkout.Session): Promise<SubscriptionSyncDetails> {
  const stripe = getStripeServerClient();

  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  if (session.status !== "complete") {
    throw new Error("Stripe checkout session is not complete yet.");
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error("Missing userId in Stripe session metadata.");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  const subscription = subscriptionId
    ? ((await stripe.subscriptions.retrieve(subscriptionId)) as unknown as Stripe.Subscription & {
        current_period_end: number;
      })
    : null;

  const tier = session.metadata?.tier || subscription?.metadata?.tier || "gold";
  const billing =
    session.metadata?.billing ||
    subscription?.metadata?.billing ||
    getBillingFromSubscription(subscription);
  const renewalDate = subscription
    ? toIsoStringSafe(subscription.current_period_end * 1000)
    : null;
  const profileStatus = mapStripeStatusToProfileStatus(subscription?.status);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;
  const email = session.customer_details?.email || undefined;

  return {
    userId,
    tier,
    billing,
    subscriptionId,
    email,
    customerId,
    profileStatus,
    renewalDate,
  };
}

async function persistSubscriptionProfile(
  supabaseClient: Pick<SupabaseClient, "from">,
  details: SubscriptionSyncDetails
) {
  const profilePayload = {
    id: details.userId,
    email: details.email,
    subscription_status: details.profileStatus,
    subscription_plan: details.tier,
    subscription_period: details.billing,
    subscription_tier: details.billing,
    membership_tier: formatMembershipTier(details.tier),
    renewal_date: details.renewalDate,
    stripe_customer_id: details.customerId,
    stripe_subscription_id: details.subscriptionId,
  };

  const { error } = await supabaseClient
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (error) {
    throw error;
  }

  return details;
}

export async function syncSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const supabaseAdmin = getSupabaseAdmin();
  const details = await getSubscriptionSyncDetails(session);
  return persistSubscriptionProfile(supabaseAdmin, details);
}

export async function syncSubscriptionCheckoutForUser(
  session: Stripe.Checkout.Session,
  supabaseClient: Pick<SupabaseClient, "from">
) {
  const details = await getSubscriptionSyncDetails(session);
  return persistSubscriptionProfile(supabaseClient, details);
}

export async function syncDonationCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    throw new Error("Stripe donation session is not paid yet.");
  }

  const charityId = Number(session.metadata?.charityId);
  if (!charityId) {
    throw new Error("Missing charityId in Stripe session metadata.");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!paymentIntentId) {
    throw new Error("Missing payment intent on Stripe session.");
  }

  const amount = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);
  if (!amount) {
    throw new Error("Missing donation amount on Stripe session.");
  }

  const userId = session.metadata?.userId;
  const donationUserId = userId && userId !== "guest" ? userId : null;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: existingDonation, error: existingDonationError } = await supabaseAdmin
    .from("donations")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existingDonationError) {
    throw existingDonationError;
  }

  if (existingDonation) {
    return { alreadyRecorded: true };
  }

  const { error: donationError } = await supabaseAdmin.from("donations").insert({
    user_id: donationUserId,
    charity_id: charityId,
    amount,
    stripe_payment_intent_id: paymentIntentId,
    donated_at: new Date().toISOString(),
  });

  if (donationError) {
    throw donationError;
  }

  const { data: charity, error: charityError } = await supabaseAdmin
    .from("charities")
    .select("raised_amount")
    .eq("id", charityId)
    .single();

  if (charityError) {
    throw charityError;
  }

  const updatedRaisedAmount = Number(charity?.raised_amount || 0) + Number(amount);
  const { error: updateCharityError } = await supabaseAdmin
    .from("charities")
    .update({
      raised_amount: updatedRaisedAmount,
      funds_allocated: `$${(updatedRaisedAmount / 1000000).toFixed(1)}M`,
    })
    .eq("id", charityId);

  if (updateCharityError) {
    throw updateCharityError;
  }

  return {
    alreadyRecorded: false,
    charityId,
    amount,
  };
}

export type SubscriptionPlan = 'Member' | 'Elite Member' | 'Founding Member';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string; // ISO string
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface SubscriptionUpdateInput {
  plan?: SubscriptionPlan;
  cancel_at_period_end?: boolean;
}

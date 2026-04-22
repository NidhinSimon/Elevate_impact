import { createClient } from "@/utils/supabase/client";

const supabase = createClient();


export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  membership_tier: string;
  total_impact: number;
  joined_at: string;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'expired';
  subscription_plan: 'none' | 'silver' | 'gold' | 'elite';
  subscription_period: 'monthly' | 'yearly';
  renewal_date?: string;
  selected_charity_id?: number;
  contribution_percentage: number;
}

export const userService = {
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use a fresh query to bypass any client-side caching
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[USER SERVICE] Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('[USER SERVICE] Error fetching all profiles:', error);
      return [];
    }
    
    return data || [];
  },


  async updateProfile(id: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    return data;
  },

  async subscribe(id: string, plan: 'silver' | 'gold' | 'elite', period: 'monthly' | 'yearly'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    console.log(`[SUBSCRIPTION] Initiating for user: ${id}, plan: ${plan}`);
    
    const renewalDate = new Date();
    if (period === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: id,
          email: user.email,
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_period: period,
          renewal_date: renewalDate.toISOString(),
          membership_tier: plan.charAt(0).toUpperCase() + plan.slice(1)
        }, { onConflict: 'id' })
        .select();


      if (error) {
        console.error('[SUPABASE ERROR] Subscription update failed:', error.message, error.details);
        return false;
      }

      console.log('[SUCCESS] Subscription state synchronized:', data);
      return true;
    } catch (err) {
      console.error('[CRITICAL ERROR] Subscription flow interrupted:', err);
      return false;
    }
  }


};

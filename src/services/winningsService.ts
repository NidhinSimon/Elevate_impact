import { createClient } from "@/utils/supabase/client";

const supabase = createClient();


export type WinningStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Winning {
  id: string;
  user_id: string;
  draw_id: string;
  amount: number;
  match_count: number;
  tier: string;
  status: string;
  proof_url?: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

export interface WinnerVerification {
  id: string;
  user_id: string;
  draw_id: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  payout_status: 'pending' | 'paid';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

export const winningsService = {
  async getMyWinnings() {
    const { data, error } = await supabase
      .from('winnings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Winning[];
  },

  async getAllWinnings() {
    const { data, error } = await supabase
      .from('winnings')
      .select(`
        *,
        profiles (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[WINNINGS SERVICE] Error fetching all winnings:', error);
      throw error;
    }
    return data as (Winning & { profiles: { email: string } })[];
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('winnings')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },


  async uploadProof(winningId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${winningId}-${Math.random()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('winnings')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('winnings')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('winnings')
      .update({ proof_url: publicUrl, status: 'pending' })
      .eq('id', winningId);

    if (updateError) throw updateError;
    return publicUrl;
  },

  async getVerifications(winningId: string) {
    const { data, error } = await supabase
      .from('winner_verifications')
      .select('*')
      .eq('draw_id', winningId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data as WinnerVerification[];
  },

  async submitVerification(userId: string, drawId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${drawId}-${Math.random()}.${fileExt}`;
    const filePath = `verifications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('winner_verifications')
      .insert({
        user_id: userId,
        draw_id: drawId,
        proof_url: publicUrl,
        status: 'pending',
        payout_status: 'pending'
      });

    if (insertError) throw insertError;
    return publicUrl;
  },

  async updateVerificationStatus(id: string, status: 'approved' | 'rejected', notes?: string) {
    const { error } = await supabase
      .from('winner_verifications')
      .update({ 
        status, 
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        payout_status: status === 'approved' ? 'pending' : 'pending' 
      })
      .eq('id', id);

    if (error) throw error;
  },

  async markAsPaid(id: string) {
    const { error } = await supabase
      .from('winner_verifications')
      .update({ payout_status: 'paid' })
      .eq('id', id);

    if (error) throw error;
  }
};

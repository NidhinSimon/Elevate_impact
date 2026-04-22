import { createClient } from "@/utils/supabase/client";

const supabase = createClient();


export type WinningStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Winning {
  id: string;
  user_id: string;
  draw_id: string;
  amount: number;
  status: WinningStatus;
  proof_url: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
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

  async updateStatus(winningId: string, status: WinningStatus) {
    const { data, error } = await supabase
      .from('winnings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', winningId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

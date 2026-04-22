import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface Score {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
}

export const scoreService = {
  async getLatestScores(userId: string): Promise<Score[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching scores:', error);
      return [];
    }
    return data || [];
  },

  async addScore(userId: string, scoreValue: number, date: string): Promise<{ success: boolean; error?: string }> {
    // 1. Check for duplicate date
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      return { success: false, error: "A score for this date already exists." };
    }

    // 2. Add the new score
    const { error: insertError } = await supabase
      .from('scores')
      .insert({ user_id: userId, score: scoreValue, date });

    if (insertError) return { success: false, error: insertError.message };

    // 3. Maintenance: Keep only latest 5
    const { data: allScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (allScores && allScores.length > 5) {
      const idsToDelete = allScores.slice(5).map(s => s.id);
      await supabase.from('scores').delete().in('id', idsToDelete);
    }

    return { success: true };
  },

  async deleteScore(id: string): Promise<boolean> {
    const { error } = await supabase.from('scores').delete().eq('id', id);
    return !error;
  }
};

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

import { Score } from "./scoreService";

export interface DrawResult {
  winning_numbers: number[];
  date: string;
  total_pool: number;
}

export interface Winner {
  user_id: string;
  match_count: number;
  tier: 'jackpot' | 'tier_2' | 'tier_3';
  amount: number;
}

export const drawService = {
  // 1. Generate a random draw (1-45)
  generateDrawSequence(): number[] {
    const sequence: number[] = [];
    while (sequence.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!sequence.includes(num)) {
        sequence.push(num);
      }
    }
    return sequence.sort((a, b) => a - b);
  },

  // 2. Calculate matches for a user
  calculateUserMatches(userScores: number[], drawSequence: number[]): number {
    return userScores.filter(score => drawSequence.includes(score)).length;
  },

  // 3. Execute the draw cycle
  async conductDraw(drawSequence: number[], totalPool: number) {
    // Allocation tiers
    const jackpotPool = totalPool * 0.40;
    const tier2Pool = totalPool * 0.35;
    const tier3Pool = totalPool * 0.25;

    // Fetch all active subscribers and their latest scores
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status')
      .eq('subscription_status', 'active');

    if (userError) throw userError;

    const allWinners: Winner[] = [];
    const matchBuckets: Record<number, string[]> = { 5: [], 4: [], 3: [] };

    // Check each user's scores
    for (const user of users) {
      const { data: scores } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (!scores) continue;
      
      const scoreValues = scores.map(s => s.score);
      const matches = this.calculateUserMatches(scoreValues, drawSequence);

      if (matches >= 3) {
        matchBuckets[matches].push(user.id);
      }
    }

    // Distribute Pools
    // Jackpot (5 matches)
    if (matchBuckets[5].length > 0) {
      const perPerson = jackpotPool / matchBuckets[5].length;
      matchBuckets[5].forEach(uid => allWinners.push({ user_id: uid, match_count: 5, tier: 'jackpot', amount: perPerson }));
    }

    // Tier 2 (4 matches)
    if (matchBuckets[4].length > 0) {
      const perPerson = tier2Pool / matchBuckets[4].length;
      matchBuckets[4].forEach(uid => allWinners.push({ user_id: uid, match_count: 4, tier: 'tier_2', amount: perPerson }));
    }

    // Tier 3 (3 matches)
    if (matchBuckets[3].length > 0) {
      const perPerson = tier3Pool / matchBuckets[3].length;
      matchBuckets[3].forEach(uid => allWinners.push({ user_id: uid, match_count: 3, tier: 'tier_3', amount: perPerson }));
    }

    return {
      winners: allWinners,
      hasJackpotWinner: matchBuckets[5].length > 0,
      rolloverAmount: matchBuckets[5].length === 0 ? jackpotPool : 0
    };
  }
};

export interface DrawResult {
  drawnNumbers: number[];
  mode: 'random' | 'algorithmic';
  timestamp: Date;
}

export interface ScoreRecord {
  score: number;
}

export interface MatchResult {
  matchCount: number;
  tier: 'jackpot' | 'tier2' | 'tier3' | null;
  prizeShare: number;
}

export interface PrizePools {
  jackpot: number;
  tier2Pool: number;
  tier3Pool: number;
  totalPool: number;
}

export function runRandomDraw(): DrawResult {
  const drawnNumbers: number[] = [];
  while (drawnNumbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!drawnNumbers.includes(num)) {
      drawnNumbers.push(num);
    }
  }
  return {
    drawnNumbers: drawnNumbers.sort((a, b) => a - b),
    mode: 'random',
    timestamp: new Date(),
  };
}

export function runAlgorithmicDraw(scores: ScoreRecord[]): DrawResult {
  // a. Build frequency map
  const frequencyMap: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) frequencyMap[i] = 0;
  
  scores.forEach(s => {
    if (s.score >= 1 && s.score <= 45) {
      frequencyMap[s.score]++;
    }
  });

  // b. Assign weights (inverse frequency)
  const weights: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) {
    weights[i] = 1 / (frequencyMap[i] + 1);
  }

  // c. Build weighted pool
  const drawnNumbers: number[] = [];
  const availableNumbers = Array.from({ length: 45 }, (_, i) => i + 1);

  while (drawnNumbers.length < 5) {
    let totalWeight = 0;
    availableNumbers.forEach(num => {
      totalWeight += weights[num];
    });

    let random = Math.random() * totalWeight;
    for (let i = 0; i < availableNumbers.length; i++) {
      const num = availableNumbers[i];
      random -= weights[num];
      if (random <= 0) {
        drawnNumbers.push(num);
        availableNumbers.splice(i, 1);
        break;
      }
    }
  }

  return {
    drawnNumbers: drawnNumbers.sort((a, b) => a - b),
    mode: 'algorithmic',
    timestamp: new Date(),
  };
}

export function checkMatch(userScores: number[], drawnNumbers: number[]): MatchResult {
  const matchCount = userScores.filter(s => drawnNumbers.includes(s)).length;

  if (matchCount === 5) return { matchCount: 5, tier: 'jackpot', prizeShare: 0.40 };
  if (matchCount === 4) return { matchCount: 4, tier: 'tier2', prizeShare: 0.35 };
  if (matchCount === 3) return { matchCount: 3, tier: 'tier3', prizeShare: 0.25 };

  return { matchCount, tier: null, prizeShare: 0 };
}

export function calculatePrizePools(
  activeSubscriberCount: number,
  contributionPerUser: number,
  jackpotRollover: number
): PrizePools {
  const totalPool = (activeSubscriberCount * contributionPerUser) + jackpotRollover;
  return {
    jackpot: (totalPool * 0.40) + jackpotRollover,
    tier2Pool: totalPool * 0.35,
    tier3Pool: totalPool * 0.25,
    totalPool
  };
}

export function splitPrize(poolAmount: number, winnerCount: number): number {
  if (winnerCount === 0) return 0;
  return poolAmount / winnerCount;
}

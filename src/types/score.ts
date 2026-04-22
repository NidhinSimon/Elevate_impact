export interface Score {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
}

export interface CreateScoreInput {
  score: number;
  date: string;
}

export interface UpdateScoreInput {
  score: number;
  date?: string;
}

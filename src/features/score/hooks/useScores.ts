import { useState, useEffect, useCallback } from "react";
import { Score, CreateScoreInput, UpdateScoreInput } from "@/types/score";

export function useScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/score");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch scores");
      }
      const data = await response.json();
      setScores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const addScore = async (input: CreateScoreInput) => {
    setError(null);
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add score");
      }
      await fetchScores(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateScore = async (id: string, input: UpdateScoreInput) => {
    setError(null);
    try {
      const response = await fetch("/api/score", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update score");
      }
      await fetchScores(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteScore = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/score?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete score");
      }
      await fetchScores(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    scores,
    loading,
    error,
    addScore,
    updateScore,
    deleteScore,
    refresh: fetchScores,
  };
}

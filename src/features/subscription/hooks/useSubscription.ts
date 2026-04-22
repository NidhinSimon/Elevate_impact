import { useState, useEffect, useCallback } from "react";
import { Subscription, SubscriptionPlan } from "@/types/subscription";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch subscription");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const updatePlan = async (plan: SubscriptionPlan) => {
    setError(null);
    try {
      const response = await fetch("/api/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update plan");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelSubscription = async () => {
    setError(null);
    try {
      const response = await fetch("/api/subscription", {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    subscription,
    loading,
    error,
    updatePlan,
    cancelSubscription,
    refresh: fetchSubscription,
  };
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeTrustScore = (userId: string | undefined) => {
  const [latestScore, setLatestScore] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchLatestScore = async () => {
      const { data } = await supabase
        .from("trust_scores")
        .select("score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setLatestScore(data.score);
      }
    };

    fetchLatestScore();

    // Poll periodically in case realtime events are missed
    const intervalId = window.setInterval(fetchLatestScore, 3000);

    // Subscribe to real-time updates
    const channel = supabase
      .channel('trust-score-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trust_scores',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New trust score:', payload);
          setLatestScore(payload.new.score);
        }
      )
      .subscribe();

    return () => {
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return latestScore;
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = (userId: string | undefined) => {
  const { data: trustScores } = useQuery({
    queryKey: ["trust-scores", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("trust_scores")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: fraudAlerts } = useQuery({
    queryKey: ["fraud-alerts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("fraud_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: activityLogs } = useQuery({
    queryKey: ["activity-logs", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: securityLayers } = useQuery({
    queryKey: ["security-layers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_layers")
        .select("*")
        .order("layer_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return {
    trustScores,
    fraudAlerts,
    activityLogs,
    securityLayers,
  };
};
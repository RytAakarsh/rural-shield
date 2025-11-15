import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FraudRing {
  id: string;
  ring_name: string;
  member_user_ids: string[];
  detection_confidence: number;
  pattern_type: string;
  network_metadata: any;
  status: string;
  detected_at: string;
}

export const useFraudRings = () => {
  const [fraudRings, setFraudRings] = useState<FraudRing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFraudRings = async () => {
      const { data, error } = await supabase
        .from("fraud_rings")
        .select("*")
        .eq("status", "active")
        .order("detected_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching fraud rings:", error);
      } else {
        setFraudRings(data || []);
      }
      setLoading(false);
    };

    fetchFraudRings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("fraud-ring-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fraud_rings",
        },
        (payload) => {
          console.log("Fraud ring update:", payload);
          
          if (payload.eventType === "INSERT") {
            setFraudRings((prev) => [payload.new as FraudRing, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setFraudRings((prev) =>
              prev.map((ring) =>
                ring.id === payload.new.id ? (payload.new as FraudRing) : ring
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { fraudRings, loading };
};

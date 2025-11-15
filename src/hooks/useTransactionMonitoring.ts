import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  beneficiary_name: string;
  status: string;
  risk_score: number;
  intervention_type: string;
  created_at: string;
}

export const useTransactionMonitoring = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("transaction-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Transaction update:", payload);
          
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
            
            // Show intervention notification
            const newTx = payload.new as Transaction;
            if (newTx.intervention_type === "BLOCK") {
              toast({
                title: "Transaction Blocked",
                description: "This transaction has been blocked due to high fraud risk.",
                variant: "destructive",
              });
            } else if (newTx.intervention_type === "WARNING") {
              toast({
                title: "Transaction Warning",
                description: "Please verify this transaction before proceeding.",
                variant: "default",
              });
            }
          } else if (payload.eventType === "UPDATE") {
            setTransactions((prev) =>
              prev.map((tx) =>
                tx.id === payload.new.id ? (payload.new as Transaction) : tx
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  return { transactions, loading };
};

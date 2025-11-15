-- Enable realtime for trust_scores table
ALTER TABLE public.trust_scores REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trust_scores;

-- Enable realtime for activity_logs table
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Enable realtime for fraud_alerts table
ALTER TABLE public.fraud_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_alerts;
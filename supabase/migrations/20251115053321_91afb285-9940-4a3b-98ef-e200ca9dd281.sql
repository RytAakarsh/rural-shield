-- Create transactions table for monitoring
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  beneficiary_id TEXT,
  beneficiary_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_score NUMERIC DEFAULT 0,
  device_id TEXT,
  ip_address TEXT,
  behavioral_flags JSONB DEFAULT '{}',
  network_flags JSONB DEFAULT '{}',
  intervention_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create transaction network table for graph analysis
CREATE TABLE public.transaction_network (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_user_id UUID NOT NULL,
  target_user_id UUID,
  transaction_id UUID REFERENCES public.transactions(id),
  edge_weight NUMERIC DEFAULT 1,
  edge_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create behavioral analytics table
CREATE TABLE public.behavioral_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  hesitation_score NUMERIC,
  typing_rhythm_anomaly NUMERIC,
  touch_pressure_variance NUMERIC,
  device_motion_anomaly NUMERIC,
  coercion_indicators JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scam signals table
CREATE TABLE public.scam_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id),
  signal_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fraud rings table
CREATE TABLE public.fraud_rings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ring_name TEXT NOT NULL,
  member_user_ids UUID[] NOT NULL,
  detection_confidence NUMERIC NOT NULL,
  pattern_type TEXT NOT NULL,
  network_metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_rings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for transaction_network
CREATE POLICY "Admins can view transaction network"
ON public.transaction_network FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert network edges"
ON public.transaction_network FOR INSERT
WITH CHECK (true);

-- RLS Policies for behavioral_analytics
CREATE POLICY "Users can view their own behavioral analytics"
ON public.behavioral_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all behavioral analytics"
ON public.behavioral_analytics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert behavioral analytics"
ON public.behavioral_analytics FOR INSERT
WITH CHECK (true);

-- RLS Policies for scam_signals
CREATE POLICY "Admins can view scam signals"
ON public.scam_signals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert scam signals"
ON public.scam_signals FOR INSERT
WITH CHECK (true);

-- RLS Policies for fraud_rings
CREATE POLICY "Admins can view fraud rings"
ON public.fraud_rings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage fraud rings"
ON public.fraud_rings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_risk_score ON public.transactions(risk_score DESC);
CREATE INDEX idx_transaction_network_source ON public.transaction_network(source_user_id);
CREATE INDEX idx_transaction_network_target ON public.transaction_network(target_user_id);
CREATE INDEX idx_behavioral_analytics_user ON public.behavioral_analytics(user_id);
CREATE INDEX idx_fraud_rings_status ON public.fraud_rings(status);

-- Enable realtime for Layer 3 tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scam_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_rings;
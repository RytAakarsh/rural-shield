import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId, amount, beneficiaryId, userId, deviceId, behavioralFlags } = await req.json();

    console.log('Scam Signal API - Analyzing transaction:', transactionId);

    // Fetch user's transaction history
    const { data: userTransactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch user's trust score
    const { data: trustScore } = await supabaseClient
      .from('trust_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Check for network patterns
    const { data: networkEdges } = await supabaseClient
      .from('transaction_network')
      .select('*')
      .or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`)
      .limit(100);

    // Calculate risk factors
    const riskFactors = {
      newBeneficiary: false,
      highAmountAnomaly: false,
      rapidVelocity: false,
      behavioralAnomaly: false,
      networkSuspicious: false,
      lowTrustScore: false,
    };

    // Check if beneficiary is new
    const beneficiaryTransactions = userTransactions?.filter(t => t.beneficiary_id === beneficiaryId) || [];
    riskFactors.newBeneficiary = beneficiaryTransactions.length === 0;

    // Check amount anomaly
    const avgAmount = userTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) / (userTransactions?.length || 1);
    riskFactors.highAmountAnomaly = amount > avgAmount * 3;

    // Check velocity (transactions in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentTransactions = userTransactions?.filter(t => t.created_at > oneHourAgo) || [];
    riskFactors.rapidVelocity = recentTransactions.length > 5;

    // Check behavioral flags
    riskFactors.behavioralAnomaly = behavioralFlags?.coercionScore > 0.7 || behavioralFlags?.hesitationScore > 0.8;

    // Check network patterns (hub-and-spoke detection)
    const uniqueTargets = new Set(networkEdges?.map(e => e.target_user_id) || []);
    riskFactors.networkSuspicious = uniqueTargets.size > 10;

    // Check trust score
    riskFactors.lowTrustScore = (trustScore?.score || 100) < 50;

    // Calculate overall risk score
    const riskScore = Object.values(riskFactors).filter(Boolean).length * 20;

    // Determine recommendation
    let recommendation = 'ALLOW';
    let severity = 'low';

    if (riskScore >= 80) {
      recommendation = 'BLOCK';
      severity = 'critical';
    } else if (riskScore >= 60) {
      recommendation = 'CHALLENGE';
      severity = 'high';
    } else if (riskScore >= 40) {
      recommendation = 'WARNING';
      severity = 'medium';
    }

    // Store scam signal
    const { error: signalError } = await supabaseClient
      .from('scam_signals')
      .insert({
        transaction_id: transactionId,
        signal_type: Object.keys(riskFactors).filter(k => riskFactors[k as keyof typeof riskFactors]).join(','),
        severity,
        recommendation,
        metadata: {
          riskScore,
          riskFactors,
          analysisTimestamp: new Date().toISOString(),
        },
      });

    if (signalError) {
      console.error('Error storing scam signal:', signalError);
    }

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'scam_signal_check',
      description: `Scam Signal API: ${recommendation} - Risk Score: ${riskScore}`,
      metadata: { transactionId, riskScore, recommendation },
    });

    return new Response(
      JSON.stringify({
        success: true,
        recommendation,
        riskScore,
        severity,
        riskFactors,
        message: getRecommendationMessage(recommendation, riskFactors),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in Scam Signal API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getRecommendationMessage(recommendation: string, riskFactors: any): string {
  if (recommendation === 'BLOCK') {
    return 'This transaction has been blocked due to high fraud risk. Please contact support.';
  } else if (recommendation === 'CHALLENGE') {
    return 'Additional verification required. Please complete step-up authentication.';
  } else if (recommendation === 'WARNING') {
    const warnings = [];
    if (riskFactors.newBeneficiary) warnings.push('new beneficiary');
    if (riskFactors.behavioralAnomaly) warnings.push('unusual behavior detected');
    return `Warning: This transaction shows signs of potential fraud (${warnings.join(', ')}). Please verify before proceeding.`;
  }
  return 'Transaction approved.';
}

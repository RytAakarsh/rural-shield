import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      userId,
      transactionType,
      amount,
      beneficiaryId,
      beneficiaryName,
      deviceId,
      ipAddress,
      behavioralData,
    } = await req.json();

    console.log('Transaction Monitoring - Processing transaction for user:', userId);

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount,
        beneficiary_id: beneficiaryId,
        beneficiary_name: beneficiaryName,
        device_id: deviceId,
        ip_address: ipAddress,
        status: 'pending',
        behavioral_flags: {},
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Store behavioral analytics if provided
    if (behavioralData) {
      await supabaseClient.from('behavioral_analytics').insert({
        user_id: userId,
        transaction_id: transaction.id,
        hesitation_score: behavioralData.hesitationScore || 0,
        typing_rhythm_anomaly: behavioralData.typingRhythmAnomaly || 0,
        touch_pressure_variance: behavioralData.touchPressureVariance || 0,
        device_motion_anomaly: behavioralData.deviceMotionAnomaly || 0,
        coercion_indicators: behavioralData.coercionIndicators || {},
      });
    }

    // Call Scam Signal API
    const scamSignalResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scam-signal-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        transactionId: transaction.id,
        amount,
        beneficiaryId,
        userId,
        deviceId,
        behavioralFlags: {
          coercionScore: behavioralData?.coercionScore || 0,
          hesitationScore: behavioralData?.hesitationScore || 0,
        },
      }),
    });

    const scamSignal = await scamSignalResponse.json();

    // Update transaction with risk score and recommendation
    await supabaseClient
      .from('transactions')
      .update({
        risk_score: scamSignal.riskScore,
        intervention_type: scamSignal.recommendation,
        status: scamSignal.recommendation === 'BLOCK' ? 'blocked' : 'pending',
      })
      .eq('id', transaction.id);

    // Create network edge
    if (beneficiaryId) {
      await supabaseClient.from('transaction_network').insert({
        source_user_id: userId,
        target_user_id: beneficiaryId,
        transaction_id: transaction.id,
        edge_weight: 1,
        edge_type: transactionType,
      });
    }

    // Calculate and insert trust score based on risk + behavioral signals
    const hesitation = behavioralData?.hesitationScore ?? 0; // 0–1 expected
    const typing = behavioralData?.typingRhythmAnomaly ?? 0; // 0–1
    const motion = behavioralData?.deviceMotionAnomaly ?? 0; // 0–1
    const coercion = behavioralData?.coercionScore ?? 0; // 0–1

    // Convert behavior to additional risk (0–40 max)
    const behaviorPenalty = Math.min(40, (hesitation * 30) + (typing * 20) + (motion * 15) + (coercion * 40));
    const combinedRisk = Math.max(0, Math.min(100, (scamSignal.riskScore ?? 0) + behaviorPenalty));

    // Pull latest Layer 1 (SIM) trust if available
    const { data: lastSim } = await supabaseClient
      .from('verification_history')
      .select('details')
      .eq('user_id', userId)
      .eq('verification_type', 'sim_verification')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const layer1 = Math.max(1, Math.min(99, Number(lastSim?.details?.trustScore ?? 80)));
    const amountFactor = Math.log10((Number(amount) || 1) + 1); // 0–~5
    const layer2 = Math.max(50, Math.min(95, Math.round(95 - amountFactor * 5)));

    const trustScore = Math.max(10, Math.min(99, Math.round(100 - combinedRisk)));

    await supabaseClient.from('trust_scores').insert({
      user_id: userId,
      score: trustScore,
      layer_1_score: layer1,
      layer_2_score: layer2,
      layer_3_score: trustScore,
    });

    // Use AI to analyze for fraud ring patterns
    if (scamSignal.riskScore > 60) {
      const { data: networkData } = await supabaseClient
        .from('transaction_network')
        .select('*')
        .or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`)
        .limit(100);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a fraud detection AI. Analyze transaction networks and identify potential fraud rings, mule accounts, or coordinated fraud patterns. Return ONLY valid JSON.',
            },
            {
              role: 'user',
              content: `Analyze this transaction network data for fraud patterns: ${JSON.stringify(networkData)}. 
              
              Return JSON with:
              {
                "isFraudRing": boolean,
                "confidence": number (0-100),
                "patternType": string,
                "suspiciousUserIds": array of strings,
                "reasoning": string
              }`,
            },
          ],
        }),
      });

      const aiData = await aiResponse.json();
      const analysis = JSON.parse(
        aiData.choices[0].message.content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
      );

      // If fraud ring detected, create or update fraud ring record
      if (analysis.isFraudRing && analysis.confidence > 70) {
        await supabaseClient.from('fraud_rings').insert({
          ring_name: `Ring_${Date.now()}`,
          member_user_ids: analysis.suspiciousUserIds,
          detection_confidence: analysis.confidence,
          pattern_type: analysis.patternType,
          network_metadata: {
            transactionId: transaction.id,
            reasoning: analysis.reasoning,
          },
          status: 'active',
        });

        // Create fraud alert
        await supabaseClient.from('fraud_alerts').insert({
          user_id: userId,
          alert_type: 'fraud_ring_detected',
          severity: 'critical',
          description: `Potential fraud ring detected: ${analysis.patternType}`,
          status: 'active',
        });
      }
    }

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'transaction_monitored',
      description: `Transaction monitored: ${transactionType} - ₹${amount}`,
      metadata: {
        transactionId: transaction.id,
        riskScore: scamSignal.riskScore,
        recommendation: scamSignal.recommendation,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        scamSignal,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in transaction monitoring:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

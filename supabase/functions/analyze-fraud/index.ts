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
    const { userId, verificationData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call Lovable AI for fraud analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a fraud detection AI for FraudShield. Analyze verification data and return a JSON object with:
            - trustScore (0-100)
            - layer1Score (0-100) - SIM & device intelligence
            - layer2Score (0-100) - Deepfake & biometric detection
            - layer3Score (0-100) - Transaction monitoring
            - riskLevel (low, medium, high, critical)
            - alerts (array of detected issues)
            - recommendations (array of suggested actions)`
          },
          {
            role: "user",
            content: `Analyze this verification data: ${JSON.stringify(verificationData)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const aiAnalysis = JSON.parse(data.choices[0].message.content);

    // Store trust score in database
    const { error: scoreError } = await supabaseClient
      .from('trust_scores')
      .insert({
        user_id: userId,
        score: aiAnalysis.trustScore,
        layer_1_score: aiAnalysis.layer1Score,
        layer_2_score: aiAnalysis.layer2Score,
        layer_3_score: aiAnalysis.layer3Score,
      });

    if (scoreError) {
      console.error("Error storing trust score:", scoreError);
    }

    // Store fraud alerts if risk is high
    if (aiAnalysis.riskLevel === 'high' || aiAnalysis.riskLevel === 'critical') {
      for (const alert of aiAnalysis.alerts) {
        await supabaseClient.from('fraud_alerts').insert({
          user_id: userId,
          alert_type: alert.type,
          severity: aiAnalysis.riskLevel,
          description: alert.description,
        });
      }
    }

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'fraud_analysis',
      description: `Fraud analysis completed - Risk: ${aiAnalysis.riskLevel}`,
      metadata: aiAnalysis,
    });

    return new Response(JSON.stringify(aiAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in analyze-fraud function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
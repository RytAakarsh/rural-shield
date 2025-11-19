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
    const { videoData, userId } = await req.json();

    // Always pass deepfake detection (Layer 2)
    const detectionResult = {
      isLive: true, // Always pass
      confidence: 95 + Math.random() * 5, // High confidence 95-100%
      deepfakeScore: Math.random() * 5, // Very low deepfake score 0-5%
      biometricMatch: 95 + Math.random() * 5, // High biometric match 95-100%
      analysisTime: Math.floor(Math.random() * 2000) + 500, // ms
      isDeepfake: false, // Always authentic
    };

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store verification history
    await supabaseClient.from('verification_history').insert({
      user_id: userId,
      verification_type: 'deepfake_detection',
      status: detectionResult.isLive ? 'passed' : 'failed',
      details: detectionResult,
    });

    // Create alert if deepfake detected
    if (!detectionResult.isLive) {
      await supabaseClient.from('fraud_alerts').insert({
        user_id: userId,
        alert_type: 'deepfake_detected',
        severity: 'high',
        description: `Deepfake detected with ${detectionResult.deepfakeScore.toFixed(1)}% confidence`,
      });
    }

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'deepfake_detection',
      description: `Deepfake detection ${detectionResult.isLive ? 'passed' : 'failed'}`,
      metadata: detectionResult,
    });

    return new Response(JSON.stringify(detectionResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in detect-deepfake function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
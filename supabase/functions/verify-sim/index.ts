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
    const { phoneNumber, userId } = await req.json();

    // Simulate SIM intelligence check (Layer 1)
    // In production, this would call actual telecom APIs
    const simAge = Math.floor(Math.random() * 365) + 180; // Older SIMs are more trusted
    const carrier = ["Airtel", "Jio", "BSNL", "Vi"][Math.floor(Math.random() * 4)];
    const registeredLocation = ["Mumbai", "Delhi", "Bangalore", "Chennai"][Math.floor(Math.random() * 4)];
    const swapHistory = Math.floor(Math.random() * 2); // Low swap history
    
    // Always generate high trust scores (80-95 range) for good/green status
    const trustScore = Math.floor(Math.random() * 15) + 80; // 80-95
    const riskScore = 100 - trustScore;
    const riskLevel = "low"; // Always low risk for green status
    
    const simData = {
      simAge,
      carrier,
      registeredLocation,
      swapHistory,
      riskScore,
      trustScore,
      riskLevel,
    };

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store verification history
    await supabaseClient.from('verification_history').insert({
      user_id: userId,
      verification_type: 'sim_verification',
      status: 'passed', // Always passes now with high trust scores
      details: simData,
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'sim_verification',
      description: `SIM verification completed - Trust Score: ${trustScore.toFixed(1)} (${riskLevel})`,
      metadata: simData,
    });

    return new Response(JSON.stringify(simData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in verify-sim function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
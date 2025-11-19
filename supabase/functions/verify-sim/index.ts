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
    const normalized = (phoneNumber || '').toString();
    const hash = [...normalized].reduce((acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0), 0);

    // Deterministic pseudo-random helpers from phone number
    const pick = (arr: string[], shift: number) => arr[(hash >> shift) % arr.length];
    const jitter = (base: number, spread: number, shift: number) => base + (((hash >> shift) % (spread * 2)) - spread);

    const carrier = pick(["Airtel", "Jio", "BSNL", "Vi"], 3);
    const registeredLocation = pick(["Mumbai", "Delhi", "Bangalore", "Chennai"], 7);

    // Older SIMs are more trusted: 30–720 days with deterministic jitter
    const simAge = Math.max(30, Math.min(720, (hash % 690) + 30));
    // Swap history 0–3 derived from hash
    const swapHistory = (hash >> 11) % 4;

    // Base risk components
    const carrierRiskMap: Record<string, number> = { Airtel: 8, Jio: 10, BSNL: 14, Vi: 12 };
    const locationRiskMap: Record<string, number> = { Mumbai: 8, Delhi: 10, Bangalore: 6, Chennai: 7 };

    let riskScore = 0;
    riskScore += carrierRiskMap[carrier] ?? 10;
    riskScore += locationRiskMap[registeredLocation] ?? 10;
    riskScore += swapHistory * 12; // frequent swaps increase risk
    riskScore += simAge < 60 ? 25 : simAge < 120 ? 15 : simAge < 180 ? 8 : 0; // new SIM penalty

    // Add small deterministic jitter for realism (±5)
    riskScore += (((hash >> 17) % 11) - 5);

    // Clamp to 0–100 and compute trust
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    const trustScore = Math.max(1, Math.min(99, 100 - riskScore));
    const riskLevel = trustScore > 70 ? "low" : trustScore > 40 ? "medium" : "high";

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
      status: trustScore > 50 ? 'passed' : 'failed',
      details: simData,
    });

    // Log activity
    await supabaseClient.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'sim_verification',
      description: `SIM verification completed - Trust Score: ${trustScore.toFixed(1)} (${riskLevel})`,
      metadata: simData,
    });

    // Insert/update trust score
    await supabaseClient.from('trust_scores').insert({
      user_id: userId,
      score: trustScore,
      layer_1_score: trustScore,
      layer_2_score: null,
      layer_3_score: null,
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
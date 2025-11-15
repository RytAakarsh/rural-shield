import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Smartphone, Video, Activity, Loader2 } from "lucide-react";
import { LivenessDetection } from "./LivenessDetection";

interface VerificationPanelProps {
  userId: string;
}

export const VerificationPanel = ({ userId }: VerificationPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationStep, setVerificationStep] = useState<"sim" | "deepfake" | "complete" | null>(null);
  const [showLivenessDialog, setShowLivenessDialog] = useState(false);
  const [simData, setSimData] = useState<any>(null);

  const calculateTrustScore = (simScore: number, deepfakeScore?: number) => {
    // Layer 1 (SIM) = 40% weight
    // Layer 2 (Deepfake) = 35% weight
    // Layer 3 (Baseline) = 25% weight
    const layer1Score = simScore;
    const layer2Score = deepfakeScore || 0;
    const layer3Score = 85; // Baseline score
    
    const trustScore = (layer1Score * 0.4) + (layer2Score * 0.35) + (layer3Score * 0.25);
    return Math.round(trustScore * 100) / 100;
  };

  const handleSimVerification = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    setVerificationStep("sim");

    try {
      const { data, error } = await supabase.functions.invoke("verify-sim", {
        body: { phoneNumber, userId },
      });

      if (error) throw error;

      setSimData(data);
      
      // Calculate initial trust score with just Layer 1
      const initialTrustScore = calculateTrustScore(data.riskScore);
      
      // Store trust score in database
      await supabase.from('trust_scores').insert({
        user_id: userId,
        score: initialTrustScore,
        layer_1_score: data.riskScore,
        layer_2_score: null,
        layer_3_score: 85,
      });

      toast.success(`Layer 1 Complete! Risk score: ${data.riskScore.toFixed(1)}%`);
      setVerificationStep("deepfake");
    } catch (error: any) {
      toast.error(error.message);
      setVerificationStep(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLivenessCheck = () => {
    setShowLivenessDialog(true);
  };

  const handleLivenessComplete = async (success: boolean) => {
    setShowLivenessDialog(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-deepfake", {
        body: { 
          videoData: success ? "liveness_verified" : "liveness_failed", 
          userId 
        },
      });

      if (error) throw error;

      // Calculate updated trust score with Layer 1 and Layer 2
      const biometricScore = success ? data.biometricMatch : 0;
      const updatedTrustScore = calculateTrustScore(simData.riskScore, biometricScore);

      // Update trust score in database
      await supabase.from('trust_scores').insert({
        user_id: userId,
        score: updatedTrustScore,
        layer_1_score: simData.riskScore,
        layer_2_score: biometricScore,
        layer_3_score: 85,
      });

      if (success && data.isLive) {
        toast.success("Layer 2 Complete! Liveness verified!");
        setVerificationStep("complete");
      } else {
        toast.error("Liveness check failed. Please try again.");
        setVerificationStep("deepfake");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFullAnalysis = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-fraud", {
        body: {
          userId,
          verificationData: {
            phoneNumber,
            deviceInfo: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast.success(
        `Full analysis complete! Trust score: ${data.trustScore} - Risk: ${data.riskLevel}`
      );
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verification Center
          </CardTitle>
          <CardDescription>
            Test the multi-layered fraud detection system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layer 1: SIM Verification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Layer 1: SIM Intelligence</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading || verificationStep !== null}
              />
            </div>
            <Button
              onClick={handleSimVerification}
              disabled={loading || !phoneNumber || verificationStep !== null}
              className="w-full"
            >
              {loading && verificationStep === "sim" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify SIM"
              )}
            </Button>
          </div>

          {/* Layer 2: Deepfake Detection */}
          {verificationStep === "deepfake" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Layer 2: Liveness Detection</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time face liveness verification using camera
              </p>
              <Button
                onClick={handleStartLivenessCheck}
                disabled={loading}
                className="w-full"
              >
                Open Camera & Detect
              </Button>
            </div>
          )}

          {/* Layer 3: Full Analysis */}
          {verificationStep === "complete" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Layer 3: AI-Powered Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete fraud analysis using AI
              </p>
              <Button
                onClick={handleFullAnalysis}
                disabled={loading}
                className="w-full"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Full AI Analysis"
                )}
              </Button>
            </div>
          )}

          {verificationStep === "complete" && !loading && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-foreground">
                ✅ All layers completed! Check the trust score and activity feed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liveness Detection Dialog */}
      <Dialog open={showLivenessDialog} onOpenChange={setShowLivenessDialog}>
        <DialogContent className="max-w-4xl p-0 gap-0">
          <LivenessDetection
            onComplete={handleLivenessComplete}
            onCancel={() => setShowLivenessDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
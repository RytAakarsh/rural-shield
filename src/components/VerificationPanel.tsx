import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Smartphone, Video, Activity, Loader2 } from "lucide-react";

interface VerificationPanelProps {
  userId: string;
}

export const VerificationPanel = ({ userId }: VerificationPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationStep, setVerificationStep] = useState<"sim" | "deepfake" | "complete" | null>(null);

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

      toast.success(`SIM verification completed! Risk score: ${data.riskScore.toFixed(1)}%`);
      setVerificationStep("deepfake");
    } catch (error: any) {
      toast.error(error.message);
      setVerificationStep(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepfakeDetection = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-deepfake", {
        body: { videoData: "simulated_video", userId },
      });

      if (error) throw error;

      toast.success(
        data.isLive ? "Liveness check passed!" : "Warning: Deepfake detected!"
      );
      setVerificationStep("complete");
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
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSimVerification}
            disabled={loading || !phoneNumber}
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
              <h4 className="font-semibold">Layer 2: Deepfake Detection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Simulating video KYC and liveness detection
            </p>
            <Button
              onClick={handleDeepfakeDetection}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Run Deepfake Detection"
              )}
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
              ✅ All layers completed! Check the activity feed for results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
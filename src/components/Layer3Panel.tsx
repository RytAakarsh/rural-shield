import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Send } from "lucide-react";

interface Layer3PanelProps {
  userId: string;
}

export const Layer3Panel = ({ userId }: Layer3PanelProps) => {
  const [amount, setAmount] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [behaviorMetrics, setBehaviorMetrics] = useState<any>(null);
  const { toast } = useToast();

  const handleTransaction = async () => {
    if (!amount || !beneficiaryName) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and beneficiary name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate behavioral data with complexity detection
      const behavioralData = {
        hesitationScore: Math.random() * 0.5, // 0-0.5 range (lower is better)
        coercionScore: Math.random() * 0.3,
        typingRhythmAnomaly: Math.random() * 0.4,
        touchPressureVariance: Math.random() * 0.3,
        deviceMotionAnomaly: Math.random() * 0.2,
        // Complexity behavior detection metrics
        transactionComplexity: {
          amountPattern: parseFloat(amount) > 50000 ? "high" : "normal",
          inputDuration: Math.random() * 10 + 5, // seconds
          correctionCount: Math.floor(Math.random() * 3),
          contextSwitching: Math.floor(Math.random() * 5),
        },
        coercionIndicators: {
          rapidDecisionTime: Math.random() > 0.7,
          repeatChecking: Math.random() > 0.6,
          unusualSpeed: Math.random() > 0.8,
        },
        cognitiveBehavior: {
          decisionLatency: Math.random() * 3 + 1, // seconds
          errorRate: Math.random() * 0.3,
          focusScore: Math.random() * 100,
        },
      };
      
      // Store metrics for UI display
      setBehaviorMetrics(behavioralData);

      // Call transaction monitoring edge function
      const { data, error } = await supabase.functions.invoke("monitor-transaction", {
        body: {
          userId,
          transactionType: "transfer",
          amount: parseFloat(amount),
          beneficiaryId: `ben_${Date.now()}`,
          beneficiaryName,
          deviceId: navigator.userAgent,
          ipAddress: "127.0.0.1", // In production, get from server
          behavioralData,
        },
      });

      if (error) throw error;

      // Handle the response
      const scamSignal = data.scamSignal;
      
      if (scamSignal.recommendation === "BLOCK") {
        toast({
          title: "Transaction Blocked",
          description: scamSignal.message,
          variant: "destructive",
        });
      } else if (scamSignal.recommendation === "WARNING") {
        toast({
          title: "Transaction Warning",
          description: scamSignal.message,
          variant: "default",
        });
      } else if (scamSignal.recommendation === "CHALLENGE") {
        toast({
          title: "Additional Verification Required",
          description: "Please complete step-up authentication.",
          variant: "default",
        });
      } else {
        toast({
          title: "Transaction Approved",
          description: "Transaction processed successfully",
        });
      }

      // Reset form
      setAmount("");
      setBeneficiaryName("");
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Layer 3: Intelligence Fabric
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test real-time transaction monitoring with AI-powered fraud detection
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="beneficiary">Beneficiary Name</Label>
              <Input
                id="beneficiary"
                placeholder="Enter beneficiary name"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleTransaction}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Initiate Transaction
                </>
              )}
            </Button>
          </div>

          {behaviorMetrics && (
            <div className="mt-4 p-4 bg-accent/50 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Complexity Behavior Analysis:</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Hesitation: {(behaviorMetrics.hesitationScore * 100).toFixed(1)}%</p>
                  <p className="text-muted-foreground">Coercion Risk: {(behaviorMetrics.coercionScore * 100).toFixed(1)}%</p>
                  <p className="text-muted-foreground">Decision Latency: {behaviorMetrics.cognitiveBehavior.decisionLatency.toFixed(1)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Input Duration: {behaviorMetrics.transactionComplexity.inputDuration.toFixed(1)}s</p>
                  <p className="text-muted-foreground">Corrections: {behaviorMetrics.transactionComplexity.correctionCount}</p>
                  <p className="text-muted-foreground">Focus Score: {behaviorMetrics.cognitiveBehavior.focusScore.toFixed(0)}</p>
                </div>
              </div>
              {(behaviorMetrics.coercionIndicators.rapidDecisionTime || 
                behaviorMetrics.coercionIndicators.unusualSpeed) && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                  ⚠️ Coercion indicators detected
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-accent/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">What Layer 3 Monitors:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Real-time behavioral analytics</li>
              <li>✓ Complexity behavior patterns</li>
              <li>✓ Cognitive load detection</li>
              <li>✓ Transaction velocity patterns</li>
              <li>✓ Network relationship analysis</li>
              <li>✓ AI-powered fraud ring detection</li>
              <li>✓ Coercion indicators</li>
              <li>✓ Scam signal correlation</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

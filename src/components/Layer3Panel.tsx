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
      // Simulate behavioral data (in real app, this would come from actual biometric sensors)
      const behavioralData = {
        hesitationScore: Math.random() * 0.5, // 0-0.5 range (lower is better)
        coercionScore: Math.random() * 0.3,
        typingRhythmAnomaly: Math.random() * 0.4,
        touchPressureVariance: Math.random() * 0.3,
        deviceMotionAnomaly: Math.random() * 0.2,
        coercionIndicators: {
          rapidDecisionTime: false,
          repeatChecking: false,
        },
      };

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

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <h4 className="font-semibold mb-2">What Layer 3 Monitors:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Transaction velocity & patterns</li>
              <li>✓ New beneficiary detection</li>
              <li>✓ Behavioral biometrics (coercion signs)</li>
              <li>✓ Network fraud ring patterns</li>
              <li>✓ Mule account identification</li>
              <li>✓ Real-time scam signal analysis</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

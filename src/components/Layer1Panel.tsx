import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Shield } from "lucide-react";

interface Layer1PanelProps {
  userId: string;
}

export const Layer1Panel = ({ userId }: Layer1PanelProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSimVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-sim", {
        body: { userId, phoneNumber },
      });

      if (error) throw error;

      toast({
        title: "SIM Verification Complete",
        description: `Trust Score: ${data.trustScore.toFixed(1)} - ${data.riskLevel}`,
        variant: data.riskLevel === "low" ? "default" : "destructive",
      });

      setPhoneNumber("");
    } catch (error) {
      console.error("SIM verification error:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify SIM",
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
          <Smartphone className="h-5 w-5" />
          Layer 1: Proactive Perimeter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            SIM intelligence & device fingerprinting with real-time risk scoring
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSimVerification}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify SIM
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <h4 className="font-semibold mb-2">What Layer 1 Checks:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ SIM age & swap detection</li>
              <li>✓ Device fingerprinting</li>
              <li>✓ Location anomaly detection</li>
              <li>✓ Network intelligence</li>
              <li>✓ IMEI validation</li>
              <li>✓ Carrier verification</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock } from "lucide-react";

interface BankingInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
];

export const BankingInterface = ({ open, onOpenChange, userId }: BankingInterfaceProps) => {
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!bank || !amount || !upiId || !pin) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate behavioral data for the transaction
      const behavioralData = {
        hesitationScore: Math.random() * 0.3,
        coercionScore: Math.random() * 0.2,
        typingRhythmAnomaly: Math.random() * 0.25,
        touchPressureVariance: Math.random() * 0.2,
        deviceMotionAnomaly: Math.random() * 0.15,
        transactionComplexity: {
          amountPattern: parseFloat(amount) > 50000 ? "high" : "normal",
          inputDuration: Math.random() * 10 + 5,
          correctionCount: Math.floor(Math.random() * 2),
          contextSwitching: Math.floor(Math.random() * 3),
        },
        coercionIndicators: {
          rapidDecisionTime: false,
          repeatChecking: false,
          unusualSpeed: false,
          coercionScore: Math.random() * 0.2,
        },
        cognitiveBehavior: {
          decisionLatency: Math.random() * 2 + 1,
          errorRate: Math.random() * 0.2,
          focusScore: 80 + Math.random() * 20,
        },
      };

      // Call transaction monitoring edge function
      const { data, error } = await supabase.functions.invoke("monitor-transaction", {
        body: {
          userId,
          transactionType: "upi_payment",
          amount: parseFloat(amount),
          beneficiaryId: upiId,
          beneficiaryName: bank,
          deviceId: navigator.userAgent,
          ipAddress: "127.0.0.1",
          behavioralData,
        },
      });

      if (error) throw error;

      const scamSignal = data.scamSignal;
      
      if (scamSignal.recommendation === "BLOCK") {
        toast({
          title: "Payment Blocked",
          description: scamSignal.message,
          variant: "destructive",
        });
      } else if (scamSignal.recommendation === "WARNING") {
        toast({
          title: "Payment Warning",
          description: scamSignal.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `₹${amount} paid via UPI successfully`,
        });
      }

      // Reset form and close
      setBank("");
      setAmount("");
      setUpiId("");
      setPin("");
      onOpenChange(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Payment System
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger id="bank">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bankName) => (
                  <SelectItem key={bankName} value={bankName}>
                    {bankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upi">UPI ID</Label>
            <Input
              id="upi"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="pin"
                type="password"
                placeholder="4-digit PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing Payment..." : `Pay ₹${amount || "0"}`}
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-2">
            <Lock className="h-3 w-3 inline mr-1" />
            Secured by Layer 3 Intelligence Fabric
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard } from "lucide-react";
import { BankingInterface } from "./BankingInterface";

interface Layer3PanelProps {
  userId: string;
}

export const Layer3Panel = ({ userId }: Layer3PanelProps) => {
  const [showBanking, setShowBanking] = useState(false);

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
            Test real-time transaction monitoring with AI-powered fraud detection through secure banking interface
          </p>

          <Button
            onClick={() => setShowBanking(true)}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Open Banking System
          </Button>

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

        <BankingInterface
          open={showBanking}
          onOpenChange={setShowBanking}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
};

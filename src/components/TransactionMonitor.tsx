import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactionMonitoring } from "@/hooks/useTransactionMonitoring";
import { AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionMonitorProps {
  userId: string;
}

export const TransactionMonitor = ({ userId }: TransactionMonitorProps) => {
  const { transactions, loading } = useTransactionMonitoring(userId);

  const getStatusIcon = (intervention: string) => {
    switch (intervention) {
      case "BLOCK":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "CHALLENGE":
        return <Shield className="h-5 w-5 text-primary" />;
      default:
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  const getStatusBadge = (intervention: string) => {
    switch (intervention) {
      case "BLOCK":
        return <Badge variant="destructive">Blocked</Badge>;
      case "WARNING":
        return <Badge variant="default">Warning</Badge>;
      case "CHALLENGE":
        return <Badge variant="default">Challenge</Badge>;
      default:
        return <Badge variant="default">Approved</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Real-Time Transaction Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions to display
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(tx.intervention_type)}
                  <div>
                    <p className="font-medium">
                      {tx.transaction_type} - ₹{tx.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {tx.beneficiary_name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(tx.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(tx.intervention_type)}
                  <div className="text-xs text-muted-foreground">
                    Risk: {Math.round(tx.risk_score)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

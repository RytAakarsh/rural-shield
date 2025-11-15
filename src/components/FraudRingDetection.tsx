import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFraudRings } from "@/hooks/useFraudRings";
import { AlertTriangle, Network, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const FraudRingDetection = () => {
  const { fraudRings, loading } = useFraudRings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fraud Ring Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading fraud rings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Fraud Ring Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fraudRings.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="text-muted-foreground">No active fraud rings detected</p>
            </div>
          ) : (
            fraudRings.map((ring) => (
              <div
                key={ring.id}
                className="p-4 border border-destructive/50 rounded-lg bg-destructive/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold">{ring.ring_name}</h4>
                  </div>
                  <Badge variant="destructive">Active</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {ring.member_user_ids.length} accounts involved
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pattern Type:</span>
                    <span className="font-medium">{ring.pattern_type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium">{ring.detection_confidence}%</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Detected{" "}
                      {formatDistanceToNow(new Date(ring.detected_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  
                  {ring.network_metadata?.reasoning && (
                    <div className="mt-2 p-2 bg-background rounded text-xs">
                      <p className="text-muted-foreground">
                        {ring.network_metadata.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

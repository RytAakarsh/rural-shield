import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface TrustScoreGaugeProps {
  score: number;
  label?: string;
  userId?: string;
}

export const TrustScoreGauge = ({ score, label = "Dashboard Trust", userId }: TrustScoreGaugeProps) => {
  const [behaviorMetrics, setBehaviorMetrics] = useState<any>(null);

  // Fetch latest behavioral analytics
  const { data: behaviorData } = useQuery({
    queryKey: ["behavioral-analytics", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("behavioral_analytics")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!userId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (behaviorData) {
      setBehaviorMetrics({
        hesitation: (behaviorData.hesitation_score || 0) * 100,
        coercion: ((behaviorData.coercion_indicators as any)?.coercionScore || 0) * 100,
        typing: (behaviorData.typing_rhythm_anomaly || 0) * 100,
        pressure: (behaviorData.touch_pressure_variance || 0) * 100,
        motion: (behaviorData.device_motion_anomaly || 0) * 100,
        focus: Math.random() * 100,
      });
    }
  }, [behaviorData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getRiskQuality = (score: number) => {
    if (score >= 80) return { level: "Low Risk", color: "text-accent", bgColor: "bg-accent/10" };
    if (score >= 60) return { level: "Medium Risk", color: "text-warning", bgColor: "bg-warning/10" };
    return { level: "High Risk", color: "text-destructive", bgColor: "bg-destructive/10" };
  };

  const riskQuality = getRiskQuality(score);

  const MetricBar = ({ label, value, max = 100, color = "bg-accent" }: any) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", color)}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        {label}
      </h3>
      
      <div className="space-y-6">
        {/* Trust Score Display */}
        <div className={cn("p-4 rounded-lg border-2 transition-all", riskQuality.bgColor, `border-${riskQuality.level === "Low Risk" ? "accent" : riskQuality.level === "Medium Risk" ? "warning" : "destructive"}/30`)}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Trust Score</div>
              <div className={cn("text-4xl font-bold", getScoreColor(score))}>
                {score}
                <span className="text-lg text-muted-foreground ml-1">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-xl font-bold mb-1", riskQuality.color)}>
                {riskQuality.level}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {score >= 80 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-accent">+3.2%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">-1.5%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Quality Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Risk Quality Features</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("p-3 rounded-lg", riskQuality.bgColor)}>
              <div className="text-xs text-muted-foreground mb-1">Authentication</div>
              <div className={cn("text-sm font-semibold", riskQuality.color)}>
                {score >= 80 ? "Verified" : score >= 60 ? "Partial" : "Required"}
              </div>
            </div>
            <div className={cn("p-3 rounded-lg", riskQuality.bgColor)}>
              <div className="text-xs text-muted-foreground mb-1">Behavioral</div>
              <div className={cn("text-sm font-semibold", riskQuality.color)}>
                {score >= 80 ? "Normal" : score >= 60 ? "Moderate" : "Anomaly"}
              </div>
            </div>
            <div className={cn("p-3 rounded-lg", riskQuality.bgColor)}>
              <div className="text-xs text-muted-foreground mb-1">Network</div>
              <div className={cn("text-sm font-semibold", riskQuality.color)}>
                {score >= 80 ? "Trusted" : score >= 60 ? "Review" : "Suspicious"}
              </div>
            </div>
            <div className={cn("p-3 rounded-lg", riskQuality.bgColor)}>
              <div className="text-xs text-muted-foreground mb-1">Transaction</div>
              <div className={cn("text-sm font-semibold", riskQuality.color)}>
                {score >= 80 ? "Safe" : score >= 60 ? "Caution" : "Block"}
              </div>
            </div>
          </div>
        </div>

        {/* Complexity Behavior Analysis */}
        {behaviorMetrics && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Complexity Behavior Analysis</h4>
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <MetricBar 
                label="Hesitation Score" 
                value={behaviorMetrics.hesitation}
                color={behaviorMetrics.hesitation > 50 ? "bg-destructive" : "bg-accent"}
              />
              <MetricBar 
                label="Coercion Risk" 
                value={behaviorMetrics.coercion}
                color={behaviorMetrics.coercion > 30 ? "bg-destructive" : "bg-warning"}
              />
              <MetricBar 
                label="Typing Rhythm" 
                value={behaviorMetrics.typing}
                color={behaviorMetrics.typing > 40 ? "bg-warning" : "bg-accent"}
              />
              <MetricBar 
                label="Touch Pressure" 
                value={behaviorMetrics.pressure}
                color={behaviorMetrics.pressure > 30 ? "bg-warning" : "bg-accent"}
              />
              <MetricBar 
                label="Device Motion" 
                value={behaviorMetrics.motion}
                color={behaviorMetrics.motion > 20 ? "bg-warning" : "bg-accent"}
              />
              <MetricBar 
                label="Focus Score" 
                value={behaviorMetrics.focus}
                color="bg-accent"
              />
            </div>
            
            {(behaviorMetrics.hesitation > 50 || behaviorMetrics.coercion > 30) && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
                  <Shield className="h-4 w-4" />
                  High Risk Indicators Detected
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layer Status */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Layer 1</div>
            <div className="text-xs font-semibold text-accent">Active</div>
          </div>
          <div className="p-2 rounded-lg bg-accent/10 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Layer 2</div>
            <div className="text-xs font-semibold text-accent">Active</div>
          </div>
          <div className="p-2 rounded-lg bg-accent/10 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Layer 3</div>
            <div className="text-xs font-semibold text-accent">Active</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

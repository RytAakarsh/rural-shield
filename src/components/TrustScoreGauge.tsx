import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustScoreGaugeProps {
  score: number;
  label?: string;
}

export const TrustScoreGauge = ({ score, label = "Trust Score" }: TrustScoreGaugeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getGaugeColor = (score: number) => {
    if (score >= 80) return "stroke-accent";
    if (score >= 60) return "stroke-warning";
    return "stroke-destructive";
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-background border-2 border-border h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        {label}
      </h3>
      
      <div className="flex flex-col items-center flex-1 justify-between">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              className={cn("transition-all duration-1000 ease-out", getGaugeColor(score))}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 8px currentColor)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-5xl font-bold", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground mt-1">/ 100</span>
          </div>
        </div>
        
        <div className="mt-8 w-full space-y-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <span className={cn("font-bold text-lg", getScoreColor(score))}>
                {score >= 80 ? "Low Risk" : score >= 60 ? "Medium Risk" : "High Risk"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-semibold text-sm text-foreground">
                {score >= 80 ? "Verified" : score >= 60 ? "Review Required" : "Action Needed"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-accent/10">
              <div className="text-xs text-muted-foreground mb-1">Layer 1</div>
              <div className="text-sm font-semibold text-accent">Active</div>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <div className="text-xs text-muted-foreground mb-1">Layer 2</div>
              <div className="text-sm font-semibold text-accent">Active</div>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <div className="text-xs text-muted-foreground mb-1">Layer 3</div>
              <div className="text-sm font-semibold text-accent">Active</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

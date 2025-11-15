import { Card } from "@/components/ui/card";
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
    <Card className="p-6 bg-gradient-to-br from-card to-background border-2 border-border">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-6 text-foreground">{label}</h3>
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
        <div className="mt-6 w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Level:</span>
            <span className={cn("font-semibold", getScoreColor(score))}>
              {score >= 80 ? "Low" : score >= 60 ? "Medium" : "High"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

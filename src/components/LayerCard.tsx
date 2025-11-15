import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerCardProps {
  layer: string;
  title: string;
  description: string;
  icon: LucideIcon;
  metrics: {
    label: string;
    value: string;
    status: "active" | "warning" | "success";
  }[];
  status: "active" | "idle" | "processing";
}

export const LayerCard = ({ layer, title, description, icon: Icon, metrics, status }: LayerCardProps) => {
  const statusStyles = {
    active: "border-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    idle: "border-border",
    processing: "border-warning/40 shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  };

  const statusBadge = {
    active: { variant: "default" as const, label: "Active" },
    idle: { variant: "outline" as const, label: "Idle" },
    processing: { variant: "secondary" as const, label: "Processing" },
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-card via-card to-background border-2 transition-all duration-300",
      statusStyles[status]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Badge variant="outline" className="mb-2 text-xs">{layer}</Badge>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
        </div>
        <Badge variant={statusBadge[status].variant}>
          {statusBadge[status].label}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{metric.value}</span>
              <div className={cn(
                "h-2 w-2 rounded-full animate-pulse-glow",
                metric.status === "active" && "bg-primary",
                metric.status === "success" && "bg-accent",
                metric.status === "warning" && "bg-warning"
              )} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

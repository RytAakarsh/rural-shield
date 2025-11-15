import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
    success: "border-accent/20 bg-gradient-to-br from-accent/5 to-transparent",
    warning: "border-warning/20 bg-gradient-to-br from-warning/5 to-transparent",
    danger: "border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-accent",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <Card className={cn("p-6 border-2 transition-all duration-300 hover:scale-105", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={cn("text-sm font-medium flex items-center gap-1", 
              trend.isPositive ? "text-accent" : "text-destructive"
            )}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl bg-card/50 backdrop-blur-sm", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "success",
    title: "Onboarding Approved",
    description: "User #45821 passed all verification layers",
    timestamp: "2 mins ago",
    userId: "45821",
  },
  {
    id: "2",
    type: "danger",
    title: "Deepfake Detected",
    description: "Video KYC failed - synthetic face detected",
    timestamp: "5 mins ago",
    userId: "45892",
  },
  {
    id: "3",
    type: "warning",
    title: "SIM Swap Alert",
    description: "Recent SIM change detected for user #45776",
    timestamp: "12 mins ago",
    userId: "45776",
  },
  {
    id: "4",
    type: "success",
    title: "Transaction Verified",
    description: "₹25,000 transfer cleared all fraud checks",
    timestamp: "18 mins ago",
  },
  {
    id: "5",
    type: "info",
    title: "Behavioral Pattern Updated",
    description: "ML model retrained with new fraud signatures",
    timestamp: "25 mins ago",
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-accent" />;
    case "danger":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "warning":
      return <Shield className="h-5 w-5 text-warning" />;
    default:
      return <Clock className="h-5 w-5 text-primary" />;
  }
};

const getBadgeVariant = (type: Activity["type"]) => {
  switch (type) {
    case "success":
      return "default";
    case "danger":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "outline";
  }
};

export const ActivityFeed = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Live Activity Feed
      </h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-300 hover:bg-muted/50 animate-slide-up",
              "hover:border-primary/30"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {activity.title}
                </h4>
                <Badge variant={getBadgeVariant(activity.type)} className="flex-shrink-0 text-xs">
                  {activity.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{activity.timestamp}</span>
                {activity.userId && (
                  <>
                    <span>•</span>
                    <span>User #{activity.userId}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const getActivityType = (activityType: string): "success" | "warning" | "danger" | "info" => {
  if (activityType.includes('verification') || activityType.includes('passed')) return 'success';
  if (activityType.includes('alert') || activityType.includes('fraud') || activityType.includes('detected')) return 'danger';
  if (activityType.includes('warning') || activityType.includes('suspicious')) return 'warning';
  return 'info';
};

const getActivityIcon = (type: "success" | "warning" | "danger" | "info") => {
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

const getBadgeVariant = (type: "success" | "warning" | "danger" | "info") => {
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

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-background border-2 border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Live Activity Feed
      </h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity logged yet
          </div>
        ) : (
          activities.map((activity, index) => {
            const type = getActivityType(activity.activity_type);
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-300 hover:bg-muted/50 animate-slide-up",
                  "hover:border-primary/30"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <Badge variant={getBadgeVariant(type)} className="flex-shrink-0 text-xs">
                      {type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
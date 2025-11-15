import { Shield, Users, AlertTriangle, TrendingUp, Activity, LogOut } from "lucide-react";
import { StatCard } from "./StatCard";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { ActivityFeed } from "./ActivityFeed";
import { TransactionMonitor } from "./TransactionMonitor";
import { FraudRingDetection } from "./FraudRingDetection";
import { Layer1Panel } from "./Layer1Panel";
import { Layer2Panel } from "./Layer2Panel";
import { Layer3Panel } from "./Layer3Panel";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useRealtimeTrustScore } from "@/hooks/useRealtimeTrustScore";

interface DashboardProps {
  userId: string;
}

export const Dashboard = ({ userId }: DashboardProps) => {
  const { signOut } = useAuth();
  const { trustScores, fraudAlerts, activityLogs, securityLayers } = useDashboardData(userId);
  const realtimeTrustScore = useRealtimeTrustScore(userId);

  // Use real-time trust score if available, otherwise use latest from query
  const latestTrustScore = realtimeTrustScore ?? trustScores?.[0]?.score ?? 87;
  const activeAlerts = fraudAlerts?.filter(alert => alert.status === 'active').length || 0;
  return (
    <section className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Fraud Prevention Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">Real-time monitoring and intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-accent rounded-full animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">System Active</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Users"
            value="12,458"
            icon={Users}
            trend={{ value: "12.5%", isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Fraud Attempts Blocked"
            value={activeAlerts.toString()}
            icon={AlertTriangle}
            trend={{ value: "8.3%", isPositive: false }}
            variant="danger"
          />
          <StatCard
            title="Avg Trust Score"
            value={latestTrustScore.toFixed(1)}
            icon={TrendingUp}
            trend={{ value: "3.2%", isPositive: true }}
            variant="default"
          />
          <StatCard
            title="Verifications Today"
            value="1,893"
            icon={Shield}
            trend={{ value: "15.7%", isPositive: true }}
            variant="success"
          />
        </div>

        {/* Trust Score and Activity - Compact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrustScoreGauge score={latestTrustScore} userId={userId} />
          <ActivityFeed activities={activityLogs || []} />
        </div>

        {/* All Three Verification Layers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Verification Layers
          </h2>
          <p className="text-muted-foreground mb-4">
            Choose any layer to verify - complete them in any order
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Layer1Panel userId={userId} />
            <Layer2Panel userId={userId} />
            <Layer3Panel userId={userId} />
          </div>
        </div>

        {/* Real-Time Monitoring */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Real-Time Intelligence & Monitoring
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FraudRingDetection />
            <TransactionMonitor userId={userId} />
          </div>
        </div>
      </div>
    </section>
  );
};

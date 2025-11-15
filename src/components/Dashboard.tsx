import { Shield, Users, AlertTriangle, TrendingUp, Smartphone, Video, Activity, LogOut } from "lucide-react";
import { StatCard } from "./StatCard";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { ActivityFeed } from "./ActivityFeed";
import { LayerCard } from "./LayerCard";
import { VerificationPanel } from "./VerificationPanel";
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Panel */}
          <div className="lg:col-span-1">
            <VerificationPanel userId={userId} />
          </div>

          {/* Trust Score */}
          <div className="lg:col-span-1">
            <TrustScoreGauge score={latestTrustScore} label="Overall Trust Score" />
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={activityLogs || []} />
          </div>
        </div>

        {/* Security Layers */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Security Layers Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityLayers?.map((layer) => {
              const icons = [Smartphone, Video, Activity];
              const titles = ["Proactive Perimeter", "Secure Core", "Intelligence Fabric"];
              const descriptions = [
                "SIM intelligence & device fingerprinting with real-time risk scoring",
                "Deepfake detection & continuous behavioral authentication",
                "Transaction monitoring & ML-powered anomaly detection"
              ];
              
              const metrics = layer.metrics as any;
              const metricsList = Object.entries(metrics).map(([key, value]) => ({
                label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: String(value),
                status: layer.status as "active" | "success" | "warning"
              }));

              return (
                <LayerCard
                  key={layer.id}
                  layer={`Layer ${layer.layer_number}`}
                  title={titles[layer.layer_number - 1]}
                  description={descriptions[layer.layer_number - 1]}
                  icon={icons[layer.layer_number - 1]}
                  status={layer.status as "active" | "processing" | "warning" | "error" | "idle"}
                  metrics={metricsList}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

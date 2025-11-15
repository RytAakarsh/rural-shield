import { Shield, Users, AlertTriangle, TrendingUp, Smartphone, Video, Activity } from "lucide-react";
import { StatCard } from "./StatCard";
import { TrustScoreGauge } from "./TrustScoreGauge";
import { ActivityFeed } from "./ActivityFeed";
import { LayerCard } from "./LayerCard";

export const Dashboard = () => {
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
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-accent rounded-full animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">System Active</span>
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
            value="247"
            icon={AlertTriangle}
            trend={{ value: "8.3%", isPositive: false }}
            variant="danger"
          />
          <StatCard
            title="Avg Trust Score"
            value="87.5"
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
          {/* Trust Score */}
          <div className="lg:col-span-1">
            <TrustScoreGauge score={87} label="Overall Trust Score" />
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
        </div>

        {/* Security Layers */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Security Layers Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LayerCard
              layer="Layer 1"
              title="Proactive Perimeter"
              description="SIM intelligence & device fingerprinting with real-time risk scoring"
              icon={Smartphone}
              status="active"
              metrics={[
                { label: "SIM Age Checks", value: "1,234", status: "active" },
                { label: "Device Trust Score", value: "92%", status: "success" },
                { label: "Risk Assessments", value: "856", status: "active" },
              ]}
            />
            <LayerCard
              layer="Layer 2"
              title="Secure Core"
              description="Deepfake detection & continuous behavioral authentication"
              icon={Video}
              status="processing"
              metrics={[
                { label: "Liveness Checks", value: "445", status: "active" },
                { label: "Deepfakes Blocked", value: "12", status: "warning" },
                { label: "Biometric Verifications", value: "98.5%", status: "success" },
              ]}
            />
            <LayerCard
              layer="Layer 3"
              title="Intelligence Fabric"
              description="Transaction monitoring & ML-powered anomaly detection"
              icon={Activity}
              status="active"
              metrics={[
                { label: "Transactions Scanned", value: "5.2K", status: "active" },
                { label: "Mule Accounts Detected", value: "8", status: "warning" },
                { label: "ML Confidence", value: "96.3%", status: "success" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

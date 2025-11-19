import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Zap, Lock, Eye } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-slide-up">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Fraud Prevention</span>
          </div>
          
          {/* Heading */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
              FraudShield
            </h1>
            <p className="text-2xl md:text-3xl text-primary font-semibold">
              Multi-Layered Security for Rural Fintech
            </p>
          </div>
          
          {/* Description */}
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Enable secure, inclusive digital onboarding while detecting sophisticated frauds in real-time. 
            Protect your platform from deepfakes, SIM swaps, and synthetic identities.
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 pt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Real-time Detection</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-accent" />
              <span>Multi-Layer Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4 text-secondary" />
              <span>AI-Powered Intelligence</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300"
              onClick={() => {
                const dashboardSection = document.querySelector('[data-dashboard-section]');
                dashboardSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              View Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary/30 hover:bg-primary/10 font-semibold px-8"
              onClick={() => window.open('https://fraudsheild.vercel.app/', '_blank')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

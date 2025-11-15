import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LivenessDetection } from "./LivenessDetection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, Shield, Upload } from "lucide-react";

interface Layer2PanelProps {
  userId: string;
}

export const Layer2Panel = ({ userId }: Layer2PanelProps) => {
  const [showLivenessDialog, setShowLivenessDialog] = useState(false);
  const [showDeepfakeDialog, setShowDeepfakeDialog] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLivenessComplete = (success: boolean) => {
    setShowLivenessDialog(false);
    if (success) {
      toast({
        title: "Liveness Check Complete",
        description: "Face movement verified successfully",
      });
    } else {
      toast({
        title: "Liveness Check Failed",
        description: "Unable to verify face movement",
        variant: "destructive",
      });
    }
  };

  const handleDeepfakeDetection = async () => {
    if (!videoFile) {
      toast({
        title: "No Video Selected",
        description: "Please upload a video for deepfake detection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert video to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Video = (reader.result as string).split(",")[1];

        const { data, error } = await supabase.functions.invoke("detect-deepfake", {
          body: { userId, videoData: base64Video },
        });

        if (error) throw error;

        toast({
          title: "Deepfake Detection Complete",
          description: `Result: ${data.isDeepfake ? "DEEPFAKE DETECTED" : "Authentic"} (Confidence: ${(data.confidence * 100).toFixed(1)}%)`,
          variant: data.isDeepfake ? "destructive" : "default",
        });

        setShowDeepfakeDialog(false);
        setVideoFile(null);
      };

      reader.readAsDataURL(videoFile);
    } catch (error) {
      console.error("Deepfake detection error:", error);
      toast({
        title: "Detection Error",
        description: "Failed to analyze video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Layer 2: Secure Core
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deepfake detection & continuous behavioral authentication
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => setShowLivenessDialog(true)}
                className="w-full"
                variant="default"
              >
                <Shield className="h-4 w-4 mr-2" />
                Start Liveness Detection
              </Button>

              <Button
                onClick={() => setShowDeepfakeDialog(true)}
                className="w-full"
                variant="outline"
              >
                <Video className="h-4 w-4 mr-2" />
                Deepfake Detection
              </Button>
            </div>

            <div className="mt-6 p-4 bg-accent/50 rounded-lg">
              <h4 className="font-semibold mb-2">What Layer 2 Checks:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Real-time liveness detection</li>
                <li>✓ Deepfake video analysis</li>
                <li>✓ Facial movement patterns</li>
                <li>✓ Behavioral biometrics</li>
                <li>✓ Continuous authentication</li>
                <li>✓ Coercion detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liveness Detection Dialog */}
      <Dialog open={showLivenessDialog} onOpenChange={setShowLivenessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Liveness Detection</DialogTitle>
          </DialogHeader>
          <LivenessDetection 
            onComplete={handleLivenessComplete} 
            onCancel={() => setShowLivenessDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Deepfake Detection Dialog */}
      <Dialog open={showDeepfakeDialog} onOpenChange={setShowDeepfakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deepfake Detection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {videoFile ? videoFile.name : "Click to upload video"}
                </p>
              </label>
            </div>

            <Button
              onClick={handleDeepfakeDetection}
              disabled={loading || !videoFile}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Analyze Video"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

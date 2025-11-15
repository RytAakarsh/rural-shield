import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LivenessDetectionProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export const LivenessDetection = ({ onComplete, onCancel }: LivenessDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [instruction, setInstruction] = useState("Click Start to begin liveness detection");
  const [movementDetected, setMovementDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setInstruction("Camera ready! Click 'Start Detection' to begin");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please allow camera permissions.");
      onCancel();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const calculateFrameDifference = (currentFrame: ImageData, previousFrame: ImageData): number => {
    let diff = 0;
    const threshold = 30; // Pixel difference threshold
    
    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const rDiff = Math.abs(currentFrame.data[i] - previousFrame.data[i]);
      const gDiff = Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]);
      const bDiff = Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
      
      if (rDiff > threshold || gDiff > threshold || bDiff > threshold) {
        diff++;
      }
    }
    
    return diff;
  };

  const detectMovement = () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (previousFrameRef.current) {
      const diff = calculateFrameDifference(currentFrame, previousFrameRef.current);
      const movementThreshold = (canvas.width * canvas.height) * 0.02; // 2% of pixels changed

      if (diff > movementThreshold) {
        setMovementDetected(true);
        setInstruction("Great! Movement detected. Keep moving your face...");
      }
    }

    previousFrameRef.current = currentFrame;
    requestAnimationFrame(detectMovement);
  };

  const startDetection = () => {
    setIsDetecting(true);
    setMovementDetected(false);
    setInstruction("Please move your head slowly left and right");
    
    // Start movement detection
    detectMovement();

    // Set timeout for detection (10 seconds)
    detectionTimeoutRef.current = setTimeout(() => {
      completeDetection();
    }, 10000);
  };

  const completeDetection = () => {
    setIsDetecting(false);
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    if (movementDetected) {
      setInstruction("✅ Liveness verified successfully!");
      toast.success("Liveness check passed!");
      setTimeout(() => {
        stopCamera();
        onComplete(true);
      }, 2000);
    } else {
      setInstruction("❌ No sufficient movement detected. Please try again.");
      toast.error("Liveness check failed. Please move your face during detection.");
      setTimeout(() => {
        stopCamera();
        onComplete(false);
      }, 2000);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Liveness Detection
        </CardTitle>
        <CardDescription>{instruction}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isDetecting && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span className="text-white text-sm">Detecting...</span>
              </div>
            </div>
          )}

          {movementDetected && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-green-500/80 px-3 py-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-white" />
                <span className="text-white text-sm">Movement Detected</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {cameraActive && !isDetecting && (
            <Button onClick={startDetection} className="flex-1">
              Start Detection
            </Button>
          )}
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
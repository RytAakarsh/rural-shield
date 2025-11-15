import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface LivenessDetectionProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export const LivenessDetection = ({ onComplete, onCancel }: LivenessDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [instruction, setInstruction] = useState("Click 'Open Camera' to allow camera access");
  const [movementDetected, setMovementDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [movementScore, setMovementScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      setInstruction("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user", 
          width: { ideal: 640 }, 
          height: { ideal: 480 }
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setCameraError(false);
          setInstruction("✅ Camera ready! Click 'Start Detection' to begin");
          toast.success("Camera access granted!");
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(true);
      setInstruction("❌ Camera access denied or unavailable");
      toast.error("Could not access camera. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const calculateFrameDifference = (currentFrame: ImageData, previousFrame: ImageData): number => {
    let diff = 0;
    const threshold = 25; // Lower threshold for better sensitivity
    
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

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectMovement);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (previousFrameRef.current) {
      const diff = calculateFrameDifference(currentFrame, previousFrameRef.current);
      const movementThreshold = (canvas.width * canvas.height) * 0.015; // 1.5% of pixels changed (more sensitive)
      
      const score = Math.min(100, (diff / movementThreshold) * 100);
      setMovementScore(score);

      if (diff > movementThreshold) {
        setMovementDetected(true);
        setInstruction("✅ Great! Movement detected. Keep moving your face...");
      }
    }

    previousFrameRef.current = currentFrame;
    animationFrameRef.current = requestAnimationFrame(detectMovement);
  };

  const startDetection = () => {
    setIsDetecting(true);
    setMovementDetected(false);
    setMovementScore(0);
    setDetectionProgress(0);
    setInstruction("👋 Please move your head slowly left and right");
    
    // Start movement detection
    detectMovement();

    // Progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      setDetectionProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 100);

    // Set timeout for detection (10 seconds)
    detectionTimeoutRef.current = setTimeout(() => {
      clearInterval(progressInterval);
      completeDetection();
    }, 10000);
  };

  const completeDetection = () => {
    setIsDetecting(false);
    setDetectionProgress(100);
    
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (movementDetected && movementScore > 50) {
      setInstruction("✅ Liveness verified successfully!");
      toast.success("Liveness check passed! Face movement confirmed.");
      setTimeout(() => {
        stopCamera();
        onComplete(true);
      }, 2000);
    } else {
      setInstruction("❌ Insufficient movement detected. Please try again.");
      toast.error("Liveness check failed. Please move your head more during detection.");
      setTimeout(() => {
        stopCamera();
        onComplete(false);
      }, 2000);
    }
  };

  useEffect(() => {
    // Do not auto-start camera; request on user gesture for iframe/browser permission compliance
    return () => {
      stopCamera();
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Liveness Detection
        </CardTitle>
        <CardDescription className="text-base font-medium">
          {instruction}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white space-y-4">
                <Video className="h-12 w-12 mx-auto" />
                <p className="text-lg font-medium">Camera is not active</p>
                <p className="text-sm text-muted-foreground">
                  Click the button below to allow camera access.
                </p>
                <Button onClick={startCamera} size="lg" className="mt-2">
                  <Video className="mr-2 h-4 w-4" />
                  Open Camera
                </Button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <p className="text-lg">Camera access denied</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please allow camera permissions in your browser
                </p>
              </div>
            </div>
          )}
          
          {isDetecting && (
            <>
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span className="text-white text-sm font-medium">Detecting...</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 p-3 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Detection Progress</span>
                    <span className="text-white text-sm font-medium">{detectionProgress}%</span>
                  </div>
                  <Progress value={detectionProgress} className="h-2" />
                </div>
              </div>
            </>
          )}

          {movementDetected && isDetecting && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-green-500/90 px-4 py-2 rounded-full backdrop-blur-sm animate-pulse">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white text-sm font-bold">Movement Detected!</span>
              </div>
            </div>
          )}

          {!isDetecting && !cameraError && cameraActive && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-primary/90 p-3 rounded-lg backdrop-blur-sm text-center">
                <p className="text-white text-sm font-medium">
                  Ready for detection. Click Start Detection when ready.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!cameraActive && !cameraError && (
            <Button onClick={startCamera} className="flex-1" size="lg">
              <Video className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
          )}
          {cameraActive && !isDetecting && !cameraError && (
            <Button onClick={startDetection} className="flex-1" size="lg">
              <Video className="mr-2 h-4 w-4" />
              Start Detection
            </Button>
          )}
          {cameraError && (
            <Button onClick={startCamera} className="flex-1" size="lg">
              <Video className="mr-2 h-4 w-4" />
              Retry Camera Access
            </Button>
          )}
          <Button onClick={onCancel} variant="outline" className="flex-1" size="lg">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
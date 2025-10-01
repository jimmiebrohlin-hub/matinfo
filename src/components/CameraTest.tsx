import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

export const CameraTest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<string>("Not started");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    console.log("🛑 Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("Stopped");
  };

  const startCamera = async () => {
    console.log("🎥 Starting camera test...");
    setStatus("Requesting camera access...");
    setError(null);

    try {
      // Request camera with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log("✅ Camera stream obtained");
      console.log("Stream tracks:", stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      
      streamRef.current = stream;
      setStatus("Stream obtained, assigning to video...");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for loadedmetadata
        videoRef.current.onloadedmetadata = async () => {
          console.log("📹 Video metadata loaded");
          console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
          setStatus("Metadata loaded, playing video...");
          
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              console.log("✅ Video playing!");
              setStatus("✅ Camera working!");
            }
          } catch (playError: any) {
            console.error("❌ Play error:", playError);
            setError(`Play failed: ${playError.message}`);
            setStatus("❌ Play failed");
          }
        };

        videoRef.current.onerror = (e) => {
          console.error("❌ Video element error:", e);
          setError("Video element error");
          setStatus("❌ Video error");
        };
      }
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      setError(err.message || "Failed to access camera");
      setStatus("❌ Camera access failed");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        Test Camera
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Camera Test</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded text-sm">
              <p className="font-semibold">Status:</p>
              <p>{status}</p>
              {error && (
                <p className="text-destructive mt-2">Error: {error}</p>
              )}
            </div>

            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={startCamera} size="sm" variant="outline">
                Restart Camera
              </Button>
              <Button onClick={stopCamera} size="sm" variant="outline">
                Stop Camera
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

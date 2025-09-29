import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  autoStart?: boolean;
}

export const BarcodeScanner = ({ onBarcodeDetected, autoStart = false }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(autoStart);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
    }
    
    return () => {
      stopCamera();
    };
  }, []);

  // Effect to start camera when dialog opens
  useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    if (!videoRef.current || !codeReader.current || isScanning) {
      return;
    }

    try {
      setIsScanning(true);
      setCameraError(null);
      
      console.log('🎥 Starting camera...');
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Request camera permissions and stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = 'scale(3)';
        videoRef.current.style.transformOrigin = 'center center';
        
        // Wait for video to be ready before starting decode
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('📹 Video metadata loaded, starting decode...');
              resolve();
            };
          }
        });
        
        // Start decoding with enhanced options
        await codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            // Validate EAN format
            if (/^\d{8,14}$/.test(barcodeText)) {
              console.log(`📷 Valid barcode detected: ${barcodeText}`);
              handleBarcodeDetected(barcodeText);
              return;
            }
          }
          
          // Reduce console noise - only log significant errors
          if (error && !error.name.includes('NotFoundException')) {
            console.warn('Scanner error:', error.name);
          }
        });
        
        console.log('✅ Camera started successfully');
      }
    } catch (err: any) {
      console.error('❌ Error starting camera:', err);
      setIsScanning(false);
      setCameraError(err.message || 'Kunde inte starta kameran');
    }
  };

  const handleBarcodeDetected = (result: string) => {
    onBarcodeDetected(result);
    setIsOpen(false);
    setIsScanning(false);
    if (codeReader.current) {
      codeReader.current.reset();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && codeReader.current) {
      try {
        const result = await codeReader.current.decodeFromImageUrl(URL.createObjectURL(file));
        if (result) {
          handleBarcodeDetected(result.getText());
        } else {
          alert("Ingen EAN-kod hittades i bilden");
        }
      } catch (err) {
        console.error('Error reading barcode from image:', err);
        alert("Kunde inte läsa EAN-kod från bilden");
      }
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    // The useEffect will handle starting/stopping the camera
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        Skanna Produkt
      </Button>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skanna Produkt</DialogTitle>
          </DialogHeader>
          
          {/* Camera view directly without tabs */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {cameraError && (
                <div className="absolute inset-0 bg-background/90 flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-destructive text-sm font-medium mb-2">Kamerafel</p>
                    <p className="text-muted-foreground text-xs">{cameraError}</p>
                  </div>
                </div>
              )}
            </div>
            {!cameraError && (
              <p className="text-sm text-muted-foreground text-center">
                Håll EAN-koden framför kameran för att skanna
              </p>
            )}
            {cameraError && (
              <p className="text-sm text-destructive text-center">
                Kontrollera kameratillstånd och försök igen
              </p>
            )}
            
            {/* Optional file upload as secondary option */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="barcode-image" className="text-sm text-muted-foreground">
                  Eller ladda upp bild:
                </Label>
                <Input
                  id="barcode-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
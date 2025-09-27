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

  useEffect(() => {
    if (!codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
    }
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current || !codeReader.current || isScanning) return;

    try {
      setIsScanning(true);
      
      // Enhanced video constraints for better barcode detection
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 640, max: 1920 },
          height: { ideal: 1080, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 15, max: 30 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      };
      
      // Apply 3x zoom for better detection as requested
      if (videoRef.current) {
        videoRef.current.style.transform = 'scale(3)';
        videoRef.current.style.transformOrigin = 'center center';
      }
      
      // Enhanced scanning with rotation handling and multiple decode attempts
      const decodeOptions = {
        tryHarder: true,
        multiple: false,
        // Comprehensive format support for better EAN detection
        possibleFormats: [
          'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39',
          'ITF', 'CODABAR', 'RSS_14', 'RSS_EXPANDED', 'QR_CODE', 'DATA_MATRIX'
        ]
      };
      
      // Enhanced decoding with rotation handling
      await codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, async (result, error) => {
        if (result) {
          const barcodeText = result.getText();
          // Validate EAN format (should be numeric and proper length)
          if (/^\d{8,14}$/.test(barcodeText)) {
            console.log(`📷 Valid barcode detected: ${barcodeText}`);
            handleBarcodeDetected(barcodeText);
            return;
          } else {
            console.log(`📷 Invalid barcode format: ${barcodeText}`);
          }
        }
        
        // If standard detection fails, try rotation handling
        if (error && videoRef.current && codeReader.current) {
          try {
            // Capture current video frame for rotation attempts
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0);
              
              // Try different rotations: 90, 180, 270 degrees
              const rotations = [90, 180, 270];
              for (const angle of rotations) {
                try {
                  const rotatedCanvas = document.createElement('canvas');
                  const rotatedCtx = rotatedCanvas.getContext('2d');
                  if (rotatedCtx) {
                    // Set canvas dimensions based on rotation
                    if (angle === 90 || angle === 270) {
                      rotatedCanvas.width = canvas.height;
                      rotatedCanvas.height = canvas.width;
                    } else {
                      rotatedCanvas.width = canvas.width;
                      rotatedCanvas.height = canvas.height;
                    }
                    
                    // Apply rotation transformation
                    rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
                    rotatedCtx.rotate((angle * Math.PI) / 180);
                    rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
                    
                    // Try to decode rotated image
                    const rotatedResult = await codeReader.current.decodeFromImageUrl(rotatedCanvas.toDataURL());
                    if (rotatedResult) {
                      const rotatedBarcodeText = rotatedResult.getText();
                      if (/^\d{8,14}$/.test(rotatedBarcodeText)) {
                        console.log(`📷 Valid barcode detected at ${angle}° rotation: ${rotatedBarcodeText}`);
                        handleBarcodeDetected(rotatedBarcodeText);
                        return;
                      }
                    }
                  }
                } catch (rotationError) {
                  // Silently continue to next rotation
                }
              }
            }
          } catch (frameError) {
            // Silently handle frame capture errors
          }
        }
        
        // Suppress most scanning errors to reduce console noise
        if (error && !['NotFoundException', 'ChecksumException', 'FormatException'].includes(error.name)) {
          console.warn('Scanner error:', error.name);
        }
      });
    } catch (err) {
      console.error('Error starting camera:', err);
      setIsScanning(false);
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
    if (!open) {
      setIsScanning(false);
      if (codeReader.current) {
        codeReader.current.reset();
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          // Start camera immediately when dialog opens
          setTimeout(startCamera, 300);
        }}
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
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Håll EAN-koden framför kameran för att skanna
            </p>
            
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
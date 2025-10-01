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

  // Effect to start camera when dialog opens
  useEffect(() => {
    if (isOpen && !isScanning) {
      // Add a small delay to ensure the dialog is fully rendered
      setTimeout(startCamera, 300);
    } else if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
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
      
      // Enhanced video constraints for better barcode detection
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 640, max: 1920 },
          height: { ideal: 1080, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 15, max: 30 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous',
          advanced: [
            { focusMode: 'continuous' },
            { focusDistance: { ideal: 0.1 } },
            { exposureMode: 'continuous' },
            { brightness: { ideal: 0.5 } },
            { contrast: { ideal: 1.2 } }
          ]
        }
      };
      
      // Apply 2x zoom for better detection
      if (videoRef.current) {
        videoRef.current.style.transform = 'scale(2)';
        videoRef.current.style.transformOrigin = 'center center';
      }
      
      // Enhanced scanning with multiple decode attempts and rotation handling
      const decodeOptions = {
        tryHarder: true,
        formats: [
          'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39',
          'ITF', 'CODABAR', 'RSS_14', 'RSS_EXPANDED'
        ],
        multiple: false,
        inverted: true, // Also try inverted colors
        rotation: [0, 90, 180, 270] // Try multiple rotations
      };
      
      // Let ZXing handle camera access with enhanced settings
      await codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const barcodeText = result.getText();
          console.log(`🔍 Raw barcode detected: ${barcodeText}`);
          
          // More flexible EAN validation - allow various barcode formats
          if (/^\d{8,14}$/.test(barcodeText)) {
            console.log(`📷 Valid EAN detected: ${barcodeText}`);
            handleBarcodeDetected(barcodeText);
            return;
          } else {
            console.log(`⚠️ Invalid EAN format: ${barcodeText} (length: ${barcodeText.length})`);
          }
        }
        
        // Log more scanning attempts for debugging
        if (error && error.name === 'NotFoundException') {
          // Reduce noise but still log occasionally
          if (Math.random() < 0.01) { // Log 1% of attempts
            console.log('🔍 Scanning... (no barcode found yet)');
          }
        } else if (error && !['ChecksumException', 'FormatException'].includes(error.name)) {
          console.warn('Scanner error:', error.name, error.message);
        }
      });
      
      console.log('✅ Camera and enhanced scanner started with 2x zoom');
      
    } catch (err: any) {
      console.error('❌ Error starting camera:', err);
      setIsScanning(false);
      setCameraError(err.message || 'Kunde inte starta kameran');
    }
  };

  const handleBarcodeDetected = (result: string) => {
    onBarcodeDetected(result);
    setIsOpen(false);
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
      setCameraError(null);
      setIsScanning(false);
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
        Skanna Produkt
      </Button>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skanna Produkt</DialogTitle>
          </DialogHeader>
          
          {/* Camera view directly without tabs */}
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
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

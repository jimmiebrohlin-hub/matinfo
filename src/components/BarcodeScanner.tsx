import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScanner = ({ onBarcodeDetected }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
      // Use continuous scanning for better detection
      await codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          handleBarcodeDetected(result.getText());
        }
        if (error && !(error.name === 'NotFoundException')) {
          console.error('Error scanning barcode:', error);
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScanner = ({ onBarcodeDetected }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");

  const handleBarcodeDetected = (result: string) => {
    onBarcodeDetected(result);
    setIsOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For image upload, we would need a different library or service
      // For now, we'll just show a message that this feature is coming soon
      alert("Bilduppladdning för streckkodsskanning kommer snart!");
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
        Skanna Streckkod
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skanna Streckkod</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-1" />
              Kamera
            </Button>
            <Button
              variant={activeTab === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("upload")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-1" />
              Ladda upp
            </Button>
          </div>

          {activeTab === "camera" && (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <BarcodeScannerComponent
                  width="100%"
                  height="100%"
                  onUpdate={(err, result) => {
                    if (result) {
                      handleBarcodeDetected(result.getText());
                    }
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Håll streckkoden framför kameran
              </p>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-image">Välj bild med streckkod</Label>
                <Input
                  id="barcode-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Välj en bild som innehåller en streckkod
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
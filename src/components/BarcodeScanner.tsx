import { useState, useRef, useEffect } from "react";
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
                    <Button 
                      onClick={startCamera} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Försök igen
                    </Button>
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

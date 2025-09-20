import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Sparkles } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";
import { OpenFoodFactsService } from "@/services/openFoodFactsService";
import { Product } from "./ProductCard";
import { toast } from "sonner";

interface ManualEanInputProps {
  onProductFound: (product: Product) => void;
  onDiscoverProduct: () => void;
  isDiscovering?: boolean;
}

export const ManualEanInput = ({ onProductFound, onDiscoverProduct, isDiscovering = false }: ManualEanInputProps) => {
  const [ean, setEan] = useState("7315360061503");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!ean.trim()) {
      toast.error("Ange en EAN-kod");
      return;
    }

    // Basic EAN validation (should be 8, 12, 13, or 14 digits)
    const cleanEan = ean.trim().replace(/\D/g, "");
    if (cleanEan.length < 8 || cleanEan.length > 14) {
      toast.error("EAN-koden måste vara mellan 8-14 siffror");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🔍 Searching for product with EAN: ${cleanEan}`);
      const product = await OpenFoodFactsService.getProductByBarcode(cleanEan);
      
      if (product) {
        console.log(`✅ Found product:`, product);
        onProductFound(product);
        toast.success("Produkt hittad!");
        setEan("");
      } else {
        console.log(`❌ No product found for EAN: ${cleanEan}`);
        toast.error("Ingen produkt hittad för denna EAN-kod");
      }
    } catch (error) {
      console.error("Error searching for product:", error);
      toast.error("Ett fel uppstod vid sökning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    setEan(barcode);
    toast.success(`Streckkod skannad: ${barcode}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Ange EAN-kod (t.ex. 7622210507501)"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={!ean.trim() || isLoading}
            className="flex-1"
            variant="fresh"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Söker...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Sök
              </>
            )}
          </Button>
          
          <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
          
          <Button
            onClick={onDiscoverProduct}
            disabled={isDiscovering}
            variant="discover"
          >
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
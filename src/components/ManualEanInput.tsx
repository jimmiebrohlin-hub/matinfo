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
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isManuallyEntered, setIsManuallyEntered] = useState(false);

  const handleSearch = async () => {
    const searchValue = searchInput.trim();
    
    if (!searchValue) {
      toast.error("Ange en EAN-kod eller produktnamn");
      return;
    }

    setIsLoading(true);
    try {
      // Check if input looks like an EAN (numeric, 8-14 digits)
      const isNumeric = /^\d+$/.test(searchValue);
      const isValidEanLength = searchValue.length >= 8 && searchValue.length <= 14;
      
      if (isNumeric && isValidEanLength) {
        console.log(`🔍 Searching for product with EAN: ${searchValue}`);
        const product = await OpenFoodFactsService.getProductByBarcode(searchValue);
        
        if (product) {
          console.log(`✅ Found product:`, product);
          onProductFound(product);
          toast.success("Produkt hittad!");
        } else {
          console.log(`❌ No product found for EAN: ${searchValue}`);
          toast.error("Ingen produkt hittad för denna EAN-kod");
        }
      } else {
        // Search by text
        console.log(`🔍 Searching for products with text: ${searchValue}`);
        const products = await OpenFoodFactsService.searchProductsByText(searchValue);
        
        if (products.length > 0) {
          // Take the first result
          const product = products[0];
          console.log(`✅ Found product by text:`, product);
          onProductFound(product);
          toast.success("Produkt hittad!");
        } else {
          console.log(`❌ No products found for text: ${searchValue}`);
          toast.error("Ingen produkt hittad för denna sökning");
        }
      }
    } catch (error) {
      console.error("Error searching for product:", error);
      toast.error("Ett fel uppstod vid sökning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Only populate input, don't auto-search
    setSearchInput(barcode);
    setIsManuallyEntered(false); // This was scanned, not manually entered
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
            placeholder="Sök produkt eller ange EAN-kod"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsManuallyEntered(true);
            }}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={!searchInput.trim() || isLoading}
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
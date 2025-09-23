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
  eanValue?: string;
  onEanChange?: (ean: string) => void;
}

export const ManualEanInput = ({ onProductFound, onDiscoverProduct, isDiscovering = false, eanValue, onEanChange }: ManualEanInputProps) => {
  const [internalEan, setInternalEan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // Use controlled or uncontrolled mode
  const ean = eanValue !== undefined ? eanValue : internalEan;
  const setEan = onEanChange || setInternalEan;

  const handleSearch = async () => {
    // Prioritize EAN if both fields have values
    const shouldSearchByEan = ean.trim();
    const shouldSearchByText = searchText.trim() && !shouldSearchByEan;
    
    if (!shouldSearchByEan && !shouldSearchByText) {
      toast.error("Ange en EAN-kod eller produktnamn");
      return;
    }

    setIsLoading(true);
    try {
      if (shouldSearchByEan) {
        // Basic EAN validation (should be 8, 12, 13, or 14 digits)
        const cleanEan = ean.trim().replace(/\D/g, "");
        if (cleanEan.length < 8 || cleanEan.length > 14) {
          toast.error("EAN-koden måste vara mellan 8-14 siffror");
          return;
        }

        console.log(`🔍 Searching for product with EAN: ${cleanEan}`);
        const product = await OpenFoodFactsService.getProductByBarcode(cleanEan);
        
        if (product) {
          console.log(`✅ Found product:`, product);
          // Update search text to match found product
          setSearchText(product.product_name_sv || product.product_name || "");
          onProductFound(product);
          toast.success("Produkt hittad!");
        } else {
          console.log(`❌ No product found for EAN: ${cleanEan}`);
          toast.error("Ingen produkt hittad för denna EAN-kod");
        }
      } else {
        // Search by text
        console.log(`🔍 Searching for products with text: ${searchText}`);
        const products = await OpenFoodFactsService.searchProductsByText(searchText);
        
        if (products.length > 0) {
          // Take the first result
          const product = products[0];
          console.log(`✅ Found product by text:`, product);
          // Update EAN field to match found product
          setEan(product.id);
          onProductFound(product);
          toast.success("Produkt hittad!");
        } else {
          console.log(`❌ No products found for text: ${searchText}`);
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
    setEan(barcode);
    toast.success(`Streckkod skannad: ${barcode}`);
    
    // Auto-search after scanning
    setTimeout(async () => {
      const cleanEan = barcode.trim().replace(/\D/g, "");
      if (cleanEan.length >= 8 && cleanEan.length <= 14) {
        setIsLoading(true);
        try {
          const product = await OpenFoodFactsService.getProductByBarcode(cleanEan);
          if (product) {
            // Update search text to match found product
            setSearchText(product.product_name_sv || product.product_name || "");
            onProductFound(product);
            toast.success("Produkt hittad!");
          } else {
            toast.error("Ingen produkt hittad för denna EAN-kod");
          }
        } catch (error) {
          console.error("Error searching for product:", error);
          toast.error("Ett fel uppstod vid sökning");
        } finally {
          setIsLoading(false);
        }
      }
    }, 500);
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
            placeholder="Produkt"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="text"
            placeholder="EAN"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={(!ean.trim() && !searchText.trim()) || isLoading}
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
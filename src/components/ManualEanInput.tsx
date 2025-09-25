import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Sparkles } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";
import { ProductSearchResults } from "./ProductSearchResults";
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
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

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
        // Search by text - show results for user to choose
        console.log(`🔍 Searching for products with text: ${searchValue}`);
        const products = await OpenFoodFactsService.searchProductsByText(searchValue);
        
        if (products.length > 0) {
          // Show top 5 results for user to choose from
          const topResults = products.slice(0, 5);
          setSearchResults(topResults);
          setShowResults(true);
          toast.success(`Hittade ${products.length} produkter`);
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
    // Auto-search when barcode is detected
    setSearchInput(barcode);
    setIsManuallyEntered(false);
    
    // Automatically search for the product
    try {
      console.log(`🔍 Auto-searching for scanned EAN: ${barcode}`);
      const product = await OpenFoodFactsService.getProductByBarcode(barcode);
      
      if (product) {
        console.log(`✅ Found product:`, product);
        onProductFound(product);
        toast.success("Produkt hittad!");
      } else {
        console.log(`❌ No product found for EAN: ${barcode}`);
        toast.error("Ingen produkt hittad för denna EAN-kod");
      }
    } catch (error) {
      console.error("Error auto-searching for scanned product:", error);
      toast.error("Ett fel uppstod vid sökning");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductFound(product);
    setShowResults(false);
    setSearchResults([]);
    toast.success("Produkt vald!");
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchResults([]);
  };

  // Show search results if we have them
  if (showResults && searchResults.length > 0) {
    return (
      <ProductSearchResults
        products={searchResults}
        onProductSelect={handleProductSelect}
        onBack={handleBackToSearch}
        searchQuery={searchInput}
      />
    );
  }

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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProductCard, Product } from "@/components/ProductCard";
import { ProductHistory } from "@/components/ProductHistory";
import { ManualEanInput } from "@/components/ManualEanInput";
import { OpenFoodFactsService } from "@/services/openFoodFactsService";
import { Loader2, Sparkles, ShoppingCart } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productHistory, setProductHistory] = useState<Product[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Predefined products to populate the history
  const PREDEFINED_EANS = [
    "7394376621666", "7310865008060", "20045197", "7313940027000", "7311070008463", "7318690028420", "7340083405655", "7310130006067"
  ];

  // Initialize with predefined + random products
  useEffect(() => {
    const initializeProducts = async () => {
      try {
        console.log("🚀 Initializing product list...");
        
        // Get predefined products
        const predefinedProducts = await OpenFoodFactsService.getProductsByBarcodes(PREDEFINED_EANS);
        console.log(`✅ Found ${predefinedProducts.length} predefined products`);
        
        // Get random products to fill up to 20 total
        const randomProducts: Product[] = [];
        const targetTotal = 12;
        const attempts = Math.max(15, targetTotal - predefinedProducts.length + 5); // Extra attempts for safety
        
        for (let i = 0; i < attempts && (predefinedProducts.length + randomProducts.length) < targetTotal; i++) {
          try {
            const randomProduct = await OpenFoodFactsService.getRandomSwedishProduct();
            if (randomProduct && 
                !predefinedProducts.some(p => p.id === randomProduct.id) &&
                !randomProducts.some(p => p.id === randomProduct.id)) {
              randomProducts.push(randomProduct);
              console.log(`📦 Added random product: ${randomProduct.product_name || randomProduct.id}`);
            }
          } catch (error) {
            console.warn(`Failed to get random product ${i + 1}:`, error);
          }
        }
        
        // Combine and shuffle
        const allProducts = [...predefinedProducts, ...randomProducts];
        const shuffledProducts = allProducts.sort(() => Math.random() - 0.5);
        
        console.log(`🎯 Initialized with ${shuffledProducts.length} products total`);
        setProductHistory(shuffledProducts);
        
      } catch (error) {
        console.error("Error initializing products:", error);
        toast({
          title: "Kunde inte ladda produkter",
          description: "Försök att uppdatera sidan",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeProducts();
  }, [toast]);


  const handleProductFound = (product: Product) => {
    setCurrentProduct(product);
    
    // Add to history if not already present
    const isAlreadyInHistory = productHistory.some(p => p.id === product.id);
    if (!isAlreadyInHistory) {
      setProductHistory(prev => [product, ...prev]);
    }
  };

  const handleProductClick = async (product: Product) => {
    setCurrentProduct(product);
    
    // Optionally refetch the product for the latest data
    try {
      const freshProduct = await OpenFoodFactsService.getProductByBarcode(product.id);
      if (freshProduct) {
        setCurrentProduct(freshProduct);
      }
    } catch (error) {
      console.error("Error refreshing product:", error);
    }
  };

  const handleDiscoverProduct = async () => {
    setIsLoading(true);
    try {
      const product = await OpenFoodFactsService.getRandomSwedishProduct();
      
      if (product) {
        setCurrentProduct(product);
        
        // Add to history if not already present
        const isAlreadyInHistory = productHistory.some(p => p.id === product.id);
        if (!isAlreadyInHistory) {
          setProductHistory(prev => [product, ...prev]);
        }
        
        toast({
          title: "Ny produkt upptäckt! 🇸🇪",
          description: `${product.product_name_sv || product.product_name || "Okänd produkt"}`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Inga produkter hittades",
          description: "Försök igen om ett ögonblick",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error discovering product:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta produktinformation. Försök igen.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <header className="bg-gradient-card backdrop-blur-sm border-b border-border/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Matinfo
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          
          {/* Product Discovery Section */}
          <div className="flex-1 space-y-6">
            {/* Manual EAN Input */}
            <ManualEanInput 
              onProductFound={handleProductFound} 
              onDiscoverProduct={handleDiscoverProduct}
              isDiscovering={isLoading}
            />

            {/* Product Display */}
            <ProductCard product={currentProduct} isLoading={isLoading} />

          </div>

          {/* History Sidebar */}
          <div className="w-full lg:w-80">
            <ProductHistory products={productHistory} onProductClick={handleProductClick} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/20 bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-warm-neutral text-sm">
            Data från Open Food Facts • Upptäck svenska matupplevelser
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

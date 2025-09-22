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
  const [currentEan, setCurrentEan] = useState("7315360061503");

  // Always load these 3 products on app start
  useEffect(() => {
    const loadDefaultProducts = async () => {
      setIsLoading(true);
      try {
        const defaultBarcodes = ["7315360061503", "7340083447532", "7622201727840", "7318690140412", "7310070005441", "6410500090014", "7318690140412", "7310130006067", "4016241050304", "7318690146261", "7350028546411"];
        const loadedProducts: Product[] = [];
        
        // Load the first product and set it as current
        for (const barcode of defaultBarcodes) {
          try {
            const product = await OpenFoodFactsService.getProductByBarcode(barcode);
            if (product) {
              loadedProducts.push(product);
              if (barcode === "7315360061503") {
                setCurrentProduct(product);
                setCurrentEan(barcode);
              }
            }
          } catch (error) {
            console.error(`Error loading product ${barcode}:`, error);
          }
        }
        
        setProductHistory(loadedProducts);
      } catch (error) {
        console.error("Error loading default products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDefaultProducts();
  }, []);

  const handleProductFound = (product: Product) => {
    setCurrentProduct(product);
    setCurrentEan(product.id);
    
    // Add to history if not already present
    const isAlreadyInHistory = productHistory.some(p => p.id === product.id);
    if (!isAlreadyInHistory) {
      setProductHistory(prev => [product, ...prev]);
    }
  };

  const handleProductClick = async (product: Product) => {
    setCurrentEan(product.id);
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
        setCurrentEan(product.id);
        
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
              Svenska Matupptäckaren
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
              eanValue={currentEan}
              onEanChange={setCurrentEan}
            />

            {/* Product Display */}
            <ProductCard product={currentProduct} isLoading={isLoading} />

            {/* Stats */}
            {productHistory.length > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-card backdrop-blur-sm rounded-full shadow-card">
                  <ShoppingCart className="w-5 h-5 text-warm-orange" />
                  <span className="text-foreground font-medium">
                    {productHistory.length} produkter upptäckta
                  </span>
                </div>
              </div>
            )}
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

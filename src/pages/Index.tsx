import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProductCard, Product } from "@/components/ProductCard";
import { ProductHistory } from "@/components/ProductHistory";
import { OpenFoodFactsService } from "@/services/openFoodFactsService";
import { Loader2, Sparkles, ShoppingCart } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productHistory, setProductHistory] = useState<Product[]>([]);

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
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent mb-2">
              Svenska Matupptäckaren
            </h1>
            <p className="text-warm-neutral text-lg max-w-2xl mx-auto">
              Upptäck slumpmässiga svenska livsmedelsprodukter från våra butiker
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          
          {/* Product Discovery Section */}
          <div className="flex-1 space-y-6">
            {/* Discover Button */}
            <div className="text-center">
              <Button
                onClick={handleDiscoverProduct}
                disabled={isLoading}
                variant="discover"
                size="lg"
                className="text-lg px-8 py-4 h-auto animate-bounce-in"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Söker produkt...
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Upptäck Ny Produkt
                  </>
                )}
              </Button>
            </div>

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
            <ProductHistory products={productHistory} />
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";
import { detectProductCategory } from "@/utils/productCategories";

interface ProductSearchResultsProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onBack: () => void;
  searchQuery: string;
}

export const ProductSearchResults = ({ products, onProductSelect, onBack, searchQuery }: ProductSearchResultsProps) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">
            Sökresultat för "{searchQuery}"
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onBack}>
            Tillbaka
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {products.map((product, index) => {
          const { customCategory } = detectProductCategory(
            product.product_name, 
            product.categories, 
            product.brands
          );
          
          return (
            <Card 
              key={product.id || index} 
              className="cursor-pointer hover:shadow-md transition-shadow border"
              onClick={() => onProductSelect(product)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {(product.image_front_url || product.image_url) ? (
                    <img
                      src={product.image_front_url || product.image_url}
                      alt={product.product_name_sv || product.product_name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-fresh rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-warm-neutral">Bild</span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {product.product_name_sv || product.product_name || "Okänd produkt"}
                    </h3>
                    {product.brands && (
                      <p className="text-xs text-warm-neutral truncate mt-1">
                        {product.brands}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-fresh-green/20 text-fresh-green">
                        {customCategory}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {products.length === 0 && (
          <p className="text-warm-neutral text-sm text-center py-4">
            Inga produkter hittades
          </p>
        )}
      </CardContent>
    </Card>
  );
};
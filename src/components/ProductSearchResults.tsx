import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";
import { detectProductCategory } from "@/utils/productCategories";
import { Search, Tag, Building2 } from "lucide-react";

interface ProductSearchResultsProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onBack: () => void;
  searchQuery: string;
  searchMethod?: 'brand' | 'category' | 'fulltext' | 'unknown';
}

const ProductSearchResults = ({ 
  products, 
  onProductSelect, 
  onBack, 
  searchQuery,
  searchMethod = 'unknown'
}: ProductSearchResultsProps) => {
  
  const getSearchMethodInfo = () => {
    switch (searchMethod) {
      case 'brand':
        return {
          icon: <Building2 className="w-4 h-4" />,
          text: "Märkessökning",
          color: "bg-blue-100 text-blue-700"
        };
      case 'category':
        return {
          icon: <Tag className="w-4 h-4" />,
          text: "Kategorisökning",
          color: "bg-purple-100 text-purple-700"
        };
      case 'fulltext':
        return {
          icon: <Search className="w-4 h-4" />,
          text: "Textsökning",
          color: "bg-green-100 text-green-700"
        };
      default:
        return {
          icon: <Search className="w-4 h-4" />,
          text: "Sökning",
          color: "bg-gray-100 text-gray-700"
        };
    }
  };

  const searchInfo = getSearchMethodInfo();

  return (
    <Card className="w-full max-w-md mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">
              Sökresultat för "{searchQuery}"
            </CardTitle>
            {searchMethod !== 'unknown' && (
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs flex items-center gap-1 ${searchInfo.color}`}
                >
                  {searchInfo.icon}
                  {searchInfo.text}
                </Badge>
                <span className="text-xs text-warm-neutral">
                  {products.length} {products.length === 1 ? 'produkt' : 'produkter'}
                </span>
              </div>
            )}
          </div>
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
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-fresh-green/50"
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
                      {searchMethod === 'brand' && product.brands && (
                        <Badge variant="outline" className="text-xs">
                          Märke
                        </Badge>
                      )}
                      {searchMethod === 'category' && (
                        <Badge variant="outline" className="text-xs">
                          Kategori
                        </Badge>
                      )}
                      {searchMethod === 'fulltext' && (
                        <Badge variant="outline" className="text-xs">
                          Text
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {products.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-warm-neutral mx-auto mb-3 opacity-50" />
            <p className="text-warm-neutral text-sm">
              Inga produkter hittades för "{searchQuery}"
            </p>
            <p className="text-xs text-warm-neutral mt-1 opacity-75">
              Försök med ett annat sökord eller märke
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ProductSearchResults };

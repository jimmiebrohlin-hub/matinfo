import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Product } from "./ProductCard";
import { exportProductsToCSV } from "@/utils/csvExport";

interface ProductHistoryProps {
  products: Product[];
}

export const ProductHistory = ({ products }: ProductHistoryProps) => {
  const handleExportCSV = () => {
    exportProductsToCSV(products);
  };

  if (products.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Upptäckta Produkter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-warm-neutral text-sm text-center">
            Inga produkter har upptäckts än
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">
            Upptäckta Produkter
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-warm-orange text-white">
              {products.length}
            </Badge>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 text-xs"
            >
              <Download className="h-3 w-3" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 w-full">
          <div className="p-4 space-y-3">
            {products.map((product, index) => {
              const displayName = product.product_name_sv || product.product_name || "Okänd produkt";
              return (
                <div
                  key={`${product.id}-${index}`}
                  className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    {(product.image_front_url || product.image_url) && (
                      <img
                        src={product.image_front_url || product.image_url}
                        alt={displayName}
                        className="w-12 h-12 object-cover rounded shadow-sm flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {displayName}
                      </h4>
                      {product.brands && (
                        <p className="text-xs text-warm-neutral truncate mt-1">
                          {product.brands}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        EAN: {product.id}
                      </p>
                      {product.nutriscore_grade && (
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs h-5 
                            ${product.nutriscore_grade === 'a' ? 'bg-fresh-green text-white border-fresh-green' : ''}
                            ${product.nutriscore_grade === 'b' ? 'bg-warm-yellow text-white border-warm-yellow' : ''}
                            ${product.nutriscore_grade === 'c' ? 'bg-warm-orange text-white border-warm-orange' : ''}
                            ${['d', 'e'].includes(product.nutriscore_grade) ? 'bg-destructive text-destructive-foreground border-destructive' : ''}
                          `}
                        >
                          {product.nutriscore_grade.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateProductSmartPoints } from "@/utils/smartPointsCalculator";

export interface Product {
  id: string;
  product_name: string;
  product_name_sv?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  categories?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  ingredients_text_sv?: string;
  nutrition_grades?: string;
  energy_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  countries?: string;
  package_weight?: number;
  serving_size?: number;
  pieces_per_package?: number;
}

interface ProductCardProps {
  product: Product | null;
  isLoading?: boolean;
}

export const ProductCard = ({ product, isLoading }: ProductCardProps) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card backdrop-blur-sm animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-muted rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="text-warm-neutral text-lg">
            Klicka på knappen för att upptäcka en slumpmässig svensk livsmedelsprodukt!
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = product.product_name_sv || product.product_name || "Okänd produkt";
  const imageUrl = product.image_front_url || product.image_url;
  const categories = product.categories?.split(',').slice(0, 3) || [];
  
  // Calculate SmartPoints
  const smartPoints = calculateProductSmartPoints(
    product.energy_100g,
    product.saturated_fat_100g,
    product.sugars_100g,
    product.proteins_100g,
    product.serving_size,
    product.package_weight,
    product.pieces_per_package
  );

  // Get category-specific portion measurements
  const getCategoryPortions = (categoriesTags: string[] = []) => {
    const portions: Array<{label: string, amount: number, unit: string}> = [];
    
    // Beverages
    const beverageTags = ['beverages', 'carbonated-drinks', 'sodas', 'colas', 'juices', 'waters', 'plant-milks', 'energy-drinks', 'coffees', 'teas', 'beers', 'wines'];
    if (categoriesTags.some(tag => beverageTags.some(bt => tag.includes(bt)))) {
      portions.push(
        {label: 'Glas', amount: 200, unit: 'ml'},
        {label: 'Burk', amount: 330, unit: 'ml'},
        {label: 'Flaska', amount: 500, unit: 'ml'}
      );
    }
    
    // Sauces/Condiments
    const sauceTags = ['sauces', 'condiments', 'mayonnaises', 'ketchups', 'mustards', 'dressings', 'jams', 'marmalades', 'honeys', 'oils', 'vinegars', 'syrups', 'pestos'];
    if (categoriesTags.some(tag => sauceTags.some(st => tag.includes(st)))) {
      portions.push(
        {label: '1 tsk', amount: 5, unit: 'g'},
        {label: '1 msk', amount: 15, unit: 'g'}
      );
    }
    
    // Dairy/Spreads
const dairyTags = [
  'dairies', 'cheese', 'cheeses', 'yogurt', 'yogurts', 'cream', 'creams',
  'butter', 'butters', 'margarine', 'margarines', 'cottage-cheese', 'cottage-cheeses',
  'fermented-milk', 'fermented-milks', 'fermented-milk-product', 'fermented-milk-products',
  'fermented-cream', 'fermented-creams', 'sour-cream', 'sour-creams',
  'plant-based-yogurt', 'plant-based-yogurts'
];

// Normalize for robust matching
const normalizedTags = categoriesTags.map(tag => tag.toLowerCase().replace(/_/g, '-'));

if (normalizedTags.some(tag =>
  dairyTags.some(dairyTag => tag.includes(dairyTag))
)) {
  portions.push(
    {label: '1 tsk', amount: 5, unit: 'g'},
    {label: '1 msk', amount: 15, unit: 'g'},
    {label: 'En klick', amount: 10, unit: 'g'}
  );
}
    
    return portions;
  };

  const categoryPortions = getCategoryPortions(product.categories_tags);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elevated bg-gradient-card backdrop-blur-sm animate-fade-in hover:shadow-warm transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {displayName}
        </CardTitle>
        {product.brands && (
          <p className="text-warm-neutral font-medium">
            {product.brands}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="w-full md:w-48 flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="w-full h-48 object-cover rounded-lg shadow-card"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gradient-fresh rounded-lg flex items-center justify-center shadow-card">
                <span className="text-warm-neutral text-sm">Ingen bild tillgänglig</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-4">
            {/* 1. SmartPoints & Package Information - Ultra Compact Layout */}
            <>
              <Separator />
              <div>
                {/* Main SmartPoints badge */}
                {smartPoints && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="bg-warm-yellow/20 text-warm-yellow border-warm-yellow/30 px-4 py-1 font-bold">
                      <span className="text-xl">{smartPoints.per100g}</span>
                      <span className="text-sm ml-1">SP/100g</span>
                    </Badge>
                  </div>
                )}

                {/* Ultra compact package info in inline format */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30 text-xs px-2 py-0.5">
                        {smartPoints?.perPackage || '-'}
                      </Badge>
                      <span><strong>Förpackning:</strong> {product.package_weight ? `${product.package_weight}g` : 'Ej tillgänglig'}</span>
                    </div>
                  </div>
                  <div><strong>Antal:</strong> {product.pieces_per_package ? `${product.pieces_per_package} st` : 'Ej tillgänglig'}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30 text-xs px-2 py-0.5">
                        {smartPoints?.perServing || '-'}
                      </Badge>
                      <span><strong>Portion:</strong> {product.serving_size ? `${product.serving_size}g` : 'Ej tillgänglig'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30 text-xs px-2 py-0.5">
                        {smartPoints?.perPiece || '-'}
                      </Badge>
                      <span><strong>Per styck:</strong> {product.pieces_per_package && product.package_weight 
                        ? `${Math.round((product.package_weight / product.pieces_per_package) * 10) / 10}g`
                        : 'Ej tillgänglig'
                      }</span>
                    </div>
                  </div>
                  
                  {/* Category-specific portions */}
                  {categoryPortions.map((portion, index) => {
                    const portionSP = smartPoints ? Math.round((smartPoints.per100g * portion.amount) / 100) : null;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30 text-xs px-2 py-0.5">
                            {portionSP || '-'}
                          </Badge>
                          <span><strong>{portion.label}:</strong> {portion.amount}{portion.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>

            {/* 3. Nutrition Facts */}
            {(product.energy_100g || product.fat_100g || product.sugars_100g || product.salt_100g) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Näringsvärden (per 100g)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.energy_100g && (
                      <div className="flex justify-between">
                        <span>Energi:</span>
                        <span className="font-medium">{Math.round(product.energy_100g)} kJ ({Math.round(product.energy_100g / 4.184)} kcal)</span>
                      </div>
                    )}
                    {product.fat_100g && (
                      <div className="flex justify-between">
                        <span>Fett:</span>
                        <span className="font-medium">{product.fat_100g}g</span>
                      </div>
                    )}
                    {product.saturated_fat_100g && (
                      <div className="flex justify-between">
                        <span>- varav mättat:</span>
                        <span className="font-medium">{product.saturated_fat_100g}g</span>
                      </div>
                    )}
                    {product.sugars_100g && (
                      <div className="flex justify-between">
                        <span>Socker:</span>
                        <span className="font-medium">{product.sugars_100g}g</span>
                      </div>
                    )}
                    {product.salt_100g && (
                      <div className="flex justify-between">
                        <span>Salt:</span>
                        <span className="font-medium">{product.salt_100g}g</span>
                      </div>
                    )}
                    {product.proteins_100g && (
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-medium">{product.proteins_100g}g</span>
                      </div>
                    )}
                    {product.fiber_100g && (
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span className="font-medium">{product.fiber_100g}g</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 4. Ingredients */}
            {(product.ingredients_text_sv || product.ingredients_text) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Ingredienser</h4>
                  <p className="text-sm text-warm-neutral line-clamp-3">
                    {product.ingredients_text_sv || product.ingredients_text}
                  </p>
                </div>
              </>
            )}

            {/* 5. EAN */}
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-warm-neutral">EAN: {product.id}</span>
            </div>

            {/* 6. Categories */}
            {categories.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Kategorier</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="bg-cream text-warm-neutral">
                        {category.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Grades */}
            <div className="flex gap-3 pt-3 border-t border-border/50">
              {product.nutriscore_grade && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Nutri-Score:</span>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${product.nutriscore_grade === 'a' ? 'bg-fresh-green text-white border-fresh-green' : ''}
                      ${product.nutriscore_grade === 'b' ? 'bg-warm-yellow text-white border-warm-yellow' : ''}
                      ${product.nutriscore_grade === 'c' ? 'bg-warm-orange text-white border-warm-orange' : ''}
                      ${['d', 'e'].includes(product.nutriscore_grade) ? 'bg-destructive text-destructive-foreground border-destructive' : ''}
                    `}
                  >
                    {product.nutriscore_grade.toUpperCase()}
                  </Badge>
                </div>
              )}
              
              {product.ecoscore_grade && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Eco-Score:</span>
                  <Badge variant="outline" className="border-fresh-green text-fresh-green">
                    {product.ecoscore_grade.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

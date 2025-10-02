import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { calculateProductEnergyScore } from "@/utils/energyScoreCalculator";
import { detectProductCategory } from "@/utils/productCategories";

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
  energy_kcal_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  countries?: string;
  package_weight?: number;
  serving_size?: number;
  pieces_per_package?: number;
  packaging?: string;
  quantity?: string;
}

interface ProductCardProps {
  product: Product | null;
  isLoading?: boolean;
}

export const ProductCard = ({ product, isLoading }: ProductCardProps) => {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
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
  
  // Calculate energy score with alignment logic for portion and piece sizes
  const energyScore = calculateProductEnergyScore(
    product.energy_100g,
    product.saturated_fat_100g,
    product.sugars_100g,
    product.proteins_100g,
    product.serving_size,
    product.package_weight,
    product.pieces_per_package
  );

  // Align portion and piece sizes if they are very similar (within 10g difference)
  let alignedServingSize = product.serving_size;
  let alignedPieceWeight = product.package_weight && product.pieces_per_package 
    ? product.package_weight / product.pieces_per_package 
    : null;

  if (alignedServingSize && alignedPieceWeight && Math.abs(alignedServingSize - alignedPieceWeight) <= 10) {
    // Use the larger value for both to avoid confusion
    const alignedValue = Math.max(alignedServingSize, alignedPieceWeight);
    alignedServingSize = alignedValue;
    if (product.package_weight && product.pieces_per_package) {
      // Don't actually change the piece calculation, just use aligned serving
    }
  }

  // Get product category using the centralized function
  const categoryResult = detectProductCategory(product.product_name, product.categories, product.brands);
  const { customCategory, specialMeasurements } = categoryResult;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elevated bg-gradient-card backdrop-blur-sm animate-fade-in hover:shadow-warm transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {displayName}
        </CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          {product.brands && (
            <p className="text-warm-neutral font-medium">
              {product.brands}
            </p>
          )}
          <Badge variant="secondary" className="bg-fresh-green/20 text-fresh-green border-fresh-green/30">
            {customCategory}
          </Badge>
        </div>
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
            {/* Energy Score & Measurements */}
            <>
              <Separator />
              <div>
                {/* Standard measurements - always show */}
                <div className="space-y-1 text-sm">
                  {/* 100g - always show */}
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className={`px-3 py-1 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                       <span className="text-xl font-bold">{energyScore?.per100g || '-'}</span>
                       <span className="text-sm ml-1 font-normal">/ 100g</span>
                    </Badge>
                  </div>

                   {/* Package - always show */}
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore && product.package_weight ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                        {energyScore && product.package_weight ? Math.round((energyScore.per100g * product.package_weight) / 100) : '-'}
                     </Badge>
                     <span className={product.package_weight ? '' : 'text-muted-foreground'}>
                       <strong>Förpackning:</strong> {product.package_weight ? Math.round(product.package_weight) + 'g' : 'ej tillgänglig'}
                     </span>
                   </div>

                   {/* Piece - always show */}
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore?.perPiece ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                        {energyScore?.perPiece || '-'}
                     </Badge>
                     <span className={product.pieces_per_package && product.package_weight ? '' : 'text-muted-foreground'}>
                       <strong>Styck:</strong> {product.pieces_per_package && product.package_weight ? Math.round(product.package_weight / product.pieces_per_package) + 'g (' + product.pieces_per_package + ' st)' : 'ej tillgänglig'}
                     </span>
                   </div>

                   {/* Serving - always show */}
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore?.perServing ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                        {energyScore?.perServing || '-'}
                     </Badge>
                      <span className={alignedServingSize ? '' : 'text-muted-foreground'}>
                        <strong>Portion:</strong> {alignedServingSize ? Math.round(alignedServingSize) + 'g' : 'ej tillgänglig'}
                      </span>
                   </div>

                    {/* Category-specific measurements */}
                    
                     {/* Skivbart - visa "en skiva" med olika vikter */}
                     {customCategory === 'Skivbart' && specialMeasurements?.type === 'slice' && (
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                            {energyScore && specialMeasurements.sliceWeight ? Math.round((energyScore.per100g * specialMeasurements.sliceWeight) / 100) : '-'}
                         </Badge>
                         <span>
                           <strong>1 skiva:</strong> {specialMeasurements.sliceWeight}g
                         </span>
                       </div>
                     )}

                     {/* Krämigt - visa tsk, msk, dl */}
                     {customCategory === 'Krämigt' && specialMeasurements?.type === 'spoon' && (
                       <>
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                              {energyScore ? Math.round((energyScore.per100g * 5) / 100) : '-'}
                           </Badge>
                           <span>
                             <strong>1 tsk:</strong> 5g
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                              {energyScore ? Math.round((energyScore.per100g * 15) / 100) : '-'}
                           </Badge>
                           <span>
                             <strong>1 msk:</strong> 15g
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                              {energyScore ? Math.round(energyScore.per100g) : '-'}
                           </Badge>
                           <span>
                             <strong>1 dl:</strong> 100g
                           </span>
                         </div>
                       </>
                     )}

                     {/* Dryck - visa 1 glas (2,5 dl) */}
                     {customCategory === 'Dryck' && specialMeasurements?.type === 'glass' && (
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                            {energyScore ? Math.round((energyScore.per100g * 250) / 100) : '-'}
                         </Badge>
                         <span>
                           <strong>1 glas:</strong> 2,5 dl
                         </span>
                       </div>
                     )}

                     {/* Kokas - visa 2 dl kokt */}
                     {customCategory === 'Kokas' && specialMeasurements?.type === 'cooked' && (
                       <>
                         {specialMeasurements.cookedDensity && specialMeasurements.swellingFactor && (
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                                {energyScore ? Math.round((energyScore.per100g * specialMeasurements.cookedDensity * 2) / (100 * specialMeasurements.swellingFactor)) : '-'}
                             </Badge>
                             <span>
                               <strong>2 dl kokt</strong> (~{specialMeasurements.cookedDensity}g/dl kokt, svällfaktor: {specialMeasurements.swellingFactor}x)
                             </span>
                           </div>
                         )}
                       </>
                     )}

                     {/* Volymvara - visa 1 dl med volymvikt */}
                     {customCategory === 'Volymvara' && specialMeasurements?.type === 'volume' && specialMeasurements.volumeDensity && (
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${energyScore ? 'bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30' : 'bg-muted/50 text-muted-foreground border-muted'}`}>
                            {energyScore ? Math.round((energyScore.per100g * specialMeasurements.volumeDensity) / 100) : '-'}
                         </Badge>
                         <span>
                           <strong>1 dl:</strong> {specialMeasurements.volumeDensity}g
                         </span>
                       </div>
                     )}
                </div>
              </div>
            </>


            {/* Mer info - Combined section */}
            {((product.energy_100g || product.fat_100g || product.sugars_100g || product.salt_100g) || 
              (product.ingredients_text_sv || product.ingredients_text) || 
              categories.length > 0 || 
              (product.nutriscore_grade || product.ecoscore_grade || product.nova_group)) && (
              <>
                <Separator />
                <Collapsible open={isMoreInfoOpen} onOpenChange={setIsMoreInfoOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                    <h4 className="font-semibold text-foreground">Mer info</h4>
                    {isMoreInfoOpen ? (
                      <ChevronDown className="h-4 w-4 text-warm-neutral" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-warm-neutral" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                     
                     {/* EAN + OFF Link */}
                     <div className="pb-2 border-b border-border">
                       <div className="flex items-center justify-between text-xs text-warm-neutral">
                         <span>EAN: {product.id}</span>
                         <a 
                           href={`https://world.openfoodfacts.org/product/${product.id}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-warm-yellow hover:underline"
                         >
                           Visa på OpenFoodFacts →
                         </a>
                       </div>
                     </div>
                     
                     {/* Nutrition Facts */}
                     {(product.energy_100g || product.fat_100g || product.sugars_100g || product.salt_100g) && (
                       <div>
                         <h5 className="font-medium text-foreground mb-2">Näringsvärden (per 100g)</h5>
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
                     )}
                     
                     {/* Ingredients */}
                     {(product.ingredients_text_sv || product.ingredients_text) && (
                       <div>
                         <h5 className="font-medium text-foreground mb-2">Ingredienser</h5>
                         <p className="text-sm text-warm-neutral">
                           {product.ingredients_text_sv || product.ingredients_text}
                         </p>
                       </div>
                     )}
                     
                     {/* Categories */}
                     {categories.length > 0 && (
                       <div>
                         <h5 className="font-medium text-foreground mb-2">Kategorier</h5>
                         <div className="flex flex-wrap gap-2">
                           {categories.map((category, index) => (
                             <Badge key={index} variant="secondary" className="bg-cream text-warm-neutral">
                               {category.trim()}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     )}
                     
                     {/* Betyg (Ratings) */}
                     {(product.nutriscore_grade || product.ecoscore_grade || product.nova_group) && (
                       <div>
                         <h5 className="font-medium text-foreground mb-2">Betyg</h5>
                         <div className="flex flex-wrap gap-2">
                           {product.nutriscore_grade && (
                             <Badge variant="outline" className="bg-fresh-green/10 text-fresh-green border-fresh-green/30">
                               Nutri-Score: {product.nutriscore_grade.toUpperCase()}
                             </Badge>
                           )}
                           {product.ecoscore_grade && (
                             <Badge variant="outline" className="bg-fresh-green/10 text-fresh-green border-fresh-green/30">
                               Eco-Score: {product.ecoscore_grade.toUpperCase()}
                             </Badge>
                           )}
                           {product.nova_group && (
                             <Badge variant="outline" className="bg-warm-yellow/10 text-warm-yellow border-warm-yellow/30">
                               NOVA: {product.nova_group}
                             </Badge>
                           )}
                         </div>
                       </div>
                     )}
                     
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

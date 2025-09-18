export interface SmartPointsCalculation {
  per100g: number;
  perPortion?: number;
  perPiece?: number;
}

export function calculateSmartPoints(
  calories: number,
  saturatedFat: number,
  sugar: number,
  protein: number
): number {
  // WW SmartPoints formula (approximate)
  // Base points from calories
  const caloriePoints = calories / 33;
  
  // Add points from saturated fat
  const fatPoints = saturatedFat * 0.12;
  
  // Add points from sugar
  const sugarPoints = sugar * 0.12;
  
  // Subtract points from protein (capped benefit)
  const proteinDeduction = Math.min(protein * 0.098, caloriePoints * 0.35);
  
  const totalPoints = caloriePoints + fatPoints + sugarPoints - proteinDeduction;
  
  // Minimum is 0 points, always return whole numbers
  return Math.max(0, Math.round(totalPoints));
}

export function calculateProductSmartPoints(
  energy100g?: number,
  saturatedFat100g?: number,
  sugars100g?: number,
  proteins100g?: number,
  portionSize?: number,
  piecesPerPack?: number,
  packWeight?: number
): SmartPointsCalculation | null {
  // Need at least calories to calculate
  if (!energy100g) return null;
  
  // Convert kJ to kcal if needed (assuming energy is in kJ)
  const calories100g = energy100g / 4.184;
  
  const per100g = calculateSmartPoints(
    calories100g,
    saturatedFat100g || 0,
    sugars100g || 0,
    proteins100g || 0
  );
  
  let perPortion: number | undefined;
  if (portionSize) {
    const portionMultiplier = portionSize / 100;
    perPortion = calculateSmartPoints(
      calories100g * portionMultiplier,
      (saturatedFat100g || 0) * portionMultiplier,
      (sugars100g || 0) * portionMultiplier,
      (proteins100g || 0) * portionMultiplier
    );
  }
  
  let perPiece: number | undefined;
  if (piecesPerPack && packWeight) {
    const pieceWeight = packWeight / piecesPerPack;
    const pieceMultiplier = pieceWeight / 100;
    perPiece = calculateSmartPoints(
      calories100g * pieceMultiplier,
      (saturatedFat100g || 0) * pieceMultiplier,
      (sugars100g || 0) * pieceMultiplier,
      (proteins100g || 0) * pieceMultiplier
    );
  }
  
  return {
    per100g,
    perPortion,
    perPiece
  };
}
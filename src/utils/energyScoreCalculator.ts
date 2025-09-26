export interface EnergyScoreCalculation {
  per100g: number;
  perPackage?: number;
  perServing?: number;
  perPiece?: number;
}

export function calculateEnergyScore(
  calories: number,
  saturatedFat: number,
  sugar: number,
  protein: number
): number {
  // Energy score formula (approximate)
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

export function calculateProductEnergyScore(
  energy100g?: number,
  saturatedFat100g?: number,
  sugars100g?: number,
  proteins100g?: number,
  servingSize?: number,
  packageWeight?: number,
  piecesPerPack?: number
): EnergyScoreCalculation | null {
  // Need at least calories to calculate
  if (!energy100g) return null;
  
  // Convert kJ to kcal if needed (assuming energy is in kJ)
  const calories100g = energy100g / 4.184;
  
  const per100g = calculateEnergyScore(
    calories100g,
    saturatedFat100g || 0,
    sugars100g || 0,
    proteins100g || 0
  );
  
  let perPackage: number | undefined;
  if (packageWeight) {
    const packageMultiplier = packageWeight / 100;
    perPackage = calculateEnergyScore(
      calories100g * packageMultiplier,
      (saturatedFat100g || 0) * packageMultiplier,
      (sugars100g || 0) * packageMultiplier,
      (proteins100g || 0) * packageMultiplier
    );
  }
  
  let perServing: number | undefined;
  if (servingSize) {
    const servingMultiplier = servingSize / 100;
    perServing = calculateEnergyScore(
      calories100g * servingMultiplier,
      (saturatedFat100g || 0) * servingMultiplier,
      (sugars100g || 0) * servingMultiplier,
      (proteins100g || 0) * servingMultiplier
    );
  }
  
  let perPiece: number | undefined;
  if (piecesPerPack && packageWeight) {
    const pieceWeight = packageWeight / piecesPerPack;
    const pieceMultiplier = pieceWeight / 100;
    perPiece = calculateEnergyScore(
      calories100g * pieceMultiplier,
      (saturatedFat100g || 0) * pieceMultiplier,
      (sugars100g || 0) * pieceMultiplier,
      (proteins100g || 0) * pieceMultiplier
    );
  }
  
  return {
    per100g,
    perPackage,
    perServing,
    perPiece
  };
}
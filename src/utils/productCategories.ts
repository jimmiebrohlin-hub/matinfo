// Syfte-driven kategorisering för att visa relevanta näringsvärdesberäkningar

export interface ProductCategoryResult {
  customCategory: 'Skivbart' | 'Krämigt' | 'Dryck' | 'Kokas' | 'Volymvara' | 'Standard';
  specialMeasurements?: {
    type: 'slice' | 'spoon' | 'glass' | 'cooked' | 'volume';
    subcategory?: 'Bröd' | 'Ost' | 'Pålägg';
    sliceWeight?: number;
    volumeDensity?: number;
    swellingFactor?: number;
    cookedDensity?: number;
    keyword?: string;
  };
}

// Volymvikter (g/dl) för Volymvara
const VOLUME_DENSITIES: { [key: string]: number } = {
  'vetemjöl': 60,
  'rågmjöl': 55,
  'potatismjöl': 80,
  'socker': 85,
  'strösocker': 85,
  'havregryn': 40,
  'flingor': 40,
  'müsli': 40,
  'kakao': 40,
  'default': 60
};

// Svällfaktorer och kokta densiteter kombinerat för Kokas
const SWELLING_DATA: { [key: string]: { factor: number; density: number } } = {
  'pasta': { factor: 2.5, density: 55 },
  'spaghetti': { factor: 2.5, density: 55 },
  'makaroner': { factor: 2.5, density: 55 },
  'penne': { factor: 2.5, density: 55 },
  'tagliatelle': { factor: 2.5, density: 55 },
  'farfalle': { factor: 2.5, density: 55 },
  'lasagneplattor': { factor: 2.5, density: 55 },
  'nudlar': { factor: 2.5, density: 55 },
  'fusilli': { factor: 2.5, density: 55 },
  'spirali': { factor: 2.5, density: 55 },
  'ris': { factor: 3.0, density: 85 },
  'jasminris': { factor: 3.0, density: 85 },
  'basmatiris': { factor: 3.0, density: 85 },
  'råris': { factor: 3.0, density: 85 },
  'bulgur': { factor: 2.5, density: 85 },
  'couscous': { factor: 2.5, density: 80 },
  'quinoa': { factor: 3.0, density: 85 },
  'linser': { factor: 2.5, density: 80 },
  'bönor': { factor: 2.5, density: 85 }
};

// Generic category strings to ignore (too broad, no signal)
const GENERIC_CATEGORIES = [
  'plant-based foods and beverages',
  'växtbaserad mat och dryck',
  'foods and beverages',
  'pflanzliche lebensmittel und getränke',
  'aliments-et-boissons-d\'origine-végétale',
  'żywność i napoje na bazie roślin',
  'beverages and beverages preparations',
  'getränke und getränkezubereitungen',
  'plant-based foods',
  'växtbaserad mat',
  'aliments-d\'origine-végétale',
  'foods'
];

function normalizeText(text: string): string {
  // Use NFKD Unicode normalization to strip diacritics properly
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase();
}

function filterGenericCategories(categories: string): string {
  let filtered = categories;
  for (const generic of GENERIC_CATEGORIES) {
    const regex = new RegExp(normalizeText(generic), 'gi');
    filtered = filtered.replace(regex, '');
  }
  return filtered;
}

function containsKeyword(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeText(text);
  return keywords.some(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    // Word boundary regex to avoid partial matches
    const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(normalizedText);
  });
}

function containsExclusion(text: string, exclusions: string[]): boolean {
  const normalizedText = normalizeText(text);
  return exclusions.some(exclusion => {
    const normalizedExclusion = normalizeText(exclusion);
    const regex = new RegExp(`\\b${normalizedExclusion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(normalizedText);
  });
}

function containsCategoryString(text: string, categoryStrings: string[]): boolean {
  const normalizedText = normalizeText(text);
  return categoryStrings.some(catStr => {
    const normalizedCat = normalizeText(catStr);
    const regex = new RegExp(`\\b${normalizedCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(normalizedText);
  });
}

function getFirstIngredient(ingredients?: string): string | null {
  if (!ingredients) return null;
  
  // Split by comma and get first ingredient
  const firstIngredient = ingredients.split(',')[0].trim().toLowerCase();
  
  // Clean up percentages and parentheses
  const cleaned = firstIngredient.replace(/\(.*?\)/g, '').replace(/\d+%/g, '').trim();
  
  return cleaned || null;
}

interface CategoryScore {
  category: 'Kokas' | 'Dryck' | 'Volymvara' | 'Skivbart-Bröd' | 'Skivbart-Ost' | 'Skivbart-Pålägg' | 'Krämigt';
  score: number;
  metadata?: any;
}

function scoreCategory(
  productName: string,
  categories: string,
  brands: string,
  ingredients: string,
  keywords: string[],
  coreKeywords: string[],
  categoryStrings: string[],
  exclusions: string[],
  categoryName: string
): number {
  let score = 0;
  
  // Check exclusions first - immediate disqualification
  if (containsExclusion(productName, exclusions) || 
      containsExclusion(categories, exclusions) || 
      containsExclusion(brands, exclusions)) {
    return -1000;
  }
  
  // Product name matches (highest weight)
  if (containsKeyword(productName, keywords)) {
    score += 10;
  }
  if (containsKeyword(productName, coreKeywords)) {
    score += 20; // Extra for core keywords
  }
  
  // Categories matches (medium weight)
  if (containsCategoryString(categories, categoryStrings)) {
    score += 5;
  }
  
  // Brands matches (low weight)
  if (containsKeyword(brands, keywords)) {
    score += 1;
  }
  
  // First ingredient analysis (high weight)
  const firstIngredient = getFirstIngredient(ingredients);
  if (firstIngredient) {
    // For Dryck: water or milk as first ingredient
    if (categoryName === 'Dryck') {
      if (firstIngredient.includes('vatten') || firstIngredient.includes('water')) {
        score += 15;
      } else if (firstIngredient.includes('mjölk') || firstIngredient.includes('mjolk') || 
                 firstIngredient.includes('milk')) {
        score += 12;
      }
    }
    
    // For Skivbart-Bröd: wheat flour as first ingredient
    if (categoryName === 'Skivbart-Bröd') {
      if (firstIngredient.includes('vetemjöl') || firstIngredient.includes('vetemjol') ||
          firstIngredient.includes('wheat flour') || firstIngredient.includes('mjöl') ||
          firstIngredient.includes('mjol')) {
        score += 20;
      }
    }
    
    // For Volymvara: flour as first ingredient
    if (categoryName === 'Volymvara') {
      if (firstIngredient.includes('mjöl') || firstIngredient.includes('mjol') ||
          firstIngredient.includes('flour')) {
        score += 15;
      }
    }
    
    // For Krämigt: milk/cream as first ingredient
    if (categoryName === 'Krämigt') {
      if (firstIngredient.includes('mjölk') || firstIngredient.includes('mjolk') ||
          firstIngredient.includes('milk') || firstIngredient.includes('grädde') ||
          firstIngredient.includes('gradde') || firstIngredient.includes('cream')) {
        score += 15;
      } else if (firstIngredient.includes('vatten') || firstIngredient.includes('water')) {
        score += 8; // Could be sauce
      }
    }
  }
  
  return score;
}

function findVolumeDensityKeyword(text: string): string {
  const normalizedText = normalizeText(text);
  
  const densities = Object.keys(VOLUME_DENSITIES);
  for (const density of densities) {
    if (density !== 'default' && normalizedText.includes(normalizeText(density))) {
      return density;
    }
  }
  
  if (normalizedText.includes('mjol')) {
    return 'default';
  }
  
  return 'default';
}

function findSwellingKeyword(text: string): string {
  const normalizedText = normalizeText(text);
  
  for (const item of Object.keys(SWELLING_DATA)) {
    if (normalizedText.includes(normalizeText(item))) {
      return item;
    }
  }
  
  return 'pasta'; // default
}

export function detectProductCategory(
  productName?: string,
  categories?: string,
  brands?: string,
  ingredients?: string
): ProductCategoryResult {
  const name = productName || '';
  const cats = filterGenericCategories(categories || '');
  const brnd = brands || '';
  const ingr = ingredients || '';

  if (!name && !cats && !brnd) return { customCategory: "Standard" };

  // === SCORING-BASED CATEGORIZATION ===
  const scores: CategoryScore[] = [];

  // 1. KOKAS - Torrvaror som sväller vid kokning
  const kokasKeywords = [
    'pasta', 'spaghetti', 'makaroner', 'penne', 'tagliatelle', 'farfalle', 
    'lasagneplattor', 'nudlar', 'spirali', 'fusilli', 
    'ris', 'jasminris', 'basmatiris', 'råris', 'bulgur', 'couscous', 'quinoa', 'linser', 'bönor'
  ];
  const kokasCoreKeywords = ['spaghetti', 'pasta', 'ris', 'makaroner'];
  const kokasCategoryStrings = ['en:pastas', 'en:rices'];
  const kokasExclusions = [
    'gröt', 'färdigkokt', 'burk', 'konserverad', 'sås', 'risifrutti', 'pudding',
    'kaffe', 'coffee', 'kaffebönor', 'brygg', 'rost'
  ];
  
  const kokasScore = scoreCategory(name, cats, brnd, ingr, kokasKeywords, kokasCoreKeywords, 
                                    kokasCategoryStrings, kokasExclusions, 'Kokas');
  if (kokasScore > 0) {
    scores.push({ category: 'Kokas', score: kokasScore });
  }

  // 2. DRYCK - Flytande produkter som konsumeras i glas
  const dryckKeywords = [
    'dryck', 'läsk', 'juice', 'saft', 'mjölk', 'vatten', 'smoothie', 
    'cider', 'must', 'festis', 'mer', 'trocadero', 'zingo', 'ramlösa', 
    'loka', 'havredryck', 'sojadryck', 'energidryck', 'kaffedryck', 
    'ikaffe', 'beverage', 'drink', 'soda', 'cola', 'cappuccino',
    'lemonade', 'iced tea', 'sports drink', 'energy drink', 'oat drink', 'almond drink'
  ];
  const dryckCoreKeywords = ['mjölk', 'juice', 'läsk', 'vatten'];
  const dryckCategoryStrings = [
    'en:beverages', 'en:drinks', 'en:plant-based beverages', 
    'en:carbonated drinks', 'en:juices', 'drycker'
  ];
  const dryckExclusions = [
    'yoghurt', 'soppa', 'gryta', 'sås', 'olja', 'vinäger', 'matlagningsvin',
    'snacks', 'choklad', 'chocolate', 'kex', 'bröd', 'bageri', 'bulle', 'kaka'
  ];
  
  const dryckScore = scoreCategory(name, cats, brnd, ingr, dryckKeywords, dryckCoreKeywords,
                                    dryckCategoryStrings, dryckExclusions, 'Dryck');
  if (dryckScore > 0) {
    scores.push({ category: 'Dryck', score: dryckScore });
  }

  // 3. VOLYMVARA - Torrvaror med specifik volymvikt
  const volymvaraKeywords = [
    'mjöl', 'vetemjöl', 'rågmjöl', 'graham mjöl', 'socker', 'strösocker',
    'gryn', 'kakao', 'panko', 'ströbröd', 'flingor', 'müsli', 'flour', 'sugar'
  ];
  const volymvaraCoreKeywords = ['mjöl', 'socker', 'flour', 'sugar'];
  const volymvaraCategoryStrings = [
    'en:flours', 'en:cereals', 'en:breakfast-cereals', 'en:breadcrumbs'
  ];
  const volymvaraExclusions = [
    'gröt', 'kaka', 'kex', 'bulle', 'choklad', 'bars',
    'dryck', 'juice', 'mjölk', 'beverage', 'drink'
  ];
  
  const volymvaraScore = scoreCategory(name, cats, brnd, ingr, volymvaraKeywords, volymvaraCoreKeywords,
                                        volymvaraCategoryStrings, volymvaraExclusions, 'Volymvara');
  // Require OFF tag for Volymvara
  if (volymvaraScore > 0 && containsCategoryString(cats, volymvaraCategoryStrings)) {
    scores.push({ category: 'Volymvara', score: volymvaraScore });
  }

  // 4. SKIVBART - Bröd
  const brodKeywords = [
    'bröd', 'limpa', 'knäckebröd', 'tunnbröd', 'formfranska', 'jättefranska', 
    'rågbröd', 'surdegsbröd', 'frökusar', 'rågkusar', 'rågkaka', 'bread', 
    'loaf', 'crispbread', 'franska', 'tortilla', 'baguette', 'pitabröd'
  ];
  const brodCoreKeywords = ['bröd', 'bread', 'limpa'];
  const brodCategoryStrings = [
    'en:breads', 'en:crispbreads', 'en:baguettes', 'en:sliced breads',
    'en:flatbreads'
  ];
  const brodExclusions = ['snacks', 'kex', 'sweet snacks', 'chocolate'];
  
  const brodScore = scoreCategory(name, cats, brnd, ingr, brodKeywords, brodCoreKeywords,
                                   brodCategoryStrings, brodExclusions, 'Skivbart-Bröd');
  if (brodScore > 0) {
    scores.push({ 
      category: 'Skivbart-Bröd', 
      score: brodScore,
      metadata: { subcategory: 'Bröd', sliceWeight: 30 }
    });
  }

  // 4b. SKIVBART - Ost
  const ostKeywords = [
    'ost', 'hårdost', 'prästost', 'herrgårdsost', 'cheddar', 'gouda', 
    'grevé', 'mozzarella', 'cheese'
  ];
  const ostCoreKeywords = ['ost', 'cheese', 'hårdost'];
  const ostCategoryStrings = ['en:cheeses'];
  const ostExclusions = [
    'färskost', 'cream cheese', 'ostkaka', 'cottage cheese', 'keso',
    'cottage cheeses', 'en:cream cheeses', 'fresh cheeses',
    'ricotta', 'feta', 'halloumi'
  ];
  
  const ostScore = scoreCategory(name, cats, brnd, ingr, ostKeywords, ostCoreKeywords,
                                  ostCategoryStrings, ostExclusions, 'Skivbart-Ost');
  if (ostScore > 0) {
    scores.push({ 
      category: 'Skivbart-Ost', 
      score: ostScore,
      metadata: { subcategory: 'Ost', sliceWeight: 10 }
    });
  }

  // 4c. SKIVBART - Pålägg
  const palaggKeywords = [
    'skinka', 'salami', 'kalkon', 'rostbiff', 'korv', 'ham', 'turkey', 
    'prosciutto', 'kycklingbröst', 'kycklingbrōst', 'kycklingfilé', 
    'grillad kyckling', 'chicken breast', 'bacon'
  ];
  const palaggCoreKeywords = ['skinka', 'salami', 'ham'];
  const palaggCategoryStrings = [
    'en:cold-cuts', 'en:salamis', 'en:chickens', 'en:poultries',
    'en:prepared meats', 'sliced bacon'
  ];
  const palaggExclusions = ['leverpastej', 'pastej', 'bredbar', 'köttbullar', 'färs'];
  
  const palaggScore = scoreCategory(name, cats, brnd, ingr, palaggKeywords, palaggCoreKeywords,
                                     palaggCategoryStrings, palaggExclusions, 'Skivbart-Pålägg');
  if (palaggScore > 0) {
    scores.push({ 
      category: 'Skivbart-Pålägg', 
      score: palaggScore,
      metadata: { subcategory: 'Pålägg', sliceWeight: 8 }
    });
  }

  // 5. KRÄMIGT - Produkter som används i små mängder
  const kramiktKeywords = [
    'yoghurt', 'kvarg', 'keso', 'cottage cheese', 'crème fraîche', 
    'creme fraiche', 'gräddfil', 'färskost', 'smör', 'margarin', 
    'leverpastej', 'pastej', 'bredbar', 'majonnäs', 'remoulad', 'dressing', 
    'ketchup', 'senap', 'sås', 'fond', 'buljong', 'sylt', 'marmelad', 
    'honung', 'spread', 'pate', 'sauce', 'mayonnaise', 'yogurt', 'quark', 'creme'
  ];
  const kramiktCoreKeywords = ['yoghurt', 'kvarg', 'smör', 'margarin'];
  const kramiktCategoryStrings = [
    'en:spreads', 'en:yogurts', 'en:fermented-milk-products', 
    'en:sauces', 'en:condiments', 'cottage cheeses', 'en:cream cheeses',
    'dairy desserts', 'fresh cheeses'
  ];
  const kramiktExclusions = [
    'fisk', 'sardiner', 'fiskbullar', 'konserv'
  ];
  
  const kramiktScore = scoreCategory(name, cats, brnd, ingr, kramiktKeywords, kramiktCoreKeywords,
                                      kramiktCategoryStrings, kramiktExclusions, 'Krämigt');
  // Require OFF tag for Krämigt
  if (kramiktScore > 0 && containsCategoryString(cats, kramiktCategoryStrings)) {
    scores.push({ category: 'Krämigt', score: kramiktScore });
  }

  // Find the highest scoring category
  if (scores.length === 0) {
    return { customCategory: "Standard" };
  }

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];

  // Map to result based on winner
  if (winner.category === 'Kokas') {
    const keyword = findSwellingKeyword(name + ' ' + cats);
    const swellingData = SWELLING_DATA[keyword];
    return {
      customCategory: "Kokas",
      specialMeasurements: {
        type: 'cooked',
        swellingFactor: swellingData.factor,
        cookedDensity: swellingData.density,
        keyword: keyword
      }
    };
  }

  if (winner.category === 'Dryck') {
    return {
      customCategory: "Dryck",
      specialMeasurements: {
        type: 'glass'
      }
    };
  }

  if (winner.category === 'Volymvara') {
    const keyword = findVolumeDensityKeyword(name + ' ' + cats);
    const volumeDensity = VOLUME_DENSITIES[keyword];
    return {
      customCategory: "Volymvara",
      specialMeasurements: {
        type: 'volume',
        volumeDensity: volumeDensity,
        keyword: keyword
      }
    };
  }

  if (winner.category.startsWith('Skivbart')) {
    return {
      customCategory: "Skivbart",
      specialMeasurements: {
        type: 'slice',
        subcategory: winner.metadata.subcategory,
        sliceWeight: winner.metadata.sliceWeight
      }
    };
  }

  if (winner.category === 'Krämigt') {
    return {
      customCategory: "Krämigt",
      specialMeasurements: {
        type: 'spoon'
      }
    };
  }

  return { customCategory: "Standard" };
}

// Helper function to calculate nutrition values based on categorization
export function calculateNutritionValues(
  nutritionPer100g: { [key: string]: number },
  categoryResult: ProductCategoryResult
): { [key: string]: { [key: string]: number } } {
  const calculations: { [key: string]: { [key: string]: number } } = {
    per_100g: nutritionPer100g
  };

  const { customCategory, specialMeasurements } = categoryResult;

  // Skivbart calculations
  if (customCategory === 'Skivbart' && specialMeasurements?.sliceWeight) {
    const sliceWeight = specialMeasurements.sliceWeight;
    calculations.per_skiva = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_skiva[key] = value * sliceWeight / 100;
    }
  }

  // Krämigt calculations
  if (customCategory === 'Krämigt' && specialMeasurements?.type === 'spoon') {
    // 1 tsk = 5g
    calculations.per_tsk = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_tsk[key] = value * 5 / 100;
    }
    
    // 1 msk = 15g
    calculations.per_msk = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_msk[key] = value * 15 / 100;
    }
    
    // 1 dl = 100g (for creamy products)
    calculations.per_dl = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_dl[key] = value;
    }
  }

  // Dryck calculations
  if (customCategory === 'Dryck' && specialMeasurements?.type === 'glass') {
    // 1 glas = 2,5 dl = 250g (for liquids, assume density = 1)
    calculations.per_glas_25dl = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_glas_25dl[key] = value * 2.5;
    }
  }

  // Kokas calculations
  if (customCategory === 'Kokas' && specialMeasurements?.type === 'cooked') {
    // 2 dl kokt
    if (specialMeasurements.cookedDensity && specialMeasurements.swellingFactor) {
      const cookedDensity = specialMeasurements.cookedDensity;
      const swellingFactor = specialMeasurements.swellingFactor;
      const dryWeightFor2dlCooked = (cookedDensity * 2) / swellingFactor;
      calculations.per_2dl_kokt = {};
      for (const [key, value] of Object.entries(nutritionPer100g)) {
        calculations.per_2dl_kokt[key] = value * dryWeightFor2dlCooked / 100;
      }
    }
  }

  // Volymvara calculations
  if (customCategory === 'Volymvara' && specialMeasurements?.volumeDensity) {
    const volumeWeight = specialMeasurements.volumeDensity;
    calculations.per_1dl = {};
    for (const [key, value] of Object.entries(nutritionPer100g)) {
      calculations.per_1dl[key] = value * volumeWeight / 100;
    }
  }

  return calculations;
}

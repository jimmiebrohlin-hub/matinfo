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

function normalizeText(text: string): string {
  // Use NFKD Unicode normalization to strip diacritics properly
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase();
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
  brands?: string
): ProductCategoryResult {
  const searchText = [productName, categories, brands]
    .filter(Boolean)
    .join(" ");

  if (!searchText) return { customCategory: "Standard" };

  // === PRIORITETSORDNING FÖR KATEGORISERING ===

  // 1. KOKAS (högst prioritet) - Torrvaror som sväller vid kokning
  const kokasKeywords = [
    'pasta', 'spaghetti', 'makaroner', 'penne', 'tagliatelle', 'farfalle', 
    'lasagneplattor', 'nudlar', 'spirali', 'fusilli', 
    'ris', 'jasminris', 'basmatiris', 'råris', 'bulgur', 'couscous', 'quinoa', 'linser', 'bönor'
  ];
  const kokasCategoryStrings = ['en:pastas', 'en:rices'];
  const kokasExclusions = [
    'gröt', 'färdigkokt', 'burk', 'konserverad', 'sås', 'risifrutti', 'pudding',
    'kaffe', 'coffee', 'kaffebönor', 'brygg', 'rost'
  ];
  
  if (!containsExclusion(searchText, kokasExclusions) && 
      (containsKeyword(searchText, kokasKeywords) || 
       containsCategoryString(searchText, kokasCategoryStrings))) {
    const keyword = findSwellingKeyword(searchText);
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

  // 2. DRYCK - Flytande produkter som konsumeras i glas
  const dryckKeywords = [
    'dryck', 'läsk', 'juice', 'saft', 'mjölk', 'vatten', 'smoothie', 
    'cider', 'must', 'festis', 'mer', 'trocadero', 'zingo', 'ramlösa', 
    'loka', 'havredryck', 'sojadryck', 'energidryck', 'kaffedryck', 
    'ikaffe', 'beverage', 'drink', 'soda', 'cola', 'cappuccino',
    'lemonade', 'iced tea', 'sports drink', 'energy drink', 'oat drink', 'almond drink'
  ];
  const dryckCategoryStrings = [
    'en:beverages', 'en:drinks', 'en:plant-based beverages', 
    'en:carbonated drinks', 'en:juices', 'drycker'
  ];
  const dryckExclusions = [
    'yoghurt', 'soppa', 'gryta', 'sås', 'olja', 'vinäger', 'matlagningsvin',
    'snacks', 'choklad', 'chocolate', 'kex'
  ];
  
  if (!containsExclusion(searchText, dryckExclusions) && 
      (containsKeyword(searchText, dryckKeywords) || 
       containsCategoryString(searchText, dryckCategoryStrings))) {
    return { 
      customCategory: "Dryck",
      specialMeasurements: {
        type: 'glass'
      }
    };
  }

  // 3. VOLYMVARA - Torrvaror med specifik volymvikt (kräver OFF-taggar)
  const volymvaraKeywords = [
    'mjöl', 'vetemjöl', 'rågmjöl', 'graham mjöl', 'socker', 'strösocker',
    'gryn', 'kakao', 'panko', 'ströbröd', 'flingor', 'müsli', 'flour', 'sugar'
  ];
  const volymvaraCategoryStrings = [
    'en:flours', 'en:cereals', 'en:breakfast-cereals', 'en:breadcrumbs'
  ];
  const volymvaraExclusions = [
    'gröt', 'kaka', 'kex', 'bulle', 'choklad', 'bars',
    'dryck', 'juice', 'mjölk', 'beverage', 'drink'
  ];
  
  if (!containsExclusion(searchText, volymvaraExclusions) && 
      containsKeyword(searchText, volymvaraKeywords) &&
      containsCategoryString(searchText, volymvaraCategoryStrings)) {
    const keyword = findVolumeDensityKeyword(searchText);
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

  // 4. SKIVBART - Bröd (högst prioritet inom skivbart)
  // 4a. Bröd - visa "en skiva (30g)"
  const brodKeywords = [
    'bröd', 'limpa', 'knäckebröd', 'tunnbröd', 'formfranska', 'jättefranska', 
    'rågbröd', 'surdegsbröd', 'frökusar', 'rågkusar', 'rågkaka', 'bread', 
    'loaf', 'crispbread', 'franska', 'tortilla', 'baguette', 'pitabröd'
  ];
  const brodCategoryStrings = [
    'en:breads', 'en:crispbreads', 'en:baguettes', 'en:sliced breads',
    'en:flatbreads'
  ];
  const brodExclusions = ['snacks', 'kex', 'sweet snacks', 'chocolate'];
  
  if (!containsExclusion(searchText, brodExclusions) &&
      (containsKeyword(searchText, brodKeywords) || 
       containsCategoryString(searchText, brodCategoryStrings))) {
    return { 
      customCategory: "Skivbart",
      specialMeasurements: {
        type: 'slice',
        subcategory: 'Bröd',
        sliceWeight: 30
      }
    };
  }

  // 4b. Ost - visa "en skiva (10g)"
  const ostKeywords = [
    'ost', 'hårdost', 'prästost', 'herrgårdsost', 'cheddar', 'gouda', 
    'grevé', 'mozzarella', 'cheese'
  ];
  const ostCategoryStrings = ['en:cheeses'];
  const ostExclusions = [
    'färskost', 'cream cheese', 'ostkaka', 'cottage cheese', 'keso',
    'cottage cheeses', 'en:cream cheeses', 'fresh cheeses',
    'ricotta', 'feta', 'halloumi'
  ];
  
  if (!containsExclusion(searchText, ostExclusions) && 
      (containsKeyword(searchText, ostKeywords) || 
       containsCategoryString(searchText, ostCategoryStrings))) {
    return { 
      customCategory: "Skivbart",
      specialMeasurements: {
        type: 'slice',
        subcategory: 'Ost',
        sliceWeight: 10
      }
    };
  }

  // 4c. Pålägg - visa "en skiva (8g)"
  const palaggKeywords = [
    'skinka', 'salami', 'kalkon', 'rostbiff', 'korv', 'ham', 'turkey', 
    'prosciutto', 'kycklingbröst', 'kycklingbrōst', 'kycklingfilé', 
    'grillad kyckling', 'chicken breast', 'bacon'
  ];
  const palaggCategoryStrings = [
    'en:cold-cuts', 'en:salamis', 'en:chickens', 'en:poultries',
    'en:prepared meats', 'sliced bacon'
  ];
  const palaggExclusions = ['leverpastej', 'pastej', 'bredbar', 'köttbullar', 'färs'];
  
  if (!containsExclusion(searchText, palaggExclusions) && 
      (containsKeyword(searchText, palaggKeywords) || 
       containsCategoryString(searchText, palaggCategoryStrings))) {
    return { 
      customCategory: "Skivbart",
      specialMeasurements: {
        type: 'slice',
        subcategory: 'Pålägg',
        sliceWeight: 8
      }
    };
  }

  // 5. KRÄMIGT - Produkter som används i små mängder (kräver OFF-taggar)
  const kramiktKeywords = [
    'yoghurt', 'kvarg', 'keso', 'cottage cheese', 'crème fraîche', 
    'creme fraiche', 'gräddfil', 'färskost', 'smör', 'margarin', 
    'leverpastej', 'pastej', 'bredbar', 'majonnäs', 'remoulad', 'dressing', 
    'ketchup', 'senap', 'sås', 'fond', 'buljong', 'sylt', 'marmelad', 
    'honung', 'spread', 'pate', 'sauce', 'mayonnaise', 'yogurt', 'quark', 'creme'
  ];
  const kramiktCategoryStrings = [
    'en:spreads', 'en:yogurts', 'en:fermented-milk-products', 
    'en:sauces', 'en:condiments', 'cottage cheeses', 'en:cream cheeses',
    'dairy desserts', 'fresh cheeses'
  ];
  const kramiktExclusions = [
    'fisk', 'sardiner', 'fiskbullar', 'konserv'
  ];
  
  if (!containsExclusion(searchText, kramiktExclusions) &&
      (containsKeyword(searchText, kramiktKeywords) || 
       containsCategoryString(searchText, kramiktCategoryStrings)) &&
      containsCategoryString(searchText, kramiktCategoryStrings)) {
    return { 
      customCategory: "Krämigt",
      specialMeasurements: {
        type: 'spoon'
      }
    };
  }


  // 6. STANDARD - Inga specialberäkningar
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
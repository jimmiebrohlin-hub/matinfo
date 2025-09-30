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
  'havregryn': 40,
  'flingor': 40,
  'müsli': 40,
  'kakao': 40,
  'default': 60
};

// Svällfaktorer för Kokas (viktökning vid kokning)
const SWELLING_FACTORS: { [key: string]: number } = {
  'pasta': 2.5,
  'nudlar': 2.5,
  'spaghetti': 2.5,
  'makaroner': 2.5,
  'ris': 3.0,
  'bulgur': 2.5,
  'couscous': 2.5,
  'quinoa': 3.0,
  'linser': 2.5,
  'bönor': 2.5
};

// Kokta densiteter (g/dl) för Kokas
const COOKED_DENSITIES: { [key: string]: number } = {
  'pasta': 55,
  'nudlar': 55,
  'spaghetti': 55,
  'makaroner': 55,
  'ris': 85,
  'bulgur': 85,
  'couscous': 80,
  'quinoa': 75,
  'linser': 80,
  'bönor': 85
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
      return normalizedText.includes(normalizedKeyword);
    });
}

function containsExclusion(text: string, exclusions: string[]): boolean {
  const normalizedText = normalizeText(text);
  return exclusions.some(exclusion => 
    normalizedText.includes(normalizeText(exclusion))
  );
}

function containsCategoryString(text: string, categoryStrings: string[]): boolean {
  const normalizedText = normalizeText(text);
  return categoryStrings.some(catStr => 
    normalizedText.includes(normalizeText(catStr))
  );
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
  
  const factors = Object.keys(SWELLING_FACTORS);
  for (const factor of factors) {
    if (normalizedText.includes(normalizeText(factor))) {
      return factor;
    }
  }
  
  return 'pasta';
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

  // 1. Skivbart - Produkter som konsumeras i skivor
  
  // 1a. Bröd - visa "en skiva (30g)"
  const brodKeywords = [
    'bröd', 'limpa', 'knäckebröd', 'tunnbröd', 'formfranska', 'jättefranska', 
    'rågbröd', 'surdegsbröd', 'frökusar', 'rågkusar', 'rågkaka', 'bread', 
    'loaf', 'crispbread', 'franska'
  ];
  const brodCategoryStrings = [
    'en:breads', 'en:crispbreads', 'en:baguettes', 'en:sliced breads'
  ];
  
  if (containsKeyword(searchText, brodKeywords) || 
      containsCategoryString(searchText, brodCategoryStrings)) {
    return { 
      customCategory: "Skivbart",
      specialMeasurements: {
        type: 'slice',
        subcategory: 'Bröd',
        sliceWeight: 30
      }
    };
  }

  // 1b. Ost - visa "en skiva (10g)"
  const ostKeywords = [
    'ost', 'hårdost', 'prästost', 'herrgårdsost', 'cheddar', 'gouda', 
    'grevé', 'mozzarella', 'cheese'
  ];
  const ostCategoryStrings = ['en:cheeses'];
  const ostExclusions = ['färskost', 'cream cheese', 'ostkaka', 'cottage cheese', 'keso'];
  
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

  // 1c. Pålägg - visa "en skiva (8g)"
  const palaggKeywords = [
    'skinka', 'salami', 'kalkon', 'rostbiff', 'korv', 'ham', 'turkey', 
    'prosciutto', 'kycklingbröst', 'kycklingbrōst', 'kycklingfilé', 
    'grillad kyckling', 'chicken breast'
  ];
  const palaggCategoryStrings = [
    'en:cold-cuts', 'en:salamis', 'en:chickens', 'en:poultries'
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

  // 2. Krämigt - Produkter som används i små mängder (1 tsk 5g, 1 msk 15g, 1 dl 100g)
  const kramiktKeywords = [
    'yoghurt', 'kvarg', 'keso', 'cottage cheese', 'crème fraîche', 
    'creme fraiche', 'gräddfil', 'färskost', 'smör', 'margarin', 
    'leverpastej', 'pastej', 'bredbar', 'majonnäs', 'remoulad', 'dressing', 
    'ketchup', 'senap', 'sås', 'fond', 'buljong', 'sylt', 'marmelad', 
    'honung', 'spread', 'pate', 'sauce', 'mayonnaise', 'yogurt', 'quark', 'creme'
  ];
  const kramiktCategoryStrings = [
    'en:spreads', 'en:yogurts', 'en:fermented-milk-products', 
    'en:sauces', 'en:condiments', 'en:cottage-cheeses', 'en:fresh-cheeses'
  ];
  
  if (containsKeyword(searchText, kramiktKeywords) || 
      containsCategoryString(searchText, kramiktCategoryStrings)) {
    return { 
      customCategory: "Krämigt",
      specialMeasurements: {
        type: 'spoon'
      }
    };
  }

  // 3. Dryck - Flytande produkter (1 glas 2 dl)
  const dryckKeywords = [
    'dryck', 'läsk', 'juice', 'saft', 'mjölk', 'vatten', 'smoothie', 
    'cider', 'must', 'festis', 'mer', 'trocadero', 'zingo', 'ramlösa', 
    'loka', 'havredryck', 'sojadryck', 'energidryck', 'kaffedryck', 
    'ikaffe', 'beverage', 'drink', 'soda'
  ];
  const dryckCategoryStrings = [
    'en:beverages', 'en:drinks', 'en:plant-based beverages', 
    'en:carbonated drinks', 'en:juices'
  ];
  const dryckExclusions = [
    'yoghurt', 'soppa', 'gryta', 'sås', 'olja', 'vinäger', 'matlagningsvin'
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

  // 4. Kokas - Torrvaror som sväller vid kokning (100g torrt, 100g kokt, 1 dl kokt)
  const kokasKeywords = [
    'pasta', 'spaghetti', 'makaroner', 'nudlar', 'spirali', 'ris', 
    'bulgur', 'couscous', 'quinoa', 'linser', 'bönor'
  ];
  const kokasExclusions = [
    'gröt', 'färdigkokt', 'burk', 'konserverad', 'sås', 'risifrutti'
  ];
  
  if (!containsExclusion(searchText, kokasExclusions) && 
      containsKeyword(searchText, kokasKeywords)) {
    const keyword = findSwellingKeyword(searchText);
    const swellingFactor = SWELLING_FACTORS[keyword];
    const cookedDensity = COOKED_DENSITIES[keyword];
    
    return { 
      customCategory: "Kokas",
      specialMeasurements: {
        type: 'cooked',
        swellingFactor: swellingFactor,
        cookedDensity: cookedDensity,
        keyword: keyword
      }
    };
  }

  // 5. Volymvara - Torrvaror med specifik volymvikt (1 dl med korrekt volymvikt)
  const volymvaraKeywords = [
    'mjöl', 'vetemjöl', 'rågmjöl', 'graham mjöl', 'socker', 'gryn', 
    'kakao', 'panko', 'ströbröd', 'flingor', 'müsli', 'flour', 'sugar'
  ];
  const volymvaraExclusions = ['gröt', 'kaka', 'kex', 'bulle', 'choklad'];
  
  if (!containsExclusion(searchText, volymvaraExclusions) && 
      containsKeyword(searchText, volymvaraKeywords)) {
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

  // 6. Standard - Inga specialberäkningar
  return { customCategory: "Standard" };
}
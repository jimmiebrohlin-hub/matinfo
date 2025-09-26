// Product category detection utility with prioritized waterfall logic

export interface ProductCategoryResult {
  customCategory: string;
  conversionData?: {
    type: 'volume' | 'swelling';
    factor: number;
    keyword?: string;
  };
}

// Volume conversion data (g/dl)
const VOLUME_CONVERSIONS: { [key: string]: number } = {
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

// Swelling factor data (weight increase when cooked)
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

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e');
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

function findVolumeConversionKeyword(text: string): string {
  const normalizedText = normalizeText(text);
  
  // Check for specific conversion keywords
  const conversions = Object.keys(VOLUME_CONVERSIONS);
  for (const conversion of conversions) {
    if (conversion !== 'default' && normalizedText.includes(normalizeText(conversion))) {
      return conversion;
    }
  }
  
  // Check for mjöl (flour) as default
  if (normalizedText.includes('mjol')) {
    return 'default';
  }
  
  return 'default';
}

function findSwellingFactorKeyword(text: string): string {
  const normalizedText = normalizeText(text);
  
  // Check for specific swelling keywords
  const factors = Object.keys(SWELLING_FACTORS);
  for (const factor of factors) {
    if (normalizedText.includes(normalizeText(factor))) {
      return factor;
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

  if (!searchText) return { customCategory: "Övrigt" };

  // 1. Identify Dryck (Beverages)
  const dryckKeywords = [
    'dryck', 'läsk', 'juice', 'saft', 'mjölk', 'vatten', 'smoothie', 'cider', 
    'must', 'festis', 'mer', 'trocadero', 'zingo', 'ramlösa', 'loka', 
    'havredryck', 'sojadryck', 'energidryck', 'kaffedryck', 'ikaffe', 
    'beverage', 'drink', 'soda'
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
    return { customCategory: "Dryck" };
  }

  // 2. Identify Krämigt & Bredbart (Spoonable & Spreads)
  const kramiktKeywords = [
    'yoghurt', 'kvarg', 'keso', 'cottage cheese', 'crème fraîche', 'creme fraiche', 'gräddfil', 
    'färskost', 'smör', 'margarin', 'leverpastej', 'pastej', 'bredbar', 
    'majonnäs', 'remoulad', 'dressing', 'ketchup', 'senap', 'sås', 'fond', 
    'buljong', 'sylt', 'marmelad', 'honung', 'spread', 'pate', 'sauce', 
    'mayonnaise', 'yogurt', 'quark'
  ];
  const kramiktCategoryStrings = [
    'en:spreads', 'en:yogurts', 'en:fermented-milk-products', 
    'en:sauces', 'en:condiments', 'en:cottage-cheeses', 'en:fresh-cheeses'
  ];

  if (containsKeyword(searchText, kramiktKeywords) || 
      containsCategoryString(searchText, kramiktCategoryStrings)) {
    return { customCategory: "Krämigt & Bredbart" };
  }

  // 3. Identify Ost (Cheese)
  const ostKeywords = [
    'ost', 'hårdost', 'prästost', 'herrgårdsost', 'cheddar', 'gouda', 
    'grevé', 'mozzarella', 'cheese'
  ];
  const ostCategoryStrings = ['en:cheeses'];
  const ostExclusions = ['färskost', 'cream cheese', 'ostkaka', 'cottage cheese', 'keso'];

  if (!containsExclusion(searchText, ostExclusions) && 
      (containsKeyword(searchText, ostKeywords) || 
       containsCategoryString(searchText, ostCategoryStrings))) {
    return { customCategory: "Ost" };
  }

  // 4. Identify Pålägg (skivat) (Sliced Cold Cuts)
  const palaggKeywords = [
    'skinka', 'salami', 'kalkon', 'rostbiff', 'korv', 'ham', 'turkey', 'prosciutto',
    'kycklingbröst', 'kycklingbrōst', 'kycklingfilé', 'grillad kyckling', 'chicken breast'
  ];
  const palaggCategoryStrings = ['en:cold-cuts', 'en:salamis', 'en:chickens', 'en:poultries'];
  const palaggExclusions = ['leverpastej', 'pastej', 'bredbar', 'köttbullar', 'färs'];

  if (!containsExclusion(searchText, palaggExclusions) && 
      (containsKeyword(searchText, palaggKeywords) || 
       containsCategoryString(searchText, palaggCategoryStrings))) {
    return { customCategory: "Pålägg (skivat)" };
  }

  // 5. Identify Bröd (Bread)
  const brodKeywords = [
    'bröd', 'limpa', 'knäckebröd', 'tunnbröd', 'formfranska', 'jättefranska', 'rågbröd', 
    'surdegsbröd', 'frökusar', 'rågkusar', 'rågkaka', 'bread', 'loaf', 'crispbread', 'franska'
  ];
  const brodCategoryStrings = ['en:breads', 'en:crispbreads', 'en:baguettes', 'en:sliced breads'];

  if (containsKeyword(searchText, brodKeywords) || 
      containsCategoryString(searchText, brodCategoryStrings)) {
    return { customCategory: "Bröd" };
  }

  // 6. Identify Torrvara (volym) (Dry Goods by Volume)
  const torrvaraVolymKeywords = [
    'mjöl', 'vetemjöl', 'rågmjöl', 'graham mjöl', 'socker', 'gryn', 'kakao', 'panko', 'ströbröd', 'flingor', 
    'müsli', 'flour', 'sugar'
  ];
  const torrvaraVolymExclusions = ['gröt', 'kaka', 'kex', 'bulle', 'choklad'];

  if (!containsExclusion(searchText, torrvaraVolymExclusions) && 
      containsKeyword(searchText, torrvaraVolymKeywords)) {
    const conversionKeyword = findVolumeConversionKeyword(searchText);
    const factor = VOLUME_CONVERSIONS[conversionKeyword];
    return { 
      customCategory: "Torrvara (volym)",
      conversionData: {
        type: 'volume',
        factor: factor,
        keyword: conversionKeyword
      }
    };
  }

  // 7. Identify Torrvara (sväller vid kokning) (Dry Goods - Swells When Cooked)
  const torrvaraSwellKeywords = [
    'pasta', 'spaghetti', 'makaroner', 'nudlar', 'spirali', 'ris', 'bulgur', 'couscous', 
    'quinoa', 'linser', 'bönor'
  ];
  const torrvaraSwellExclusions = [
    'gröt', 'färdigkokt', 'burk', 'konserverad', 'sås', 'risifrutti'
  ];

  if (!containsExclusion(searchText, torrvaraSwellExclusions) && 
      containsKeyword(searchText, torrvaraSwellKeywords)) {
    const swellKeyword = findSwellingFactorKeyword(searchText);
    const factor = SWELLING_FACTORS[swellKeyword];
    return { 
      customCategory: "Torrvara (sväller vid kokning)",
      conversionData: {
        type: 'swelling',
        factor: factor,
        keyword: swellKeyword
      }
    };
  }

  // 8. Default: Assign Övrigt (Other)
  return { customCategory: "Övrigt" };
}
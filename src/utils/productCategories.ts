// Product category detection utility with extensive Swedish and English keywords

export interface ProductCategoryKeywords {
  name: string;
  keywords: string[];
  exclusions?: string[];
  categoryStrings: string[];
}

export const PRODUCT_CATEGORIES: ProductCategoryKeywords[] = [
  {
    name: "Dryck",
    keywords: [
      // Primary Swedish terms
      "dryck", "drycker", "läsk", "läskedryck", "juice", "saft", "mjölk", 
      "vatten", "mineralvatten", "kolsyrat vatten", "sodavatten", "sportdryck", 
      "energidryck", "energi-dryck",
      
      // Plant-based drinks
      "havredryck", "havre-dryck", "sojadryck", "soja-dryck", "mandeldryck", 
      "mandel-dryck", "risdryck", "ris-dryck", "växtdryck", "växt-dryck", 
      "växtbaserad dryck", "växtbaserade drycker",
      
      // Specific beverages
      "apelsinjuice", "äppeljuice", "smoothie", "smoothies", "lemonad", "must", 
      "julmust", "cider", "tonic", "nektar", "fruktsoppa",
      
      // Brand terms
      "coca-cola", "cocacola", "pepsi", "fanta", "sprite", "pucko", "ramlösa", 
      "loka", "zingo", "trocadero", "festis", "mer",
      
      // English terms
      "beverage", "beverages", "drink", "drinks", "soda", "juice", "milk", 
      "water", "mineral water", "sparkling water", "carbonated water", 
      "sports drink", "energy drink", "plant milk", "oat drink", "soy drink",
      "almond drink", "rice drink", "plant-based drink"
    ],
    exclusions: [
      // Condiments and non-beverages
      "olja", "oljer", "vinäger", "sås", "såser", "buljong", "fond", "soppa", 
      "soppor", "oil", "oils", "vinegar", "sauce", "sauces", "broth", "stock", 
      "soup", "soups"
    ],
    categoryStrings: [
      "beverages", "boissons", "drinks", "plant-based beverages", "en:beverages", 
      "en:plant-based beverages", "en:carbonated drinks", "en:juices", "en:waters", 
      "en:plant-milks", "drycker", "läskedrycker"
    ]
  },
  {
    name: "Kaffe",
    keywords: [
      "kaffe", "bryggkaffe", "snabbkaffe", "instantkaffe", "espresso", "cappuccino", 
      "latte", "kaffebönor", "kaffepulver", "kaffekapsel", "kaffekapslar", 
      "kaffepads", "ikaffe", "coffee", "instant coffee", "ground coffee", 
      "coffee beans", "coffee powder", "coffee capsule", "coffee capsules", 
      "coffee pods"
    ],
    categoryStrings: [
      "en:coffees", "en:coffee", "cafés", "kaffi", "kahvi", "kaffe"
    ]
  },
  {
    name: "Mejeri",
    keywords: [
      // Liquid dairy
      "mjölk", "yoghurt", "yogurt", "fil", "filmjölk", "gräddfil", "crème fraiche", 
      "creme fraiche", "grädde", "kvarg", "keso", "cottage cheese", "kesocottage",
      
      // Spreadable dairy
      "smör", "margarin", "färskost", "cream cheese", "philadelphia", "bregott", 
      "messmör", "smörgåsmargarin",
      
      // Hard cheese
      "ost", "ostar", "hårdost", "mozzarella", "cheddar", "gouda", "parmesan", 
      "grevé", "hushållsost", "prästost", "herrgård", "västerbotten", "gräddost",
      
      // English terms
      "milk", "sour cream", "cream", "quark", "butter", "margarine", "cheese", 
      "hard cheese", "soft cheese"
    ],
    categoryStrings: [
      "en:dairies", "dairy", "en:fermented-milk-products", "en:cheeses", 
      "en:butters", "mejeriprodukter", "mejeri", "mjölkprodukter"
    ]
  },
  {
    name: "Spannmål",
    keywords: [
      // Flours
      "vetemjöl", "mjöl", "grahammjöl", "rågmjöl", "kornmjöl", "dinkelmjöl", 
      "majsmjöl", "flour", "wheat flour", "whole wheat flour", "rye flour", 
      "barley flour", "corn flour",
      
      // Grains and flakes
      "havregryn", "gryn", "flingor", "müsli", "musli", "muesli", "ris", 
      "couscous", "bulgur", "quinoa", "oats", "rolled oats", "flakes", 
      "breakfast cereals", "frukostflingor", "rice"
    ],
    categoryStrings: [
      "en:cereals-and-potatoes", "en:cereals-and-their-products", "en:flours", 
      "en:breakfast-cereals", "spannmål", "flingor", "gryn"
    ]
  },
  {
    name: "Bröd",
    keywords: [
      "bröd", "knäckebröd", "tunnbröd", "limpa", "formfranska", "rågbröd", 
      "fullkornsbröd", "vörtbröd", "surdegsbröd", "fralla", "bullar", "bulle",
      "bread", "crispbread", "flatbread", "loaf", "rye bread", "whole grain bread", 
      "sourdough bread", "roll", "bun"
    ],
    categoryStrings: [
      "en:breads", "en:crispbreads", "en:flatbreads", "brød", "leipä", "bröd"
    ]
  },
  {
    name: "Kakor",
    keywords: [
      "kaka", "kakor", "kex", "småkaka", "småkakor", "cookie", "cookies", 
      "digestive", "havreflarn", "drömmar", "pepparkakor", "biskvi", "muffins", 
      "muffin", "biscuit", "biscuits", "gingerbread", "cake"
    ],
    categoryStrings: [
      "en:biscuits-and-cakes", "en:cookies", "en:biscuits", "kex", "småkakor", "kakor"
    ]
  },
  {
    name: "Choklad",
    keywords: [
      "choklad", "mjölkchoklad", "mörk choklad", "vit choklad", "pralin", 
      "chokladkaka", "godis", "konfekt", "chocolate", "milk chocolate", 
      "dark chocolate", "white chocolate", "praline", "chocolate bar", 
      "candy", "confectionery", "marabou", "lindt", "fazer", "toblerone", "kinder"
    ],
    categoryStrings: [
      "en:chocolates", "en:chocolate-candies", "en:chocolate-bars", 
      "chokolade", "suklaa", "choklad"
    ]
  },
  {
    name: "Pasta",
    keywords: [
      "pasta", "spaghetti", "tagliatelle", "penne", "fusilli", "farfalle", 
      "lasagne", "lasagneplattor", "makaroner", "nudlar", "noodles", 
      "lasagna", "lasagna sheets", "macaroni"
    ],
    categoryStrings: [
      "en:pastas", "en:noodles", "pasta", "nudlar"
    ]
  },
  {
    name: "Mat",
    keywords: [
      // Frozen/prepared
      "fiskpinnar", "nuggets", "kycklingnuggets", "köttbullar", "färdigmat", 
      "fryst mat", "fish fingers", "fish sticks", "chicken nuggets", "meatballs", 
      "ready meal", "frozen meal",
      
      // Meals
      "soppa", "soppor", "gryta", "grytor", "lasagne", "pizza", "pizzor", "paj", 
      "pajer", "soup", "soups", "stew", "stews", "lasagna", "pie", "pies"
    ],
    categoryStrings: [
      "en:prepared-foods", "en:meals", "en:frozen-foods", "en:soups", 
      "färdigmat", "fryst mat", "måltider"
    ]
  },
  {
    name: "Pålägg",
    keywords: [
      "pålägg", "leverpastej", "pastej", "skinka", "korv", "korvar", "salami", 
      "sylta", "bredbar", "spread", "spreads", "liver pate", "pate", "ham", 
      "sausage", "sausages", "spreadable", "chark", "charkuterier"
    ],
    categoryStrings: [
      "en:spreads", "en:pates", "en:cold-cuts", "pålägg", "bredbart", "chark"
    ]
  }
];

export function detectProductCategory(
  productName?: string, 
  categories?: string, 
  brands?: string
): string {
  if (!productName && !categories) return "Okategoriserad";
  
  const searchText = [productName, categories, brands]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  
  // Check each category
  for (const category of PRODUCT_CATEGORIES) {
    // Check for exclusions first (for Dryck category)
    if (category.exclusions && category.exclusions.some(exclusion => 
      searchText.includes(exclusion.toLowerCase())
    )) {
      continue; // Skip this category if exclusion found
    }
    
    // Check keywords with fuzzy matching
    const hasKeywordMatch = category.keywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Exact match
      if (searchText.includes(keywordLower)) return true;
      
      // Fuzzy matching for plurals and similar words
      const keywordBase = keywordLower.replace(/s$|er$|or$/, ""); // Remove common endings
      if (keywordBase.length > 3 && searchText.includes(keywordBase)) return true;
      
      // Check if any word in searchText starts with the keyword (for brand matching)
      const words = searchText.split(/\s+/);
      return words.some(word => 
        word.startsWith(keywordLower) || keywordLower.startsWith(word)
      );
    });
    
    // Check category strings
    const hasCategoryMatch = category.categoryStrings.some(catStr => 
      searchText.includes(catStr.toLowerCase())
    );
    
    if (hasKeywordMatch || hasCategoryMatch) {
      return category.name;
    }
  }
  
  return "Mat & Dryck";
}
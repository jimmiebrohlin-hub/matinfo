import { Product } from "@/components/ProductCard";

const BASE_URL = "https://world.openfoodfacts.org";

// List of popular Swedish food product categories
const SWEDISH_CATEGORIES = [
  "knäckebröd", // Crispbread
  "mjölkprodukter", // Dairy products
  "kött", // Meat
  "fisk", // Fish
  "ost", // Cheese
  "smör", // Butter
  "yoghurt", // Yogurt
  "kött-charkuterier", // Deli meats
  "konserver", // Canned goods
  "bröd", // Bread
  "kakor", // Cookies
  "godis", // Candy
  "drycker", // Beverages
  "kaffe", // Coffee
  "te", // Tea
  "pasta", // Pasta
  "ris", // Rice
  "potatis", // Potatoes
  "frukostflingor", // Breakfast cereals
  "sylt", // Jam
];

// Popular Swedish brands to help filter
const SWEDISH_BRANDS = [
  "ICA", "Coop", "Arla", "Scan", "Findus", "Fazer", "Marabou", "Gevalia",
  "Löfbergs", "Oatly", "Alpro", "Barilla", "Santa Maria", "Felix", "Estrella",
  "Kalles", "Bregott", "Garant", "Eldorado", "Swedish Match"
];

export class OpenFoodFactsService {
  /**
   * Search for products with Swedish origin or commonly found in Swedish stores
   */
  static async searchSwedishProducts(page: number = 1, pageSize: number = 24): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams({
        countries_tags_en: "sweden",
        page_size: pageSize.toString(),
        page: page.toString(),
        fields: "code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments"
      });

      console.log(`🔍 Searching Swedish products...`);
      const response = await fetch(`${BASE_URL}/api/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SvenskMatupptackaren/1.0'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ API response not ok: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 API response:`, data);

      if (data && data.products) {
        return data.products.filter((product: any) => 
          product.product_name || product.product_name_en || product.product_name_sv
        );
      }
      return [];
    } catch (error) {
      console.error("Error searching Swedish products:", error);
      throw error;
    }
  }

  /**
   * Get a random product from Open Food Facts database
   */
  static async getRandomSwedishProduct(): Promise<Product | null> {
    try {
      console.log("🔍 Fetching random Swedish product from OFF...");
      
      // Use popular Swedish food categories for better results
      const categories = [
        "dairy", "bread", "meat", "fish", "cheese", "coffee", 
        "pasta", "cereals", "beverages", "chocolate", "cookies"
      ];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const searchParams = new URLSearchParams({
        categories_tags_en: randomCategory,
        countries_tags_en: "sweden",
        page_size: "50",
        fields: "code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments,quantity,serving_size,serving_quantity,net_weight_unit,net_weight_value,packaging,product_quantity"
      });

      console.log(`🔍 Searching for products in category: ${randomCategory}`);
      const response = await fetch(`${BASE_URL}/api/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SvenskMatupptackaren/1.0'
        }
      });

      if (!response.ok) {
        console.error(`❌ HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 OFF search response:`, data);

      if (data && data.products && data.products.length > 0) {
        // Filter products that have name and image
        const validProducts = data.products.filter((product: any) => 
          (product.product_name || product.product_name_en || product.product_name_sv) && 
          (product.image_front_url || product.image_url) &&
          product.code // Ensure we have a valid product code
        );
        
        if (validProducts.length > 0) {
          const randomIndex = Math.floor(Math.random() * validProducts.length);
          const selectedProduct = validProducts[randomIndex];
          console.log(`✅ Found valid product: ${selectedProduct.product_name || selectedProduct.product_name_en}`);
          return this.normalizeProduct(selectedProduct);
        }
      }
      
      console.warn("No valid products found in response");
      return null;
    } catch (error) {
      console.error("Error getting random Swedish product:", error);
      // Don't throw error, return null to let UI handle gracefully
      return null;
    }
  }


  /**
   * Normalize product data from OFF API
   */
  private static normalizeProduct(product: any): Product {
    const nutriments = product.nutriments || {};
    
    // Try to extract serving size from nutrition data ratio
    let serving_size = undefined;
    
    // First check for numeric serving_quantity field (most reliable)
    if (product.serving_quantity) {
      serving_size = parseFloat(product.serving_quantity);
    } else if (nutriments.serving_size) {
      serving_size = parseFloat(nutriments.serving_size.toString().replace(/[^\d.]/g, ''));
    } else if (product.serving_size) {
      // Handle Swedish decimal format (comma) and convert to dot
      const servingSizeStr = product.serving_size.replace(/,/g, '.').replace(/[^\d.]/g, '');
      serving_size = parseFloat(servingSizeStr);
    } else if (nutriments.energy_serving && nutriments.energy_100g) {
      // Calculate serving size from energy ratio
      const ratio = nutriments.energy_serving / nutriments.energy_100g;
      serving_size = Math.round(ratio * 100);
    } else if (nutriments["energy-kcal_serving"] && nutriments["energy-kcal_100g"]) {
      // Alternative energy calculation
      const ratio = nutriments["energy-kcal_serving"] / nutriments["energy-kcal_100g"];
      serving_size = Math.round(ratio * 100);
    }

    // Extract package weight from various possible fields (improved to prioritize quantity)
    let package_weight = undefined;
    
    // Try quantity first (this is usually the most reliable - OFF's main weight field)
    if (product.quantity) {
      const quantityStr = product.quantity.toString();
      console.log(`🔍 Processing quantity field: "${quantityStr}" for product: ${product.product_name || product.code}`);
      
      // Look for patterns like "185 g", "85g", "3 oz (85 g)", "240g", "1.5 kg"
      // Enhanced regex to be more flexible with spacing and formats
      const weightMatch = quantityStr.match(/(?:\((\d+(?:[,.]?\d+)?)\s*g\))|(\d+(?:[,.]?\d+)?)\s*g(?:\b|$)/i);
      if (weightMatch) {
        // Use the value in parentheses if available, otherwise use the direct match
        const weightValue = weightMatch[1] || weightMatch[2];
        package_weight = parseFloat(weightValue.replace(',', '.'));
        console.log(`✅ Found weight from quantity: ${package_weight}g`);
      } else {
        // Try kg to g conversion
        const kgMatch = quantityStr.match(/(\d+(?:[,.]?\d+)?)\s*kg(?:\b|$)/i);
        if (kgMatch) {
          package_weight = parseFloat(kgMatch[1].replace(',', '.')) * 1000;
          console.log(`✅ Found weight from kg conversion: ${package_weight}g`);
        } else {
          console.log(`❌ No weight pattern found in quantity: "${quantityStr}"`);
        }
      }
    }
    
    // Fallback to net_weight_value + unit
    if (!package_weight && product.net_weight_value && product.net_weight_unit === 'g') {
      package_weight = parseFloat(product.net_weight_value);
    }
    
    // Try product_quantity as another fallback
    if (!package_weight && product.product_quantity) {
      const weight = parseFloat(product.product_quantity);
      if (!isNaN(weight)) {
        package_weight = weight;
      }
    }
    
    // Last resort: extract from packaging text
    if (!package_weight && product.packaging) {
      const weightMatch = product.packaging.match(/(\d+(?:\.\d+)?)\s*g/i);
      if (weightMatch) {
        package_weight = parseFloat(weightMatch[1]);
      }
    }

    // Extract pieces per package using improved logic
    let pieces_per_package = 1; // Default to 1 piece per package
    
    // Step 1: Check "quantity" field for patterns like "X st", "X-pack", "X x Y"
    if (product.quantity) {
      const quantityStr = product.quantity.toString();
      const piecesMatch = quantityStr.match(/(\d+)\s*(?:st|pack|x\s*\d+|pieces?|styck)/i);
      if (piecesMatch) {
        pieces_per_package = parseInt(piecesMatch[1]);
      }
    }
    
    // Step 2: If not found and we have both total weight and serving size, calculate
    if (pieces_per_package === 1 && package_weight && serving_size && serving_size > 0) {
      const calculated_pieces = Math.floor(package_weight / serving_size);
      if (calculated_pieces > 1) {
        pieces_per_package = calculated_pieces;
      }
    }
    
    // Step 3: Check "packaging" and "product_name" for piece patterns
    if (pieces_per_package === 1) {
      const fieldsToCheck = [product.packaging, product.product_name, product.product_name_sv].filter(Boolean);
      for (const field of fieldsToCheck) {
        const fieldStr = field.toString();
        const piecesMatch = fieldStr.match(/(\d+)\s*(?:st|pack|x\s*\d+|pieces?|styck)/i);
        if (piecesMatch) {
          pieces_per_package = parseInt(piecesMatch[1]);
          break;
        }
      }
    }
    
    return {
      id: product.code || product.id || product._id,
      product_name: product.product_name || product.product_name_en || "Okänd produkt",
      product_name_sv: product.product_name_sv || product.product_name || product.product_name_en,
      brands: product.brands,
      image_front_url: product.image_front_url || product.image_url,
      nutriscore_grade: product.nutriscore_grade,
      ecoscore_grade: product.ecoscore_grade,
      nova_group: product.nova_group,
      categories: product.categories,
      ingredients_text: product.ingredients_text,
      ingredients_text_sv: product.ingredients_text_sv || product.ingredients_text,
      energy_100g: nutriments.energy_100g || nutriments["energy-kcal_100g"] || nutriments.energy,
      fat_100g: nutriments.fat_100g || nutriments.fat,
      saturated_fat_100g: nutriments["saturated-fat_100g"] || nutriments.saturated_fat_100g || nutriments["saturated_fat"],
      sugars_100g: nutriments.sugars_100g || nutriments.sugars,
      salt_100g: nutriments.salt_100g || nutriments.salt,
      fiber_100g: nutriments.fiber_100g || nutriments.fiber,
      proteins_100g: nutriments.proteins_100g || nutriments.proteins,
      countries: product.countries || "Unknown",
      package_weight,
      serving_size,
      pieces_per_package
    };
  }


  /**
   * Get product by barcode/EAN
   */
  /**
   * Search for products by text (product name)
   */
  static async searchProductsByText(searchText: string): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams({
        search_terms: searchText,
        countries_tags_en: "sweden",
        page_size: "10",
        fields: "code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments,quantity,serving_size,serving_quantity,net_weight_unit,net_weight_value,packaging,product_quantity"
      });

      console.log(`🔍 Searching for products with text: ${searchText}`);
      const response = await fetch(`${BASE_URL}/api/v2/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SvenskMatupptackaren/1.0'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ API response not ok: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 Text search API response:`, data);

      if (data && data.products) {
        return data.products
          .filter((product: any) => 
            product.product_name || product.product_name_en || product.product_name_sv
          )
          .map((product: any) => this.normalizeProduct(product));
      }
      return [];
    } catch (error) {
      console.error("Error searching products by text:", error);
      return [];
    }
  }

  /**
   * Get product by barcode/EAN
   */
  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/v2/product/${barcode}?fields=code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments,quantity,serving_size,serving_quantity,net_weight_unit,net_weight_value,packaging,product_quantity`);
      const data = await response.json();

      if (data && data.product && data.status === 1) {
        return this.normalizeProduct(data.product);
      }
      return null;
    } catch (error) {
      console.error("Error getting product by barcode:", error);
      return null;
    }
  }
}
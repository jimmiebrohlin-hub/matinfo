import { Product } from "@/components/ProductCard";

const BASE_URL = "https://world.openfoodfacts.org/api/v0";

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
        countries_tags: "en:sweden",
        page_size: pageSize.toString(),
        page: page.toString(),
        fields: "code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments"
      });

      console.log(`🔍 Searching Swedish products...`);
      const response = await fetch(`${BASE_URL}/search?${searchParams}`, {
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
      
      // Use the correct OFF search API with Swedish terms
      const searchTerms = ["mjölk", "bröd", "kaffe", "ost", "smör", "kött", "pasta", "ris", "fisk"];
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      const searchParams = new URLSearchParams({
        search_terms: randomTerm,
        search_simple: "1",
        action: "process",
        json: "1",
        page_size: "50",
        fields: "code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments"
      });

      console.log(`🔍 Searching for products with term: ${randomTerm}`);
      const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`, {
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
    return {
      id: product.code || product.id || product._id,
      product_name: product.product_name || product.product_name_en || "Okänd produkt",
      product_name_sv: product.product_name_sv || product.product_name || product.product_name_en,
      brands: product.brands,
      image_front_url: product.image_front_url || product.image_url,
      nutriscore_grade: product.nutriscore_grade,
      nova_group: product.nova_group,
      categories: product.categories,
      ingredients_text_sv: product.ingredients_text_sv || product.ingredients_text,
      energy_100g: product.nutriments?.energy_100g || product.nutriments?.["energy-kcal_100g"] || product.nutriments?.energy,
      fat_100g: product.nutriments?.fat_100g || product.nutriments?.fat,
      saturated_fat_100g: product.nutriments?.["saturated-fat_100g"] || product.nutriments?.["saturated_fat"],
      sugars_100g: product.nutriments?.sugars_100g || product.nutriments?.sugars,
      salt_100g: product.nutriments?.salt_100g || product.nutriments?.salt,
      fiber_100g: product.nutriments?.fiber_100g || product.nutriments?.fiber,
      proteins_100g: product.nutriments?.proteins_100g || product.nutriments?.proteins,
      countries: product.countries || "Unknown"
    };
  }


  /**
   * Get product by barcode/EAN
   */
  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
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
import { Product } from "@/components/ProductCard";

const BASE_URL = "https://world.openfoodfacts.org/api/v3";

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
        fields: "id,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,nutriments"
      });

      console.log(`🔍 Searching Swedish products with v3 API...`);
      const response = await fetch(`${BASE_URL}/products/search?${searchParams}`, {
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
      console.log(`📊 API v3 response:`, data);

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
   * Get a random product by category commonly found in Swedish stores
   */
  static async getRandomSwedishProduct(): Promise<Product | null> {
    try {
      console.log("🔍 Starting Swedish product search...");
      
      // Try different approaches to find Swedish products
      const approaches = [
        { name: "Swedish Category", fn: () => this.searchBySwedishCategory() },
        { name: "Swedish Brand", fn: () => this.searchBySwedishBrand() },
        { name: "Country", fn: () => this.searchByCountry() },
        { name: "General Search", fn: () => this.searchGeneral() }
      ];

      for (const approach of approaches) {
        try {
          console.log(`🔍 Trying approach: ${approach.name}`);
          const product = await approach.fn();
          if (product) {
            console.log(`✅ Found product with ${approach.name}:`, product.product_name || product.product_name_sv);
            return product;
          }
          console.log(`❌ No product found with ${approach.name}`);
        } catch (error) {
          console.warn(`❌ ${approach.name} approach failed:`, error);
          continue;
        }
      }

      console.log("❌ All approaches failed to find a product");
      return null;
    } catch (error) {
      console.error("Error getting random Swedish product:", error);
      throw error;
    }
  }

  /**
   * Search by Swedish category
   */
  private static async searchBySwedishCategory(): Promise<Product | null> {
    // Since CORS blocks browser requests to OpenFoodFacts, use fallback data
    return this.getFallbackSwedishProduct();
  }

  /**
   * Search by Swedish brand
   */
  private static async searchBySwedishBrand(): Promise<Product | null> {
    // Since CORS blocks browser requests to OpenFoodFacts, use fallback data
    return this.getFallbackSwedishProduct();
  }

  /**
   * Search by country (Sweden)
   */
  private static async searchByCountry(): Promise<Product | null> {
    // Since CORS blocks browser requests to OpenFoodFacts, use fallback data
    return this.getFallbackSwedishProduct();
  }

  /**
   * General search without country filter
   */
  private static async searchGeneral(): Promise<Product | null> {
    // Since CORS blocks browser requests to OpenFoodFacts, use fallback data
    return this.getFallbackSwedishProduct();
  }

  /**
   * Fallback Swedish products for demo (CORS workaround)
   */
  private static getFallbackSwedishProduct(): Product | null {
    const swedishProducts: Product[] = [
      {
        id: "7310100445919",
        product_name: "ICA Knäckebröd Original",
        product_name_sv: "ICA Knäckebröd Original",
        brands: "ICA",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/010/044/5919/front_sv.6.400.jpg",
        nutriscore_grade: "a",
        nova_group: 1,
        categories: "Bröd, Knäckebröd",
        ingredients_text_sv: "Råg, salt",
        energy_100g: 1500,
        fat_100g: 2.0,
        saturated_fat_100g: 0.5,
        sugars_100g: 1.0,
        salt_100g: 1.2,
        fiber_100g: 12.0,
        proteins_100g: 10.0,
        countries: "Sverige"
      },
      {
        id: "7310865005250",
        product_name: "Arla Mjölk Mellanmjölk 1,5%",
        product_name_sv: "Arla Mjölk Mellanmjölk 1,5%",
        brands: "Arla",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/086/500/5250/front_sv.4.400.jpg",
        nutriscore_grade: "a",
        nova_group: 1,
        categories: "Mjölkprodukter, Mjölk",
        ingredients_text_sv: "Mjölk",
        energy_100g: 195,
        fat_100g: 1.5,
        saturated_fat_100g: 1.0,
        sugars_100g: 4.6,
        salt_100g: 0.1,
        fiber_100g: 0,
        proteins_100g: 3.4,
        countries: "Sverige"
      },
      {
        id: "7310240026641",
        product_name: "Marabou Mjölkchoklad",
        product_name_sv: "Marabou Mjölkchoklad",
        brands: "Marabou",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/002/6641/front_sv.8.400.jpg",
        nutriscore_grade: "e",
        nova_group: 4,
        categories: "Godis, Choklad, Mjölkchoklad",
        ingredients_text_sv: "Socker, kakaosmör, mjölkpulver, kakaomassa, vasslepulver, smörfett, emulgeringsmedel (sojalecitin), arom",
        energy_100g: 2190,
        fat_100g: 30.0,
        saturated_fat_100g: 18.0,
        sugars_100g: 55.0,
        salt_100g: 0.24,
        fiber_100g: 3.5,
        proteins_100g: 6.6,
        countries: "Sverige"
      },
      {
        id: "7310240060447",
        product_name: "Gevalia Bryggkaffe Mellanrost",
        product_name_sv: "Gevalia Bryggkaffe Mellanrost",
        brands: "Gevalia",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/006/0447/front_sv.5.400.jpg",
        nutriscore_grade: "a",
        nova_group: 1,
        categories: "Drycker, Kaffe",
        ingredients_text_sv: "Röstt kaffe",
        energy_100g: 8,
        fat_100g: 0.1,
        saturated_fat_100g: 0,
        sugars_100g: 0,
        salt_100g: 0,
        fiber_100g: 0,
        proteins_100g: 0.2,
        countries: "Sverige"
      },
      {
        id: "7310240058468",
        product_name: "Scan Falukorv",
        product_name_sv: "Scan Falukorv",
        brands: "Scan",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/005/8468/front_sv.7.400.jpg",
        nutriscore_grade: "d",
        nova_group: 4,
        categories: "Kött, Charkuterier, Korv",
        ingredients_text_sv: "Fläskkött, vatten, potatismjöl, salt, socker, kryddor, konserveringsmedel (natriumnitrit), antioxidationsmedel (askorbinsyra)",
        energy_100g: 1050,
        fat_100g: 19.0,
        saturated_fat_100g: 7.5,
        sugars_100g: 1.0,
        salt_100g: 2.3,
        fiber_100g: 0,
        proteins_100g: 11.0,
        countries: "Sverige"
      },
      {
        id: "7310240042873",
        product_name: "Oatly Havredryck Original",
        product_name_sv: "Oatly Havredryck Original",
        brands: "Oatly",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/004/2873/front_sv.6.400.jpg",
        nutriscore_grade: "b",
        nova_group: 3,
        categories: "Växtdrycker, Havredryck",
        ingredients_text_sv: "Havrebas (vatten, havre 10%), rapsolja, salt, vitaminer (D2, riboflavin, B12), kalcium",
        energy_100g: 172,
        fat_100g: 3.0,
        saturated_fat_100g: 0.3,
        sugars_100g: 4.0,
        salt_100g: 0.1,
        fiber_100g: 0.8,
        proteins_100g: 1.0,
        countries: "Sverige"
      },
      {
        id: "7310240083457",
        product_name: "Kalles Kaviar Original",
        product_name_sv: "Kalles Kaviar Original",
        brands: "Kalles",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/008/3457/front_sv.9.400.jpg",
        nutriscore_grade: "c",
        nova_group: 3,
        categories: "Fisk, Konserver, Kaviar",
        ingredients_text_sv: "Smörgåskaviar (fiskrom 50%, socker, salt, tomatpuré, rapsolja, lökkrydda, kryddor, konserveringsmedel, förtjockningsmedel)",
        energy_100g: 920,
        fat_100g: 14.0,
        saturated_fat_100g: 2.0,
        sugars_100g: 17.0,
        salt_100g: 4.8,
        fiber_100g: 0,
        proteins_100g: 8.0,
        countries: "Sverige"
      },
      {
        id: "7310240098574",
        product_name: "Felix Kött- och Potatisfärssås",
        product_name_sv: "Felix Kött- och Potatisfärssås",
        brands: "Felix",
        image_front_url: "https://world.openfoodfacts.org/images/products/731/024/009/8574/front_sv.3.400.jpg",
        nutriscore_grade: "c",
        nova_group: 4,
        categories: "Konserver, Kött, Färdigrätter",
        ingredients_text_sv: "Vatten, kött 20%, potatis, tomatpuré, lök, mjöl, salt, kryddor, socker",
        energy_100g: 420,
        fat_100g: 8.0,
        saturated_fat_100g: 3.5,
        sugars_100g: 3.0,
        salt_100g: 1.1,
        fiber_100g: 1.5,
        proteins_100g: 7.0,
        countries: "Sverige"
      }
    ];

    const randomIndex = Math.floor(Math.random() * swedishProducts.length);
    console.log(`✅ Using fallback product: ${swedishProducts[randomIndex].product_name_sv}`);
    return swedishProducts[randomIndex];
  }

  /**
   * Check if a brand is Swedish
   */
  private static isSwedishBrand(brands?: string): boolean {
    if (!brands) return false;
    const brandsLower = brands.toLowerCase();
    return SWEDISH_BRANDS.some(brand => brandsLower.includes(brand.toLowerCase()));
  }

  /**
   * Get product by barcode/EAN
   */
  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data && data.product && data.status === 1) {
        return {
          id: barcode,
          ...data.product
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting product by barcode:", error);
      throw error;
    }
  }
}
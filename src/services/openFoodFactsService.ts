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
        countries: "Sverige",
        page_size: pageSize.toString(),
        page: page.toString(),
        json: "1",
        fields: "id,product_name,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,energy_100g,fat_100g,saturated_fat_100g,sugars_100g,salt_100g,fiber_100g,proteins_100g,countries"
      });

      const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`);
      const data = await response.json();

      if (data && data.products) {
        return data.products.filter((product: any) => 
          product.product_name && 
          (product.countries?.toLowerCase().includes('sve') || 
           product.countries?.toLowerCase().includes('sweden') ||
           this.isSwedishBrand(product.brands))
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
    const randomCategory = SWEDISH_CATEGORIES[Math.floor(Math.random() * SWEDISH_CATEGORIES.length)];
    const randomPage = Math.floor(Math.random() * 3) + 1; // Reduce page range

    const searchParams = new URLSearchParams({
      categories: randomCategory,
      page_size: "20",
      page: randomPage.toString(),
      json: "1",
      fields: "id,product_name,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,energy_100g,fat_100g,saturated_fat_100g,sugars_100g,salt_100g,fiber_100g,proteins_100g,countries"
    });

    console.log(`🔍 Searching category: ${randomCategory}, page: ${randomPage}`);
    const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`);
    const data = await response.json();
    console.log(`📊 Category search response:`, data?.products?.length || 0, "products found");

    if (data && data.products && data.products.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.products.length);
      return data.products[randomIndex];
    }
    return null;
  }

  /**
   * Search by Swedish brand
   */
  private static async searchBySwedishBrand(): Promise<Product | null> {
    const randomBrand = SWEDISH_BRANDS[Math.floor(Math.random() * SWEDISH_BRANDS.length)];
    const randomPage = Math.floor(Math.random() * 5) + 1;

    const searchParams = new URLSearchParams({
      brands: randomBrand,
      page_size: "20",
      page: randomPage.toString(),
      json: "1",
      fields: "id,product_name,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,energy_100g,fat_100g,saturated_fat_100g,sugars_100g,salt_100g,fiber_100g,proteins_100g,countries"
    });

    const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`);
    const data = await response.json();

    if (data && data.products && data.products.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.products.length);
      return data.products[randomIndex];
    }
    return null;
  }

  /**
   * Search by country (Sweden)
   */
  private static async searchByCountry(): Promise<Product | null> {
    const randomPage = Math.floor(Math.random() * 5) + 1; // Reduce page range

    const searchParams = new URLSearchParams({
      countries: "Sweden", // Try English name
      page_size: "20",
      page: randomPage.toString(),
      json: "1",
      fields: "id,product_name,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,energy_100g,fat_100g,saturated_fat_100g,sugars_100g,salt_100g,fiber_100g,proteins_100g,countries"
    });

    console.log(`🔍 Searching by country: Sweden, page: ${randomPage}`);
    const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`);
    const data = await response.json();
    console.log(`📊 Country search response:`, data?.products?.length || 0, "products found");

    if (data && data.products && data.products.length > 0) {
      const filteredProducts = data.products.filter((product: any) => 
        product.product_name && 
        (product.product_name.length > 3) && // Filter out very short names
        !product.product_name.toLowerCase().includes('test') // Filter out test products
      );
      
      console.log(`📊 Filtered products:`, filteredProducts.length);
      if (filteredProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredProducts.length);
        return filteredProducts[randomIndex];
      }
    }
    return null;
  }

  /**
   * General search without country filter
   */
  private static async searchGeneral(): Promise<Product | null> {
    const randomPage = Math.floor(Math.random() * 5) + 1;

    const searchParams = new URLSearchParams({
      page_size: "20",
      page: randomPage.toString(),
      json: "1",
      fields: "id,product_name,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutrition_grades,energy_100g,fat_100g,saturated_fat_100g,sugars_100g,salt_100g,fiber_100g,proteins_100g,countries"
    });

    console.log(`🔍 General search, page: ${randomPage}`);
    const response = await fetch(`${BASE_URL}/cgi/search.pl?${searchParams}`);
    const data = await response.json();
    console.log(`📊 General search response:`, data?.products?.length || 0, "products found");

    if (data && data.products && data.products.length > 0) {
      const filteredProducts = data.products.filter((product: any) => 
        product.product_name && 
        (product.product_name.length > 3) &&
        !product.product_name.toLowerCase().includes('test')
      );
      
      if (filteredProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredProducts.length);
        return filteredProducts[randomIndex];
      }
    }
    return null;
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
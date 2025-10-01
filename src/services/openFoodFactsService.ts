// openFoodFactsService.ts
import { Product } from "@/components/ProductCard";

const BASE_URL = "https://world.openfoodfacts.org";

export class OpenFoodFactsService {
  /**
   * Minimal query normalization for better free-text search
   */
  private static normalizeQuery(q: string): string {
    // Lowercase, trim, remove accents
    const base = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    // Tiny synonym/misspelling map to catch frequent cases
    const map: Record<string, string> = {
      "choclate": "chocolate",
      "chocolat": "chocolate",
      "choccolate": "chocolate",
      "choklad": "chocolate",
      "biscuits": "cookies",
    };
    return map[base] ?? base;
  }

  private static isSingleToken(q: string): boolean {
    return q.split(/\s+/).length === 1;
  }

  /**
   * Simplified free-text search (global, no country restrictions).
   * - Uses API v2 free-text with search_simple=1
   * - Minimal normalization (typos like "choclate" → "chocolate")
   * - Optional fallback: if zero results and the query is a single word,
   *   try a category tag filter (e.g., "chocolate")
   */
  static async searchProductsByText(searchText: string, opts?: { pageSize?: number; page?: number }): Promise<Product[]> {
    try {
      const pageSize = String(opts?.pageSize ?? 50);
      const page = String(opts?.page ?? 1);
      const q = this.normalizeQuery(searchText);

      const fields = [
        "code","product_name","product_name_en","product_name_sv","brands",
        "image_url","image_front_url",
        "nutriscore_grade","ecoscore_grade","nova_group",
        "categories","ingredients_text","ingredients_text_sv",
        "nutriments","quantity","serving_size","serving_quantity",
        "net_weight_unit","net_weight_value","packaging","product_quantity",
      ].join(",");

      // Primary: free-text search (simple and broad)
      const primaryParams = new URLSearchParams({
        search_terms: q,
        search_simple: "1",
        sort_by: "unique_scans_n",
        page_size: pageSize,
        page,
        fields,
      });

      const primaryUrl = `${BASE_URL}/api/v2/search?${primaryParams}`;
      console.log(`🔎 Free-text search URL: ${primaryUrl}`);

      const primaryRes = await fetch(primaryUrl, {
        method: "GET",
        headers: { Accept: "application/json", "User-Agent": "SvenskMatupptackaren/1.0" },
      });

      if (!primaryRes.ok) throw new Error(`HTTP error! status: ${primaryRes.status}`);

      const primaryData = await primaryRes.json();
      let products = this.processSearchResults(primaryData, searchText);

      // Optional lightweight fallback: if zero results and single token, try one category tag
      if (products.length === 0 && this.isSingleToken(q)) {
        const fallbackParams = new URLSearchParams({
          sort_by: "unique_scans_n",
          page_size: pageSize,
          page,
          fields,
          tagtype_0: "categories",
          tag_contains_0: "contains",
          tag_0: q, // e.g., "chocolate"
        });
        const fallbackUrl = `${BASE_URL}/api/v2/search?${fallbackParams}`;
        console.log(`🧭 Fallback tag search URL: ${fallbackUrl}`);

        const fallbackRes = await fetch(fallbackUrl, {
          method: "GET",
          headers: { Accept: "application/json", "User-Agent": "SvenskMatupptackaren/1.0" },
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          products = this.processSearchResults(fallbackData, `${searchText} (fallback)`);
        }
      }

      return products;
    } catch (error) {
      console.error("Error searching products by text:", error);
      throw error;
    }
  }

  /**
   * Optional: Get product by barcode/EAN
   */
  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v2/product/${barcode}?fields=code,product_name,product_name_en,product_name_sv,brands,image_url,image_front_url,nutriscore_grade,ecoscore_grade,nova_group,categories,ingredients_text,ingredients_text_sv,nutriments,quantity,serving_size,serving_quantity,net_weight_unit,net_weight_value,packaging,product_quantity`
      );
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

  /**
   * Optional: Get multiple products by their barcodes/EANs
   */
  static async getProductsByBarcodes(barcodes: string[]): Promise<Product[]> {
    const products: Product[] = [];

    // Process in chunks to avoid overwhelming the API
    for (let i = 0; i < barcodes.length; i += 5) {
      const chunk = barcodes.slice(i, i + 5);
      const chunkPromises = chunk.map(barcode => this.getProductByBarcode(barcode));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          products.push(result.value);
        }
      });

      // Small delay to be respectful to the API
      if (i + 5 < barcodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return products;
  }

  /**
   * Internal: Process search results (filters and normalization)
   */
  private static processSearchResults(data: any, searchText: string): Product[] {
    console.log(`📊 Text search response for "${searchText}":`, {
      count: data.count,
      products_found: data.products?.length || 0,
      first_product: data.products?.[0]?.product_name || data.products?.[0]?.code
    });

    if (data && data.products && data.products.length > 0) {
      const filteredProducts = data.products
        .filter((product: any) =>
          (product.product_name || product.product_name_en || product.product_name_sv) &&
          (product.image_front_url || product.image_url) // Ensure we have images
        )
        .map((product: any) => this.normalizeProduct(product))
        .filter((product: Product) =>
          product.product_name && product.product_name.length > 0
        );

      console.log(`✅ Filtered ${filteredProducts.length} products from ${data.products.length} results`);
      return filteredProducts;
    }

    console.log(`❌ No products found in API response for "${searchText}"`);
    return [];
  }

  /**
   * Internal: Normalize product data from OFF API
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

    // Extract package weight from various possible fields
    let package_weight = undefined;

    // Try quantity first (this is usually the most reliable - OFF's main weight field)
    if (product.quantity) {
      const quantityStr = product.quantity.toString();
      console.log(`🔍 Processing quantity field: "${quantityStr}" for product: ${product.product_name || product.code}`);

      // Look for patterns like "185 g", "85g", "3 oz (85 g)", "240g", "1.5 kg"
      const weightMatch = quantityStr.match(/(?:\((\d+(?:[,.]?\d+)?)\s*g\))|(\d+(?:[,.]?\d+)?)\s*g(?:\b|$)/i);
      if (weightMatch) {
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
}

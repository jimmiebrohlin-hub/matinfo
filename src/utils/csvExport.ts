import { Product } from "@/components/ProductCard";
import { OpenFoodFactsService } from "@/services/openFoodFactsService";
import { detectProductCategory } from "@/utils/productCategories";

/**
 * Export products to CSV format with complete data
 */
export const exportProductsToCSV = async (products: Product[], filename: string = "swedish-food-products.csv") => {
  if (products.length === 0) {
    alert("Inga produkter att exportera!");
    return;
  }

  // Show loading state
  const originalAlert = window.alert;
  window.alert = () => {}; // Temporarily disable alerts
  
  try {
    // Fetch complete data for all products
    const completeProducts = await Promise.all(
      products.map(async (product) => {
        const completeProduct = await OpenFoodFactsService.getProductByBarcode(product.id);
        return completeProduct || product;
      })
    );

    // Comprehensive CSV headers
    const headers = [
      "EAN", "Produktnamn", "Tillverkare", "Anpassad Kategori", "Kategorier", "Ingredienser",
      "Nutri-Score", "Eco-Score", "NOVA Grupp",
      "Energi (kJ/100g)", "Energi (kcal/100g)", "Fett (g/100g)", "Mättat fett (g/100g)",
      "Kolhydrater (g/100g)", "Socker (g/100g)", "Fiber (g/100g)", "Protein (g/100g)",
      "Salt (g/100g)", "Portionsstorlek", "Förpackningsvikt", "Antal per förpackning",
      "Ursprungsländer", "Förpackning", "Kvantitet"
    ];
    
    // Convert products to CSV rows with complete data
    const csvRows = [
      headers.join(","), // Header row
      ...completeProducts.map(product => {
        const { customCategory } = detectProductCategory(
          product.product_name || product.product_name_sv,
          product.categories,
          product.brands
        );
        
        return [
          `"${product.id || ""}"`,
          `"${(product.product_name_sv || product.product_name || "").replace(/"/g, '""')}"`,
          `"${(product.brands || "").replace(/"/g, '""')}"`,
          `"${customCategory}"`,
          `"${(product.categories || "").replace(/"/g, '""')}"`,
          `"${(product.ingredients_text_sv || product.ingredients_text || "").replace(/"/g, '""')}"`,
          `"${product.nutriscore_grade || ""}"`,
          `"${product.ecoscore_grade || ""}"`,
          `"${product.nova_group || ""}"`,
          `"${product.energy_100g || ""}"`,
          `"${product.energy_kcal_100g || ""}"`,
          `"${product.fat_100g || ""}"`,
          `"${product.saturated_fat_100g || ""}"`,
          `"${product.carbohydrates_100g || ""}"`,
          `"${product.sugars_100g || ""}"`,
          `"${product.fiber_100g || ""}"`,
          `"${product.proteins_100g || ""}"`,
          `"${product.salt_100g || ""}"`,
          `"${product.serving_size || ""}"`,
          `"${product.package_weight || ""}"`,
          `"${product.pieces_per_package || ""}"`,
          `"${product.countries || ""}"`,
          `"${(product.packaging || "").replace(/"/g, '""')}"`,
          `"${(product.quantity || "").replace(/"/g, '""')}"`
        ].join(",");
      })
    ];
    
    // Create CSV content
    const csvContent = csvRows.join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error exporting CSV:", error);
    originalAlert("Ett fel uppstod vid export av CSV-fil.");
  } finally {
    window.alert = originalAlert; // Restore alerts
  }
};
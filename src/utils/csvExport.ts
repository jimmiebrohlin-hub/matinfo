import { Product } from "@/components/ProductCard";

/**
 * Export products to CSV format
 */
export const exportProductsToCSV = (products: Product[], filename: string = "swedish-food-products.csv") => {
  if (products.length === 0) {
    alert("Inga produkter att exportera!");
    return;
  }

  // CSV headers
  const headers = ["EAN", "Product Name", "Manufacturer"];
  
  // Convert products to CSV rows
  const csvRows = [
    headers.join(","), // Header row
    ...products.map(product => [
      `"${product.id || ""}"`,
      `"${(product.product_name_sv || product.product_name || "").replace(/"/g, '""')}"`,
      `"${(product.brands || "").replace(/"/g, '""')}"`,
    ].join(","))
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
};
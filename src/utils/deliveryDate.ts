import { Product, ProductAccessory } from "../types";

/**
 * Dynamically calculates the estimated delivery date as the next day based on current date.
 * Never hard-codes the date.
 * Example output: "Order today • Get it by Oct 4"
 */
export function getDynamicDeliveryDate(baseDate = new Date()): {
  label: string;
  formattedDate: string;
  weekday: string;
  fullDateString: string;
} {
  const tomorrow = new Date(baseDate.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formattedDate = tomorrow.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const weekday = tomorrow.toLocaleDateString("en-US", {
    weekday: "short",
  });

  return {
    label: `Order today • Get it by ${formattedDate}`,
    formattedDate,
    weekday,
    fullDateString: `${weekday}, ${formattedDate}`,
  };
}

/**
 * Converts a selected accessory into a valid Product representation
 * so it integrates into the existing CartItem without creating any new database or cart system.
 */
export function createAccessoryCartProduct(
  accessory: ProductAccessory,
  parentProduct?: Product | null
): Product {
  const accessoryId = `acc_${accessory.id}`;
  return {
    id: accessoryId,
    name: accessory.name,
    brand: parentProduct?.brand || "MILITO",
    condition: "Brand New",
    categorySlug: "accessories",
    productType: "phone",
    price: Number(accessory.price) || 0,
    originalPrice: Math.round((Number(accessory.price) || 0) * 1.25),
    availability: accessory.inStock !== false ? "In Stock" : "Sold Out",
    image: accessory.image || "",
    gallery: accessory.image ? [accessory.image] : [],
    storageOptions: ["Standard"],
    colorOptions: [{ name: "Default", hex: "#000000" }],
    description: `Original verified ${accessory.type || "accessory"} for ${parentProduct?.name || "your device"}.`,
    rating: 5,
    reviewsCount: 14,
    badge: accessory.type || "Accessory",
    quantity: 15,
    stockQuantity: 15,
  };
}

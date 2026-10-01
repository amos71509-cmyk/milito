import { Product, CartItem } from "../types";

/**
 * Dedicated MILITO WhatsApp Number
 * Central configuration used throughout the application.
 */
export const MILITO_WHATSAPP_NUMBER = "+2348162017129";
export const MILITO_WHATSAPP_CLEAN_NUMBER = "2348162017129";
export const MILITO_WHATSAPP_DISPLAY = "+234 816 201 7129";

// Currency formatter for Naira (NGN)
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatNaira = (amount: number): string => {
  return nairaFormatter.format(amount || 0);
};

/**
 * Generates a clean, consistent MILITO Product ID reference
 * e.g., "MIL-1042", "MIL-PH-1", or preserves existing MIL- prefix.
 */
export function getProductDisplayId(product: Product): string {
  if (!product || !product.id) return "MIL-001";
  const idStr = String(product.id).trim();
  if (idStr.toUpperCase().startsWith("MIL-")) {
    return idStr.toUpperCase();
  }
  // If numeric or alphanumeric like "phone-1" or "1042"
  const clean = idStr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `MIL-${clean || "001"}`;
}

export interface SingleProductOrderOptions {
  quantity?: number;
  selectedStorage?: string;
  selectedColor?: { name: string; hex?: string } | string;
  customPrice?: number;
  sellerName?: string;
}

/**
 * Generates the standardized WhatsApp message for a single selected product.
 *
 * Example:
 * Hello MILITO 👋
 *
 * I would like to order this product:
 *
 * Product: iPhone 15 Pro Max
 * Product ID: MIL-PHONE1
 * Price: ₦1,450,000
 * Seller: MILITO Direct
 * Storage: 256GB
 * Colour: Natural Titanium
 * Quantity: 1
 *
 * Please help me continue with this order.
 */
export function generateProductWhatsAppMessage(
  product: Product,
  options?: SingleProductOrderOptions
): string {
  const productName = product.name || "Product";
  const productId = getProductDisplayId(product);
  const price = options?.customPrice ?? product.price ?? 0;
  const formattedPrice = formatNaira(price);
  const quantity = options?.quantity || 1;
  const seller = options?.sellerName || "MILITO Direct";

  // Build product details
  const lines: string[] = [
    "Hello MILITO 👋",
    "",
    "I would like to order this product:",
    "",
    `Product: ${productName}`,
    `Product ID: ${productId}`,
    `Price: ${formattedPrice}`,
    `Seller: ${seller}`,
  ];

  // Specific variations for phones/gadgets
  if (product.productType !== "vehicle") {
    if (options?.selectedStorage) {
      lines.push(`Storage: ${options.selectedStorage}`);
    } else if (product.storageOptions && product.storageOptions[0]) {
      lines.push(`Storage: ${product.storageOptions[0]}`);
    }

    if (options?.selectedColor) {
      const colorName =
        typeof options.selectedColor === "string"
          ? options.selectedColor
          : options.selectedColor.name;
      if (colorName) {
        lines.push(`Colour: ${colorName}`);
      }
    } else if (product.colorOptions && product.colorOptions[0]) {
      lines.push(`Colour: ${product.colorOptions[0].name}`);
    }

    if (product.condition) {
      lines.push(`Condition: ${product.condition}`);
    }
  } else {
    // Variations for vehicles
    if (product.year) {
      lines.push(`Year: ${product.year}`);
    }
    if (product.condition) {
      lines.push(`Condition: ${product.condition}`);
    }
    if (product.transmission) {
      lines.push(`Transmission: ${product.transmission}`);
    }
    if (product.mileage) {
      lines.push(`Mileage: ${product.mileage}`);
    }
    if (product.location) {
      lines.push(`Location: ${product.location}`);
    }
    if (product.vin) {
      lines.push(`VIN/Chassis: ${product.vin}`);
    }
  }

  // Quantity
  lines.push(`Quantity: ${quantity}`);
  lines.push("");
  lines.push("Please help me continue with this order.");

  return lines.join("\n");
}

/**
 * Generates the standardized WhatsApp message for multiple products in the cart.
 *
 * Example:
 * Hello MILITO 👋
 *
 * I would like to order the following products:
 *
 * 1. Product: Samsung Galaxy S24
 *    Product ID: MIL-1042
 *    Price: ₦850,000
 *    Quantity: 1
 *    Storage: 256GB
 *    Colour: Onyx Black
 *
 * 2. Product: Anker Power Bank
 *    Product ID: MIL-1088
 *    Price: ₦75,000
 *    Quantity: 2
 *
 * Total: ₦1,000,000
 *
 * Please help me continue with my order.
 */
export function generateCartWhatsAppMessage(
  cartItems: CartItem[],
  customTotal?: number
): string {
  if (!cartItems || cartItems.length === 0) {
    return `Hello MILITO 👋\n\nI would like to inquire about ordering products from MILITO TECH HOME.\n\nPlease help me continue with my order.`;
  }

  const lines: string[] = [
    "Hello MILITO 👋",
    "",
    "I would like to order the following products:",
    "",
  ];

  let calculatedTotal = 0;

  cartItems.forEach((item, index) => {
    const p = item.product;
    const num = index + 1;
    const itemPrice = p.price || 0;
    const subtotal = itemPrice * item.quantity;
    calculatedTotal += subtotal;

    lines.push(`${num}. Product: ${p.name}`);
    lines.push(`   Product ID: ${getProductDisplayId(p)}`);
    lines.push(`   Price: ${formatNaira(itemPrice)}`);
    lines.push(`   Quantity: ${item.quantity}`);

    if (item.selectedStorage) {
      lines.push(`   Storage: ${item.selectedStorage}`);
    }
    if (item.selectedColor && item.selectedColor.name) {
      lines.push(`   Colour: ${item.selectedColor.name}`);
    }
    if (p.condition) {
      lines.push(`   Condition: ${p.condition}`);
    }
    lines.push("");
  });

  const finalTotal = customTotal !== undefined ? customTotal : calculatedTotal;
  lines.push(`Total: ${formatNaira(finalTotal)}`);
  lines.push("");
  lines.push("Please help me continue with my order.");

  return lines.join("\n");
}

/**
 * Returns a fully formed WhatsApp click-to-chat URL for the MILITO number.
 */
export function getWhatsAppOrderUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${MILITO_WHATSAPP_CLEAN_NUMBER}?text=${encoded}`;
}

/**
 * Safely opens WhatsApp with the generated message.
 */
export function openWhatsAppOrder(message: string): void {
  const url = getWhatsAppOrderUrl(message);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

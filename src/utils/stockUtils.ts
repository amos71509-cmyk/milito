import { Product } from "../types";

export type StockUrgencyState = "in_stock" | "low_stock_2" | "low_stock_1" | "sold_out";

export interface StockStatusInfo {
  quantity: number;
  label: string; // e.g. "25 in stock", "Only 2 left", "Only 1 left", "Out of stock"
  shortLabel: string;
  colorClass: string; // Tailwind text color only - directly on white background
  dotColor: string; // Tailwind dot color
  isSoldOut: boolean;
  isUrgent: boolean;
  state: StockUrgencyState;
}

/**
 * Returns the true numeric stock quantity of a product with backward-compatible fallbacks.
 */
export function getProductStockQuantity(product: Partial<Product> | null | undefined): number {
  if (!product) return 0;

  if (typeof product.stockQuantity === "number") {
    return Math.max(0, Math.floor(product.stockQuantity));
  }
  if (typeof product.quantity === "number") {
    return Math.max(0, Math.floor(product.quantity));
  }
  if (product.availability === "Sold Out" || (product.availability as string) === "Out of stock") {
    return 0;
  }
  // If product explicitly states in stock
  return 5;
}

/**
 * Calculates customer-facing stock message, colors, and urgency state based on quantity.
 * 
 * Rules (No background cards/pills - plain text styling directly on white background):
 * - Healthy stock (qty >= 4): Green text -> "[X] in stock"
 * - Few left (qty === 3 || qty === 2 || qty === 1): Yellow text -> "Only [X] left" or "[X] left"
 * - Zero stock (qty <= 0): Red text -> "Out of stock"
 */
export function getStockStatus(quantityOrProduct: number | Partial<Product> | null | undefined): StockStatusInfo {
  const qty = typeof quantityOrProduct === "number"
    ? Math.max(0, Math.floor(quantityOrProduct))
    : getProductStockQuantity(quantityOrProduct);

  if (qty <= 0) {
    return {
      quantity: 0,
      label: "Out of stock",
      shortLabel: "Out of stock",
      colorClass: "text-red-600",
      dotColor: "bg-red-500",
      isSoldOut: true,
      isUrgent: false,
      state: "sold_out",
    };
  }

  if (qty === 1) {
    return {
      quantity: 1,
      label: "Only 1 left",
      shortLabel: "1 left",
      colorClass: "text-amber-600",
      dotColor: "bg-amber-500",
      isSoldOut: false,
      isUrgent: true,
      state: "low_stock_1",
    };
  }

  if (qty === 2) {
    return {
      quantity: 2,
      label: "Only 2 left",
      shortLabel: "2 left",
      colorClass: "text-amber-600",
      dotColor: "bg-amber-500",
      isSoldOut: false,
      isUrgent: true,
      state: "low_stock_2",
    };
  }

  if (qty === 3) {
    return {
      quantity: 3,
      label: "Only 3 left",
      shortLabel: "3 left",
      colorClass: "text-amber-600",
      dotColor: "bg-amber-500",
      isSoldOut: false,
      isUrgent: true,
      state: "low_stock_2",
    };
  }

  // Healthy stock >= 4
  return {
    quantity: qty,
    label: `${qty} in stock`,
    shortLabel: `${qty} in stock`,
    colorClass: "text-emerald-600",
    dotColor: "bg-emerald-500",
    isSoldOut: false,
    isUrgent: false,
    state: "in_stock",
  };
}

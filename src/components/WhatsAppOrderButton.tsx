import React from "react";
import { Product, CartItem } from "../types";
import {
  generateProductWhatsAppMessage,
  generateCartWhatsAppMessage,
  openWhatsAppOrder,
  SingleProductOrderOptions,
} from "../utils/whatsapp";

interface OrderNowButtonProps {
  product?: Product;
  options?: SingleProductOrderOptions;
  cartItems?: CartItem[];
  customTotal?: number;
  variant?: "primary" | "secondary" | "card" | "compact" | "outline";
  label?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  onClickCustom?: () => void;
}

export default function WhatsAppOrderButton({
  product,
  options,
  cartItems,
  customTotal,
  variant = "primary",
  label = "Order Now",
  className = "",
  id = "order-now-btn",
  disabled = false,
  onClickCustom,
}: OrderNowButtonProps) {
  const isOutOfStock = disabled || (product && (product.quantity === 0 || product.stockQuantity === 0 || product.availability === "Sold Out" || (product.availability as string) === "Out of stock"));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (onClickCustom) {
      onClickCustom();
      return;
    }

    let message = "";
    if (cartItems && cartItems.length > 0) {
      message = generateCartWhatsAppMessage(cartItems, customTotal);
    } else if (product) {
      message = generateProductWhatsAppMessage(product, options);
    } else {
      message = `Hello MILITO 👋\n\nI would like to place an order from MILITO TECH HOME.\n\nPlease help me continue with my order.`;
    }

    openWhatsAppOrder(message);
  };

  // Disabled / Out of stock state
  if (isOutOfStock) {
    if (variant === "card") {
      return (
        <button
          type="button"
          disabled
          id={id}
          className={`w-full inline-flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-400 font-bold text-[9px] sm:text-xs uppercase tracking-wider cursor-not-allowed border border-gray-200 ${className}`}
        >
          <span>Out of Stock</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled
        id={id}
        className={`w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gray-150 text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed border border-gray-250 ${className}`}
      >
        <span>Out of Stock</span>
      </button>
    );
  }

  // Card Variant: Sleek and prominent for Product Cards
  if (variant === "card") {
    return (
      <button
        type="button"
        id={id}
        onClick={handleClick}
        className={`w-full inline-flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-[9px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer font-sans ${className}`}
      >
        <span>{label}</span>
      </button>
    );
  }

  // Outline Variant
  if (variant === "outline") {
    return (
      <button
        type="button"
        id={id}
        onClick={handleClick}
        className={`w-full inline-flex items-center justify-center py-3 px-4 rounded-xl border-2 border-milito-green bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-98 cursor-pointer ${className}`}
      >
        <span>{label}</span>
      </button>
    );
  }

  // Primary Variant: Large prominent button for Product Details Modal and Cart
  return (
    <button
      type="button"
      id={id}
      onClick={handleClick}
      className={`w-full py-3.5 sm:py-4 px-6 rounded-xl bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(0,177,79,0.25)] transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${className}`}
    >
      <span>{label}</span>
    </button>
  );
}

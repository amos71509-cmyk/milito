import React from "react";
import { Star, ShoppingCart, Check } from "lucide-react";
import { Product, resolveImageUrl } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isComparing: boolean;
  onToggleCompare: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onOpenDetails, 
  onQuickAdd,
  isComparing,
  onToggleCompare
}: ProductCardProps) {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  const getAvailabilityColor = (avail?: string) => {
    if (avail === "Reserved") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (avail === "Sold Out" || product.quantity === 0) return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-emerald-500/10 text-[#00B14F] border-[#00B14F]/20";
  };

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "New Arrival":
        return "bg-purple-50 text-purple-700 border-purple-200 shadow-sm";
      case "Hot Deal":
        return "bg-rose-50 text-rose-700 border-rose-200 shadow-sm";
      case "Best Seller":
        return "bg-amber-50 text-amber-800 border-amber-200 shadow-sm";
      case "Limited Stock":
        return "bg-orange-50 text-orange-700 border-orange-200 shadow-sm";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 shadow-sm";
    }
  };

  const isProductSoldOut = product.availability === "Sold Out" || product.quantity === 0;

  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col h-full shadow-md ${
      isComparing ? "border-milito-green ring-2 ring-milito-green/20" : "border-gray-250 hover:border-milito-green/50 hover:shadow-xl"
    }`}>
      {/* Badges and tags */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {product.badge && (
          <span className="text-[9px] uppercase font-extrabold tracking-widest bg-milito-green text-[#1A2025] px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,177,79,0.25)]">
            {product.badge}
          </span>
        )}
        <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
          product.condition === "Brand New" 
            ? "bg-blue-50 text-blue-650 border-blue-200"
            : "bg-amber-50 text-amber-700 border-amber-250"
        }`}>
          {product.condition}
        </span>
        {isProductSoldOut ? (
          <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
            Sold Out
          </span>
        ) : (
          product.availability && (
            <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getAvailabilityColor(product.availability)}`}>
              {product.availability}
            </span>
          )
        )}
        {/* Optional tags */}
        {product.tags && product.tags.map((tag) => (
          <span key={tag} className={`text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${getTagStyle(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Compare Checkbox Anchor on card top-right */}
      <div className="absolute top-4 right-4 z-10">
        <label className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-sm hover:border-milito-green transition duration-200 text-[10px] font-bold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => onToggleCompare(product)}
            className="w-3.5 h-3.5 rounded text-milito-green border-gray-300 focus:ring-milito-green cursor-pointer accent-milito-green"
          />
          <span>Compare</span>
        </label>
      </div>

      {/* Main product cover image with scale hover animation */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="h-56 w-full bg-gray-50 flex items-center justify-center relative cursor-pointer overflow-hidden group-hover:bg-gray-100 transition-colors"
      >
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Hover quick views overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-[#1A2025]/95 backdrop-blur-sm py-2.5 text-center text-[10px] font-bold text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          Click for Full Specs & Sourcing Reviews
        </div>
      </div>

      {/* Product Content Block */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand & Specifications Row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">{product.brand}</span>
          <div className="flex items-center gap-1 bg-gray-50 px-2 rounded-full border border-gray-200 shadow-sm">
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span className="text-[9px] text-gray-700 font-bold">{product.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => onOpenDetails(product)}
          className="text-sm font-extrabold text-gray-900 mt-2 group-hover:text-milito-green transition cursor-pointer line-clamp-1 font-sans"
        >
          {product.name}
        </h3>

        {/* Device Attributes (Storage list, Battery Health) */}
        <div className="flex flex-wrap gap-2 mt-3 mb-1">
          <div className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-150 px-2.5 py-1 rounded-lg">
            💾 {product.storageOptions.join(" / ")}
          </div>
          {product.condition === "Premium UK Used" && (
            <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
              🔋 Battery: <span className="font-bold text-emerald-900">{product.batteryHealth || "90%+"}</span>
            </div>
          )}
          {product.condition === "Brand New" && (
            <div className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-105 px-2 py-0.5 rounded-lg flex items-center gap-1">
              🔋 Battery: <span className="font-bold text-blue-950">100% (Sealed)</span>
            </div>
          )}
        </div>

        {/* Short description */}
        <p className="text-gray-650 text-xs mt-2 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & original price */}
        <div className="mt-4 pt-4 border-t border-gray-150 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-500 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-base font-black text-gray-950 group-hover:text-milito-green transition-colors font-mono">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Details button */}
            <button
              onClick={() => onOpenDetails(product)}
              className="text-[10px] font-black uppercase tracking-wider text-gray-700 hover:text-white px-3 py-2.5 rounded-xl border border-gray-250 bg-white hover:bg-gray-900 hover:border-gray-900 transition-all cursor-pointer shadow-sm"
            >
              View Details
            </button>

            {/* Quick add cart */}
            {isProductSoldOut ? (
              <button
                disabled
                className="p-2.5 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed text-xs font-bold"
                title="Sold Out"
              >
                Out
              </button>
            ) : (
              <button
                onClick={() => onQuickAdd(product)}
                className="p-2.5 rounded-xl bg-milito-green hover:brightness-105 text-black transition-all shadow-[0_4px_12px_rgba(0,177,79,0.2)] active:scale-95 cursor-pointer"
                title="Add to Locked Escrow Custody"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

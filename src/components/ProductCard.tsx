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
    <div className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col shadow-md ${
      isComparing ? "border-milito-green ring-2 ring-milito-green/20" : "border-gray-250 hover:border-milito-green/50 hover:shadow-xl"
    }`}>
      {/* Badges and tags */}
      <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 z-10 flex flex-row md:flex-col flex-wrap gap-1 md:gap-1.5 items-start max-w-[75%] md:max-w-none pointer-events-none">
        {product.badge && (
          <span className="text-[7.5px] md:text-[9px] uppercase font-bold md:font-extrabold tracking-tight md:tracking-widest bg-milito-green text-[#1A2025] px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-full shadow-none md:shadow-[0_4px_12px_rgba(0,177,79,0.25)] pointer-events-auto whitespace-nowrap">
            {product.badge}
          </span>
        )}
        <span className={`text-[7.5px] md:text-[9px] uppercase font-bold tracking-tight md:tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-full border pointer-events-auto whitespace-nowrap ${
          product.condition === "Brand New" 
            ? "bg-blue-50/90 md:bg-blue-50 text-blue-650 border-blue-200"
            : "bg-amber-50/90 md:bg-amber-50 text-amber-700 border-amber-250"
        }`}>
          {product.condition}
        </span>
        {isProductSoldOut ? (
          <span className="text-[7.5px] md:text-[9px] uppercase font-bold tracking-tight md:tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-full border bg-red-500/10 text-red-500 border-red-500/20 pointer-events-auto whitespace-nowrap">
            Sold Out
          </span>
        ) : (
          product.availability && (
            <span className={`text-[7.5px] md:text-[9px] uppercase font-bold tracking-tight md:tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-full border pointer-events-auto whitespace-nowrap ${getAvailabilityColor(product.availability)}`}>
              {product.availability}
            </span>
          )
        )}
        {/* Optional tags */}
        {product.tags && product.tags.map((tag) => (
          <span key={tag} className={`text-[7.5px] md:text-[9px] uppercase font-bold md:font-extrabold tracking-tight md:tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-full border pointer-events-auto whitespace-nowrap ${getTagStyle(tag)}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Compare Checkbox Anchor on card top-right */}
      <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 z-10">
        <label className="flex items-center gap-1 md:gap-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 md:px-2.5 md:py-1.5 rounded-lg md:rounded-xl border border-gray-200 shadow-xs md:shadow-sm hover:border-milito-green transition duration-200 text-[8.5px] md:text-[10px] font-bold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => onToggleCompare(product)}
            className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded text-milito-green border-gray-300 focus:ring-milito-green cursor-pointer accent-milito-green"
          />
          <span className="hidden sm:inline">Compare</span>
        </label>
      </div>

      {/* Main product cover image - strict 1:1 square container */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="w-full aspect-square relative cursor-pointer bg-gray-100 overflow-hidden group-hover:bg-gray-200 transition-colors"
      >
        <img
          src={resolveImageUrl(product.thumbnail?.secure_url || product.image || product.galleryImages?.[0]?.secure_url || product.gallery?.[0])}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
        />
        {/* Hover quick views overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-[#1A2025]/95 backdrop-blur-sm py-2 text-center text-[10px] font-bold text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          Click for Full Specs & Sourcing Reviews
        </div>
      </div>

      {/* Product Content Block */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1">
        {/* Brand & Rating Row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-extrabold uppercase tracking-widest truncate">{product.brand}</span>
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-200 shadow-xs flex-shrink-0">
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span className="text-[9px] text-gray-700 font-bold">{product.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => onOpenDetails(product)}
          className="text-xs sm:text-sm font-bold text-gray-900 mt-1 group-hover:text-milito-green transition cursor-pointer line-clamp-2 leading-snug font-sans"
        >
          {product.name}
        </h3>

        {/* Short Spec summary */}
        <div className="mt-1 mb-1.5">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate block max-w-full">
            💾 {product.storageOptions?.[0] || "128GB"}
            {product.batteryCondition && ` • 🔋 ${product.batteryCondition}`}
            {!product.batteryCondition && product.batteryHealth && ` • 🔋 ${product.batteryHealth}`}
            {product.condition === "Brand New" && !product.batteryCondition && !product.batteryHealth && " • 🔋 100% Sealed"}
            {product.network && ` • 📡 ${product.network}`}
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-1.5 border-t border-gray-150 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {product.originalPrice && (
              <span className="text-[8.5px] sm:text-[9.5px] text-gray-400 line-through font-medium truncate">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-black text-gray-950 group-hover:text-milito-green transition-colors font-mono truncate">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* View Details button */}
            <button
              onClick={() => onOpenDetails(product)}
              className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-700 hover:text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-900 hover:border-gray-900 transition-all cursor-pointer shadow-xs text-center"
            >
              Details
            </button>

            {/* Quick add cart */}
            {isProductSoldOut ? (
              <button
                disabled
                className="p-1 sm:p-1.5 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed text-[8.5px] font-bold"
                title="Sold Out"
              >
                Out
              </button>
            ) : (
              <button
                onClick={() => onQuickAdd(product)}
                className="p-1 sm:p-1.5 rounded-lg bg-milito-green hover:brightness-105 text-black transition-all shadow-[0_2px_8px_rgba(0,177,79,0.2)] active:scale-95 cursor-pointer flex-shrink-0"
                title="Add to Protected Escrow Custody"
              >
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

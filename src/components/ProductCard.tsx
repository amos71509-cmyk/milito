import React, { memo, useState, useEffect, useMemo } from "react";
import { ShoppingCart, Smartphone, Car, ArrowRight } from "lucide-react";
import { Product, resolveImageUrl, extractProductOriginalImages, getFallbackImage } from "../types";
import { getStockStatus } from "../utils/stockUtils";

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isComparing?: boolean;
  isCompared?: boolean;
  onToggleCompare: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatPrice = (p: number) => nairaFormatter.format(p);

function ProductCardComponent({ 
  product, 
  onOpenDetails, 
  onQuickAdd,
  isComparing,
  isCompared,
  onToggleCompare,
}: ProductCardProps) {
  const isComparingEffective = Boolean(isComparing ?? isCompared);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Extract ONLY images that actually belong to this product and were saved by admin
  const candidateUrls = useMemo(() => {
    return extractProductOriginalImages(product);
  }, [product]);

  const currentImageUrl = candidateUrls[imageIndex] || "";

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [product.id, product.image, product.thumbnail]);

  const handleImageError = () => {
    if (imageIndex + 1 < candidateUrls.length) {
      setImageIndex(prev => prev + 1);
    } else {
      setImageFailed(true);
    }
  };

  const stockInfo = getStockStatus(product);
  const isProductSoldOut = stockInfo.isSoldOut;

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "New Arrival":
        return "bg-purple-50 text-purple-700 border-purple-200 shadow-xs";
      case "Hot Deal":
        return "bg-rose-50 text-rose-700 border-rose-200 shadow-xs";
      case "Best Seller":
        return "bg-amber-50 text-amber-800 border-amber-200 shadow-xs";
      case "Limited Stock":
        return "bg-orange-50 text-orange-700 border-orange-200 shadow-xs";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 shadow-xs";
    }
  };

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(product);
        }
      }}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col shadow-xs sm:shadow-md will-change-transform cursor-pointer select-none ${
        isComparingEffective ? "border-milito-green ring-2 ring-milito-green/30" : "border-gray-200 hover:border-milito-green/50 hover:shadow-xl"
      }`}
    >
      {/* Badges and tags */}
      <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start max-w-[70%] pointer-events-none">
        {product.badge && (
          <span className="text-[7px] sm:text-[9px] uppercase font-black tracking-tight sm:tracking-widest bg-milito-green text-[#1A2025] px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md shadow-xs pointer-events-auto whitespace-nowrap">
            {product.badge}
          </span>
        )}
        <span className={`text-[7px] sm:text-[8.5px] uppercase font-bold tracking-tight px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md border pointer-events-auto whitespace-nowrap ${
          product.condition === "Brand New" 
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-amber-50 text-amber-800 border-amber-200"
        }`}>
          {product.condition}
        </span>
      </div>

      {/* Compare Checkbox Anchor on card top-right */}
      <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10">
        <label 
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-1 sm:gap-1.5 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg border transition duration-200 text-[7.5px] sm:text-[9px] font-bold cursor-pointer select-none shadow-xs ${
            isComparingEffective 
              ? "bg-milito-green text-black border-milito-green shadow-[0_2px_8px_rgba(0,177,79,0.3)]" 
              : "bg-white/95 text-gray-700 border-gray-200 hover:border-milito-green"
          }`}
        >
          <input
            type="checkbox"
            checked={isComparingEffective}
            onChange={() => onToggleCompare(product)}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded text-milito-green border-gray-300 focus:ring-milito-green cursor-pointer accent-milito-green"
          />
          <span className="font-extrabold">{isComparingEffective ? "Compared" : "Compare"}</span>
        </label>
      </div>

      {/* Main product cover image - fills the card edge-to-edge taking the shape of the card */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="w-full aspect-square relative cursor-pointer bg-gray-100 overflow-hidden group-hover:bg-gray-200 transition-colors"
      >
        {currentImageUrl && !imageFailed ? (
          <img
            key={currentImageUrl}
            src={currentImageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover object-center block transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center select-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-1.5 text-gray-400">
              {product.productType === "vehicle" ? (
                <Car className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              ) : (
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 leading-tight">Image unavailable</span>
          </div>
        )}
        {/* Hover quick views overlay (desktop only) */}
        <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-[#1A2025]/95 backdrop-blur-sm py-1.5 text-center text-[9px] font-bold text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          Click for Specifications
        </div>
      </div>

      {/* Product Content Block */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        {/* Brand & Stock Availability Row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8px] sm:text-[9.5px] text-gray-500 font-extrabold uppercase tracking-wider truncate">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dotColor}`} />
            <span className={`text-[8.5px] sm:text-[10px] font-bold ${stockInfo.colorClass}`}>
              {stockInfo.label}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => onOpenDetails(product)}
          className="text-[11px] sm:text-sm font-bold text-gray-900 mt-0.5 sm:mt-1 group-hover:text-milito-green transition cursor-pointer line-clamp-2 leading-tight sm:leading-snug font-sans min-h-[28px] sm:min-h-[36px]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Short Spec summary */}
        <div className="mt-1 mb-1.5">
          {product.productType === "vehicle" ? (
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate block max-w-full">
              🚗 {product.year || "Vehicle"}{product.transmission ? ` • ${product.transmission}` : ""}
            </span>
          ) : (
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate block max-w-full">
              💾 {product.storageOptions?.[0] || "128GB"}
              {product.batteryCondition ? ` • 🔋 ${product.batteryCondition}` : product.batteryHealth ? ` • 🔋 ${product.batteryHealth}` : ""}
            </span>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 border-t border-gray-150 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {product.originalPrice && (
              <span className="text-[7.5px] sm:text-[9px] text-gray-400 line-through font-medium truncate">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-[12px] sm:text-sm font-black text-gray-950 group-hover:text-milito-green transition-colors font-mono truncate">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Specs action indicator */}
            <span className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-tight text-gray-700 group-hover:text-white px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg border border-gray-250 bg-white group-hover:bg-[#1A2025] group-hover:border-[#1A2025] transition-all flex items-center gap-1 shadow-xs">
              <span>View Specs</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-milito-green transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;

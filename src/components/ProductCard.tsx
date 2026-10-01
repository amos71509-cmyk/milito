import React, { memo, useState, useEffect, useMemo } from "react";
import { ShoppingCart, Smartphone, Car } from "lucide-react";
import { Product, resolveImageUrl, extractProductOriginalImages, getFallbackImage } from "../types";
import { getStockStatus } from "../utils/stockUtils";
import WhatsAppOrderButton from "./WhatsAppOrderButton";

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isComparing: boolean;
  onToggleCompare: (product: Product) => void;
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
  onToggleCompare,
}: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Extract candidate image URLs starting with product's original images
  const originalImages = extractProductOriginalImages(product);
  const primaryFallback = resolveImageUrl(product.thumbnail || product.image || product.galleryImages?.[0]?.secure_url || product.gallery?.[0]);

  const candidateUrls = useMemo(() => {
    const list: string[] = [];
    originalImages.forEach(u => {
      if (u && !list.includes(u)) list.push(u);
    });
    if (primaryFallback && !list.includes(primaryFallback)) {
      list.push(primaryFallback);
    }
    const brandFallback = getFallbackImage(product.brand, product.productType);
    if (brandFallback && !list.includes(brandFallback)) {
      list.push(brandFallback);
    }
    return list.filter(Boolean);
  }, [originalImages, primaryFallback, product.brand, product.productType]);

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

  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col shadow-md will-change-transform ${
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
        {currentImageUrl && !imageFailed ? (
          <img
            key={currentImageUrl}
            src={currentImageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/90 text-gray-500 p-4 text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-gray-200/80 flex items-center justify-center mb-2 text-gray-400 group-hover:bg-gray-200 transition">
              {product.productType === "vehicle" ? (
                <Car className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Smartphone className="w-6 h-6 stroke-[1.5]" />
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-700 leading-tight">Original image unavailable</span>
            <span className="text-[9px] font-medium text-gray-400 mt-0.5">Asset offline</span>
          </div>
        )}
        {/* Hover quick views overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-[#1A2025]/95 backdrop-blur-sm py-2 text-center text-[10px] font-bold text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          Click for Full Specifications
        </div>
      </div>

      {/* Product Content Block */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1">
        {/* Brand & Stock Availability Row (Replaces old rating area with text directly on white background) */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-extrabold uppercase tracking-widest truncate">
            {product.brand}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dotColor}`} />
            <span className={`text-[10px] sm:text-[11px] font-bold ${stockInfo.colorClass}`}>
              {stockInfo.label}
            </span>
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
          {product.productType === "vehicle" ? (
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate block max-w-full">
              🚗 {product.year || "Vehicle"}
              {product.transmission && ` • ⚙️ ${product.transmission}`}
              {product.fuelType && ` • ⛽ ${product.fuelType}`}
              {product.mileage && ` • 🛣️ ${product.mileage}`}
              {product.location && ` • 📍 ${product.location}`}
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate block max-w-full">
              💾 {product.storageOptions?.[0] || "128GB"}
              {product.specs?.ram && ` • 🧠 ${product.specs.ram}`}
              {product.networkCapability && ` • 📶 ${product.networkCapability}`}
              {product.batteryCondition && ` • 🔋 ${product.batteryCondition}`}
              {!product.batteryCondition && product.batteryHealth && ` • 🔋 ${product.batteryHealth}`}
              {product.condition === "Brand New" && !product.batteryCondition && !product.batteryHealth && " • 🔋 100%"}
              {product.network && !product.networkCapability && ` • 📡 ${product.network}`}
            </span>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 border-t border-gray-150 flex items-center justify-between gap-1">
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

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* View Details button */}
            <button
              onClick={() => onOpenDetails(product)}
              className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-700 hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-900 hover:border-gray-900 transition-all cursor-pointer shadow-xs text-center"
            >
              Details
            </button>

            {/* Quick add cart */}
            {isProductSoldOut ? (
              <button
                disabled
                className="p-1 sm:p-1.5 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed text-[8.5px] font-bold"
                title="Out of stock"
              >
                Out
              </button>
            ) : (
              <button
                onClick={() => onQuickAdd(product)}
                className="p-1 sm:p-1.5 rounded-lg bg-gray-100 hover:bg-milito-green hover:text-black text-gray-700 transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
                title="Add to cart"
              >
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dedicated "Order Now" button */}
        <div className="mt-2">
          <WhatsAppOrderButton
            product={product}
            variant="card"
            label="Order Now"
            disabled={isProductSoldOut}
            id={`product-card-order-${product.id}`}
          />
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;

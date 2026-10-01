import React, { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, ImageOff, ArrowLeft, Zap, Info, ShieldCheck, ArrowLeftRight, Share2, Bell, AlertCircle } from "lucide-react";
import { Product, ProductAlertType, resolveImageUrl, extractProductOriginalImages, getFallbackImage } from "../types";
import { getStockStatus } from "../utils/stockUtils";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";
import WhatsAppOrderButton from "./WhatsAppOrderButton";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedStorage?: string, selectedColor?: { name: string; hex: string }) => void;
  onBuyNow?: (product: Product, selectedStorage: string, selectedColor: { name: string; hex: string }, price: number) => void;
  onSwapForThis?: (product: Product) => void;
  onShare?: (product: Product) => void;
  onNotifyMe?: (product: Product, alertType?: ProductAlertType) => void;
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatPrice = (p: number) => nairaFormatter.format(p);

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onSwapForThis,
  onShare,
  onNotifyMe,
}: ProductDetailsModalProps) {
  const [selectedStorage, setSelectedStorage] = useState<string>(
    product.storageOptions && product.storageOptions.length > 0 ? product.storageOptions[0] : ""
  );

  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.colorOptions && product.colorOptions.length > 0
      ? product.colorOptions[0]
      : { name: "Default", hex: "#000000" }
  );

  // Extract all original images cleanly with fallback protection
  const rawOriginalImages = extractProductOriginalImages(product);
  const galleryList = useMemo(() => {
    const list: string[] = [];
    rawOriginalImages.forEach((img) => {
      if (img && !list.includes(img)) list.push(img);
    });
    const primaryFallback = resolveImageUrl(product.thumbnail || product.image || product.galleryImages?.[0]?.secure_url || product.gallery?.[0]);
    if (primaryFallback && !list.includes(primaryFallback)) {
      list.push(primaryFallback);
    }
    const brandFallback = getFallbackImage(product.brand, product.productType);
    if (brandFallback && !list.includes(brandFallback)) {
      list.push(brandFallback);
    }
    return list.filter(Boolean);
  }, [rawOriginalImages, product.thumbnail, product.image, product.galleryImages, product.gallery, product.brand, product.productType]);

  const [activeImageTab, setActiveImageTab] = useState(0);
  const [failedImages, setFailedImages] = useState<{ [index: number]: boolean }>({});

  const stockInfo = getStockStatus(product);
  const isProductSoldOut = stockInfo.isSoldOut;

  // Lock body scroll cleanly while modal is open
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  const handlePrevImage = () => {
    setActiveImageTab((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageTab((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0));
  };

  // Price calculation
  const currentPrice = product.price;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A2025]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden relative animate-scaleUp">
        
        {/* Sticky Header with Close Button */}
        <div className="p-4 sm:p-5 border-b border-gray-150 flex items-center justify-between bg-white z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:text-black hover:bg-gray-150 transition-all duration-200 cursor-pointer shadow-xs text-xs font-bold font-sans"
              title="Go back to device listings"
            >
              <ArrowLeft className="w-4 h-4 text-milito-green" />
              <span>Back</span>
            </button>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">
              MILITO Verified Specs
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(product)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-all text-xs font-bold font-sans cursor-pointer"
                title="Share this product"
              >
                <Share2 className="w-3.5 h-3.5 text-milito-green" />
                <span>Share</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition cursor-pointer"
              title="Close Product View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Gallery */}
            <div className="flex flex-col items-center">
              {/* Main Photo View */}
              <div className="w-full aspect-square max-h-[380px] bg-gray-100 rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden relative flex items-center justify-center mb-4 group select-none">
                {galleryList.length > 0 && !failedImages[activeImageTab] ? (
                  <img
                    src={resolveImageUrl(galleryList[activeImageTab] || galleryList[0], { width: 800, brand: product.brand })}
                    alt={`${product.name} view ${activeImageTab + 1}`}
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setFailedImages(prev => ({ ...prev, [activeImageTab]: true }));
                    }}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <ImageOff className="w-12 h-12 stroke-[1.5] mb-2" />
                    <span className="text-xs font-bold text-gray-650">Product photo offline</span>
                  </div>
                )}

                {/* Left/Right controls for multiple photos */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-all hover:scale-110 cursor-pointer z-10"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-all hover:scale-110 cursor-pointer z-10"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Thumbs */}
              {galleryList.length > 1 && (
                <div className="flex justify-center gap-2 sm:gap-2.5 flex-wrap w-full max-h-36 overflow-y-auto p-1">
                  {galleryList.map((img, index) => {
                    const thumbFailed = failedImages[index];
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImageTab(index)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden p-0.5 bg-white flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                          activeImageTab === index
                            ? "border-milito-green ring-3 ring-milito-green/30 scale-105 shadow-sm"
                            : "border-gray-250 hover:border-gray-400 opacity-70 hover:opacity-100"
                        }`}
                        title={`View Photo ${index + 1}`}
                      >
                        {!thumbFailed ? (
                          <img
                            src={resolveImageUrl(img, { width: 140, brand: product.brand })}
                            alt={`Thumbnail ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={() => {
                              setFailedImages(prev => ({ ...prev, [index]: true }));
                            }}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageOff className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quality & Trust Alert */}
              {product.productType === "vehicle" ? (
                <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 shadow-xs w-full">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Verified Auto Inspection & Customs Papers</h5>
                    <p className="text-[11px] text-gray-650 mt-1 leading-relaxed">
                      {product.documentation || "Complete original vehicle customs clearance and verification papers guaranteed."} 
                      {product.location ? ` Inspected and physically verified in ${product.location}.` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-milito-green/10 border border-milito-green/20 flex items-start gap-3 shadow-xs w-full">
                  <Zap className="w-5 h-5 text-milito-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">QC Battery Health Guard</h5>
                    <p className="text-[11px] text-gray-650 mt-1 leading-relaxed">
                      {product.condition === "Brand New"
                        ? "100% Battery capacity. Guaranteed brand-sealed. Ships with official manufacturer backing."
                        : `We guarantee a tested Battery Health state between ${product.specs?.batterySize && product.specs.batterySize.includes("tested") ? product.specs.batterySize : "88% and 95%"} for our pristine grade UK used stock.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Details & Purchasing */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                {/* Brand & Stock Availability Header (Single clean indicator directly on white background) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-milito-green font-bold tracking-wider uppercase">
                    {product.brand} {product.productType === "vehicle" ? (product.year || "Automotive") : "Flagship"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stockInfo.dotColor}`} />
                    <span className={`text-xs font-extrabold ${stockInfo.colorClass}`}>
                      {stockInfo.label}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-gray-950 mt-1.5 font-sans">{product.name}</h2>
                <div className="mt-2">
                  <p className="text-milito-green text-2xl sm:text-3xl font-black font-mono">{formatPrice(currentPrice)}</p>
                </div>
              </div>

              <p className="text-xs text-gray-650 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                {product.description}
              </p>

              {/* Storage Config (For Phones) */}
              {product.productType !== "vehicle" && product.storageOptions && product.storageOptions.length > 0 && (
                <div>
                  <span className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-2.5">
                    Storage Capacity
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.storageOptions.map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStorage(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                          selectedStorage === st
                            ? "bg-milito-green text-black border-milito-green shadow-xs"
                            : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-sm"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hard Specs Sheet */}
              <div className="pt-4 border-t border-gray-250 space-y-3">
                <span className="block text-xs font-extrabold text-gray-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-milito-green" />
                  {product.productType === "vehicle" ? "Vehicle Specifications" : "Technical Spec Sheet"}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                  {product.productType === "vehicle" ? (
                    [
                      ...(product.year ? [{ label: "Model Year", val: product.year }] : []),
                      ...(product.condition ? [{ label: "Vehicle Condition", val: product.condition }] : []),
                      ...(product.mileage ? [{ label: "Mileage", val: product.mileage }] : []),
                      ...(product.transmission ? [{ label: "Transmission", val: product.transmission }] : []),
                      ...(product.fuelType ? [{ label: "Fuel Type", val: product.fuelType }] : []),
                      ...(product.engineSize ? [{ label: "Engine Size / Trim", val: product.engineSize }] : []),
                      ...(product.driveType ? [{ label: "Drivetrain", val: product.driveType }] : []),
                      ...(product.location ? [{ label: "Physical Location", val: product.location }] : []),
                      ...(product.vehicleStatus ? [{ label: "Vehicle Status", val: product.vehicleStatus }] : []),
                      ...(product.documentation ? [{ label: "Documentation / Papers", val: product.documentation }] : []),
                      ...(product.color ? [{ label: "Exterior Color", val: product.color }] : []),
                      ...(product.interiorColor ? [{ label: "Interior Color", val: product.interiorColor }] : []),
                      ...(product.vin ? [{ label: "VIN / Chassis", val: product.vin }] : []),
                      ...(product.vehicleFeatures && product.vehicleFeatures.length > 0 ? [{ label: "Key Features", val: product.vehicleFeatures.join(", ") }] : [])
                    ].filter(item => Boolean(item.val)).map((spec) => (
                      <div key={spec.label} className="border-b border-gray-200 pb-1.5 last:border-b-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">{spec.label}</span>
                        <span className="text-gray-800 font-semibold leading-relaxed mt-0.5 block">{spec.val}</span>
                      </div>
                    ))
                  ) : (
                    [
                      ...(product.specs?.ram ? [{ label: "RAM / Memory", val: product.specs.ram }] : []),
                      ...(product.batteryHealth ? [{ label: "Battery Health", val: product.batteryHealth }] : []),
                      ...(product.batteryCondition ? [{ label: "Battery Condition", val: product.batteryCondition }] : []),
                      ...(product.networkCapability ? [{ label: "Network Band", val: product.networkCapability }] : []),
                      ...(product.network ? [{ label: "Network Status", val: product.network }] : []),
                      ...(product.deviceLockStatus ? [{ label: "Device Lock", val: product.deviceLockStatus }] : []),
                      ...(product.fingerprint ? [{ label: "Fingerprint Sensor", val: product.fingerprint }] : []),
                      ...(product.faceId ? [{ label: "Face ID / Unlock", val: product.faceId }] : []),
                      ...(product.specs?.screen ? [{ label: "Display", val: product.specs.screen }] : []),
                      ...(product.specs?.chipset ? [{ label: "Processor", val: product.specs.chipset }] : []),
                      ...(product.specs?.camera ? [{ label: "Main Cameras", val: product.specs.camera }] : []),
                      ...(product.specs?.batterySize ? [{ label: "Factory Battery", val: product.specs.batterySize }] : []),
                      ...(product.specs?.os ? [{ label: "Platform OS", val: product.specs.os }] : []),
                      ...(product.specs?.simType ? [{ label: "Sim Standard", val: product.specs.simType }] : []),
                      ...(product.specs?.warranty ? [{ label: "Store Warranty", val: product.specs.warranty }] : [])
                    ].filter(item => Boolean(item.val)).map((spec) => (
                      <div key={spec.label} className="border-b border-gray-200 pb-1.5 last:border-b-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">{spec.label}</span>
                        <span className="text-gray-800 font-semibold leading-relaxed mt-0.5 block">{spec.val}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Trigger Action Area */}
              <div className="pt-4 border-t border-gray-250 space-y-3">
                {isProductSoldOut ? (
                  /* OUT OF STOCK: PROMINENT PRIMARY NOTIFY ME CALL TO ACTION */
                  <div className="space-y-2.5">
                    {/* Out of stock indicator */}
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                        Restock Pending
                      </span>
                    </div>

                    {/* Main Notify Me CTA Button */}
                    <button
                      type="button"
                      onClick={() => onNotifyMe?.(product, "RESTOCK")}
                      aria-label={`Notify me when ${product.name} is back in stock`}
                      className="group relative w-full min-h-[50px] sm:min-h-[52px] py-3.5 sm:py-4 px-6 rounded-2xl bg-[#00B14F] hover:bg-[#009944] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#00B14F]/20 hover:shadow-xl hover:shadow-[#00B14F]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:ring-offset-2"
                      id="modal-notify-me-restock-btn"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.2] transition-transform duration-200 group-hover:rotate-12 flex-shrink-0" />
                      <span>Notify Me When Available</span>
                    </button>

                    {/* Supporting Micro-copy */}
                    <p className="text-xs text-center text-gray-500 font-medium leading-relaxed">
                      Get notified when this device is back in stock.
                    </p>
                  </div>
                ) : (
                  /* IN STOCK: DEDICATED ORDER NOW BUTTON + SECONDARY PRICE ALERT CARD */
                  <div className="space-y-3">
                    <WhatsAppOrderButton
                      product={product}
                      options={{
                        quantity: 1,
                        selectedStorage,
                        selectedColor,
                        customPrice: currentPrice,
                        sellerName: "MILITO Direct",
                      }}
                      label="Order Now"
                      disabled={false}
                      id="modal-order-now-btn"
                    />

                    {/* Secondary Price Notification Card */}
                    {onNotifyMe && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/70 border border-gray-200 transition-all duration-200 space-y-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B14F] border border-emerald-200/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bell className="w-4 h-4 text-[#00B14F] stroke-[2.2]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                              Can&apos;t buy today?
                            </h4>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                              Get notified when the price changes
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onNotifyMe(product, "PRICE_CHANGE")}
                          aria-label={`Get notified when price changes for ${product.name}`}
                          className="group w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50/80 text-gray-900 hover:text-emerald-950 font-extrabold text-xs border border-gray-250 hover:border-emerald-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:ring-offset-1"
                          id="modal-notify-price-change-btn"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#00B14F] stroke-[2] transition-transform duration-200 group-hover:scale-110" />
                          <span>Notify Me</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Secondary Action Row: Swap & Share */}
                <div className={`grid ${onSwapForThis && (product.productType || "phone") !== "vehicle" && onShare ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2`}>
                  {onSwapForThis && (product.productType || "phone") !== "vehicle" && (
                    <button
                      type="button"
                      onClick={() => onSwapForThis(product)}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-milito-green shrink-0" />
                      <span>Swap for This</span>
                    </button>
                  )}

                  {onShare && (
                    <button
                      type="button"
                      onClick={() => onShare(product)}
                      className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-250 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                      id="details-modal-share-btn"
                    >
                      <Share2 className="w-4 h-4 text-milito-green shrink-0" />
                      <span>Share Product</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-6 rounded-xl bg-gray-50 hover:bg-gray-200 text-gray-700 hover:text-black transition-colors duration-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mb-6 sm:mb-0 border border-gray-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-milito-green" />
                  Go Back to Device Listings
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

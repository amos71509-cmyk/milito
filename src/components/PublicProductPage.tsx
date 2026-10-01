import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Info, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight, 
  ImageOff, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  Share2, 
  Clock, 
  ShoppingBag, 
  AlertCircle, 
  Package, 
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Bell
} from "lucide-react";
import { Product, ProductAlertType, resolveImageUrl, extractProductOriginalImages, getFallbackImage } from "../types";
import { getStockStatus } from "../utils/stockUtils";
import { formatNaira, MILITO_WHATSAPP_CLEAN_NUMBER } from "../utils/whatsapp";
import { 
  getProductPublicUrl, 
  trackFunnelEvent, 
  copyTextToClipboard, 
  isNativeShareSupported, 
  triggerNativeProductShare 
} from "../utils/productUrl";
import WhatsAppOrderButton from "./WhatsAppOrderButton";
import ShareProductModal from "./ShareProductModal";

interface PublicProductPageProps {
  product: Product | null;
  allProducts: Product[];
  trafficSource?: string | null;
  onNavigateHome: () => void;
  onNavigateStore: () => void;
  onSelectProduct: (product: Product) => void;
  onOrderNow: (product: Product, selectedStorage: string, selectedColor: { name: string; hex: string }, price: number, source?: string) => void;
  onSwapForThis: (product: Product) => void;
  onShare?: (product: Product) => void;
  onNotifyMe?: (product: Product, alertType?: ProductAlertType) => void;
}

export default function PublicProductPage({
  product,
  allProducts,
  trafficSource,
  onNavigateHome,
  onNavigateStore,
  onSelectProduct,
  onOrderNow,
  onSwapForThis,
  onShare,
  onNotifyMe,
}: PublicProductPageProps) {
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
    name: "Default",
    hex: "#000000",
  });
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [failedImages, setFailedImages] = useState<{ [index: number]: boolean }>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLocalShareModalOpen, setIsLocalShareModalOpen] = useState(false);

  // Sync initial product options
  useEffect(() => {
    if (product) {
      if (product.storageOptions && product.storageOptions.length > 0) {
        setSelectedStorage(product.storageOptions[0]);
      } else {
        setSelectedStorage("");
      }
      if (product.colorOptions && product.colorOptions.length > 0) {
        setSelectedColor(product.colorOptions[0]);
      } else {
        setSelectedColor({ name: "Default", hex: "#000000" });
      }
      setActiveImageTab(0);
      setFailedImages({});

      // Track product view funnel event
      trackFunnelEvent("product_viewed", {
        productId: product.id,
        productName: product.name,
        source: trafficSource || "direct",
        metadata: { price: product.price, condition: product.condition }
      });
    }
  }, [product, trafficSource]);

  // Gallery List with fallback protection
  const galleryList = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    const originals = extractProductOriginalImages(product);
    originals.forEach(img => {
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
  }, [product]);

  const stockInfo = useMemo(() => {
    if (!product) return { label: "Unavailable", colorClass: "text-gray-400", bgClass: "bg-gray-100", dotColor: "bg-gray-400", isSoldOut: true, isUrgent: false };
    return getStockStatus(product);
  }, [product]);

  // Find similar products for recommendations / fallback
  const similarProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    if (product) {
      return allProducts
        .filter(p => p.id !== product.id && (p.brand === product.brand || p.productType === product.productType))
        .slice(0, 4);
    }
    // Fallback: Return top 4 available products
    return allProducts.slice(0, 4);
  }, [allProducts, product]);

  const handlePrevImage = () => {
    if (galleryList.length === 0) return;
    setActiveImageTab((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1));
  };

  const handleNextImage = () => {
    if (galleryList.length === 0) return;
    setActiveImageTab((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0));
  };

  // Robust product sharing handler: opens share modal with direct WhatsApp, copy link, and native sharing actions
  const handleShareProduct = () => {
    if (!product) return;
    if (onShare) {
      onShare(product);
    } else {
      setIsLocalShareModalOpen(true);
    }
  };

  // Direct quick copy link
  const handleQuickCopyLink = async () => {
    if (!product) return;
    const url = getProductPublicUrl(product, trafficSource || undefined);
    const success = await copyTextToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // =========================================================================
  // SCENARIO A: PRODUCT NOT FOUND OR SOLD/REMOVED (Requirement 11)
  // =========================================================================
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          
          {/* Breadcrumb / Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateStore}
              className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black transition"
            >
              <ArrowLeft className="w-4 h-4 text-[#00B14F]" />
              <span>Back to Store Catalogue</span>
            </button>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              MILITO Verified Direct
            </span>
          </div>

          {/* Unavailable Hero Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <Package className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-sans">
                This device is no longer available
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The product link you accessed has either been purchased or updated in our inventory. Explore our verified live catalogue below for current stock with nationwide delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateStore}
                className="px-6 py-3 rounded-2xl bg-[#00B14F] hover:brightness-105 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00B14F]/20 transition cursor-pointer"
              >
                Explore Store
              </button>
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
              >
                Back to Homepage
              </button>
            </div>
          </div>

          {/* Similar Active Devices */}
          {similarProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-950">Browse Available Alternative Devices</h3>
                  <p className="text-xs text-gray-500">Verified Grade A & Brand New devices currently in stock</p>
                </div>
                <button
                  onClick={onNavigateStore}
                  className="text-xs font-bold text-[#00B14F] hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square bg-gray-50 rounded-xl p-2 flex items-center justify-center mb-3">
                      <img
                        src={resolveImageUrl(p.image || p.thumbnail?.secure_url || p.gallery?.[0], { width: 250, brand: p.brand })}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-[#00B14F] uppercase block">{p.brand}</span>
                      <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{p.name}</h4>
                      <p className="text-sm font-black text-gray-950 font-mono mt-1">{formatNaira(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO B: ACTIVE PRODUCT SALES FUNNEL PAGE
  // =========================================================================
  const isSoldOut = stockInfo.isSoldOut;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-16">
      
      {/* TOP NAVIGATION & CONTEXT BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateStore}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:text-black hover:bg-gray-100 transition text-xs font-bold font-sans cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00B14F]" />
            <span>Store Catalogue</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {trafficSource && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#00B14F] border border-emerald-200 text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Source: {trafficSource}</span>
              </span>
            )}

            <button
              onClick={handleShareProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-extrabold transition cursor-pointer"
              title="Share this device"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00B14F]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* HERO TWO-COLUMN PRODUCT SALES LAYOUT */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-4 sm:p-8 md:p-10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: HIGH-RES GALLERY */}
            <div className="md:col-span-6 flex flex-col items-center">
              {/* Main Photo */}
              <div className="w-full aspect-square max-h-[420px] bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden relative flex items-center justify-center p-4 group select-none shadow-inner">
                {galleryList.length > 0 && !failedImages[activeImageTab] ? (
                  <img
                    src={resolveImageUrl(galleryList[activeImageTab] || galleryList[0], { width: 900, brand: product.brand })}
                    alt={`${product.name} view ${activeImageTab + 1}`}
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages((prev) => ({ ...prev, [activeImageTab]: true }))}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <ImageOff className="w-12 h-12 stroke-[1.5] mb-2" />
                    <span className="text-xs font-bold text-gray-500">Product Photo Offline</span>
                  </div>
                )}

                {/* Left / Right arrows for multi-image gallery */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {galleryList.length > 1 && (
                <div className="flex justify-center gap-2 sm:gap-3 flex-wrap w-full mt-4 max-h-32 overflow-y-auto p-1">
                  {galleryList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageTab(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden p-1 bg-white flex items-center justify-center border transition-all cursor-pointer ${
                        activeImageTab === idx
                          ? "border-[#00B14F] ring-3 ring-[#00B14F]/30 scale-105 shadow-sm"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img, { width: 150, brand: product.brand })}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quality & Trust Assurance Card */}
              {product.productType === "vehicle" ? (
                <div className="mt-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 w-full shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Verified Vehicle Papers & Inspection
                    </h5>
                    <p className="text-[11px] text-gray-650 mt-1 leading-relaxed">
                      {product.documentation || "Complete original customs clearance and verification papers guaranteed."}
                      {product.location ? ` Inspected and physically verified in ${product.location}.` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 w-full shadow-xs">
                  <Zap className="w-5 h-5 text-[#00B14F] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      MILITO 35-Point QC & Battery Guard
                    </h5>
                    <p className="text-[11px] text-gray-650 mt-1 leading-relaxed">
                      {product.condition === "Brand New"
                        ? "100% Factory sealed condition with official manufacturer warranty and original accessories."
                        : `Guaranteed authentic internal hardware with tested battery health (${product.batteryHealth || "88%–100%"}) and zero lock issues.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT SALES FUNNEL ACTIONS */}
            <div className="md:col-span-6 space-y-6">
              
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#00B14F] tracking-wider uppercase">
                    {product.brand} {product.productType === "vehicle" ? (product.year || "Automotive") : "Flagship"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${stockInfo.dotColor} animate-pulse`} />
                    <span className={`text-xs font-black ${stockInfo.colorClass}`}>
                      {stockInfo.label}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-2 font-sans tracking-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#00B14F] font-mono">
                    {formatNaira(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm font-bold text-gray-400 line-through font-mono">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">
                    Condition: {product.condition}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200">
                    Seller: MILITO Direct
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                {product.description || "Authentic device directly sourced, inspected, and protected under MILITO verified checkout guarantee."}
              </div>

              {/* Storage Capacity Selector (For Phones) */}
              {product.productType !== "vehicle" && product.storageOptions && product.storageOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Storage Capacity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.storageOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStorage(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          selectedStorage === st
                            ? "bg-[#00B14F] text-black border-[#00B14F] shadow-sm font-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#00B14F]" />
                  <span>{product.productType === "vehicle" ? "Vehicle Specifications" : "Technical Specifications"}</span>
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {product.productType === "vehicle" ? (
                    [
                      ...(product.year ? [{ label: "Model Year", val: product.year }] : []),
                      ...(product.condition ? [{ label: "Condition", val: product.condition }] : []),
                      ...(product.mileage ? [{ label: "Mileage", val: product.mileage }] : []),
                      ...(product.transmission ? [{ label: "Transmission", val: product.transmission }] : []),
                      ...(product.fuelType ? [{ label: "Fuel Type", val: product.fuelType }] : []),
                      ...(product.location ? [{ label: "Location", val: product.location }] : []),
                    ].map((s) => (
                      <div key={s.label} className="border-b border-gray-200/80 pb-1 last:border-b-0">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">{s.label}</span>
                        <span className="font-semibold text-gray-900">{s.val}</span>
                      </div>
                    ))
                  ) : (
                    [
                      ...(product.batteryHealth ? [{ label: "Battery Health", val: product.batteryHealth }] : []),
                      ...(product.specs?.ram ? [{ label: "RAM / Memory", val: product.specs.ram }] : []),
                      ...(product.networkCapability ? [{ label: "Network Band", val: product.networkCapability }] : []),
                      ...(product.specs?.screen ? [{ label: "Display", val: product.specs.screen }] : []),
                      ...(product.specs?.camera ? [{ label: "Camera", val: product.specs.camera }] : []),
                      ...(product.specs?.warranty ? [{ label: "Warranty", val: product.specs.warranty }] : []),
                    ].map((s) => (
                      <div key={s.label} className="border-b border-gray-200/80 pb-1 last:border-b-0">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">{s.label}</span>
                        <span className="font-semibold text-gray-900">{s.val}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ======================================================= */}
              {/* PRIMARY & SECONDARY CONVERSION ACTIONS                  */}
              {/* ======================================================= */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                
                {/* Primary CTA: ORDER NOW (for in-stock products) */}
                {!isSoldOut ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        trackFunnelEvent("order_started", {
                          productId: product.id,
                          productName: product.name,
                          source: trafficSource || "direct"
                        });
                        onOrderNow(product, selectedStorage, selectedColor, product.price, trafficSource || undefined);
                      }}
                      className="w-full py-4 px-6 rounded-2xl bg-[#00B14F] hover:brightness-105 active:scale-98 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-[#00B14F]/25 flex items-center justify-center gap-2 cursor-pointer transition min-h-[50px] focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:ring-offset-2"
                      id="public-page-order-now-btn"
                    >
                      <ShoppingBag className="w-5 h-5 text-black" />
                      <span>Order Now ({formatNaira(product.price)})</span>
                    </button>
                    
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
                          id="public-notify-price-change-btn"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#00B14F] stroke-[2] transition-transform duration-200 group-hover:scale-110" />
                          <span>Notify Me</span>
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#00B14F]" />
                      <span>Fast nationwide dispatch • Direct manual bank transfer verification</span>
                    </p>
                  </div>
                ) : (
                  /* OUT OF STOCK: PROMINENT PRIMARY NOTIFY ME CALL TO ACTION */
                  <div className="space-y-2.5">
                    {/* Out of Stock Status Pill */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                        Restock Pending
                      </span>
                    </div>

                    {/* Prominent Notify Me CTA Button */}
                    <button
                      type="button"
                      onClick={() => onNotifyMe?.(product, "RESTOCK")}
                      aria-label={`Notify me when ${product.name} is back in stock`}
                      className="group relative w-full min-h-[50px] sm:min-h-[54px] py-4 px-6 rounded-2xl bg-[#00B14F] hover:bg-[#009944] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#00B14F]/20 hover:shadow-xl hover:shadow-[#00B14F]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:ring-offset-2"
                      id="public-notify-restock-btn"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.2] transition-transform duration-200 group-hover:rotate-12 flex-shrink-0" />
                      <span>Notify Me When Available</span>
                    </button>

                    {/* Supporting Micro-copy */}
                    <p className="text-xs text-center text-gray-500 font-medium leading-relaxed">
                      Get notified when this device is back in stock.
                    </p>
                  </div>
                )}

                {/* Secondary Actions Row */}
                <div className={`grid ${product.productType !== "vehicle" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2.5`}>
                  {product.productType !== "vehicle" && (
                    <button
                      type="button"
                      onClick={() => onSwapForThis(product)}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-[#00B14F] shrink-0" />
                      <span>Swap for This</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98"
                    id="public-page-share-btn"
                  >
                    <Share2 className="w-4 h-4 text-[#00B14F] shrink-0" />
                    <span>Share Product</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RELATED / SIMILAR PRODUCTS CAROUSEL */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">Similar Verified Devices</h3>
                <p className="text-xs text-gray-500">More genuine {product.brand} inventory available for direct order</p>
              </div>
              <button
                onClick={onNavigateStore}
                className="text-xs font-bold text-[#00B14F] hover:underline"
              >
                Explore Store →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-xl p-2 flex items-center justify-center mb-3">
                    <img
                      src={resolveImageUrl(p.image || p.thumbnail?.secure_url || p.gallery?.[0], { width: 250, brand: p.brand })}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#00B14F] uppercase block">{p.brand}</span>
                    <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{p.name}</h4>
                    <p className="text-sm font-black text-gray-950 font-mono mt-1">{formatNaira(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Standalone Share Modal fallback if parent handler not attached */}
      {isLocalShareModalOpen && product && (
        <ShareProductModal
          isOpen={isLocalShareModalOpen}
          onClose={() => setIsLocalShareModalOpen(false)}
          product={product}
        />
      )}

    </div>
  );
}


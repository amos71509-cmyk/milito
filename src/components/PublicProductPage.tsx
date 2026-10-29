import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Info, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight, 
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
  Bell,
  Heart,
  Smartphone,
  Car,
  Tag,
  Battery,
  Wifi,
  HardDrive,
  Cpu,
  Layers,
  ShoppingCart,
  X
} from "lucide-react";
import { Product, ProductAccessory, ProductAlertType, resolveImageUrl, extractProductOriginalImages } from "../types";
import { getStockStatus } from "../utils/stockUtils";
import { formatNaira, MILITO_WHATSAPP_CLEAN_NUMBER } from "../utils/whatsapp";
import { 
  getProductPublicUrl, 
  trackFunnelEvent, 
  copyTextToClipboard 
} from "../utils/productUrl";
import ShareProductModal from "./ShareProductModal";
import CompletePackageSection from "./CompletePackageSection";
import { getDynamicDeliveryDate, createAccessoryCartProduct } from "../utils/deliveryDate";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import CustomerAuthPromptModal from "./CustomerAuthPromptModal";

interface PublicProductPageProps {
  product: Product | null;
  allProducts: Product[];
  trafficSource?: string | null;
  onNavigateHome: () => void;
  onNavigateStore: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, selectedStorage?: string, selectedColor?: { name: string; hex: string }) => void;
  onOpenCart?: () => void;
  onOrderNow?: (product: Product, selectedStorage: string, selectedColor: { name: string; hex: string }, price: number, source?: string) => void;
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
  onAddToCart,
  onOpenCart,
  onOrderNow,
  onSwapForThis,
  onShare,
  onNotifyMe,
}: PublicProductPageProps) {
  const { isLoggedIn, isProductLiked, toggleLikeProduct, isAuthPromptOpen, closeAuthPrompt } = useCustomerAuth();

  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [failedImages, setFailedImages] = useState<{ [index: number]: boolean }>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLocalShareModalOpen, setIsLocalShareModalOpen] = useState(false);
  const [likeToast, setLikeToast] = useState<string | null>(null);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>([]);
  const [cartSuccessNotice, setCartSuccessNotice] = useState<{
    show: boolean;
    productName: string;
    accessoriesCount: number;
    totalAmount: number;
  } | null>(null);

  // Dynamic estimated delivery date (Next Day calculated automatically from current date)
  const deliveryInfo = useMemo(() => getDynamicDeliveryDate(), []);

  // Sync initial product options without inventing missing fields
  useEffect(() => {
    if (product) {
      if (product.storageOptions && product.storageOptions.length > 0) {
        setSelectedStorage(product.storageOptions[0]);
      } else {
        setSelectedStorage("");
      }

      // ONLY set color if saved in product data
      if (product.colorOptions && product.colorOptions.length > 0) {
        setSelectedColor(product.colorOptions[0]);
      } else {
        setSelectedColor(null);
      }

      setActiveImageTab(0);
      setFailedImages({});

      // Track view
      trackFunnelEvent("product_viewed", {
        productId: product.id,
        productName: product.name,
        source: trafficSource || "direct",
        metadata: { price: product.price, condition: product.condition }
      });
    }
  }, [product, trafficSource]);

  // Extract ONLY images that were actually uploaded/saved by admin for this exact product
  const galleryList = useMemo(() => {
    if (!product) return [];
    return extractProductOriginalImages(product);
  }, [product]);

  const stockInfo = useMemo(() => {
    if (!product) return { label: "Unavailable", colorClass: "text-gray-400", bgClass: "bg-gray-100", dotColor: "bg-gray-400", isSoldOut: true, isUrgent: false };
    return getStockStatus(product);
  }, [product]);

  // Optional accessories assigned by admin to this product
  const assignedAccessories = product?.assignedAccessories || [];
  const selectedAccessories = useMemo(() => {
    return assignedAccessories.filter((acc) => selectedAccessoryIds.includes(acc.id));
  }, [assignedAccessories, selectedAccessoryIds]);

  const accessoriesTotal = useMemo(() => {
    return selectedAccessories.reduce((sum, acc) => sum + (Number(acc.price) || 0), 0);
  }, [selectedAccessories]);

  const totalPackagePrice = (product?.price || 0) + accessoriesTotal;

  const handleToggleAccessory = (acc: ProductAccessory) => {
    setSelectedAccessoryIds((prev) =>
      prev.includes(acc.id) ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]
    );
  };

  const handleAddToCartClick = () => {
    if (!product) return;

    trackFunnelEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      source: trafficSource || "direct",
      metadata: {
        accessoriesCount: selectedAccessories.length,
        totalPrice: totalPackagePrice,
      }
    });

    if (onAddToCart) {
      // 1. Add phone to cart
      onAddToCart(
        product,
        selectedStorage || product.storageOptions?.[0] || "",
        selectedColor || (product.colorOptions?.[0] ?? { name: "Default", hex: "#000" })
      );

      // 2. Add each selected accessory as a verified CartItem
      selectedAccessories.forEach((acc) => {
        const accProduct = createAccessoryCartProduct(acc, product);
        onAddToCart(accProduct, "Standard", { name: "Default", hex: "#000" });
      });
    }

    // Immediately take user to the cart section
    if (onOpenCart) {
      onOpenCart();
    } else {
      setCartSuccessNotice({
        show: true,
        productName: product.name,
        accessoriesCount: selectedAccessories.length,
        totalAmount: totalPackagePrice,
      });
    }
  };

  // Find similar products for recommendations
  const similarProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    if (product) {
      return allProducts
        .filter(p => p.id !== product.id && (p.brand === product.brand || p.productType === product.productType))
        .slice(0, 4);
    }
    return allProducts.slice(0, 4);
  }, [allProducts, product]);

  const handlePrevImage = () => {
    if (galleryList.length <= 1) return;
    setActiveImageTab((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1));
  };

  const handleNextImage = () => {
    if (galleryList.length <= 1) return;
    setActiveImageTab((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0));
  };

  const handleShareProduct = () => {
    if (!product) return;
    if (onShare) {
      onShare(product);
    } else {
      setIsLocalShareModalOpen(true);
    }
  };

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigateStore();
    }
  };

  const isLiked = product ? isProductLiked(product.id) : false;

  const handleToggleLike = async () => {
    if (!product) return;
    const res = await toggleLikeProduct(product.id);
    if (res.success) {
      const msg = res.action === "added" ? "Saved to your Liked Products ❤️" : "Removed from Liked Products";
      setLikeToast(msg);
      setTimeout(() => setLikeToast(null), 2500);
    }
  };

  // =========================================================================
  // SCENARIO A: PRODUCT NOT FOUND
  // =========================================================================
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black transition"
            >
              <ArrowLeft className="w-4 h-4 text-[#00B14F]" />
              <span>Back to Store</span>
            </button>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              MILITO TECH HOME
            </span>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950">Device not found or sold</h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              This device is currently unavailable or has been purchased. Browse our verified inventory for current live devices.
            </p>
            <button
              onClick={onNavigateStore}
              className="px-6 py-3 rounded-2xl bg-[#00B14F] text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition"
            >
              Explore Live Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO B: STANDALONE PRODUCT SPEC PAGE
  // =========================================================================
  const isSoldOut = stockInfo.isSoldOut;
  const currentImageUrl = galleryList[activeImageTab] || "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-28 md:pb-16 w-full">
      {/* Toast Notification */}
      {likeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black/95 text-white text-xs font-bold px-4 py-2.5 rounded-full border border-milito-green/50 shadow-2xl flex items-center gap-2 animate-bounce">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{likeToast}</span>
        </div>
      )}

      {/* TOP NAVIGATION & CONTEXT BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-250 bg-gray-50 hover:bg-gray-100 text-gray-800 transition text-xs font-bold font-sans cursor-pointer shadow-2xs"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-[#00B14F]" />
              <span>Back</span>
            </button>
            <span className="text-[11px] font-bold text-gray-500 truncate max-w-[150px] sm:max-w-xs hidden sm:inline">
              {product.brand} &bull; {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Love / Like Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                isLiked
                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:text-rose-600"
              }`}
              title={isLiked ? "Saved to your Wishlist" : "Save this device"}
              aria-label={isLiked ? "Remove from wishlist" : "Save product"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
              <span className="hidden xs:inline">{isLiked ? "Saved" : "Love"}</span>
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShareProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-extrabold transition cursor-pointer"
              title="Share this device"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00B14F]" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        
        {/* TWO-COLUMN PRODUCT SALES LAYOUT */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-3.5 sm:p-8 md:p-10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: HIGH-RES GALLERY (ONLY ACTUAL SAVED IMAGES) */}
            <div className="md:col-span-6 flex flex-col items-center w-full">
              {/* Main Photo View */}
              <div className="w-full aspect-square max-h-[380px] sm:max-h-[440px] bg-gradient-to-b from-gray-50 to-gray-100/70 rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden relative flex items-center justify-center p-3 sm:p-5 select-none shadow-inner">
                {galleryList.length > 0 && currentImageUrl && !failedImages[activeImageTab] ? (
                  <img
                    key={currentImageUrl}
                    src={resolveImageUrl(currentImageUrl, { width: 900, brand: product.brand })}
                    alt={`${product.name} image ${activeImageTab + 1}`}
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages((prev) => ({ ...prev, [activeImageTab]: true }))}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  /* Strictly NO random or stock fallback photo when none uploaded */
                  <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center select-none">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200/80 flex items-center justify-center mb-2 text-gray-400">
                      {product.productType === "vehicle" ? (
                        <Car className="w-7 h-7 stroke-[1.5]" />
                      ) : (
                        <Smartphone className="w-7 h-7 stroke-[1.5]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-650">No photo uploaded by admin</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Specifications verified by MILITO</span>
                  </div>
                )}

                {/* Left / Right arrows ONLY if multiple actual images uploaded */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Previous Image"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Next Image"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Image counter indicator */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                      {activeImageTab + 1} / {galleryList.length}
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails (ONLY for actual uploaded images, no empty slots) */}
              {galleryList.length > 1 && (
                <div className="flex justify-center gap-2 sm:gap-2.5 flex-wrap w-full mt-3 sm:mt-4 max-h-24 overflow-y-auto p-1">
                  {galleryList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageTab(idx)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden p-1 bg-white flex items-center justify-center border transition-all cursor-pointer ${
                        activeImageTab === idx
                          ? "border-[#00B14F] ring-2 ring-[#00B14F]/40 scale-105 shadow-xs"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img
                        src={resolveImageUrl(img, { width: 120, brand: product.brand })}
                        alt={`Thumbnail ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Trust Assurance Banner */}
              <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 w-full shadow-2xs">
                <Zap className="w-5 h-5 text-[#00B14F] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    MILITO 35-Point QC Verified
                  </h5>
                  <p className="text-[11px] text-gray-650 mt-0.5 leading-relaxed">
                    {product.condition === "Brand New"
                      ? "Factory sealed authentic hardware with verified manufacturer warranty."
                      : `Tested authentic internal hardware. Screen, cameras, and battery certified.`}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SPECS & BUY ACTIONS */}
            <div className="md:col-span-6 space-y-4 sm:space-y-6">
              
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#00B14F] tracking-wider uppercase">
                    {product.brand} {product.series ? `• ${product.series}` : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stockInfo.dotColor} animate-pulse`} />
                    <span className={`text-xs font-black ${stockInfo.colorClass}`}>
                      {stockInfo.label}
                    </span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-gray-950 mt-1 font-sans tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="mt-2.5 sm:mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-4xl font-black text-[#00B14F] font-mono">
                    {formatNaira(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs sm:text-sm font-bold text-gray-400 line-through font-mono">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-250">
                    Condition: {product.condition}
                  </span>
                  {product.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-milito-green text-black text-[11px] font-black uppercase">
                      {product.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200">
                    Seller: MILITO Direct
                  </span>
                </div>

                {/* Dynamic Estimated Delivery Date Badge (Calculated Next Day) */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-[#00B14F]/30 text-emerald-950 text-xs">
                  <Truck className="w-4 h-4 text-[#00B14F] shrink-0" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-[#00873c]">{deliveryInfo.label}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">•</span>
                    <span className="text-[11px] text-gray-650">Insured express delivery with tracking</span>
                  </div>
                </div>
              </div>

              {/* Description (from existing product data) */}
              {product.description && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                  {product.description}
                </div>
              )}

              {/* Storage Capacity Selector (ONLY if stored in product data) */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Storage Capacity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.storageOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStorage(st)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          selectedStorage === st
                            ? "bg-[#00B14F] text-black border-[#00B14F] shadow-xs font-black"
                            : "bg-white text-gray-700 border-gray-250 hover:border-gray-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options (ONLY if actually part of stored product data) */}
              {product.colorOptions && product.colorOptions.length > 0 && selectedColor && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Color: <span className="text-gray-900 font-extrabold">{selectedColor.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          selectedColor.name === c.name
                            ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                            : "bg-white text-gray-700 border-gray-250 hover:border-gray-400"
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-black/20" 
                          style={{ backgroundColor: c.hex || "#999" }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Matrix (Strictly from existing stored data) */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#00B14F]" />
                  <span>Device Specifications</span>
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200">
                  {/* Brand & Model */}
                  <div className="border-b border-gray-200/80 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Brand</span>
                    <span className="font-semibold text-gray-900">{product.brand}</span>
                  </div>

                  {product.series && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Series</span>
                      <span className="font-semibold text-gray-900">{product.series}</span>
                    </div>
                  )}

                  {/* Condition */}
                  <div className="border-b border-gray-200/80 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Condition</span>
                    <span className="font-semibold text-gray-900">{product.condition}</span>
                  </div>

                  {/* Storage */}
                  {(selectedStorage || (product.storageOptions && product.storageOptions[0])) && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Storage</span>
                      <span className="font-semibold text-gray-900">{selectedStorage || product.storageOptions?.[0]}</span>
                    </div>
                  )}

                  {/* Battery Info */}
                  {(product.batteryCondition || product.batteryHealth) && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Battery Health</span>
                      <span className="font-semibold text-gray-900">{product.batteryCondition || product.batteryHealth}</span>
                    </div>
                  )}

                  {/* Network / Carrier lock status */}
                  {(product.networkCapability || product.network) && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Network / SIM</span>
                      <span className="font-semibold text-gray-900">{product.networkCapability || product.network}</span>
                    </div>
                  )}

                  {/* SIM Card type */}
                  {product.specs?.simType && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">SIM Type</span>
                      <span className="font-semibold text-gray-900">{product.specs.simType}</span>
                    </div>
                  )}

                  {/* RAM */}
                  {product.specs?.ram && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">RAM</span>
                      <span className="font-semibold text-gray-900">{product.specs.ram}</span>
                    </div>
                  )}

                  {/* Display */}
                  {product.specs?.screen && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Display</span>
                      <span className="font-semibold text-gray-900">{product.specs.screen}</span>
                    </div>
                  )}

                  {/* Camera */}
                  {product.specs?.camera && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Camera</span>
                      <span className="font-semibold text-gray-900">{product.specs.camera}</span>
                    </div>
                  )}

                  {/* Chipset */}
                  {product.specs?.chipset && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Chipset</span>
                      <span className="font-semibold text-gray-900">{product.specs.chipset}</span>
                    </div>
                  )}

                  {/* Face ID / Fingerprint */}
                  {(product.faceId || product.fingerprint) && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Biometrics</span>
                      <span className="font-semibold text-gray-900">
                        {product.faceId ? `Face ID: ${product.faceId}` : `Fingerprint: ${product.fingerprint}`}
                      </span>
                    </div>
                  )}

                  {/* Warranty */}
                  {product.specs?.warranty && (
                    <div className="border-b border-gray-200/80 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Warranty</span>
                      <span className="font-semibold text-gray-900">{product.specs.warranty}</span>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="border-b border-gray-200/80 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Stock Status</span>
                    <span className={`font-bold ${stockInfo.colorClass}`}>{stockInfo.label}</span>
                  </div>
                </div>
              </div>

              {/* 2. OPTIONAL ACCESSORIES / COMPLETE YOUR PACKAGE */}
              {product.assignedAccessories && product.assignedAccessories.length > 0 && (
                <CompletePackageSection
                  product={product}
                  assignedAccessories={product.assignedAccessories}
                  selectedAccessoryIds={selectedAccessoryIds}
                  onToggleAccessory={handleToggleAccessory}
                />
              )}

              {/* CART SUCCESS CONFIRMATION FEEDBACK */}
              {cartSuccessNotice?.show && (
                <div className="p-4 rounded-2xl bg-[#1A2025] text-white border border-[#00B14F]/50 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#00B14F] text-black flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white">
                          Added to Cart!
                        </h4>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {cartSuccessNotice.productName}
                          {cartSuccessNotice.accessoriesCount > 0
                            ? ` + ${cartSuccessNotice.accessoriesCount} verified accessory ${cartSuccessNotice.accessoriesCount === 1 ? "add-on" : "add-ons"}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCartSuccessNotice(null)}
                      className="text-gray-400 hover:text-white p-1 cursor-pointer"
                      title="Dismiss notice"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCartSuccessNotice(null);
                        if (onOpenCart) {
                          onOpenCart();
                        }
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00B14F] hover:bg-[#009241] active:scale-98 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                      id="spec-view-cart-checkout-btn"
                    >
                      <ShoppingCart className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>View Cart & Checkout ({formatNaira(cartSuccessNotice.totalAmount)})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCartSuccessNotice(null)}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition text-center"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS (ADD TO CART) */}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                
                {/* Primary: ADD TO CART */}
                {!isSoldOut ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleAddToCartClick}
                      className="w-full py-4 px-6 rounded-2xl bg-[#00B14F] hover:bg-[#009944] active:scale-98 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00B14F]/25 flex items-center justify-center gap-2.5 cursor-pointer transition min-h-[52px]"
                      id="spec-page-add-to-cart-btn"
                    >
                      <ShoppingCart className="w-5 h-5 text-black stroke-[2.5]" />
                      <span>
                        {selectedAccessories.length > 0
                          ? `Add Package to Cart • ${formatNaira(totalPackagePrice)}`
                          : `Add to Cart • ${formatNaira(product.price)}`}
                      </span>
                    </button>

                    <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5 text-[#00B14F] shrink-0" />
                      <span>{deliveryInfo.label} • Insured nationwide delivery with instant tracking</span>
                    </p>
                  </div>
                ) : (
                  /* OUT OF STOCK NOTIFICATION */
                  <div className="space-y-2.5">
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNotifyMe?.(product, "RESTOCK")}
                        className="flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#00B14F] hover:bg-[#009944] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                        id="spec-notify-restock-btn"
                      >
                        <Bell className="w-4 h-4 text-black" />
                        <span>Notify Me When Restocked</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleLike}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-center min-h-[48px] ${
                          isLiked
                            ? "bg-rose-50 border-rose-200 text-rose-600 shadow-xs"
                            : "bg-gray-100 hover:bg-rose-50 border-gray-250 text-gray-600 hover:text-rose-600"
                        }`}
                        title={isLiked ? "Saved to your Wishlist" : "Save this device"}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Secondary Actions: SWAP & SHARE */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {product.productType !== "vehicle" && (
                    <button
                      type="button"
                      onClick={() => onSwapForThis(product)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-98"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#00B14F] shrink-0" />
                      <span>Swap For This</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-98"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#00B14F] shrink-0" />
                    <span>Share Device</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RELATED / SIMILAR DEVICES CAROUSEL */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-950">Similar Verified Devices</h3>
                <p className="text-xs text-gray-500">More genuine {product.brand} inventory available</p>
              </div>
              <button
                type="button"
                onClick={onNavigateStore}
                className="text-xs font-bold text-[#00B14F] hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {similarProducts.map((p) => {
                const pImgs = extractProductOriginalImages(p);
                const pImg = pImgs.length > 0 ? pImgs[0] : "";

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="w-full aspect-square bg-gray-100 overflow-hidden relative flex items-center justify-center">
                      {pImg ? (
                        <img
                          src={resolveImageUrl(pImg, { width: 300, brand: p.brand })}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-2">
                          <Smartphone className="w-6 h-6 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#00B14F] uppercase block">{p.brand}</span>
                        <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 truncate mt-0.5">{p.name}</h4>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-gray-950 font-mono mt-1">{formatNaira(p.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Auth Prompt Modal (For Guests who click Love/Like) */}
      <CustomerAuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={closeAuthPrompt}
      />

      {/* Share Modal */}
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

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, ArrowLeft, Sparkles, Filter, Check, ShoppingCart, RefreshCw, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { searchStoreProducts } from "../utils/searchUtils";

export type CategoryKey = "iphone" | "android" | "ipad" | "wrist";

interface CategoryShoppingPageProps {
  category: CategoryKey;
  products: Product[];
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
  onBackToHome: () => void;
  onSelectCategory: (cat: CategoryKey) => void;
  onOpenCart?: () => void;
}

interface CategoryMeta {
  title: string;
  tagline: string;
  description: string;
  searchPlaceholder: string;
  badge: string;
}

const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  iphone: {
    title: "iPhone",
    tagline: "Apple Flagships & Essentials",
    description: "Explore 100% factory unlocked Brand New & certified Grade A UK Used iPhones with verified battery health.",
    searchPlaceholder: "Search iPhone model (e.g. 15 Pro, 14, 256GB)...",
    badge: "Official Apple iOS Devices",
  },
  android: {
    title: "Android Phones",
    tagline: "Samsung, Google Pixel, Tecno, Infinix & Redmi",
    description: "Find high-performance Android devices across flagship, camera specialist and value powerhouse tiers.",
    searchPlaceholder: "Search Android brand or model (e.g. S24 Ultra, Pixel 9, Tecno)...",
    badge: "Verified Android Inventory",
  },
  ipad: {
    title: "iPad",
    tagline: "Apple iPad Pro, Air & 10th Generation",
    description: "Precision Retina tablets for creativity, productivity and digital workflows in Wi-Fi and Cellular configs.",
    searchPlaceholder: "Search iPad models (e.g. Pro M4, Air M2, 10th Gen)...",
    badge: "Apple Tablets",
  },
  wrist: {
    title: "Smartwatches & Wrist",
    tagline: "Apple Watch & Galaxy Watch Series",
    description: "Keep track of health, fitness, notifications and workouts with premium smartwatches and wearables.",
    searchPlaceholder: "Search smartwatches (e.g. Ultra 2, Series 9, Galaxy Watch)...",
    badge: "Certified Wearables",
  },
};

export default function CategoryShoppingPage({
  category,
  products,
  compareList,
  onToggleCompare,
  onOpenDetails,
  onQuickAdd,
  onShareProduct,
  onBackToHome,
  onSelectCategory,
  onOpenCart,
}: CategoryShoppingPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState<"All" | "Brand New" | "Premium UK Used">("All");
  const [priceSort, setPriceSort] = useState<"Default" | "LowToHigh" | "HighToLow" | "Newest">("Default");
  const [selectedStorage, setSelectedStorage] = useState<string>("All");
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("All");

  // Category-specific subfilters
  // iPhone: Series/Model
  const [iphoneSeries, setIphoneSeries] = useState<string>("All");
  // Android: Brand filter
  const [androidBrand, setAndroidBrand] = useState<string>("All");
  // iPad: Model line & connectivity
  const [ipadModelLine, setIpadModelLine] = useState<string>("All");
  const [ipadConnectivity, setIpadConnectivity] = useState<string>("All");
  // Wrist: Brand/Series
  const [wristBrand, setWristBrand] = useState<string>("All");

  // Reset filters whenever category switches
  useEffect(() => {
    setSearchQuery("");
    setConditionFilter("All");
    setPriceSort("Default");
    setSelectedStorage("All");
    setPriceRangeFilter("All");
    setIphoneSeries("All");
    setAndroidBrand("All");
    setIpadModelLine("All");
    setIpadConnectivity("All");
    setWristBrand("All");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [category]);

  // Base Category Products Filtering (Strictly isolates category domain)
  const baseCategoryProducts = useMemo(() => {
    return products.filter((p) => {
      // Must not be vehicle
      if ((p.productType || "phone") === "vehicle") return false;

      const pBrand = (p.brand || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const pCat = ((p as any).category || "").toLowerCase();
      const pType = (p.productType || "").toLowerCase();

      if (category === "iphone") {
        // Only iPhones: Must be Apple, contain "iphone", NOT ipad, NOT watch
        const isApple = pBrand.includes("apple");
        const hasIphone = pName.includes("iphone") || pCat.includes("iphone") || pType.includes("iphone");
        const notIpad = !pName.includes("ipad") && !pCat.includes("ipad");
        const notWatch = !pName.includes("watch") && !pCat.includes("wrist") && !pCat.includes("watch");
        return isApple && hasIphone && notIpad && notWatch;
      }

      if (category === "android") {
        // Only Android: Must NOT be Apple, NOT contain iPhone, NOT iPad, NOT Apple Watch
        const notApple = !pBrand.includes("apple") && !pName.includes("iphone") && !pName.includes("ipad") && !pName.includes("apple watch");
        const notWatch = !pName.includes("watch") && !pCat.includes("wrist");
        return notApple && notWatch;
      }

      if (category === "ipad") {
        // Only iPads
        return pName.includes("ipad") || pCat.includes("ipad") || pType.includes("ipad");
      }

      if (category === "wrist") {
        // Only Wrist / Smartwatches
        return (
          pName.includes("watch") ||
          pName.includes("wrist") ||
          pCat.includes("wrist") ||
          pCat.includes("watch") ||
          pType.includes("watch")
        );
      }

      return false;
    });
  }, [products, category]);

  // Derived available options for the active category
  const availableStorages = useMemo(() => {
    const set = new Set<string>();
    baseCategoryProducts.forEach((p) => {
      (p.storageOptions || []).forEach((s) => set.add(s));
    });
    const order = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
    return order.filter((s) => set.has(s));
  }, [baseCategoryProducts]);

  const availableAndroidBrands = useMemo(() => {
    if (category !== "android") return [];
    const set = new Set<string>();
    baseCategoryProducts.forEach((p) => {
      if (p.brand) set.add(p.brand.trim());
    });
    const standard = ["Samsung", "Google Pixel", "Tecno", "Infinix", "Redmi", "Xiaomi"];
    const foundStandard = standard.filter((b) => set.has(b));
    const others = Array.from(set).filter((b) => !standard.includes(b));
    return ["All", ...foundStandard, ...others];
  }, [baseCategoryProducts, category]);

  // Apply Category-Specific Search & Active Filters
  const filteredProducts = useMemo(() => {
    let list = baseCategoryProducts;

    // 1. Search Query (Scoped strictly to this category)
    if (searchQuery.trim().length > 0) {
      list = searchStoreProducts(list, searchQuery);
    }

    // 2. Condition filter
    if (conditionFilter !== "All") {
      list = list.filter((p) => {
        const c = (p.condition || "").toLowerCase();
        if (conditionFilter === "Brand New") {
          return c.includes("brand new") || c === "new" || c === "sealed";
        }
        if (conditionFilter === "Premium UK Used") {
          return c.includes("used") || c.includes("grade") || c.includes("uk");
        }
        return p.condition === conditionFilter;
      });
    }

    // 3. Storage Filter
    if (selectedStorage !== "All") {
      list = list.filter((p) => p.storageOptions && p.storageOptions.includes(selectedStorage));
    }

    // 4. Price Range Filter
    if (priceRangeFilter !== "All") {
      list = list.filter((p) => {
        if (priceRangeFilter === "under-500k") return p.price < 500000;
        if (priceRangeFilter === "500k-1m") return p.price >= 500000 && p.price <= 1000000;
        if (priceRangeFilter === "above-1m") return p.price > 1000000;
        return true;
      });
    }

    // Category-specific subfilters:
    if (category === "iphone") {
      if (iphoneSeries !== "All") {
        list = list.filter((p) => {
          const name = p.name.toLowerCase();
          if (iphoneSeries === "15") return name.includes("15");
          if (iphoneSeries === "14") return name.includes("14");
          if (iphoneSeries === "13") return name.includes("13");
          if (iphoneSeries === "12") return name.includes("12");
          if (iphoneSeries === "pro") return name.includes("pro");
          return true;
        });
      }
    } else if (category === "android") {
      if (androidBrand !== "All") {
        list = list.filter((p) => (p.brand || "").toLowerCase().includes(androidBrand.toLowerCase()));
      }
    } else if (category === "ipad") {
      if (ipadModelLine !== "All") {
        list = list.filter((p) => {
          const name = p.name.toLowerCase();
          if (ipadModelLine === "pro") return name.includes("pro");
          if (ipadModelLine === "air") return name.includes("air");
          if (ipadModelLine === "10th") return name.includes("10th") || name.includes("10.9");
          if (ipadModelLine === "mini") return name.includes("mini");
          return true;
        });
      }
      if (ipadConnectivity !== "All") {
        list = list.filter((p) => {
          const fullText = `${p.name} ${p.specs?.simType || ""} ${p.network || ""}`.toLowerCase();
          if (ipadConnectivity === "cellular") {
            return fullText.includes("cellular") || fullText.includes("sim") || fullText.includes("5g") || fullText.includes("lte");
          }
          if (ipadConnectivity === "wifi") {
            return fullText.includes("wi-fi only") || !fullText.includes("cellular");
          }
          return true;
        });
      }
    } else if (category === "wrist") {
      if (wristBrand !== "All") {
        list = list.filter((p) => {
          const name = p.name.toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          if (wristBrand === "apple") return brand.includes("apple") || name.includes("apple watch");
          if (wristBrand === "samsung") return brand.includes("samsung") || name.includes("galaxy watch");
          return true;
        });
      }
    }

    // Price sorting
    if (priceSort === "LowToHigh") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (priceSort === "HighToLow") {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (priceSort === "Newest") {
      return [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    return list;
  }, [
    baseCategoryProducts,
    searchQuery,
    conditionFilter,
    selectedStorage,
    priceRangeFilter,
    priceSort,
    category,
    iphoneSeries,
    androidBrand,
    ipadModelLine,
    ipadConnectivity,
    wristBrand,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    conditionFilter !== "All" ||
    selectedStorage !== "All" ||
    priceRangeFilter !== "All" ||
    priceSort !== "Default" ||
    iphoneSeries !== "All" ||
    androidBrand !== "All" ||
    ipadModelLine !== "All" ||
    ipadConnectivity !== "All" ||
    wristBrand !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setConditionFilter("All");
    setSelectedStorage("All");
    setPriceRangeFilter("All");
    setPriceSort("Default");
    setIphoneSeries("All");
    setAndroidBrand("All");
    setIpadModelLine("All");
    setIpadConnectivity("All");
    setWristBrand("All");
  };

  const meta = CATEGORY_META[category];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] w-full flex flex-col">
      
      {/* 1. Category Switcher Top Bar (Quick Breadcrumb & Direct Category Jumper) */}
      <div className="bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-black hover:underline cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-extrabold text-[#00B14F] uppercase tracking-wide">
              {meta.title}
            </span>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[11px] font-semibold text-gray-400 mr-1 hidden sm:inline">
              Switch Category:
            </span>
            {(["iphone", "android", "ipad", "wrist"] as CategoryKey[]).map((catKey) => {
              const isActive = catKey === category;
              const label =
                catKey === "iphone"
                  ? "iPhone"
                  : catKey === "android"
                  ? "Android"
                  : catKey === "ipad"
                  ? "iPad"
                  : "Wrist";

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => onSelectCategory(catKey)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#1A2025] text-white shadow-sm ring-1 ring-[#00B14F]/50"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Focused Category Header (Clean, dedicated shopping space — NO homepage hero, NO promotional banner) */}
      <section className="bg-white border-b border-gray-150 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{meta.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">
                {meta.title}
              </h1>

              <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1.5 max-w-2xl leading-relaxed">
                {meta.description}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-[#00B14F] animate-pulse" />
              <span className="text-xs font-bold text-gray-800">
                {filteredProducts.length} {filteredProducts.length === 1 ? "device" : "devices"} available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STICKY CATEGORY-SPECIFIC SEARCH & FILTERS TOOLBAR
          Stays sticky right below the category header as user scrolls! */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] py-3 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2.5">
          
          {/* Row 1: Category-Specific Search Bar + Quick Condition/Sort */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dedicated Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={meta.searchPlaceholder}
                className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-250 focus:border-[#00B14F] focus:ring-2 focus:ring-[#00B14F]/20 pl-9 sm:pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder-gray-400 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-200 cursor-pointer transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Storage selector if options available */}
            {availableStorages.length > 0 && (
              <div className="relative hidden md:block">
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer focus:outline-none appearance-none pr-7 shadow-2xs ${
                    selectedStorage !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F]"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Storage: All</option>
                  {availableStorages.map((s) => (
                    <option key={s} value={s} className="bg-white text-gray-900">
                      {s}
                    </option>
                  ))}
                </select>
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none ${selectedStorage !== "All" ? "text-white" : "text-gray-500"}`}>
                  ▼
                </span>
              </div>
            )}

            {/* Price Sorting Dropdown */}
            <div className="relative">
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer focus:outline-none appearance-none pr-7 shadow-2xs ${
                  priceSort !== "Default"
                    ? "bg-[#1A2025] text-white border-[#1A2025]"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250"
                }`}
              >
                <option value="Default" className="bg-white text-gray-900">Sort: Featured</option>
                <option value="LowToHigh" className="bg-white text-gray-900">Price: Low to High</option>
                <option value="HighToLow" className="bg-white text-gray-900">Price: High to Low</option>
                <option value="Newest" className="bg-white text-gray-900">Latest Added</option>
              </select>
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none ${priceSort !== "Default" ? "text-white" : "text-gray-500"}`}>
                ▼
              </span>
            </div>

            {/* Reset Filter Button if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

          </div>

          {/* Row 2: Category-Specific Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            
            {/* Condition Filters */}
            <button
              type="button"
              onClick={() => setConditionFilter("All")}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                conditionFilter === "All"
                  ? "bg-[#00B14F] text-black shadow-xs font-extrabold"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              All {meta.title}
            </button>

            <button
              type="button"
              onClick={() => setConditionFilter(conditionFilter === "Brand New" ? "All" : "Brand New")}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                conditionFilter === "Brand New"
                  ? "bg-[#00B14F] text-black shadow-xs font-extrabold"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Brand New
            </button>

            <button
              type="button"
              onClick={() => setConditionFilter(conditionFilter === "Premium UK Used" ? "All" : "Premium UK Used")}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                conditionFilter === "Premium UK Used"
                  ? "bg-[#00B14F] text-black shadow-xs font-extrabold"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              UK Used
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />

            {/* iPhone-specific series filters */}
            {category === "iphone" && (
              <>
                {[
                  { id: "15", label: "iPhone 15 Series" },
                  { id: "14", label: "iPhone 14 Series" },
                  { id: "13", label: "iPhone 13 Series" },
                  { id: "pro", label: "Pro Models" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIphoneSeries(iphoneSeries === item.id ? "All" : item.id)}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                      iphoneSeries === item.id
                        ? "bg-[#1A2025] text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}

            {/* Android-specific brand filters */}
            {category === "android" && (
              <>
                {availableAndroidBrands
                  .filter((b) => b !== "All")
                  .map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setAndroidBrand(androidBrand === b ? "All" : b)}
                      className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                        androidBrand === b
                          ? "bg-[#1A2025] text-white shadow-xs"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
              </>
            )}

            {/* iPad-specific model line filters */}
            {category === "ipad" && (
              <>
                {[
                  { id: "pro", label: "iPad Pro" },
                  { id: "air", label: "iPad Air" },
                  { id: "10th", label: "iPad 10th Gen" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIpadModelLine(ipadModelLine === item.id ? "All" : item.id)}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                      ipadModelLine === item.id
                        ? "bg-[#1A2025] text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />

                <button
                  type="button"
                  onClick={() => setIpadConnectivity(ipadConnectivity === "wifi" ? "All" : "wifi")}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    ipadConnectivity === "wifi"
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Wi-Fi Only
                </button>

                <button
                  type="button"
                  onClick={() => setIpadConnectivity(ipadConnectivity === "cellular" ? "All" : "cellular")}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    ipadConnectivity === "cellular"
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Wi-Fi + Cellular (5G)
                </button>
              </>
            )}

            {/* Wrist-specific brand filters */}
            {category === "wrist" && (
              <>
                <button
                  type="button"
                  onClick={() => setWristBrand(wristBrand === "apple" ? "All" : "apple")}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    wristBrand === "apple"
                      ? "bg-[#1A2025] text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Apple Watch
                </button>

                <button
                  type="button"
                  onClick={() => setWristBrand(wristBrand === "samsung" ? "All" : "samsung")}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                    wristBrand === "samsung"
                      ? "bg-[#1A2025] text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Galaxy Watch
                </button>
              </>
            )}

            {/* Price Bracket Quick Pills */}
            <div className="h-4 w-px bg-gray-300 mx-1 flex-shrink-0" />
            <button
              type="button"
              onClick={() => setPriceRangeFilter(priceRangeFilter === "under-500k" ? "All" : "under-500k")}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                priceRangeFilter === "under-500k"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Under ₦500k
            </button>
            <button
              type="button"
              onClick={() => setPriceRangeFilter(priceRangeFilter === "above-1m" ? "All" : "above-1m")}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                priceRangeFilter === "above-1m"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Flagship (₦1M+)
            </button>

          </div>

        </div>
      </div>

      {/* 4. Products Grid */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 items-start">
            {filteredProducts.map((product) => {
              const isCompared = compareList.some((p) => p.id === product.id);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={onOpenDetails}
                  onQuickAdd={onQuickAdd}
                  onToggleCompare={onToggleCompare}
                  isComparing={isCompared}
                  isCompared={isCompared}
                  onShareProduct={onShareProduct}
                />
              );
            })}
          </div>
        ) : (
          /* Clean, helpful empty state if no products match */
          <div className="py-16 sm:py-24 text-center max-w-lg mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 my-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <Search className="w-7 h-7" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-gray-900">
              No matching {meta.title} devices found
            </h3>

            <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed">
              {searchQuery
                ? `We couldn't find any ${meta.title} matching "${searchQuery}".`
                : `No devices match the selected filters in this category.`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00B14F] hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
              >
                Clear Category Filters
              </button>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

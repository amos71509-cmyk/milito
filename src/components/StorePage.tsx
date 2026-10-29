import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Search, X, SlidersHorizontal, Trash2, ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Filter, Check } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { searchStoreProducts } from "../utils/searchUtils";

interface StorePageProps {
  products: Product[];
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  initialSearch?: string;
  initialBrand?: string;
  onShareProduct?: (product: Product) => void;
}

export default function StorePage({
  products,
  compareList,
  onToggleCompare,
  onOpenDetails,
  onQuickAdd,
  initialSearch = "",
  initialBrand = "All",
  onShareProduct,
}: StorePageProps) {
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter & Search States (Hydrate from Session Storage if available for seamless state retention)
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_search") || initialSearch;
    } catch {
      return initialSearch;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_category") || initialBrand;
    } catch {
      return initialBrand;
    }
  });

  const [conditionFilter, setConditionFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_condition") || "All";
    } catch {
      return "All";
    }
  });

  const [priceRangeFilter, setPriceRangeFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_price_range") || "All";
    } catch {
      return "All";
    }
  });

  const [storageFilter, setStorageFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_storage") || "All";
    } catch {
      return "All";
    }
  });

  const [batteryHealthFilter, setBatteryHealthFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_battery") || "All";
    } catch {
      return "All";
    }
  });

  const [availabilityFilter, setAvailabilityFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem("milito_store_availability") || "All";
    } catch {
      return "All";
    }
  });

  const [priceSort, setPriceSort] = useState<"Default" | "LowToHigh" | "HighToLow" | "Newest">(() => {
    try {
      return (sessionStorage.getItem("milito_store_sort") as any) || "Default";
    } catch {
      return "Default";
    }
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    if (initialBrand) {
      setSelectedCategory(initialBrand);
      setCurrentPage(1);
    }
  }, [initialBrand]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
      setCurrentPage(1);
    }
  }, [initialSearch]);

  // Persist state to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem("milito_store_search", searchQuery);
      sessionStorage.setItem("milito_store_category", selectedCategory);
      sessionStorage.setItem("milito_store_condition", conditionFilter);
      sessionStorage.setItem("milito_store_price_range", priceRangeFilter);
      sessionStorage.setItem("milito_store_storage", storageFilter);
      sessionStorage.setItem("milito_store_battery", batteryHealthFilter);
      sessionStorage.setItem("milito_store_availability", availabilityFilter);
      sessionStorage.setItem("milito_store_sort", priceSort);
    } catch (e) {
      // ignore
    }
  }, [searchQuery, selectedCategory, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, priceSort]);

  // Separate phone/gadget products
  const phoneProducts = useMemo(() => {
    return products.filter((p) => (p.productType || "phone") !== "vehicle");
  }, [products]);

  // Dynamic list of categories based on actual available stock
  const dynamicCategories = useMemo(() => {
    const brandSet = new Set<string>();
    phoneProducts.forEach((p) => {
      if (p.brand && p.brand.trim().length > 0) {
        brandSet.add(p.brand.trim());
      }
    });

    const orderedStandard = ["Apple", "Samsung", "Google Pixel", "Tecno", "Infinix", "Redmi", "Xiaomi"];
    const availableStandard = orderedStandard.filter((b) => brandSet.has(b) || (b === "Apple" && brandSet.has("iPhone")));
    const others = Array.from(brandSet).filter((b) => !orderedStandard.includes(b) && b !== "iPhone");

    return ["All", ...availableStandard, ...others];
  }, [phoneProducts]);

  // Filter computation
  const filteredProducts = useMemo(() => {
    let list = phoneProducts;

    // 1. Search query (multi-field match across brand, model, storage, specs)
    if (searchQuery.trim().length > 0) {
      list = searchStoreProducts(list, searchQuery);
    }

    // 2. Category / Brand selection
    if (selectedCategory !== "All") {
      list = list.filter((p) => {
        const pBrand = (p.brand || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const cat = selectedCategory.toLowerCase();

        if (cat === "apple" || cat === "iphone") {
          return pBrand.includes("apple") || pBrand.includes("iphone") || pName.includes("iphone");
        }
        if (cat === "android") {
          return !pBrand.includes("apple") && !pName.includes("iphone") && !pName.includes("ipad");
        }
        if (cat === "samsung") {
          return pBrand.includes("samsung") || pName.includes("galaxy");
        }
        if (cat === "google pixel" || cat === "google") {
          return pBrand.includes("google") || pBrand.includes("pixel") || pName.includes("pixel");
        }
        return pBrand.includes(cat) || pName.includes(cat);
      });
    }

    // 3. Condition filter
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

    // 4. Price range filter
    if (priceRangeFilter !== "All") {
      list = list.filter((p) => {
        if (priceRangeFilter === "under-200k") return p.price < 200000;
        if (priceRangeFilter === "200k-500k") return p.price >= 200000 && p.price <= 500000;
        if (priceRangeFilter === "500k-1m") return p.price >= 500000 && p.price <= 1000000;
        if (priceRangeFilter === "above-1m") return p.price > 1000000;
        return true;
      });
    }

    // 5. Storage filter
    if (storageFilter !== "All") {
      list = list.filter((p) => p.storageOptions && p.storageOptions.includes(storageFilter));
    }

    // 6. Battery health filter
    if (batteryHealthFilter !== "All") {
      list = list.filter((p) => {
        if (p.condition === "Brand New") return true;
        const val = p.batteryHealthValue || p.batteryHealth || "";
        if (batteryHealthFilter === "100%") return val === "100%";
        if (batteryHealthFilter === "95%+") return val === "95%+" || val === "100%";
        if (batteryHealthFilter === "90%+") return val === "90%+" || val === "95%+" || val === "100%";
        return true;
      });
    }

    // 7. Availability filter
    if (availabilityFilter !== "All") {
      list = list.filter((p) => {
        const isSoldOut = (typeof p.stockQuantity === "number" && p.stockQuantity <= 0) || p.availability === "Sold Out" || p.status === "Sold Out";
        if (availabilityFilter === "Sold Out") return isSoldOut;
        if (availabilityFilter === "Available" || availabilityFilter === "In Stock") return !isSoldOut;
        if (availabilityFilter === "Few Left") return typeof p.stockQuantity === "number" && p.stockQuantity > 0 && p.stockQuantity <= 3;
        return true;
      });
    }

    // Sorting
    if (priceSort === "LowToHigh") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (priceSort === "HighToLow") {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (priceSort === "Newest") {
      return [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    return list;
  }, [phoneProducts, searchQuery, selectedCategory, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, priceSort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, conditionFilter, priceRangeFilter, storageFilter, batteryHealthFilter, availabilityFilter, priceSort]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "All" ||
    conditionFilter !== "All" ||
    priceRangeFilter !== "All" ||
    storageFilter !== "All" ||
    batteryHealthFilter !== "All" ||
    availabilityFilter !== "All";

  const handleResetAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setConditionFilter("All");
    setPriceRangeFilter("All");
    setStorageFilter("All");
    setBatteryHealthFilter("All");
    setAvailabilityFilter("All");
    setPriceSort("Default");
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/60 text-[#0F172A]">
      {/* STICKY SHOPPING NAVIGATION TOOLBAR */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-200 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2 sm:space-y-2.5">
          
          {/* Top Row: Search Input + Desktop Quick Filters */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                id="store-main-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices, models, specs (e.g. iPhone 14, S24, 256GB)..."
                className="w-full bg-gray-50 hover:bg-gray-100/90 focus:bg-white border border-gray-250 focus:border-[#00B14F] focus:ring-2 focus:ring-[#00B14F]/20 pl-9 sm:pl-11 pr-9 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-[#0F172A] placeholder-gray-400 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="store-clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full hover:bg-gray-200 transition cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Desktop Direct Storage Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="relative">
                <select
                  id="store-sticky-storage-select"
                  value={storageFilter}
                  onChange={(e) => setStorageFilter(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    storageFilter !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Storage: All</option>
                  <option value="64GB" className="bg-white text-gray-900">64GB</option>
                  <option value="128GB" className="bg-white text-gray-900">128GB</option>
                  <option value="256GB" className="bg-white text-gray-900">256GB</option>
                  <option value="512GB" className="bg-white text-gray-900">512GB</option>
                  <option value="1TB" className="bg-white text-gray-900">1TB</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${storageFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Direct Price Dropdown */}
              <div className="relative">
                <select
                  id="store-sticky-price-select"
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className={`text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs ${
                    priceRangeFilter !== "All"
                      ? "bg-[#00B14F] text-white border-[#00B14F] shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <option value="All" className="bg-white text-gray-900">Price: All</option>
                  <option value="under-200k" className="bg-white text-gray-900">Under ₦200,000</option>
                  <option value="200k-500k" className="bg-white text-gray-900">₦200k–₦500k</option>
                  <option value="500k-1m" className="bg-white text-gray-900">₦500k–₦1,000,000</option>
                  <option value="above-1m" className="bg-white text-gray-900">Above ₦1,000,000</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className={`text-[10px] font-black ${priceRangeFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
                </div>
              </div>

              {/* Desktop Sort Selector */}
              <div className="relative">
                <select
                  id="store-sticky-sort-select"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-250 hover:border-gray-300 text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl cursor-pointer focus:outline-none pr-8 appearance-none shadow-2xs"
                >
                  <option value="Default">Sort: Relevant</option>
                  <option value="LowToHigh">Price: Low to High</option>
                  <option value="HighToLow">Price: High to Low</option>
                  <option value="Newest">Newest Arrivals</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-[10px] font-black text-gray-500">▼</span>
                </div>
              </div>

              {/* Desktop Reset Pill (if filters active) */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition cursor-pointer shadow-2xs"
                  title="Reset all search and filters"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Mobile All-Filters Drawer Toggle Button */}
            <button
              type="button"
              id="store-mobile-filter-btn"
              onClick={() => setIsMobileFiltersOpen(true)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-2xs ${
                hasActiveFilters
                  ? "bg-[#00B14F] text-white border-[#00B14F]"
                  : "bg-gray-50 text-gray-700 border-gray-250 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Row 2: Category Navigation Row (All, Apple, Samsung, Google Pixel, etc.) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`store-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-[#00B14F] text-white border border-[#00B14F] shadow-sm scale-[1.02]"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black border border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Row 3 (Mobile Only): Ultra-Compact Quick Filter Pills for Storage & Price */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
            
            {/* Mobile Storage Selector */}
            <div className="relative flex-shrink-0">
              <select
                id="store-mobile-storage-select"
                value={storageFilter}
                onChange={(e) => setStorageFilter(e.target.value)}
                className={`py-1 px-2.5 rounded-lg border font-bold text-[11px] transition-all cursor-pointer focus:outline-none pr-6 appearance-none shadow-2xs ${
                  storageFilter !== "All"
                    ? "bg-[#00B14F] text-white border-[#00B14F]"
                    : "bg-white text-gray-700 border-gray-250"
                }`}
              >
                <option value="All" className="bg-white text-gray-900">Storage: All</option>
                <option value="64GB" className="bg-white text-gray-900">64GB</option>
                <option value="128GB" className="bg-white text-gray-900">128GB</option>
                <option value="256GB" className="bg-white text-gray-900">256GB</option>
                <option value="512GB" className="bg-white text-gray-900">512GB</option>
                <option value="1TB" className="bg-white text-gray-900">1TB</option>
              </select>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`text-[8px] font-black ${storageFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
              </div>
            </div>

            {/* Mobile Price Range Selector */}
            <div className="relative flex-shrink-0">
              <select
                id="store-mobile-price-select"
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className={`py-1 px-2.5 rounded-lg border font-bold text-[11px] transition-all cursor-pointer focus:outline-none pr-6 appearance-none shadow-2xs ${
                  priceRangeFilter !== "All"
                    ? "bg-[#00B14F] text-white border-[#00B14F]"
                    : "bg-white text-gray-700 border-gray-250"
                }`}
              >
                <option value="All" className="bg-white text-gray-900">Price: All</option>
                <option value="under-200k" className="bg-white text-gray-900">&lt; ₦200k</option>
                <option value="200k-500k" className="bg-white text-gray-900">₦200k–₦500k</option>
                <option value="500k-1m" className="bg-white text-gray-900">₦500k–₦1M</option>
                <option value="above-1m" className="bg-white text-gray-900">&gt; ₦1M</option>
              </select>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`text-[8px] font-black ${priceRangeFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
              </div>
            </div>

            {/* Mobile Condition Selector */}
            <div className="relative flex-shrink-0">
              <select
                id="store-mobile-condition-select"
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className={`py-1 px-2.5 rounded-lg border font-bold text-[11px] transition-all cursor-pointer focus:outline-none pr-6 appearance-none shadow-2xs ${
                  conditionFilter !== "All"
                    ? "bg-[#00B14F] text-white border-[#00B14F]"
                    : "bg-white text-gray-700 border-gray-250"
                }`}
              >
                <option value="All" className="bg-white text-gray-900">Condition: All</option>
                <option value="Brand New" className="bg-white text-gray-900">Brand New</option>
                <option value="Premium UK Used" className="bg-white text-gray-900">UK Used</option>
              </select>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`text-[8px] font-black ${conditionFilter !== "All" ? "text-white" : "text-gray-500"}`}>▼</span>
              </div>
            </div>

            {/* Mobile Sort Selector */}
            <div className="relative flex-shrink-0">
              <select
                id="store-mobile-sort-select"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="py-1 px-2.5 rounded-lg border border-gray-250 bg-white text-gray-700 font-bold text-[11px] transition-all cursor-pointer focus:outline-none pr-6 appearance-none shadow-2xs"
              >
                <option value="Default">Sort: Relevant</option>
                <option value="LowToHigh">Price: Low-High</option>
                <option value="HighToLow">Price: High-Low</option>
                <option value="Newest">Newest</option>
              </select>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-[8px] font-black text-gray-500">▼</span>
              </div>
            </div>

            {/* Mobile Clear All Filters Button (if active) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 3. MAIN STORE CATALOGUE LAYOUT */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT SIDEBAR: DESKTOP FILTERS */}
          <div className="hidden lg:block lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-52">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0F172A]" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#0F172A]">Filter Devices</span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  id="store-reset-desktop-filters-btn"
                  onClick={handleResetAllFilters}
                  className="text-[10px] uppercase font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* FILTER CONTROLS */}
            <div className="space-y-6 text-xs">
              
              {/* Condition */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2.5 text-[11px]">
                  Condition
                </h4>
                <div className="space-y-2">
                  {["All", "Brand New", "Premium UK Used"].map((cond) => (
                    <label key={cond} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                      <input
                        type="radio"
                        name="store-cond"
                        checked={conditionFilter === cond}
                        onChange={() => setConditionFilter(cond)}
                        className="w-3.5 h-3.5 text-[#00B14F] accent-[#00B14F] cursor-pointer"
                      />
                      <span>{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2.5 text-[11px]">
                  Price Range
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "Show All Prices", id: "All" },
                    { label: "Under ₦200,000", id: "under-200k" },
                    { label: "₦200,000–₦500,000", id: "200k-500k" },
                    { label: "₦500,000–₦1,000,000", id: "500k-1m" },
                    { label: "Above ₦1,000,000", id: "above-1m" },
                  ].map((pr) => (
                    <label key={pr.id} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                      <input
                        type="radio"
                        name="store-price"
                        checked={priceRangeFilter === pr.id}
                        onChange={() => setPriceRangeFilter(pr.id)}
                        className="w-3.5 h-3.5 text-[#00B14F] accent-[#00B14F] cursor-pointer"
                      />
                      <span>{pr.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2.5 text-[11px]">
                  Storage Capacity
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {["All", "64GB", "128GB", "256GB", "512GB", "1TB"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStorageFilter(st)}
                      className={`py-1.5 rounded-lg border font-bold text-[11px] transition cursor-pointer ${
                        storageFilter === st
                          ? "bg-[#00B14F] text-white border-[#00B14F]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2.5 text-[11px]">
                  Stock Availability
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "All Items", id: "All" },
                    { label: "Available (In Stock)", id: "Available" },
                    { label: "Few Left", id: "Few Left" },
                    { label: "Out of Stock", id: "Sold Out" },
                  ].map((av) => (
                    <label key={av.id} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                      <input
                        type="radio"
                        name="store-avail"
                        checked={availabilityFilter === av.id}
                        onChange={() => setAvailabilityFilter(av.id)}
                        className="w-3.5 h-3.5 text-[#00B14F] accent-[#00B14F] cursor-pointer"
                      />
                      <span>{av.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Battery Health */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2.5 text-[11px]">
                  Battery Health
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "Show All", id: "All" },
                    { label: "90%+ (Good Health)", id: "90%+" },
                    { label: "95%+ (Excellent)", id: "95%+" },
                    { label: "100% (Maximum Cap)", id: "100%" },
                  ].map((bh) => (
                    <label key={bh.id} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-black cursor-pointer select-none">
                      <input
                        type="radio"
                        name="store-battery"
                        checked={batteryHealthFilter === bh.id}
                        onChange={() => setBatteryHealthFilter(bh.id)}
                        className="w-3.5 h-3.5 text-[#00B14F] accent-[#00B14F] cursor-pointer"
                      />
                      <span>{bh.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT CATALOGUE GRID */}
          <div className="lg:col-span-3">
            
            {/* Toolbar: Result Count & Sort Options */}
            <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                <span>
                  {filteredProducts.length === 0
                    ? "0 devices matching criteria"
                    : `Showing ${Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}–${Math.min(filteredProducts.length, currentPage * itemsPerPage)} of ${filteredProducts.length} verified devices`}
                </span>
                {searchQuery && (
                  <span className="text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-md text-[10px]">
                    "{searchQuery}"
                  </span>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort By:</span>
                <select
                  id="store-sort-select"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className="bg-gray-50 border border-gray-250 rounded-xl px-3 py-1.5 text-xs text-gray-900 font-bold focus:outline-none focus:border-[#00B14F] cursor-pointer w-full sm:w-44"
                >
                  <option value="Default">Most Relevant</option>
                  <option value="LowToHigh">Price: Low to High</option>
                  <option value="HighToLow">Price: High to Low</option>
                  <option value="Newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl py-16 sm:py-20 px-6 sm:px-8 border border-gray-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-extrabold text-[#0F172A]">
                  No devices found
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Try another model, brand or search term.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="store-empty-clear-search-btn"
                    onClick={handleResetAllFilters}
                    className="px-6 py-3 rounded-xl bg-[#00B14F] hover:bg-[#009643] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-sm active:scale-98"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              </div>
            ) : (
              /* REAL PRODUCT CATALOGUE GRID */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 items-start">
                {paginatedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isComparing={compareList.some((p) => p.id === prod.id)}
                    onToggleCompare={onToggleCompare}
                    onOpenDetails={onOpenDetails}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-10 sm:mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black cursor-pointer shadow-xs"
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                          : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black shadow-xs"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-250 hover:bg-gray-100 hover:text-black cursor-pointer shadow-xs"
                  }`}
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE FILTERS MODAL DRAWER */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#0F172A]" />
                    <span className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Filter Controls */}
                <div className="space-y-6 text-xs">
                  {/* Condition */}
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Condition</h4>
                    <div className="space-y-2">
                      {["All", "Brand New", "Premium UK Used"].map((cond) => (
                        <label key={cond} className="flex items-center gap-2 font-semibold text-gray-700">
                          <input
                            type="radio"
                            name="mob-cond"
                            checked={conditionFilter === cond}
                            onChange={() => setConditionFilter(cond)}
                            className="text-[#00B14F] accent-[#00B14F]"
                          />
                          <span>{cond}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Price Range</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Show All Prices", id: "All" },
                        { label: "Under ₦200,000", id: "under-200k" },
                        { label: "₦200,000–₦500,000", id: "200k-500k" },
                        { label: "₦500,000–₦1,000,000", id: "500k-1m" },
                        { label: "Above ₦1,000,000", id: "above-1m" },
                      ].map((pr) => (
                        <label key={pr.id} className="flex items-center gap-2 font-semibold text-gray-700">
                          <input
                            type="radio"
                            name="mob-price"
                            checked={priceRangeFilter === pr.id}
                            onChange={() => setPriceRangeFilter(pr.id)}
                            className="text-[#00B14F] accent-[#00B14F]"
                          />
                          <span>{pr.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Storage</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["All", "64GB", "128GB", "256GB", "512GB", "1TB"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStorageFilter(st)}
                          className={`py-1.5 rounded-lg border font-bold text-xs ${
                            storageFilter === st
                              ? "bg-[#00B14F] text-white border-[#00B14F]"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Availability</h4>
                    <div className="space-y-2">
                      {[
                        { label: "All Items", id: "All" },
                        { label: "Available (In Stock)", id: "Available" },
                        { label: "Few Left", id: "Few Left" },
                        { label: "Out of Stock", id: "Sold Out" },
                      ].map((av) => (
                        <label key={av.id} className="flex items-center gap-2 font-semibold text-gray-700">
                          <input
                            type="radio"
                            name="mob-avail"
                            checked={availabilityFilter === av.id}
                            onChange={() => setAvailabilityFilter(av.id)}
                            className="text-[#00B14F] accent-[#00B14F]"
                          />
                          <span>{av.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#00B14F] text-white font-bold"
                >
                  Apply
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

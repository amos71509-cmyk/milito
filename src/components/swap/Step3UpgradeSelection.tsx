import React, { useState, useMemo, useRef } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Smartphone, 
  Check, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion } from "motion/react";
import { Product, resolveImageUrl } from "../../types";
import { formatNaira } from "../../utils/swapUtils";

interface Step3UpgradeSelectionProps {
  currentModel: string;
  currentStorage: string;
  currentEstimatedGrade: string;
  currentEstimatedValue: number;
  availableProducts: Product[];
  selectedTargetProduct: Product | null;
  onSelectTargetProduct: (product: Product | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3UpgradeSelection({
  currentModel,
  currentStorage,
  currentEstimatedGrade,
  currentEstimatedValue,
  availableProducts,
  selectedTargetProduct,
  onSelectTargetProduct,
  onBack,
  onNext,
}: Step3UpgradeSelectionProps) {
  const [filterCategory, setFilterCategory] = useState<"all" | "brand-new" | "uk-used">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("All");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter only phones from available inventory
  const phoneCatalog = useMemo(() => {
    return availableProducts.filter((p) => (p.productType || "phone") !== "vehicle");
  }, [availableProducts]);

  // Dynamic filtered inventory based on user search & filters
  const filteredCatalog = useMemo(() => {
    return phoneCatalog.filter((p) => {
      // 1. Search Query filter (matches name, brand, condition, or storage)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCondition = p.condition.toLowerCase().includes(q);
        const matchesStorage = p.storageOptions?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesCondition && !matchesStorage) {
          return false;
        }
      }

      // 2. Brand Filter
      if (brandFilter !== "All" && p.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // 3. Category Tier
      if (filterCategory === "brand-new") {
        return p.condition === "Brand New";
      }
      if (filterCategory === "uk-used") {
        return p.condition === "Premium UK Used";
      }

      return true;
    });
  }, [phoneCatalog, searchQuery, brandFilter, filterCategory]);

  // Selected Upgrade Calculations (ONLY computed when a customer explicitly selects a target product)
  const upgradeCalculation = useMemo(() => {
    if (!selectedTargetProduct) return null;
    const targetPrice = selectedTargetProduct.price;
    const difference = targetPrice - currentEstimatedValue;
    return {
      targetPrice,
      currentValue: currentEstimatedValue,
      difference,
      isTopUp: difference > 0,
      isDirectOrSurplus: difference <= 0,
    };
  }, [selectedTargetProduct, currentEstimatedValue]);

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn" id="swap-step-3-container">
      
      {/* STEP HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-milito-green/10 border border-milito-green/20 text-milito-green text-xs font-extrabold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5" />
          Step 3 of 4: Swap Valuation & Upgrade
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight font-sans">
          Your Valuation & Upgrade Selection
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">
          Review your trade-in credit and choose your desired swap phone from the MILITO catalogue.
        </p>
      </div>

      {/* DUAL COMPARISON WORKSPACE: LEFT (YOUR CURRENT PHONE) vs RIGHT (CHOOSE / YOUR SELECTED SWAP PHONE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* ================================================== */}
        {/* 1. LEFT PANEL: YOUR CURRENT PHONE & SWAP CREDIT   */}
        {/* ================================================== */}
        <div className="bg-gradient-to-br from-gray-950 via-[#141A1E] to-[#1A2025] text-white p-6 sm:p-7 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-milito-green/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-milito-green flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-milito-green inline-block" />
                YOUR CURRENT PHONE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">
                Valuation Complete
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                {currentModel || "Your Trade-In Device"}
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-gray-200">
                  {currentStorage || "Standard"}
                </span>
                <span>•</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-extrabold">
                  {currentEstimatedGrade || "Grade B"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                Estimated Swap Credit
              </span>
              <div className="text-3xl sm:text-4xl font-black text-milito-green tracking-tight font-sans">
                {formatNaira(currentEstimatedValue)}
              </div>
              <p className="text-[11px] text-gray-400 font-medium pt-1">
                This information is based on the customer&apos;s completed valuation.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-milito-green shrink-0" />
              <span>Valuation Locked In</span>
            </span>
            <button
              type="button"
              onClick={onBack}
              className="text-gray-400 hover:text-white underline underline-offset-2 transition text-[11px] font-medium cursor-pointer"
            >
              Edit Condition
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RIGHT PANEL: CHOOSE YOUR SWAP PHONE (EMPTY DEFAULT) vs SELECTED PHONE */}
        {/* ========================================================================= */}
        {selectedTargetProduct && upgradeCalculation ? (
          /* STATE B: CUSTOMER HAS EXPLICITLY CHOSEN A TARGET PHONE */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-br from-gray-950 via-[#1A2025] to-gray-900 text-white p-6 sm:p-7 rounded-3xl border-2 border-milito-green shadow-xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-milito-green/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-milito-green flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-milito-green" />
                  YOUR SELECTED SWAP PHONE
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTargetProduct(null)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition cursor-pointer bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-bold"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Change Phone</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight line-clamp-1">
                  {selectedTargetProduct.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className={`px-2.5 py-1 rounded-lg font-extrabold uppercase text-[10px] border ${
                    selectedTargetProduct.condition === "Brand New"
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                  }`}>
                    {selectedTargetProduct.condition}
                  </span>
                  <span className="text-gray-400 font-medium">
                    {selectedTargetProduct.storageOptions?.[0] || "128GB"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium text-gray-400">Current MILITO Catalogue Price:</span>
                  <span className="font-bold text-white text-sm font-sans">
                    {formatNaira(selectedTargetProduct.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium text-gray-400">Estimated Swap Credit:</span>
                  <span className="font-bold text-milito-green text-sm font-sans">
                    - {formatNaira(currentEstimatedValue)}
                  </span>
                </div>

                {/* Estimated Top-Up Calculation */}
                <div className="p-3.5 rounded-2xl bg-milito-green/15 border border-milito-green/30 flex items-center justify-between mt-1">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">
                      Estimated Top-Up
                    </span>
                    <span className="text-[10px] text-gray-300">
                      ({formatNaira(selectedTargetProduct.price)} - {formatNaira(currentEstimatedValue)})
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-milito-green font-sans">
                    {upgradeCalculation.isTopUp ? formatNaira(upgradeCalculation.difference) : "₦0 (Direct Swap)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-medium">
                Target phone chosen
              </span>
              <button
                type="button"
                onClick={onNext}
                className="px-4 py-2 bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Step 4</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* STATE A: DEFAULT PERMANENT EMPTY STATE */
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors p-6 sm:p-7 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="border-b border-gray-150 pb-3.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                  CHOOSE YOUR SWAP PHONE
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-sans tracking-tight">
                  Choose Your Swap Phone
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                  Select the phone you&apos;d like to swap for.
                </p>
              </div>

              {/* Search or Select Control CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFocusSearch}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-milito-green rounded-2xl text-left text-xs font-semibold text-gray-600 flex items-center justify-between transition group cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-milito-green transition" />
                    <span>Search or select a phone from catalogue below...</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-milito-green bg-milito-green/10 px-2.5 py-1 rounded-lg group-hover:bg-milito-green group-hover:text-black transition">
                    Browse
                  </span>
                </button>
              </div>

              {/* Subtle Explanatory Guidance */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-center space-y-1">
                <p className="text-xs font-bold text-gray-800">
                  Select a phone to calculate your top-up.
                </p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  No default phone is assumed. The top-up amount will be calculated immediately after your selection.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-150 flex items-center justify-between text-xs text-gray-500">
              <span>Target Phone: <strong>Empty (Unselected)</strong></span>
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                Awaiting Selection
              </span>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & FILTER INTERFACE CONNECTED TO MILITO CATALOGUE                */}
      {/* ========================================================================= */}
      <div className="space-y-4 bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-150">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-milito-green" />
            <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider font-sans">
              MILITO Smartphone Catalogue
            </h3>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {filteredCatalog.length} {filteredCatalog.length === 1 ? "phone" : "phones"} available
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search phones (e.g. iPhone 14 Pro Max, Samsung S24 Ultra, Pixel 8, 256GB)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
            />
          </div>

          {/* Brand Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {["All", "Apple", "Samsung", "Google", "Tecno", "Infinix", "Xiaomi"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrandFilter(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  brandFilter === b
                    ? "bg-gray-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-150">
          {[
            { id: "all", label: "All Available Phones" },
            { id: "brand-new", label: "Brand New Sealed" },
            { id: "uk-used", label: "Premium UK Used" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex-shrink-0 ${
                filterCategory === cat.id
                  ? "bg-milito-green text-black shadow-xs"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRODUCT CATALOGUE GRID                                                 */}
      {/* ========================================================================= */}
      {filteredCatalog.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-3xl border border-gray-200 space-y-3">
          <Smartphone className="w-8 h-8 text-gray-400 mx-auto" />
          <h4 className="text-base font-extrabold text-gray-900">No matching phones found in catalogue</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try clearing your search query or switching to another category to view all available devices.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setBrandFilter("All");
              setFilterCategory("all");
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredCatalog.map((prod) => {
            const isSelected = selectedTargetProduct?.id === prod.id;
            const diff = prod.price - currentEstimatedValue;
            const isTopUp = diff > 0;
            const imgUrl = resolveImageUrl(
              prod.thumbnail?.secure_url || prod.thumbnail || prod.image || prod.galleryImages?.[0]?.secure_url || prod.gallery?.[0],
              { width: 300, brand: prod.brand }
            );

            return (
              <div
                key={prod.id}
                className={`bg-white rounded-3xl border transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between relative group ${
                  isSelected
                    ? "border-milito-green ring-3 ring-milito-green/30 shadow-xl scale-[1.01]"
                    : "border-gray-200 hover:border-gray-350 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-milito-green text-black rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Selected
                  </div>
                )}

                <div>
                  {/* Image container */}
                  <div className="h-44 w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-center mb-3 group-hover:bg-gray-100/60 transition relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute bottom-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      prod.condition === "Brand New"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {prod.condition}
                    </span>
                  </div>

                  {/* Brand & Name */}
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {prod.brand}
                  </span>
                  <h4 className="text-sm font-extrabold text-gray-950 line-clamp-1 font-sans">
                    {prod.name}
                  </h4>

                  {/* Storage / Specs */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span>{prod.storageOptions?.[0] || "128GB"}</span>
                    {prod.batteryHealthValue && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{prod.batteryHealthValue} Battery</span>
                      </>
                    )}
                  </div>

                  {/* Current Catalogue Price */}
                  <div className="mt-3 pt-3 border-t border-gray-150 flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-gray-500">Catalogue Price:</span>
                    <span className="text-sm font-black text-gray-950 font-sans">{formatNaira(prod.price)}</span>
                  </div>

                  {/* Estimated Top-Up Calculation (shown on card when selected) */}
                  {isSelected && (
                    <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between ${
                      isTopUp 
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                        : "bg-blue-50/80 border-blue-300 text-blue-950"
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {isTopUp ? "Estimated Top-Up:" : "Difference:"}
                      </span>
                      <span className="text-sm font-black font-sans text-emerald-800">
                        {isTopUp ? formatNaira(diff) : "₦0 (Direct Swap)"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Explicit Selection Button */}
                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelectTargetProduct(null);
                      } else {
                        onSelectTargetProduct(prod);
                        // Smoothly scroll up to the comparison view so user immediately sees their calculation
                        const container = document.getElementById("swap-step-3-container");
                        if (container) {
                          container.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-[#1A2025] text-white hover:bg-gray-900"
                        : "bg-gray-100 hover:bg-milito-green hover:text-black text-gray-900"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-milito-green" />
                        <span>Selected Swap Phone</span>
                      </>
                    ) : (
                      <>
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BOTTOM NAVIGATION BAR                                                  */}
      {/* ========================================================================= */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Condition Check</span>
        </button>

        {selectedTargetProduct ? (
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed with {selectedTargetProduct.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold text-center">
            Select a phone to calculate your top-up.
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Smartphone, 
  ArrowRight, 
  Search, 
  ChevronDown, 
  Check, 
  X, 
  AlertCircle,
  HardDrive,
  Sparkles
} from "lucide-react";
import { TRADE_IN_BRANDS } from "../../data";
import { getStoredTradeInValuations } from "../../utils/tradeInValuationDb";

interface Step1DeviceSelectionProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  selectedStorage: string;
  onSelectStorage: (storage: string) => void;
  onNext: () => void;
}

export default function Step1DeviceSelection({
  selectedBrand,
  onSelectBrand,
  selectedModel,
  onSelectModel,
  selectedStorage,
  onSelectStorage,
  onNext,
}: Step1DeviceSelectionProps) {
  // Brand Dropdown & Search state
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Model Dropdown & Search state
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Validation Error Trigger
  const [validationError, setValidationError] = useState<string | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load database items
  const [dbRecords, setDbRecords] = useState(() => getStoredTradeInValuations());

  useEffect(() => {
    const handleUpdate = () => {
      setDbRecords(getStoredTradeInValuations());
    };
    window.addEventListener("milito_tradein_valuations_updated", handleUpdate);
    return () => window.removeEventListener("milito_tradein_valuations_updated", handleUpdate);
  }, []);

  // Filtered Brands based on search query
  const filteredBrands = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    if (!q) return TRADE_IN_BRANDS;
    return TRADE_IN_BRANDS.filter((b) =>
      b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    );
  }, [brandSearchQuery]);

  // All active models for the selected brand from the database
  const allBrandModels = useMemo(() => {
    if (!selectedBrand) return [];
    const activeRecords = dbRecords.filter(
      (r) => r.status === "Active" && r.brand.toLowerCase() === selectedBrand.toLowerCase()
    );
    const uniqueModels = Array.from(new Set(activeRecords.map((r) => r.model)));
    return uniqueModels;
  }, [selectedBrand, dbRecords]);

  // Normalized search query matcher (e.g. "14 pro max" -> "iPhone 14 Pro Max", "s23" -> "Galaxy S23")
  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    const q = modelSearchQuery.trim().toLowerCase().replace(/[\s-_]+/g, " ");
    if (!q) return allBrandModels;

    return allBrandModels.filter((modelName) => {
      const normalizedName = modelName.toLowerCase().replace(/[\s-_]+/g, " ");
      if (normalizedName.includes(q)) return true;

      // Handle common abbreviations like "s24" matching "galaxy s24", "14 pro" matching "iphone 14 pro"
      const terms = q.split(" ").filter(Boolean);
      return terms.every((term) => normalizedName.includes(term));
    });
  }, [selectedBrand, allBrandModels, modelSearchQuery]);

  // Available Storages for the selected model from the database
  const availableStorages = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    const matchingRecords = dbRecords.filter(
      (r) =>
        r.status === "Active" &&
        r.brand.toLowerCase() === selectedBrand.toLowerCase() &&
        r.model.toLowerCase() === selectedModel.toLowerCase()
    );
    const storages = matchingRecords.map((r) => r.storage);
    if (storages.length > 0) {
      // Sort in standard order
      const order = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
      return storages.sort((a, b) => {
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.localeCompare(b);
      });
    }
    return ["64GB", "128GB", "256GB", "512GB"];
  }, [selectedBrand, selectedModel, dbRecords]);

  // Helper to get compatible storages for a given model
  const getModelStorages = (modelName: string) => {
    const list = dbRecords
      .filter(
        (r) =>
          r.status === "Active" &&
          r.brand.toLowerCase() === selectedBrand.toLowerCase() &&
          r.model.toLowerCase() === modelName.toLowerCase()
      )
      .map((r) => r.storage);
    return list.length > 0 ? list : ["64GB", "128GB", "256GB"];
  };

  // Select a brand
  const handleSelectBrand = (brandId: string) => {
    onSelectBrand(brandId);
    setBrandSearchQuery("");
    setIsBrandDropdownOpen(false);
    
    // Clear dependent model & storage (NO auto-selection)
    onSelectModel("");
    onSelectStorage("");
    setModelSearchQuery("");
    setValidationError(null);
  };

  // Select a model
  const handleSelectModel = (modelName: string) => {
    onSelectModel(modelName);
    setModelSearchQuery("");
    setIsModelDropdownOpen(false);

    // Clear storage so user explicitly chooses
    onSelectStorage("");
    setValidationError(null);
  };

  // Select storage
  const handleSelectStorage = (storage: string) => {
    onSelectStorage(storage);
    setValidationError(null);
  };

  // Handle Next with validation
  const handleContinue = () => {
    if (!selectedBrand) {
      setValidationError("Please select your device brand to continue.");
      return;
    }
    if (!selectedModel) {
      setValidationError("Please select your device model to continue.");
      return;
    }
    if (!selectedStorage) {
      setValidationError("Please select your storage capacity to continue.");
      return;
    }
    setValidationError(null);
    onNext();
  };

  const selectedBrandObj = TRADE_IN_BRANDS.find(
    (b) => b.id.toLowerCase() === selectedBrand.toLowerCase()
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-milito-green/10 border border-milito-green/20 text-milito-green text-xs font-extrabold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5" />
          Step 1: Your Current Device
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight font-sans">
          WHAT ARE YOU SWAPPING?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base font-medium">
          Select the device you currently own so we can prepare your trade-in estimation.
        </p>
      </div>

      {/* Main Selection Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
        
        {/* 1. Brand Selection (Searchable Dropdown) */}
        <div className="space-y-2 relative" ref={brandDropdownRef}>
          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest">
            Select Device Brand
          </label>

          {/* Trigger Input / Button */}
          <div
            onClick={() => setIsBrandDropdownOpen((prev) => !prev)}
            className={`w-full p-4 rounded-2xl border bg-white flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
              isBrandDropdownOpen
                ? "border-milito-green ring-3 ring-milito-green/20 shadow-xs"
                : selectedBrand
                ? "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                : "border-gray-250 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectedBrandObj ? (
                <>
                  <span className="text-2xl select-none">{selectedBrandObj.logo}</span>
                  <span className="text-sm font-extrabold text-gray-950 font-sans">
                    {selectedBrandObj.name}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  Search or select brand...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedBrand && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBrand("");
                    onSelectModel("");
                    onSelectStorage("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isBrandDropdownOpen ? "rotate-180 text-milito-green" : ""
                }`}
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isBrandDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-fadeIn">
              {/* Search Bar inside dropdown */}
              <div className="p-3 border-b border-gray-100 bg-gray-50/80">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    placeholder="Type brand name (e.g. Apple, Samsung, Tecno)..."
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {brandSearchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBrandSearchQuery("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Brands list */}
              <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredBrands.length === 0 ? (
                  <div className="p-4 col-span-2 text-center text-xs text-gray-500">
                    No brand found matching "{brandSearchQuery}".
                  </div>
                ) : (
                  filteredBrands.map((b) => {
                    const isSelected = selectedBrand.toLowerCase() === b.id.toLowerCase();
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBrand(b.id)}
                        className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 font-extrabold border border-emerald-200"
                            : "hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg select-none">{b.logo}</span>
                          <span>{b.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-milito-green" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Device Model Selection (Appears once brand is chosen) */}
        {selectedBrand ? (
          <div className="space-y-2 relative pt-2 animate-fadeIn" ref={modelDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                Select Your Device
              </label>
              <span className="text-[11px] font-bold text-gray-500">
                {allBrandModels.length} models supported
              </span>
            </div>

            {/* Model Selector Trigger */}
            <div
              onClick={() => setIsModelDropdownOpen((prev) => !prev)}
              className={`w-full p-4 rounded-2xl border bg-white flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                isModelDropdownOpen
                  ? "border-milito-green ring-3 ring-milito-green/20 shadow-xs"
                  : selectedModel
                  ? "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                  : "border-gray-250 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {selectedModel ? (
                  <div>
                    <span className="text-sm font-extrabold text-gray-950 font-sans block">
                      {selectedModel}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {getModelStorages(selectedModel).join(" • ")}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    Search device model (e.g. {selectedBrand === "Apple" ? "14 Pro Max, 13, 11..." : selectedBrand === "Samsung" ? "S23, S24 Ultra, A54..." : "Camon 30, Spark 20..."})...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedModel && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectModel("");
                      onSelectStorage("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isModelDropdownOpen ? "rotate-180 text-milito-green" : ""
                  }`}
                />
              </div>
            </div>

            {/* Model Dropdown Menu */}
            {isModelDropdownOpen && (
              <div className="absolute z-40 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-fadeIn">
                {/* Search Bar */}
                <div className="p-3 border-b border-gray-100 bg-gray-50/80">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      placeholder={`Type to search ${selectedBrand} models...`}
                      autoFocus
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {modelSearchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModelSearchQuery("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Models List */}
                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                  {filteredModels.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">
                      No models found matching "{modelSearchQuery}". Try searching without "iPhone" or series prefixes.
                    </div>
                  ) : (
                    filteredModels.map((m) => {
                      const isSelected = selectedModel === m;
                      const storages = getModelStorages(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSelectModel(m)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-950 font-extrabold border border-emerald-200"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div>
                            <span className="block">{m}</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              Compatible storages: {storages.join(", ")}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-milito-green flex-shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 3. Storage Selection (Appears once model is chosen) */}
        {selectedModel ? (
          <div className="space-y-3 pt-4 border-t border-gray-150 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-milito-green" />
                Select Storage Capacity
              </label>
              <span className="text-[11px] font-medium text-gray-500">
                Choose your phone's exact storage
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableStorages.map((st) => {
                const isSelected = selectedStorage === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStorage(st)}
                    className={`py-3 px-4 rounded-2xl border text-center text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-milito-green text-black border-milito-green shadow-xs font-black ring-2 ring-milito-green/30"
                        : "bg-white text-gray-800 border-gray-250 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

      </div>

      {/* Summary Banner & Next Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-100/70 p-4 sm:p-6 rounded-3xl border border-gray-200">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-milito-green flex-shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              Device Selected
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-950 font-sans">
              {selectedBrand && selectedModel
                ? `${selectedModel}${selectedStorage ? ` • ${selectedStorage}` : " (Select storage)"}`
                : "No device selected yet"}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto px-8 py-3.5 bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Condition Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

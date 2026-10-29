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
  Cpu,
  Sparkles,
  HelpCircle,
  PlusCircle,
  Edit2
} from "lucide-react";
import { 
  SWAP_BRANDS, 
  getSwapModelsForBrand, 
  SWAP_STORAGE_OPTIONS, 
  SWAP_RAM_OPTIONS,
  SwapBrandEntry,
  SwapModelEntry
} from "../../data/swapPhoneCatalogue";
import { getStoredTradeInValuations } from "../../utils/tradeInValuationDb";

interface Step1DeviceSelectionProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  customModelName?: string;
  onSelectCustomModelName?: (customName: string) => void;
  selectedStorage: string;
  onSelectStorage: (storage: string) => void;
  selectedRam?: string;
  onSelectRam?: (ram: string) => void;
  onNext: () => void;
}

export default function Step1DeviceSelection({
  selectedBrand,
  onSelectBrand,
  selectedModel,
  onSelectModel,
  customModelName = "",
  onSelectCustomModelName,
  selectedStorage,
  onSelectStorage,
  selectedRam = "",
  onSelectRam,
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

  // Custom Model Manual Entry state ("Other model")
  const [isCustomModelActive, setIsCustomModelActive] = useState(() => {
    return selectedModel === "Other Model" || selectedModel === "Other Smartphone / Tablet" || Boolean(customModelName);
  });
  const [localCustomModelText, setLocalCustomModelText] = useState(customModelName || "");

  // Custom Storage Manual Entry state
  const [isCustomStorageActive, setIsCustomStorageActive] = useState(false);
  const [customStorageText, setCustomStorageText] = useState("");

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

  // Filtered Brands based on search query
  const filteredBrands = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    if (!q) return SWAP_BRANDS;
    return SWAP_BRANDS.filter((b) =>
      b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    );
  }, [brandSearchQuery]);

  // Selected Brand Object
  const selectedBrandObj = useMemo(() => {
    if (!selectedBrand) return null;
    return (
      SWAP_BRANDS.find((b) => b.id.toLowerCase() === selectedBrand.toLowerCase()) ||
      SWAP_BRANDS.find((b) => b.name.toLowerCase().includes(selectedBrand.toLowerCase())) || {
        id: selectedBrand,
        name: selectedBrand,
        logo: "📱",
      }
    );
  }, [selectedBrand]);

  // All models for the selected brand from the comprehensive catalogue
  const brandCatalogueModels = useMemo<SwapModelEntry[]>(() => {
    if (!selectedBrand) return [];
    return getSwapModelsForBrand(selectedBrand);
  }, [selectedBrand]);

  // Filtered models for dropdown list
  const filteredModels = useMemo<SwapModelEntry[]>(() => {
    if (!selectedBrand) return [];
    const q = modelSearchQuery.trim().toLowerCase().replace(/[\s-_]+/g, " ");
    if (!q) return brandCatalogueModels;

    return brandCatalogueModels.filter((entry) => {
      const normalizedName = entry.model.toLowerCase().replace(/[\s-_]+/g, " ");
      const normalizedSeries = (entry.series || "").toLowerCase().replace(/[\s-_]+/g, " ");
      if (normalizedName.includes(q) || normalizedSeries.includes(q)) return true;

      // Tokenized search (e.g. "s24" matching "Galaxy S24", "14 pro" matching "iPhone 14 Pro")
      const terms = q.split(" ").filter(Boolean);
      return terms.every((term) => normalizedName.includes(term) || normalizedSeries.includes(term));
    });
  }, [selectedBrand, brandCatalogueModels, modelSearchQuery]);

  // Handle Brand Selection
  const handleSelectBrand = (brandId: string) => {
    onSelectBrand(brandId);
    setBrandSearchQuery("");
    setIsBrandDropdownOpen(false);

    // Clear dependent fields cleanly
    onSelectModel("");
    if (onSelectCustomModelName) onSelectCustomModelName("");
    setIsCustomModelActive(false);
    setLocalCustomModelText("");
    onSelectStorage("");
    if (onSelectRam) {
      // For Apple, default to "Standard / N/A" or clear
      if (brandId.toLowerCase().includes("apple")) {
        onSelectRam("Standard / N/A");
      } else {
        onSelectRam("");
      }
    }
    setModelSearchQuery("");
    setValidationError(null);
  };

  // Handle Model Selection
  const handleSelectModel = (modelName: string) => {
    if (modelName === "Other Model" || modelName === "Other Smartphone / Tablet") {
      setIsCustomModelActive(true);
      onSelectModel("Other Model");
    } else {
      setIsCustomModelActive(false);
      onSelectModel(modelName);
      if (onSelectCustomModelName) onSelectCustomModelName("");
    }
    setModelSearchQuery("");
    setIsModelDropdownOpen(false);
    setValidationError(null);
  };

  // Handle Custom Model Text Change
  const handleCustomModelTextChange = (text: string) => {
    setLocalCustomModelText(text);
    if (onSelectCustomModelName) onSelectCustomModelName(text);
    if (text.trim()) {
      onSelectModel(text.trim());
    } else {
      onSelectModel("Other Model");
    }
    setValidationError(null);
  };

  // Select Storage
  const handleSelectStorage = (st: string) => {
    setIsCustomStorageActive(false);
    onSelectStorage(st);
    setValidationError(null);
  };

  // Select RAM
  const handleSelectRam = (ram: string) => {
    if (onSelectRam) {
      onSelectRam(ram);
    }
    setValidationError(null);
  };

  // Validate and Continue to Step 2
  const handleContinue = () => {
    if (!selectedBrand) {
      setValidationError("Please select your device brand to continue.");
      return;
    }
    if (!selectedModel || (selectedModel === "Other Model" && !localCustomModelText.trim())) {
      setValidationError("Please select or enter your device model name to continue.");
      return;
    }
    if (!selectedStorage) {
      setValidationError("Please select your device Storage / ROM capacity (32GB - 1TB).");
      return;
    }
    if (onSelectRam && !selectedRam) {
      setValidationError("Please select your device RAM capacity or 'Standard / N/A'.");
      return;
    }

    setValidationError(null);
    onNext();
  };

  const isApple = selectedBrand.toLowerCase().includes("apple");

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Main Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-7">
        
        {/* 1. BRAND SELECTION (Searchable Dropdown) */}
        <div className="space-y-2 relative" ref={brandDropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest">
              1. Phone Brand <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-semibold text-gray-400">
              iPhone, Samsung, Infinix, TECNO, etc.
            </span>
          </div>

          {/* Trigger Button */}
          <div
            id="brand-dropdown-trigger"
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
                  Search or select phone brand...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedBrand && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectBrand("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  aria-label="Clear Brand"
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

          {/* Brand Dropdown Menu */}
          {isBrandDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-fadeIn">
              {/* Search Bar */}
              <div className="p-3 border-b border-gray-100 bg-gray-50/80">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="brand-search-input"
                    type="text"
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    placeholder="Type brand name (e.g. Apple, Samsung, TECNO, Infinix, Pixel)..."
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Brands Grid */}
              <div className="max-h-72 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredBrands.length === 0 ? (
                  <div className="p-4 col-span-2 text-center text-xs text-gray-500">
                    No brand found matching "{brandSearchQuery}".
                    <button
                      type="button"
                      onClick={() => handleSelectBrand(brandSearchQuery.trim() || "Other")}
                      className="mt-2 block mx-auto px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold"
                    >
                      Use "{brandSearchQuery}" as Brand
                    </button>
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

        {/* 2. MODEL SELECTION (Searchable Dropdown + "Other Model" Option) */}
        {selectedBrand ? (
          <div className="space-y-2 relative pt-1 animate-fadeIn" ref={modelDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                2. Phone Model <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-gray-500">
                {brandCatalogueModels.length} models catalogued
              </span>
            </div>

            {/* Model Selector Trigger */}
            <div
              id="model-dropdown-trigger"
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
                      {isCustomModelActive && localCustomModelText ? localCustomModelText : selectedModel}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {selectedBrand} {isCustomModelActive ? "• Custom Model" : "• Official Model"}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    Search or select {selectedBrand} model...
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
                      setIsCustomModelActive(false);
                      setLocalCustomModelText("");
                      if (onSelectCustomModelName) onSelectCustomModelName("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    aria-label="Clear Model"
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
                      id="model-search-input"
                      type="text"
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                      placeholder={`Search ${selectedBrand} models (e.g. S24, Note 40, Camon 30, A54, 15 Pro)...`}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Models List */}
                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                  {/* Pin "Other Model" at top if query matches or as quick option */}
                  <button
                    type="button"
                    onClick={() => handleSelectModel("Other Model")}
                    className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <span className="font-extrabold block">Other {selectedBrand} Model</span>
                        <span className="text-[10px] text-amber-700 font-normal">
                          Model not listed? Click to type your phone's exact model name
                        </span>
                      </div>
                    </div>
                    {isCustomModelActive && <Check className="w-4 h-4 text-amber-700" />}
                  </button>

                  {/* Filtered Catalogue List */}
                  {filteredModels.map((entry) => {
                    const isSelected = selectedModel === entry.model && !isCustomModelActive;
                    return (
                      <button
                        key={entry.model}
                        type="button"
                        onClick={() => handleSelectModel(entry.model)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 font-extrabold border border-emerald-200"
                            : "hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div>
                          <span className="block">{entry.model}</span>
                          {entry.series && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              {entry.series}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-milito-green flex-shrink-0" />}
                      </button>
                    );
                  })}

                  {filteredModels.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-500 space-y-2">
                      <p>No catalogued model matching "{modelSearchQuery}".</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectModel("Other Model");
                          handleCustomModelTextChange(modelSearchQuery.trim());
                        }}
                        className="px-4 py-2 bg-milito-green text-black font-extrabold rounded-xl text-xs hover:brightness-105"
                      >
                        Use "{modelSearchQuery}" as Model
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* "Other Model" Interactive Text Input Field */}
            {isCustomModelActive && (
              <div className="mt-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                    Enter Your Phone Model Name:
                  </label>
                  <span className="text-[11px] font-semibold text-amber-800">
                    Never blocked
                  </span>
                </div>
                <input
                  id="custom-model-input"
                  type="text"
                  value={localCustomModelText}
                  onChange={(e) => handleCustomModelTextChange(e.target.value)}
                  placeholder={`e.g. ${selectedBrand} Galaxy A03 Core, Hot 10 Play, Spark 7...`}
                  className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  autoFocus
                />
                <p className="text-[11px] text-amber-800">
                  Tip: Provide the full name on the phone settings or box (e.g. <em>Infinix Hot 10 Play</em>).
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* 3. STORAGE / ROM SELECTION (Options from 32GB to 1TB, plus 16GB & 2TB) */}
        {selectedModel ? (
          <div className="space-y-3 pt-3 border-t border-gray-150 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-milito-green" />
                3. Storage / ROM Capacity <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-gray-500">
                Options from 32GB to 1TB+
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {SWAP_STORAGE_OPTIONS.map((st) => {
                const isSelected = selectedStorage === st && !isCustomStorageActive;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStorage(st)}
                    className={`py-3 px-2 rounded-2xl border text-center text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
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

            {/* Custom storage fallback */}
            <div className="flex items-center justify-end">
              {!isCustomStorageActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomStorageActive(true);
                    onSelectStorage("");
                  }}
                  className="text-[11px] font-bold text-gray-500 hover:text-black underline cursor-pointer"
                >
                  Other storage capacity?
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full max-w-xs animate-fadeIn">
                  <input
                    type="text"
                    value={customStorageText}
                    onChange={(e) => {
                      setCustomStorageText(e.target.value);
                      onSelectStorage(e.target.value.trim());
                    }}
                    placeholder="e.g. 128GB, 48GB..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomStorageActive(false)}
                    className="text-xs text-gray-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* 4. RAM SELECTION (Separate field as explicitly required) */}
        {selectedModel ? (
          <div className="space-y-3 pt-3 border-t border-gray-150 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-milito-green" />
                4. RAM (Operating Memory) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-gray-500">
                {isApple ? "Apple iPhones use unified RAM" : "Select exact installed RAM"}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {SWAP_RAM_OPTIONS.map((ram) => {
                const isSelected = selectedRam === ram;
                return (
                  <button
                    key={ram}
                    type="button"
                    onClick={() => handleSelectRam(ram)}
                    className={`py-2.5 px-1.5 rounded-2xl border text-center text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-milito-green text-black border-milito-green shadow-xs font-black ring-2 ring-milito-green/30"
                        : "bg-white text-gray-800 border-gray-250 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {ram === "Standard / N/A" ? (isApple ? "Standard (iOS)" : "N/A") : ram}
                  </button>
                );
              })}
            </div>

            {isApple && (
              <p className="text-[11px] text-gray-500 italic">
                * Note: Apple does not advertise RAM on iPhones; "Standard (iOS)" is automatically applicable for all iPhones.
              </p>
            )}
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

      {/* Selected Device Summary & Proceed CTA */}
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
                ? `${isCustomModelActive && localCustomModelText ? localCustomModelText : selectedModel}${selectedStorage ? ` • ${selectedStorage} Storage` : ""}${selectedRam ? ` • ${selectedRam} RAM` : ""}`
                : "No device selected yet"}
            </h3>
          </div>
        </div>

        <button
          id="continue-to-condition-check-btn"
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

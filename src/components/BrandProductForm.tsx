import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Plus,
  X,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  BatteryCharging,
  HardDrive,
  Palette,
  DollarSign,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Product, CloudinaryImageMeta } from "../types";
import { MediaUploader } from "./MediaUploader";
import { useBranding } from "../context/BrandingContext";
import {
  PHONE_BRANDS,
  getModelsForBrand,
  getPhoneModelDetails,
  PhoneModelItem
} from "../data/phoneModels";

interface BrandProductFormProps {
  productForm: Partial<Product>;
  setProductForm: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  editingProduct: Product | null;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving?: boolean;
  uploadQueue?: File[];
  isUploadingImage?: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  uploadStatus?: {
    isUploading: boolean;
    current: number;
    total: number;
    stageText?: string;
    isSuccess?: boolean;
    errorMessage?: string | null;
  };
  fileInputRef?: React.RefObject<HTMLInputElement>;
  handleFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUploadSuccess?: (
    uploadedFile: CloudinaryImageMeta | null,
    newGalleryImages?: CloudinaryImageMeta[],
    newThumbnail?: { secure_url: string; public_id: string }
  ) => void;
}

export function BrandProductForm({
  productForm,
  setProductForm,
  editingProduct,
  onSave,
  onCancel,
  isSaving = false,
  uploadError = null,
  uploadStatus,
  onImageUploadSuccess
}: BrandProductFormProps) {
  const { branding } = useBranding();
  const brandLogos = branding?.brandLogos || [];

  // Brand selection state
  const [selectedBrand, setSelectedBrand] = useState<string>(productForm.brand || "Apple");
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");
  const [customColorName, setCustomColorName] = useState<string>("");
  const [customColorHex, setCustomColorHex] = useState<string>("#1C1C1E");

  // Helper to find logo URL for a brand
  const getBrandLogoUrl = (brandName: string): string | undefined => {
    const found = brandLogos.find(
      b => b.name.toLowerCase() === brandName.toLowerCase() || b.id.toLowerCase() === brandName.toLowerCase()
    );
    return found?.logoUrl;
  };

  // Combine standard PHONE_BRANDS with any custom brands added by Admin
  const allBrands = React.useMemo(() => {
    const standardNames = new Set(PHONE_BRANDS.map(b => b.name.toLowerCase()));
    const list: Array<{ id: string; name: string; logo?: string; logoUrl?: string; modelCount?: number }> = PHONE_BRANDS.map(b => ({
      id: b.id,
      name: b.name,
      logo: b.logo,
      logoUrl: getBrandLogoUrl(b.name),
      modelCount: b.models.length
    }));

    // Add custom brands from brandLogos if not already in standard list
    brandLogos.forEach(bl => {
      if (!standardNames.has(bl.name.toLowerCase())) {
        list.push({
          id: bl.id,
          name: bl.name,
          logoUrl: bl.logoUrl,
          modelCount: getModelsForBrand(bl.name).length
        });
      }
    });

    return list;
  }, [brandLogos]);

  // Format currency display
  const formatNaira = (num: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Keep selectedBrand synchronized with productForm.brand
  useEffect(() => {
    if (productForm.brand && productForm.brand !== selectedBrand) {
      setSelectedBrand(productForm.brand);
    }
  }, [productForm.brand]);

  // When admin selects a new brand
  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    setModelSearchQuery("");
    
    // Get default models for the new brand
    const modelsForNewBrand = getModelsForBrand(newBrand);
    const defaultModel = modelsForNewBrand[0];

    setProductForm(prev => {
      const updated: Partial<Product> = {
        ...prev,
        brand: newBrand,
        name: defaultModel ? defaultModel.model : ""
      };

      if (defaultModel) {
        applyModelDetailsToForm(updated, defaultModel);
      }

      return updated;
    });
  };

  // Helper to apply model specs & variants to form
  const applyModelDetailsToForm = (form: Partial<Product>, modelItem: PhoneModelItem) => {
    const defaultStorage = modelItem.defaultStorageOptions || ["128GB", "256GB"];
    const defaultColors = modelItem.defaultColors && modelItem.defaultColors.length > 0
      ? modelItem.defaultColors
      : [{ name: "Standard Color", hex: "#1C1C1E" }];

    form.storageOptions = defaultStorage;
    form.colorOptions = defaultColors;
    
    if (modelItem.specs) {
      form.specs = {
        screen: modelItem.specs.screen,
        camera: modelItem.specs.camera,
        chipset: modelItem.specs.chipset,
        batterySize: modelItem.specs.batterySize,
        os: modelItem.specs.os,
        warranty: modelItem.specs.warranty || "1-Year Warranty",
        simType: modelItem.specs.simType || "Physical Nano SIM + eSIM",
        accessories: "Original Box & Accessories"
      };
    }

    form.condition = form.condition === "Brand New" ? "Brand New" : (form.condition || "Premium UK Used");
    form.quantity = form.quantity !== undefined ? form.quantity : 1;
    form.availability = form.availability || "In Stock";

    // Auto generate description summary
    form.description = generateSummaryText(form);
  };

  // Handle Model Selection
  const handleSelectModelByName = (modelName: string) => {
    const details = getPhoneModelDetails(selectedBrand, modelName);

    setProductForm(prev => {
      const updatedForm: Partial<Product> = {
        ...prev,
        brand: selectedBrand,
        name: modelName // CLEAN MODEL NAME ONLY
      };

      if (details) {
        applyModelDetailsToForm(updatedForm, details);
      } else {
        updatedForm.description = generateSummaryText(updatedForm);
      }

      return updatedForm;
    });
  };

  // Get models for selected brand filtered by search query
  const availableModels: PhoneModelItem[] = React.useMemo(() => {
    let models = getModelsForBrand(selectedBrand);
    if (modelSearchQuery.trim()) {
      const q = modelSearchQuery.toLowerCase();
      models = models.filter(m => m.model.toLowerCase().includes(q) || (m.series && m.series.toLowerCase().includes(q)));
    }
    return models;
  }, [selectedBrand, modelSearchQuery]);

  // Helper to generate clean, concise, natural summary in simple Nigerian English based ONLY on selected fields
  const generateSummaryText = (form: Partial<Product>) => {
    const brand = (form.brand || "").trim();
    const model = (form.name || "").trim();
    const isApple = brand.toLowerCase() === "apple" || model.toLowerCase().includes("iphone") || model.toLowerCase().includes("ipad");

    // 1. Device Title (Combine brand and model without unnecessary repetition)
    let deviceTitle = "";
    if (model) {
      const lowerModel = model.toLowerCase();
      const lowerBrand = brand.toLowerCase();

      const isAppleProduct = lowerModel.startsWith("iphone") ||
                             lowerModel.startsWith("ipad") ||
                             lowerModel.startsWith("macbook") ||
                             lowerModel.startsWith("airpods");

      if (lowerModel.startsWith(lowerBrand) || isAppleProduct) {
        deviceTitle = model;
      } else if (brand && brand !== "Other" && brand !== "Smartphone") {
        deviceTitle = `${brand} ${model}`;
      } else {
        deviceTitle = model;
      }
    } else if (brand && brand !== "Other" && brand !== "Smartphone") {
      deviceTitle = brand;
    } else {
      deviceTitle = "Device";
    }

    // 2. Condition
    const condition = form.condition ? form.condition.trim() : "";

    // 3. Storage
    let storageVal = "";
    if (form.storageOptions && form.storageOptions.length > 0) {
      storageVal = form.storageOptions.join("/");
    }

    // First Sentence Assembly: [Device Title], [Condition], [Storage]
    const firstSentenceParts: string[] = [];
    if (deviceTitle) firstSentenceParts.push(deviceTitle);
    if (condition) firstSentenceParts.push(condition);
    if (storageVal) firstSentenceParts.push(storageVal);

    const firstSentence = firstSentenceParts.join(", ");

    // 4. Battery Text (Apple: Battery Health percentage, Android: Battery Condition)
    let batteryText = "";
    if (isApple) {
      if (form.batteryHealth && form.batteryHealth.trim()) {
        const rawBat = form.batteryHealth.trim();
        if (rawBat.includes("100%")) {
          batteryText = "Battery health is 100%";
        } else if (rawBat.includes("%")) {
          batteryText = `Battery health is ${rawBat}`;
        } else {
          batteryText = `Battery health is ${rawBat}%`;
        }
      }
    } else {
      if (form.batteryCondition && form.batteryCondition.trim()) {
        batteryText = `Battery condition is ${form.batteryCondition.trim()}`;
      } else if (form.batteryHealth && form.batteryHealth.trim()) {
        batteryText = `Battery condition is ${form.batteryHealth.trim()}`;
      }
    }

    // 5. Network Status
    let networkText = "";
    if (form.network && form.network.trim()) {
      const net = form.network.trim();
      if (net === "Factory Unlocked") {
        networkText = "Factory Unlocked";
      } else if (net === "Network Unlocked") {
        networkText = "Network Unlocked";
      } else {
        networkText = net;
      }
    }

    // 6. Device Lock Status
    let lockText = "";
    if (form.deviceLockStatus && form.deviceLockStatus.trim()) {
      const lk = form.deviceLockStatus.trim();
      if (lk === "Unlocked") {
        lockText = "Unlocked";
      } else if (lk !== "Unknown") {
        lockText = lk;
      }
    }

    // 7. Face ID / Biometrics & iCloud Lock
    let biometricsText = "";
    if (isApple) {
      if (form.faceId && form.faceId.trim()) {
        const fid = form.faceId.trim().toLowerCase();
        if (fid.includes("working") && !fid.includes("not working")) {
          biometricsText = "Face ID is working";
        } else if (fid.includes("not working")) {
          biometricsText = "Face ID is not working";
        }
      }
      if (form.specs?.icloudStatus) {
        const icl = form.specs.icloudStatus.trim();
        if (icl.toLowerCase().includes("clean")) {
          if (biometricsText) biometricsText += " and iCloud is Clean";
          else biometricsText = "iCloud is Clean";
        }
      }
    }

    // Second Sentence Assembly: [Battery], [Network], [Device Lock], [Biometrics]
    const statusParts: string[] = [];
    if (batteryText) statusParts.push(batteryText);
    if (networkText && lockText) {
      if (networkText === "Factory Unlocked" && lockText === "Unlocked") {
        statusParts.push("the device is Factory Unlocked");
      } else {
        statusParts.push(`network is ${networkText} (${lockText})`);
      }
    } else if (networkText) {
      statusParts.push(`the device is ${networkText}`);
    } else if (lockText) {
      statusParts.push(`device lock is ${lockText}`);
    }
    if (biometricsText) statusParts.push(biometricsText);

    let secondSentence = "";
    if (statusParts.length > 0) {
      secondSentence = statusParts.join(" and ") + ".";
      // Capitalize first letter of second sentence
      secondSentence = secondSentence.charAt(0).toUpperCase() + secondSentence.slice(1);
    }

    if (firstSentence && secondSentence) {
      return `${firstSentence}. ${secondSentence}`;
    } else if (firstSentence) {
      return `${firstSentence}.`;
    } else if (secondSentence) {
      return secondSentence;
    }

    return `${deviceTitle}.`;
  };

  // Auto Generate Summary Button Handler
  const handleAutoGenerateSummary = () => {
    const summary = generateSummaryText(productForm);
    setProductForm(prev => ({
      ...prev,
      description: summary
    }));
  };

  // Toggle Storage Option Chip
  const toggleStorageOption = (storageVal: string) => {
    setProductForm(prev => {
      const current = prev.storageOptions || [];
      let updated: string[];
      if (current.includes(storageVal)) {
        if (current.length === 1) return prev;
        updated = current.filter(s => s !== storageVal);
      } else {
        updated = [...current, storageVal];
      }
      return { ...prev, storageOptions: updated };
    });
  };

  // Add Custom Color
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const newColor = { name: customColorName.trim(), hex: customColorHex || "#1C1C1E" };
    setProductForm(prev => {
      const current = prev.colorOptions || [];
      return {
        ...prev,
        colorOptions: [...current, newColor]
      };
    });
    setCustomColorName("");
  };

  // Local validation error state
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  // Direct Submit & Validation Handler
  const handleDirectSubmit = (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (isSaving) return;

    if (!productForm.brand) {
      setLocalValidationError("Please select a smartphone brand first.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!productForm.name || !productForm.name.trim()) {
      setLocalValidationError("Please select or enter the smartphone model name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (productForm.price === undefined || productForm.price === null || isNaN(Number(productForm.price)) || Number(productForm.price) <= 0) {
      setLocalValidationError("Please enter a valid selling price in Naira (₦).");
      return;
    }

    setLocalValidationError(null);
    onSave(e as React.FormEvent);
  };

  return (
    <form onSubmit={handleDirectSubmit} noValidate className="space-y-6">
      {/* STEP 1: SELECT BRAND & MODEL (DEPENDENT DROPDOWNS) */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Select Brand & Phone Model</h4>
              <p className="text-xs text-gray-400">Selecting a brand dynamically loads ONLY models for that brand.</p>
            </div>
          </div>
          {productForm.name && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 truncate max-w-[220px]">
              {productForm.brand}: {productForm.name}
            </span>
          )}
        </div>

        {/* Visual Brand Buttons with Brand Logo Images */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {allBrands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
            const logoUrl = b.logoUrl || getBrandLogoUrl(b.name);

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBrandChange(b.name)}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                  isSelected
                    ? "bg-[#00B14F]/15 border-[#00B14F] text-white shadow-lg shadow-[#00B14F]/10 scale-[1.02]"
                    : "bg-gray-900/80 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                {logoUrl ? (
                  <div className="w-8 h-8 rounded-lg bg-black/80 border border-gray-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src={logoUrl} alt={b.name} className="w-full h-full object-contain" />
                  </div>
                ) : b.logo ? (
                  <span className="text-2xl">{b.logo}</span>
                ) : (
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                )}
                <span className="text-xs font-extrabold leading-tight">{b.name}</span>
                {b.modelCount !== undefined && b.modelCount > 0 && (
                  <span className="text-[10px] text-gray-400">{b.modelCount} Models</span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleBrandChange("Other")}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
              selectedBrand === "Other"
                ? "bg-[#00B14F]/15 border-[#00B14F] text-white shadow-lg shadow-[#00B14F]/10 scale-[1.02]"
                : "bg-gray-900/80 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
            }`}
          >
            <Smartphone className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-extrabold">Other Brand</span>
            <span className="text-[10px] text-gray-400">Custom Entry</span>
          </button>
        </div>

        {/* DEPENDENT MODEL SELECTOR DROPDOWN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Select {selectedBrand} Model
            </label>
            <select
              value={productForm.name || ""}
              onChange={(e) => handleSelectModelByName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-semibold"
            >
              <option value="">-- Choose {selectedBrand} Model --</option>
              {availableModels.map((m) => (
                <option key={m.id} value={m.model}>
                  {m.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Search Models</label>
            <input
              type="text"
              placeholder={`Search ${selectedBrand} models...`}
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            />
          </div>
        </div>

        {/* POPULAR MODEL QUICK SELECT CHIPS */}
        {availableModels.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
              {selectedBrand} Models (Click to Select)
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {availableModels.map((m) => {
                const isSelected = productForm.name === m.model;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectModelByName(m.model)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#00B14F] text-black border-[#00B14F] shadow-md shadow-[#00B14F]/20"
                        : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{m.model}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Product Title / Model Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Model Name (Stored as Product Title)</label>
          <input
            type="text"
            required
            placeholder="e.g. iPhone 17 Pro Max"
            value={productForm.name || ""}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* STEP 2: CONDITION, STORAGE, COLORS & VARIANTS */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Condition & Storage Options</h4>
              <p className="text-xs text-gray-400">Select device condition grade, storage capacities and color swatches.</p>
            </div>
          </div>
        </div>

        {/* CONDITION SELECTION CHIPS (BRAND NEW vs PREMIUM UK USED) */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Device Condition
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {(["Brand New", "Premium UK Used"] as const).map((cond) => {
              const isSelected = productForm.condition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() =>
                    setProductForm(prev => ({
                      ...prev,
                      condition: cond,
                      batteryHealth: cond === "Brand New" ? "100% (Brand New)" : (prev.batteryHealth || "100%")
                    }))
                  }
                  className={`p-3 rounded-xl border text-xs font-extrabold transition-all text-center ${
                    isSelected
                      ? "bg-[#00B14F] text-black border-[#00B14F] shadow-lg shadow-[#00B14F]/20"
                      : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* STORAGE OPTIONS CHIPS */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Storage Options
          </label>
          <div className="flex flex-wrap gap-2">
            {["64GB", "128GB", "256GB", "512GB", "1TB"].map((stg) => {
              const isSelected = (productForm.storageOptions || []).includes(stg);
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => toggleStorageOption(stg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#00B14F] text-black border-[#00B14F]"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{stg}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLOR OPTIONS SWATCHES */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            Color Options
          </label>
          
          <div className="flex flex-wrap gap-2.5 mb-3">
            {(productForm.colorOptions || []).map((colorObj, idx) => {
              const name = typeof colorObj === 'string' ? colorObj : colorObj.name;
              const hex = typeof colorObj === 'object' ? colorObj.hex : "#1C1C1E";
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white font-semibold"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-500 shadow-sm" style={{ backgroundColor: hex }} />
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm(prev => ({
                        ...prev,
                        colorOptions: (prev.colorOptions || []).filter((_, i) => i !== idx)
                      }));
                    }}
                    className="text-gray-400 hover:text-red-400 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Add color (e.g. Sierra Blue)"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            />
            <input
              type="color"
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="w-8 h-8 rounded-lg border border-gray-700 bg-transparent cursor-pointer shrink-0"
            />
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Color
            </button>
          </div>
        </div>

        {/* BATTERY INFORMATION, NETWORK STATUS, DEVICE LOCK STATUS & BIOMETRICS */}
        {(() => {
          const isAppleDevice = selectedBrand.toLowerCase() === "apple" ||
                                (productForm.brand || "").toLowerCase() === "apple" ||
                                (productForm.name || "").toLowerCase().includes("iphone") ||
                                (productForm.name || "").toLowerCase().includes("ipad");

          return (
            <div className="space-y-4 pt-2 border-t border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. BATTERY INFORMATION */}
                {isAppleDevice ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      Battery Health (Apple)
                    </label>
                    <select
                      value={productForm.batteryHealth || ""}
                      onChange={(e) => setProductForm({ ...productForm, batteryHealth: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Battery Health % --</option>
                      <option value="100%">100% Battery Health</option>
                      <option value="99%">99% Battery Health</option>
                      <option value="98%">98% Battery Health</option>
                      <option value="95%">95% Battery Health</option>
                      <option value="90%">90% Battery Health</option>
                      <option value="88%">88% Battery Health</option>
                      <option value="85%">85% Battery Health</option>
                      <option value="80%">80% Battery Health</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      Battery Condition (Android)
                    </label>
                    <select
                      value={productForm.batteryCondition || productForm.batteryHealth || ""}
                      onChange={(e) => setProductForm({ ...productForm, batteryCondition: e.target.value, batteryHealth: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Battery Condition --</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Normal">Normal</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Attention">Needs Attention</option>
                    </select>
                  </div>
                )}

                {/* 2. NETWORK STATUS */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Network Status</label>
                  <select
                    value={productForm.network || ""}
                    onChange={(e) => setProductForm({ ...productForm, network: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="">-- Select Network Status --</option>
                    <option value="Factory Unlocked">Factory Unlocked</option>
                    <option value="Network Unlocked">Network Unlocked</option>
                    <option value="Locked">Locked</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                {/* 3. DEVICE LOCK STATUS */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Device Lock Status</label>
                  <select
                    value={productForm.deviceLockStatus || ""}
                    onChange={(e) => setProductForm({ ...productForm, deviceLockStatus: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="">-- Select Device Lock Status --</option>
                    <option value="Unlocked">Unlocked</option>
                    <option value="Carrier Locked">Carrier Locked</option>
                    <option value="SIM Locked">SIM Locked</option>
                    <option value="Account Locked">Account Locked</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                {/* 4. APPLE SPECIFIC: FACE ID & ICLOUD LOCK */}
                {isAppleDevice && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Face ID / Biometrics</label>
                      <select
                        value={productForm.faceId || ""}
                        onChange={(e) => setProductForm({ ...productForm, faceId: e.target.value as any })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="">-- Face ID Status --</option>
                        <option value="Working">Working (Tested)</option>
                        <option value="Not Working">Not Working</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">iCloud Lock Status</label>
                      <select
                        value={productForm.specs?.icloudStatus || ""}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...productForm.specs, icloudStatus: e.target.value } as any
                        })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      >
                        <option value="">-- iCloud Lock Status --</option>
                        <option value="Clean / Unlocked">Clean / Unlocked</option>
                        <option value="iCloud Locked">iCloud Locked</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* STEP 3: PRICING & STOCK QUANTITY */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-sm">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pricing & Inventory</h4>
              <p className="text-xs text-gray-400">Main manual input: Enter selling price in Naira (₦) and quantity.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Selling Price (₦)
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 380000"
              value={productForm.price || ""}
              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
              className="w-full bg-gray-900 border-2 border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-emerald-400 focus:border-[#00B14F] focus:outline-none"
            />
            {Number(productForm.price) > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 mt-1 block">
                Formatted: {formatNaira(Number(productForm.price))}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Original Price (₦ Strikethrough)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 420000"
              value={productForm.originalPrice || ""}
              onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Stock Quantity</label>
            <input
              type="number"
              min="0"
              placeholder="1"
              value={productForm.quantity !== undefined ? productForm.quantity : 1}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  quantity: Number(e.target.value),
                  availability: Number(e.target.value) <= 0 ? "Sold Out" : "In Stock"
                })
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* STEP 4: MEDIA UPLOADER */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-sm">
            4
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Product Photos & Media</h4>
            <p className="text-xs text-gray-400">Upload product photos. Cloudinary handles high-res delivery.</p>
          </div>
        </div>

        {uploadError && (
          <div className="p-4 bg-red-950/90 border border-red-500/60 rounded-xl text-xs font-mono space-y-1 animate-fadeIn shadow-lg">
            <div className="font-bold text-red-400 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Upload error.</span>
            </div>
            <div className="text-red-300 leading-relaxed break-words">{uploadError}</div>
          </div>
        )}

        <MediaUploader
          galleryImages={
            (productForm.galleryImages && productForm.galleryImages.length > 0)
              ? productForm.galleryImages
              : (productForm.gallery && productForm.gallery.length > 0)
              ? productForm.gallery.map((url, i) => ({
                  secure_url: url,
                  public_id: (productForm.galleryPublicIds && productForm.galleryPublicIds[i]) || `legacy_${i}`,
                  original_filename: `Photo ${i + 1}`
                }))
              : productForm.image
              ? [{
                  secure_url: productForm.image,
                  public_id: productForm.imagePublicId || "legacy_main",
                  original_filename: "Main Cover"
                }]
              : []
          }
          thumbnail={
            productForm.thumbnail?.secure_url
              ? productForm.thumbnail
              : productForm.image
              ? { secure_url: productForm.image, public_id: productForm.imagePublicId || "" }
              : undefined
          }
          uploadStatus={uploadStatus}
          onChange={({ galleryImages: newImages, thumbnail: newThumb, mediaItems }) => {
            const galleryUrls = mediaItems && mediaItems.length > 0
              ? mediaItems.map(m => m.previewUrl)
              : newImages.map(img => img.secure_url);
            
            const galleryPublicIds = newImages.map(img => img.public_id);
            const mainItem = mediaItems && mediaItems.length > 0 ? mediaItems[0] : null;
            const mainImage = mainItem ? mainItem.previewUrl : (newThumb.secure_url || galleryUrls[0] || "");
            const mainPublicId = (mainItem && !mainItem.isLocal ? mainItem.meta?.public_id : "") || newThumb.public_id || galleryPublicIds[0] || "";

            setProductForm(prev => ({
              ...prev,
              _mediaItems: mediaItems,
              galleryImages: newImages,
              thumbnail: { secure_url: mainImage, public_id: mainPublicId },
              image: mainImage,
              imagePublicId: mainPublicId,
              gallery: galleryUrls,
              galleryPublicIds: galleryPublicIds
            } as any));
          }}
          onUploadSuccess={onImageUploadSuccess}
        />
      </div>

      {/* STEP 5: SUMMARY & DESCRIPTION */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              5
            </div>
            <h4 className="text-sm font-bold text-white">Product Description Summary</h4>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerateSummary}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Generate Summary
          </button>
        </div>

        <textarea
          rows={3}
          placeholder="Auto-generated summary from selected details..."
          value={productForm.description || ""}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-[#00B14F] focus:outline-none leading-relaxed"
        />
      </div>

      {/* LIVE PRODUCT PREVIEW CARD */}
      <div className="p-5 bg-[#0A0E1A] border border-emerald-500/30 rounded-2xl shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" /> Live Storefront Preview
          </span>
          <span className="text-[10px] text-gray-400">Updates dynamically</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-900/90 p-4 rounded-xl border border-gray-800">
          <div className="w-24 h-24 rounded-lg bg-black border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
            {productForm.image || productForm.thumbnail?.secure_url ? (
              <img
                src={productForm.thumbnail?.secure_url || productForm.image}
                alt="Preview"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Smartphone className="w-8 h-8 text-gray-600" />
            )}
          </div>

          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#00B14F] text-black">
                {productForm.brand || "Brand"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                {productForm.condition || "Premium UK Used"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚡ {productForm.batteryHealth || "100% Battery"}
              </span>
            </div>

            <h5 className="text-sm font-extrabold text-white">
              {productForm.name || "Product Model Name"}
            </h5>

            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {productForm.description || "Description preview..."}
            </p>

            <div className="pt-1 flex items-center gap-3 justify-center sm:justify-start">
              <span className="text-base font-extrabold text-[#00B14F]">
                {Number(productForm.price) > 0 ? formatNaira(Number(productForm.price)) : "₦0"}
              </span>
              {Number(productForm.originalPrice) > Number(productForm.price) && (
                <span className="text-xs text-gray-500 line-through">
                  {formatNaira(Number(productForm.originalPrice))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VALIDATION ERROR BANNER */}
      {localValidationError && (
        <div className="p-4 bg-red-950/90 border border-red-500 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 text-red-200 animate-fadeIn shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{localValidationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocalValidationError(null)}
            className="text-red-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="sticky bottom-0 z-40 bg-[#0E131F]/98 backdrop-blur-md p-4 rounded-b-2xl border-t border-gray-800 shadow-2xl flex flex-col xs:flex-row items-center justify-end gap-3 min-h-[72px]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full xs:w-auto px-6 py-3.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all text-center touch-manipulation disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="admin-publish-product-btn"
          disabled={isSaving}
          onClick={handleDirectSubmit}
          className="w-full xs:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black bg-[#00B14F] hover:bg-[#009241] active:bg-[#007a36] active:scale-[0.98] text-black shadow-xl shadow-[#00B14F]/25 transition-all disabled:opacity-60 text-center cursor-pointer touch-manipulation select-none"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{uploadStatus?.stageText || "Publishing to Catalog..."}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{editingProduct ? "Update Product" : "Publish Product to Catalog"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default BrandProductForm;

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  BatteryCharging,
  HardDrive,
  DollarSign,
  Eye,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Wifi,
  Layers
} from "lucide-react";
import { Product, CloudinaryImageMeta } from "../types";
import { MediaUploader } from "./MediaUploader";
import { useBranding } from "../context/BrandingContext";
import { getStockStatus, getProductStockQuantity } from "../utils/stockUtils";
import {
  PHONE_BRANDS,
  getModelsForBrand,
  getSeriesForBrand,
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

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

const formatNaira = (num: number) => nairaFormatter.format(num);

// Helper to generate clean, concise, natural summary in straightforward Nigerian English based ONLY on admin selected fields
export const generateSelectedOnlyDescription = (form: Partial<Product>): string => {
  const brand = (form.brand || "").trim();
  const model = (form.name || "").trim();
  const isApple =
    brand.toLowerCase() === "apple" ||
    model.toLowerCase().includes("iphone") ||
    model.toLowerCase().includes("ipad");

  // 1. Device Title (Combine brand and model without repetition)
  let deviceTitle = "";
  if (model) {
    const lowerModel = model.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    const isAppleProduct =
      lowerModel.startsWith("iphone") ||
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
  }

  // 2. Condition (Only if selected)
  const condition = form.condition ? form.condition.trim() : "";

  // 3. Storage (ONLY what admin selected)
  let storageVal = "";
  if (form.storageOptions && form.storageOptions.length > 0) {
    const validStorage = form.storageOptions.filter(Boolean);
    if (validStorage.length > 0) {
      storageVal = validStorage.join(" / ") + " storage";
    }
  }

  // 4. RAM (ONLY if selected)
  let ramVal = "";
  if (form.specs?.ram && form.specs.ram.trim() && form.specs.ram !== "None") {
    const rawRam = form.specs.ram.trim();
    ramVal = rawRam.toLowerCase().includes("ram") ? rawRam : `${rawRam} RAM`;
  }

  // 5. Network Capability (e.g. 4G, 5G)
  let netCapVal = "";
  if (form.networkCapability && form.networkCapability.trim()) {
    const rawCap = form.networkCapability.trim();
    netCapVal = rawCap.toLowerCase().includes("network") ? rawCap : `${rawCap} network`;
  }

  // 6. Device Lock / SIM Status (e.g. Factory Unlocked)
  let lockText = "";
  if (form.deviceLockStatus && String(form.deviceLockStatus).trim()) {
    const lk = String(form.deviceLockStatus).trim();
    if (lk === "Unlocked" || lk === "Factory Unlocked") {
      lockText = "Factory Unlocked";
    } else {
      lockText = lk;
    }
  } else if (form.network && String(form.network).trim()) {
    const net = String(form.network).trim();
    if (net.toLowerCase().includes("unlocked")) {
      lockText = net;
    }
  }

  // Assemble First Sentence: [Device Title], [Condition] [with details...]
  const configParts: string[] = [];
  if (storageVal) configParts.push(storageVal);
  if (ramVal) configParts.push(ramVal);
  if (netCapVal) configParts.push(netCapVal);
  if (lockText) configParts.push(lockText);

  let firstSentence = "";
  if (deviceTitle && condition) {
    firstSentence = `${deviceTitle}, ${condition}`;
  } else if (deviceTitle) {
    firstSentence = deviceTitle;
  } else if (condition) {
    firstSentence = condition;
  }

  if (configParts.length > 0) {
    if (firstSentence) {
      if (configParts.length === 1) {
        firstSentence += ` with ${configParts[0]}`;
      } else if (configParts.length === 2) {
        firstSentence += ` with ${configParts[0]} and ${configParts[1]}`;
      } else {
        const allExceptLast = configParts.slice(0, -1).join(", ");
        const last = configParts[configParts.length - 1];
        firstSentence += ` with ${allExceptLast} and ${last}`;
      }
    } else {
      firstSentence = configParts.join(", ");
    }
  }

  // 7. Battery Text (Only if selected by admin)
  let batteryText = "";
  if (isApple) {
    if (form.batteryHealth && form.batteryHealth.trim()) {
      const rawBat = form.batteryHealth.trim();
      if (rawBat.toLowerCase().includes("brand new") || (condition === "Brand New" && rawBat.includes("100%"))) {
        batteryText = "battery health is 100%";
      } else if (rawBat.includes("%")) {
        batteryText = `battery health is ${rawBat}`;
      } else {
        batteryText = `battery health is ${rawBat}%`;
      }
    }
  } else {
    if (form.batteryCondition && form.batteryCondition.trim()) {
      batteryText = `battery condition is ${form.batteryCondition.trim()}`;
    } else if (form.batteryHealth && form.batteryHealth.trim()) {
      const rawBat = form.batteryHealth.trim();
      batteryText = `battery is ${rawBat.includes("%") ? rawBat : `${rawBat}%`}`;
    }
  }

  // 8. Biometrics (Fingerprint & Face Unlock / Face ID)
  let biometricsText = "";
  const fp = form.fingerprint ? String(form.fingerprint).trim() : "";
  const fid = form.faceId ? String(form.faceId).trim() : "";

  const fpWorking = fp.toLowerCase().includes("working") && !fp.toLowerCase().includes("not working");
  const fpNotWorking = fp.toLowerCase().includes("not working");
  
  const fidWorking = fid.toLowerCase().includes("working") && !fid.toLowerCase().includes("not working");
  const fidNotWorking = fid.toLowerCase().includes("not working");

  const faceLabel = isApple ? "Face ID" : "Face Unlock";

  if (fpWorking && fidWorking) {
    biometricsText = `Fingerprint and ${faceLabel} are working`;
  } else if (fpWorking && !fidWorking && !fidNotWorking) {
    biometricsText = "Fingerprint sensor is working";
  } else if (!fpWorking && !fpNotWorking && fidWorking) {
    biometricsText = `${faceLabel} is working`;
  } else if (fpNotWorking && fidNotWorking) {
    biometricsText = `Fingerprint and ${faceLabel} are not working`;
  } else if (fpNotWorking) {
    biometricsText = "Fingerprint is not working";
  } else if (fidNotWorking) {
    biometricsText = `${faceLabel} is not working`;
  }

  // 9. iCloud Status (Only if selected)
  let icloudText = "";
  if (form.specs?.icloudStatus && form.specs.icloudStatus.trim() && form.specs.icloudStatus !== "Unknown") {
    const icl = form.specs.icloudStatus.trim();
    if (icl.toLowerCase().includes("clean") || icl.toLowerCase().includes("unlocked")) {
      icloudText = "iCloud is Clean";
    } else {
      icloudText = `iCloud is ${icl}`;
    }
  }

  // Assemble second sentence with ONLY selected details
  const statusParts: string[] = [];
  if (batteryText) statusParts.push(batteryText);
  if (biometricsText) statusParts.push(biometricsText);
  if (icloudText) statusParts.push(icloudText);

  let secondSentence = "";
  if (statusParts.length > 0) {
    if (statusParts.length === 1) {
      secondSentence = statusParts[0] + ".";
    } else if (statusParts.length === 2) {
      secondSentence = `${statusParts[0]} and ${statusParts[1]}.`;
    } else {
      const allExceptLast = statusParts.slice(0, -1).join(", ");
      const last = statusParts[statusParts.length - 1];
      secondSentence = `${allExceptLast} and ${last}.`;
    }
    secondSentence = secondSentence.charAt(0).toUpperCase() + secondSentence.slice(1);
  }

  const conclusion = "Device is tested and ready for use.";

  if (firstSentence && secondSentence) {
    return `${firstSentence}. ${secondSentence} ${conclusion}`;
  } else if (firstSentence) {
    return `${firstSentence}. ${conclusion}`;
  } else if (secondSentence) {
    return `${secondSentence} ${conclusion}`;
  }

  return deviceTitle ? `${deviceTitle}. ${conclusion}` : "";
};

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
  const [selectedSeries, setSelectedSeries] = useState<string>("All Series");
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");

  // Helper to find logo URL for a brand
  const getBrandLogoUrl = (brandName: string): string | undefined => {
    const found = brandLogos.find(
      b => b.name.toLowerCase() === brandName.toLowerCase() || b.id.toLowerCase() === brandName.toLowerCase()
    );
    return found?.logoUrl;
  };

  // Combine standard PHONE_BRANDS with any custom brands added by Admin with strict deduplication
  const allBrands = React.useMemo(() => {
    const seenBrandNames = new Set<string>();
    const list: Array<{ id: string; name: string; logo?: string; logoUrl?: string; modelCount?: number }> = [];

    // Add standard brands
    PHONE_BRANDS.forEach(b => {
      const lower = b.name.trim().toLowerCase();
      if (!seenBrandNames.has(lower)) {
        seenBrandNames.add(lower);
        list.push({
          id: b.id,
          name: b.name,
          logo: b.logo,
          logoUrl: getBrandLogoUrl(b.name),
          modelCount: b.models.length
        });
      }
    });

    // Add custom brands from brandLogos if not already in standard list
    brandLogos.forEach(bl => {
      const lower = bl.name.trim().toLowerCase();
      if (!seenBrandNames.has(lower)) {
        seenBrandNames.add(lower);
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

  // Available series for selected brand
  const availableSeries = React.useMemo(() => {
    return getSeriesForBrand(selectedBrand);
  }, [selectedBrand]);

  // Keep selectedBrand synchronized with productForm.brand
  useEffect(() => {
    if (productForm.brand && productForm.brand !== selectedBrand) {
      setSelectedBrand(productForm.brand);
      setSelectedSeries("All Series");
    }
  }, [productForm.brand]);

  // Helper to apply model specs & variants to form
  const applyModelDetailsToForm = (form: Partial<Product>, modelItem: PhoneModelItem) => {
    // Single selected storage default (never auto-add multiple unless chosen)
    const defaultStorage = modelItem.defaultStorageOptions?.[0] ? [modelItem.defaultStorageOptions[0]] : ["128GB"];
    form.storageOptions = form.storageOptions && form.storageOptions.length > 0 ? form.storageOptions : defaultStorage;
    
    // RAM configuration
    const defaultRam = modelItem.ramOptions?.[0] || modelItem.specs?.ram || "";

    // Network options
    const defaultNetwork = modelItem.networkOptions?.[0] || (modelItem.specs?.simType?.includes("5G") ? "5G" : "4G");
    form.networkCapability = form.networkCapability || defaultNetwork;
    form.network = form.network || "Factory Unlocked";
    form.deviceLockStatus = form.deviceLockStatus || "Unlocked";

    // Biometrics
    const isApple = selectedBrand.toLowerCase() === "apple" || modelItem.model.toLowerCase().includes("iphone");
    if (isApple) {
      form.faceId = form.faceId || "Working";
    } else {
      form.fingerprint = form.fingerprint || "Working";
      form.faceId = form.faceId || "Working";
    }

    if (modelItem.specs) {
      form.specs = {
        screen: modelItem.specs.screen,
        camera: modelItem.specs.camera,
        chipset: modelItem.specs.chipset,
        batterySize: modelItem.specs.batterySize,
        os: modelItem.specs.os,
        warranty: modelItem.specs.warranty || "1-Year Warranty",
        simType: modelItem.specs.simType || "Physical Nano SIM + eSIM",
        accessories: "Original Box & Accessories",
        ram: form.specs?.ram || defaultRam,
        fingerprint: modelItem.specs.fingerprint,
        faceUnlock: modelItem.specs.faceUnlock
      };
    }

    form.condition = form.condition || "Premium UK Used";
    if (!isApple && !form.batteryCondition) {
      form.batteryCondition = "Excellent";
    }
    form.quantity = form.quantity !== undefined ? form.quantity : 1;
    form.availability = form.availability || "In Stock";

    // Auto generate description summary based strictly on selected fields
    form.description = generateSelectedOnlyDescription(form);
  };

  // When admin selects a new brand
  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    setSelectedSeries("All Series");
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
      } else {
        updated.description = generateSelectedOnlyDescription(updated);
      }

      return updated;
    });
  };

  // When admin selects a series filter
  const handleSeriesChange = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setModelSearchQuery("");
  };

  // Handle Model Selection
  const handleSelectModelByName = (modelName: string) => {
    const details = getPhoneModelDetails(selectedBrand, modelName);

    setProductForm(prev => {
      const updatedForm: Partial<Product> = {
        ...prev,
        brand: selectedBrand,
        name: modelName
      };

      if (details) {
        applyModelDetailsToForm(updatedForm, details);
      } else {
        updatedForm.description = generateSelectedOnlyDescription(updatedForm);
      }

      return updatedForm;
    });
  };

  // Get models for selected brand filtered by series and search query
  const availableModels: PhoneModelItem[] = React.useMemo(() => {
    let models = getModelsForBrand(selectedBrand);
    if (selectedSeries && selectedSeries !== "All Series" && selectedSeries !== "All") {
      models = models.filter(m => m.series && m.series.toLowerCase() === selectedSeries.toLowerCase());
    }
    if (modelSearchQuery.trim()) {
      const q = modelSearchQuery.toLowerCase();
      models = models.filter(m => m.model.toLowerCase().includes(q) || (m.series && m.series.toLowerCase().includes(q)));
    }
    return models;
  }, [selectedBrand, selectedSeries, modelSearchQuery]);

  // Current active phone model details if available
  const currentModelDetails = React.useMemo(() => {
    if (!productForm.name) return undefined;
    return getPhoneModelDetails(selectedBrand, productForm.name);
  }, [selectedBrand, productForm.name]);

  // Available RAM options for the currently selected phone model
  const availableRamOptions = React.useMemo(() => {
    if (currentModelDetails?.ramOptions && currentModelDetails.ramOptions.length > 0) {
      return currentModelDetails.ramOptions;
    }
    return ["4GB", "6GB", "8GB", "12GB", "16GB"];
  }, [currentModelDetails]);

  // Auto Generate Summary Button Handler
  const handleAutoGenerateSummary = () => {
    const summary = generateSelectedOnlyDescription(productForm);
    setProductForm(prev => ({
      ...prev,
      description: summary
    }));
  };

  // Select Storage Option (Admin selects single storage or updates selection)
  const handleSelectStorage = (storageVal: string) => {
    setProductForm(prev => {
      const updatedForm = { ...prev, storageOptions: [storageVal] };
      return {
        ...updatedForm,
        description: generateSelectedOnlyDescription(updatedForm)
      };
    });
  };

  // Select RAM Option
  const handleSelectRam = (ramVal: string) => {
    setProductForm(prev => {
      const newRam = prev.specs?.ram === ramVal ? "" : ramVal;
      const updatedForm: Partial<Product> = {
        ...prev,
        specs: {
          ...(prev.specs || {}),
          screen: prev.specs?.screen || "",
          camera: prev.specs?.camera || "",
          chipset: prev.specs?.chipset || "",
          batterySize: prev.specs?.batterySize || "",
          os: prev.specs?.os || "",
          warranty: prev.specs?.warranty || "",
          simType: prev.specs?.simType || "",
          ram: newRam
        }
      };
      return {
        ...updatedForm,
        description: generateSelectedOnlyDescription(updatedForm)
      };
    });
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

  const isAppleDevice =
    selectedBrand.toLowerCase() === "apple" ||
    (productForm.brand || "").toLowerCase() === "apple" ||
    (productForm.name || "").toLowerCase().includes("iphone") ||
    (productForm.name || "").toLowerCase().includes("ipad");

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
              <h4 className="text-sm font-bold text-white">Select Brand, Series & Phone Model</h4>
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
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBrandChange(b.name)}
                className={`relative p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${
                  isSelected
                    ? "bg-[#00B14F]/15 border-[#00B14F] ring-2 ring-[#00B14F]/40 shadow-lg shadow-[#00B14F]/10 scale-[1.02]"
                    : "bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-850"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/60 p-1.5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  ) : b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  ) : (
                    <Smartphone className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="text-center">
                  <span className={`text-xs font-bold block ${isSelected ? "text-[#00B14F]" : "text-gray-200"}`}>
                    {b.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {b.modelCount !== undefined ? `${b.modelCount} models` : "Brand"}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00B14F] text-black flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SERIES SELECTOR (PROMINENT TABS WHEN BRAND HAS SERIES) */}
        {availableSeries.length > 0 && (
          <div className="pt-2 pb-1 border-t border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00B14F]" />
                <span>{selectedBrand} Series Filter</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {selectedSeries === "All Series" ? "Showing all series" : `Filtered to ${selectedSeries}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSeriesChange("All Series")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  selectedSeries === "All Series"
                    ? "bg-[#00B14F] text-black border-[#00B14F] shadow-sm font-black"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                <span>All Series</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedSeries === "All Series" ? "bg-black/20 text-black" : "bg-gray-800 text-gray-400"}`}>
                  {getModelsForBrand(selectedBrand).length}
                </span>
              </button>
              {availableSeries.map((series) => {
                const isSelected = selectedSeries.toLowerCase() === series.toLowerCase();
                const seriesCount = getModelsForBrand(selectedBrand).filter(m => m.series && m.series.toLowerCase() === series.toLowerCase()).length;
                return (
                  <button
                    key={series}
                    type="button"
                    onClick={() => handleSeriesChange(series)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#00B14F] text-black border-[#00B14F] shadow-sm font-black"
                        : "bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    <span>{series}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-black/20 text-black" : "bg-gray-800 text-gray-400"}`}>
                      {seriesCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Model Selection Dropdown and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Select {selectedBrand} Model {selectedSeries !== "All Series" && `(${selectedSeries})`}
            </label>
            <select
              value={productForm.name || ""}
              onChange={(e) => handleSelectModelByName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-semibold"
            >
              <option value="">-- Choose {selectedBrand} Model --</option>
              {availableModels.map((m) => (
                <option key={m.id} value={m.model}>
                  {m.model} {m.series ? `(${m.series})` : ""}
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
              {selectedBrand} {selectedSeries !== "All Series" ? selectedSeries : ""} Models (Click to Select)
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
            placeholder="e.g. TECNO SPARK 40 Pro"
            value={productForm.name || ""}
            onChange={(e) => {
              const updated = { ...productForm, name: e.target.value };
              setProductForm({
                ...updated,
                description: generateSelectedOnlyDescription(updated)
              });
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* STEP 2: CONDITION, STORAGE, RAM & HARDWARE SPECIFICATIONS */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Condition, Storage, RAM & Specifications</h4>
              <p className="text-xs text-gray-400">Select only the exact specs that apply to this device.</p>
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
                  onClick={() => {
                    const updated: Partial<Product> = {
                      ...productForm,
                      condition: cond,
                      batteryHealth: cond === "Brand New" && isAppleDevice ? "100%" : (productForm.batteryHealth || "")
                    };
                    setProductForm({
                      ...updated,
                      description: generateSelectedOnlyDescription(updated)
                    });
                  }}
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

        {/* STORAGE SELECTION CHIPS - SINGLE VALUE SELECTION */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Selected Storage (Click to Choose)
          </label>
          <div className="flex flex-wrap gap-2">
            {["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"].map((stg) => {
              const isSelected = (productForm.storageOptions || []).includes(stg);
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => handleSelectStorage(stg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#00B14F] text-black border-[#00B14F] shadow-md shadow-[#00B14F]/20"
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

        {/* RAM SELECTION CHIPS (FOR TECNO & ANDROID DEVICES) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Selected RAM Configuration (Optional)
            </label>
            {productForm.specs?.ram && (
              <span className="text-[11px] font-bold text-[#00B14F] bg-[#00B14F]/10 border border-[#00B14F]/30 px-2 py-0.5 rounded-full">
                {productForm.specs.ram} Selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableRamOptions.map((ram) => {
              const isSelected = productForm.specs?.ram === ram;
              return (
                <button
                  key={ram}
                  type="button"
                  onClick={() => handleSelectRam(ram)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#00B14F] text-black border-[#00B14F] shadow-md shadow-[#00B14F]/20"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{ram}</span>
                </button>
              );
            })}
            {productForm.specs?.ram && (
              <button
                type="button"
                onClick={() => handleSelectRam(productForm.specs?.ram || "")}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/50 bg-gray-900 transition-colors"
              >
                Clear RAM
              </button>
            )}
          </div>
        </div>

        {/* BATTERY INFORMATION, NETWORK STATUS, DEVICE LOCK STATUS & BIOMETRICS */}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...productForm, batteryHealth: val, batteryHealthValue: val };
                    setProductForm({
                      ...updated,
                      description: generateSelectedOnlyDescription(updated)
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="">-- None / Leave Blank --</option>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    Battery Condition
                  </label>
                  {productForm.specs?.batterySize && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {productForm.specs.batterySize}
                    </span>
                  )}
                </div>
                <select
                  value={productForm.batteryCondition || productForm.batteryHealth || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...productForm, batteryCondition: val, batteryHealth: val };
                    setProductForm({
                      ...updated,
                      description: generateSelectedOnlyDescription(updated)
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="">-- None / Leave Blank --</option>
                  <option value="Excellent">Excellent (Guaranteed Battery)</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Normal">Normal</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>
            )}

            {/* 2. NETWORK CAPABILITY (4G / 5G) */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                Network Capability
              </label>
              <select
                value={productForm.networkCapability || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = { ...productForm, networkCapability: val };
                  setProductForm({
                    ...updated,
                    description: generateSelectedOnlyDescription(updated)
                  });
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              >
                <option value="">-- None / Leave Blank --</option>
                <option value="5G">5G Ultra-Fast</option>
                <option value="4G">4G LTE</option>
                <option value="4G / 5G">4G / 5G Dual Network</option>
              </select>
            </div>

            {/* 3. NETWORK / SIM STATUS */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Network / SIM Status</label>
              <select
                value={productForm.network || ""}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const updated = { ...productForm, network: val };
                  setProductForm({
                    ...updated,
                    description: generateSelectedOnlyDescription(updated)
                  });
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              >
                <option value="">-- None / Leave Blank --</option>
                <option value="Factory Unlocked">Factory Unlocked</option>
                <option value="Network Unlocked">Network Unlocked</option>
                <option value="SIM Unlocked">SIM Unlocked</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            {/* 4. DEVICE LOCK STATUS */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Device Lock Status</label>
              <select
                value={productForm.deviceLockStatus || ""}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const updated = { ...productForm, deviceLockStatus: val };
                  setProductForm({
                    ...updated,
                    description: generateSelectedOnlyDescription(updated)
                  });
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              >
                <option value="">-- None / Leave Blank --</option>
                <option value="Unlocked">Unlocked (All Carriers)</option>
                <option value="Carrier Locked">Carrier Locked</option>
                <option value="SIM Locked">SIM Locked</option>
                <option value="Account Locked">Account Locked</option>
              </select>
            </div>

            {/* 5. BIOMETRICS: FINGERPRINT SENSOR */}
            {!isAppleDevice && (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  Fingerprint Sensor
                </label>
                <select
                  value={productForm.fingerprint || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...productForm, fingerprint: val };
                    setProductForm({
                      ...updated,
                      description: generateSelectedOnlyDescription(updated)
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="">-- None / Leave Blank --</option>
                  <option value="Working">Working (Tested & Verified)</option>
                  <option value="Not Working">Not Working</option>
                  <option value="Not Available">Not Available on this Model</option>
                </select>
              </div>
            )}

            {/* 6. BIOMETRICS: FACE UNLOCK / FACE ID */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {isAppleDevice ? "Face ID Status" : "Face Unlock Status"}
              </label>
              <select
                value={productForm.faceId || ""}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const updated = { ...productForm, faceId: val };
                  setProductForm({
                    ...updated,
                    description: generateSelectedOnlyDescription(updated)
                  });
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              >
                <option value="">-- None / Leave Blank --</option>
                <option value="Working">Working (Tested & Verified)</option>
                <option value="Not Working">Not Working</option>
                {!isAppleDevice && <option value="Not Available">Not Available</option>}
              </select>
            </div>

            {/* 7. APPLE SPECIFIC: ICLOUD LOCK STATUS */}
            {isAppleDevice && (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">iCloud Lock Status</label>
                <select
                  value={productForm.specs?.icloudStatus || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = {
                      ...productForm,
                      specs: { ...(productForm.specs || {}), icloudStatus: val } as any
                    };
                    setProductForm({
                      ...updated,
                      description: generateSelectedOnlyDescription(updated)
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="">-- None / Leave Blank --</option>
                  <option value="Clean / Unlocked">Clean / Unlocked</option>
                  <option value="iCloud Locked">iCloud Locked</option>
                </select>
              </div>
            )}
          </div>
        </div>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-300">Stock Quantity</label>
              {(() => {
                const currentQty = getProductStockQuantity(productForm);
                const status = getStockStatus(currentQty);
                return (
                  <span className={`text-[10px] font-extrabold flex items-center gap-1 ${status.colorClass}`}>
                    <span>{status.label} ({currentQty})</span>
                  </span>
                );
              })()}
            </div>
            <input
              type="number"
              min="0"
              placeholder="1"
              value={productForm.stockQuantity !== undefined ? productForm.stockQuantity : (productForm.quantity !== undefined ? productForm.quantity : 1)}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                setProductForm({
                  ...productForm,
                  stockQuantity: val,
                  quantity: val,
                  availability: val <= 0 ? "Sold Out" : "In Stock"
                });
              }}
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
            <div>
              <h4 className="text-sm font-bold text-white">Product Description Summary</h4>
              <p className="text-xs text-gray-400">Uses only the exact details you selected above.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerateSummary}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
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
              {productForm.storageOptions && productForm.storageOptions.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                  💾 {productForm.storageOptions.join(" / ")}
                </span>
              )}
              {productForm.specs?.ram && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🧠 {productForm.specs.ram} RAM
                </span>
              )}
              {productForm.networkCapability && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  📶 {productForm.networkCapability}
                </span>
              )}
              {productForm.batteryHealth && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚡ {productForm.batteryHealth}
                </span>
              )}
              {!productForm.batteryHealth && productForm.batteryCondition && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚡ {productForm.batteryCondition}
                </span>
              )}
              {productForm.network && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  📡 {productForm.network}
                </span>
              )}
              {productForm.fingerprint === "Working" && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  🔒 Fingerprint OK
                </span>
              )}
            </div>

            <h5 className="text-sm font-extrabold text-white">
              {productForm.name || "Product Model Name"}
            </h5>

            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {productForm.description || "Description preview..."}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <span className="text-base font-extrabold text-[#00B14F]">
                {Number(productForm.price) > 0 ? formatNaira(Number(productForm.price)) : "₦0"}
              </span>
              {Number(productForm.originalPrice) > Number(productForm.price) && (
                <span className="text-xs text-gray-500 line-through">
                  {formatNaira(Number(productForm.originalPrice))}
                </span>
              )}
              {(() => {
                const currentQty = getProductStockQuantity(productForm);
                const status = getStockStatus(currentQty);
                return (
                  <span className={`text-[10px] font-extrabold ${status.colorClass}`}>
                    <span>{status.label}</span>
                  </span>
                );
              })()}
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
            className="text-red-400 hover:text-white p-1 cursor-pointer"
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
          className="w-full xs:w-auto px-6 py-3.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all text-center touch-manipulation disabled:opacity-50 cursor-pointer"
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

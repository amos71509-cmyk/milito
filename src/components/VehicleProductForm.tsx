import React, { useState, useEffect, useMemo } from "react";
import {
  Car,
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Eye,
  CheckCircle2,
  Cpu,
  MapPin,
  FileCheck,
  Palette,
  Gauge,
  Calendar,
  Layers,
  Fuel,
  Settings2
} from "lucide-react";
import { Product, CloudinaryImageMeta } from "../types";
import { MediaUploader } from "./MediaUploader";
import { getStockStatus, getProductStockQuantity } from "../utils/stockUtils";
import {
  VEHICLE_BRANDS,
  VEHICLE_CONDITIONS,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_DRIVE_TYPES,
  VEHICLE_BODY_TYPES,
  VEHICLE_EXTERIOR_COLORS,
  VEHICLE_INTERIOR_COLORS,
  VEHICLE_STATUSES,
  VEHICLE_DOCUMENTATION_STATUSES,
  VEHICLE_LOCATIONS,
  VEHICLE_YEARS,
  getModelsForVehicleBrand,
  getSeriesForVehicleBrand,
  getModelsForVehicleBrandAndSeries,
  getVehicleModelDetails
} from "../data/vehicleModels";

interface VehicleProductFormProps {
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

export const generateVehicleDescription = (form: Partial<Product>): string => {
  const brand = (form.brand || "").trim();
  const model = (form.name || "").trim();
  const year = form.year ? String(form.year).trim() : "";
  const condition = form.condition ? String(form.condition).trim() : "";
  const mileage = form.mileage ? String(form.mileage).trim() : "";
  const transmission = form.transmission ? String(form.transmission).trim() : "";
  const fuelType = form.fuelType ? String(form.fuelType).trim() : "";
  const engine = form.engine ? String(form.engine).trim() : "";
  const driveType = form.driveType ? String(form.driveType).trim() : "";
  const bodyType = form.bodyType ? String(form.bodyType).trim() : "";
  const exteriorColor = form.exteriorColor ? String(form.exteriorColor).trim() : "";
  const interiorColor = form.interiorColor ? String(form.interiorColor).trim() : "";
  const documentation = form.documentation ? String(form.documentation).trim() : "";
  const location = form.location ? String(form.location).trim() : "";
  const price = form.price ? formatNaira(Number(form.price)) : "";

  // Title: e.g. "2020 Toyota Camry"
  const titleParts = [year, brand !== "Other" ? brand : "", model].filter(Boolean);
  const title = titleParts.join(" ").trim();

  const sentences: string[] = [];

  // 1. Opening sentence
  if (title) {
    if (condition && mileage) {
      sentences.push(`${title}, ${condition}, with ${mileage.toLowerCase().includes("km") || mileage.toLowerCase().includes("mi") ? mileage : `${mileage} km`} mileage.`);
    } else if (condition) {
      sentences.push(`${title}, in clean ${condition} condition.`);
    } else if (mileage) {
      sentences.push(`${title} with ${mileage.toLowerCase().includes("km") || mileage.toLowerCase().includes("mi") ? mileage : `${mileage} km`} mileage.`);
    } else {
      sentences.push(`${title} available for sale.`);
    }
  }

  // 2. Performance and specs
  const perfParts: string[] = [];
  if (transmission) perfParts.push(`${transmission.toLowerCase()} transmission`);
  if (engine) perfParts.push(`${engine} engine`);
  if (fuelType && fuelType !== "Other") perfParts.push(`${fuelType.toLowerCase()} fuel system`);
  if (driveType) perfParts.push(`${driveType} drivetrain`);
  if (bodyType && bodyType !== "Other") perfParts.push(`${bodyType.toLowerCase()} styling`);

  if (perfParts.length > 0) {
    const joinedPerf =
      perfParts.length === 1
        ? `Equipped with ${perfParts[0]}.`
        : `Equipped with ${perfParts.slice(0, -1).join(", ")} and ${perfParts[perfParts.length - 1]}.`;
    sentences.push(joinedPerf);
  }

  // 3. Aesthetics
  const colorParts: string[] = [];
  if (exteriorColor && exteriorColor !== "Other") colorParts.push(`clean ${exteriorColor.toLowerCase()} exterior`);
  if (interiorColor && interiorColor !== "Other") colorParts.push(`well-kept ${interiorColor.toLowerCase()} interior`);

  if (colorParts.length > 0) {
    sentences.push(`Features a ${colorParts.join(" and ")}.`);
  }

  // 4. Documentation & Location
  const closingParts: string[] = [];
  if (documentation && documentation !== "Other") {
    closingParts.push(`${documentation.toLowerCase()} documentation`);
  }
  if (location && location !== "Other") {
    closingParts.push(`available for physical inspection in ${location}`);
  }

  if (closingParts.length > 0) {
    sentences.push(`Comes with ${closingParts.join(", ")}.`);
  }

  if (price) {
    sentences.push(`Offered at ${price}.`);
  }

  return sentences.join(" ");
};

export default function VehicleProductForm({
  productForm,
  setProductForm,
  editingProduct,
  onSave,
  onCancel,
  isSaving = false,
  uploadQueue = [],
  isUploadingImage = false,
  uploadProgress = 0,
  uploadError = null,
  uploadStatus,
  fileInputRef,
  handleFileSelect,
  onImageUploadSuccess
}: VehicleProductFormProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>(productForm.brand || "");
  const [selectedSeries, setSelectedSeries] = useState<string>(productForm.series || "All");
  const [customBrandInput, setCustomBrandInput] = useState<string>(productForm.customBrand || "");
  const [selectedModel, setSelectedModel] = useState<string>(productForm.name || "");
  const [customModelInput, setCustomModelInput] = useState<string>(productForm.customModel || "");
  const [isOtherModel, setIsOtherModel] = useState<boolean>(false);
  const [isOtherBrand, setIsOtherBrand] = useState<boolean>(false);
  const [customLocationInput, setCustomLocationInput] = useState<string>("");

  // Sync internal state with productForm
  useEffect(() => {
    if (productForm.brand) {
      setSelectedBrand(productForm.brand);
      const isCustom = !VEHICLE_BRANDS.some(
        b => b.name.toLowerCase() === productForm.brand?.toLowerCase()
      );
      setIsOtherBrand(isCustom || productForm.brand === "Other");
      if (isCustom) setCustomBrandInput(productForm.brand);
    }
    if (productForm.name) {
      setSelectedModel(productForm.name);
    }
  }, [productForm.brand, productForm.name]);

  // Available series for brand
  const seriesList = useMemo(() => {
    if (!selectedBrand || isOtherBrand) return [];
    return getSeriesForVehicleBrand(selectedBrand);
  }, [selectedBrand, isOtherBrand]);

  // Available models for brand & series
  const availableModels = useMemo(() => {
    if (!selectedBrand || isOtherBrand) return [];
    return getModelsForVehicleBrandAndSeries(selectedBrand, selectedSeries);
  }, [selectedBrand, selectedSeries, isOtherBrand]);

  // Stock Urgency Indicator info
  const stockInfo = useMemo(() => {
    const qty = productForm.quantity !== undefined ? Number(productForm.quantity) : 1;
    return getStockStatus({
      ...productForm,
      quantity: qty,
      availability: productForm.availability
    } as Product);
  }, [productForm.quantity, productForm.availability]);

  // Handle Brand Selection
  const handleBrandChange = (brandName: string) => {
    setSelectedBrand(brandName);
    setSelectedSeries("All");
    setSelectedModel("");
    setIsOtherModel(false);

    if (brandName === "Other") {
      setIsOtherBrand(true);
      setProductForm(prev => ({
        ...prev,
        brand: customBrandInput.trim() || "Other",
        name: "",
        series: ""
      }));
    } else {
      setIsOtherBrand(false);
      setProductForm(prev => ({
        ...prev,
        brand: brandName,
        name: "",
        series: ""
      }));
    }
  };

  // Handle Custom Brand Text Change
  const handleCustomBrandText = (text: string) => {
    setCustomBrandInput(text);
    setProductForm(prev => ({
      ...prev,
      brand: text.trim() || "Other",
      customBrand: text
    }));
  };

  // Handle Series Selection
  const handleSeriesChange = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setSelectedModel("");
    setIsOtherModel(false);
    setProductForm(prev => ({
      ...prev,
      series: seriesName === "All" ? "" : seriesName
    }));
  };

  // Handle Model Selection
  const handleModelChange = (modelName: string) => {
    if (modelName === "Other") {
      setIsOtherModel(true);
      setSelectedModel("Other");
      setProductForm(prev => ({
        ...prev,
        name: customModelInput.trim() || "",
        customModel: customModelInput
      }));
    } else {
      setIsOtherModel(false);
      setSelectedModel(modelName);
      
      // Look up default spec presets without overwriting admin's explicit inputs
      const specDetails = getVehicleModelDetails(selectedBrand, modelName);

      setProductForm(prev => {
        const next = {
          ...prev,
          name: modelName,
          customModel: undefined
        };

        if (specDetails) {
          if (!next.bodyType && specDetails.defaultBodyType) next.bodyType = specDetails.defaultBodyType;
          if (!next.engine && specDetails.defaultEngine) next.engine = specDetails.defaultEngine;
          if (!next.transmission && specDetails.defaultTransmission) next.transmission = specDetails.defaultTransmission;
          if (!next.fuelType && specDetails.defaultFuelType) next.fuelType = specDetails.defaultFuelType;
          if (!next.driveType && specDetails.defaultDriveType) next.driveType = specDetails.defaultDriveType;
        }

        return next;
      });
    }
  };

  // Handle Custom Model Text Change
  const handleCustomModelText = (text: string) => {
    setCustomModelInput(text);
    setProductForm(prev => ({
      ...prev,
      name: text,
      customModel: text
    }));
  };

  // Handle Quantity Change and sync availability
  const handleQuantityChange = (qty: number) => {
    const validQty = Math.max(0, Math.floor(qty));
    setProductForm(prev => ({
      ...prev,
      quantity: validQty,
      stockQuantity: validQty,
      availability: validQty === 0 ? "Sold Out" : "In Stock"
    }));
  };

  // Auto Generate Description
  const handleGenerateDescription = () => {
    const desc = generateVehicleDescription(productForm);
    setProductForm(prev => ({
      ...prev,
      description: desc
    }));
  };

  return (
    <form onSubmit={onSave} className="space-y-6 animate-fadeIn text-white">
      {/* SECTION 1: VEHICLE BRAND SELECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#00B14F]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              1. Select Vehicle Make / Brand
            </h4>
          </div>
          <span className="text-[11px] font-bold text-gray-400">Step 1 of 6</span>
        </div>

        {/* Brand Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {VEHICLE_BRANDS.map(brand => {
            const isSelected = selectedBrand.toLowerCase() === brand.name.toLowerCase() && !isOtherBrand;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleBrandChange(brand.name)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#00B14F]/15 border-[#00B14F] text-[#00B14F] shadow-md shadow-[#00B14F]/10 scale-[1.02]"
                    : "bg-gray-900/80 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
                }`}
              >
                <span className="text-base">{brand.logo}</span>
                <span className="truncate w-full text-center">{brand.name}</span>
              </button>
            );
          })}

          {/* Other Brand Option */}
          <button
            type="button"
            onClick={() => handleBrandChange("Other")}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              isOtherBrand
                ? "bg-[#00B14F]/15 border-[#00B14F] text-[#00B14F] shadow-md shadow-[#00B14F]/10 scale-[1.02]"
                : "bg-gray-900/80 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <span className="text-base">✨</span>
            <span className="truncate w-full text-center">Other Brand</span>
          </button>
        </div>

        {/* Custom Brand Text Input */}
        {isOtherBrand && (
          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-700 animate-fadeIn space-y-2">
            <label className="block text-xs font-bold text-gray-300">
              Enter Custom Vehicle Brand / Make:
            </label>
            <input
              type="text"
              placeholder="e.g., Genesis, Rolls-Royce, Bentley, Tesla..."
              value={customBrandInput}
              onChange={e => handleCustomBrandText(e.target.value)}
              className="w-full bg-[#111827] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00B14F] focus:outline-none"
              required={isOtherBrand}
            />
          </div>
        )}
      </div>

      {/* SECTION 2: VEHICLE MODEL & SERIES */}
      {selectedBrand && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#00B14F]" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                2. Vehicle Series & Model
              </h4>
            </div>
            <span className="text-[11px] font-bold text-gray-400">Step 2 of 6</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Series / Family Filter */}
            {seriesList.length > 0 && !isOtherBrand && (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Series / Model Family (Optional Filter):
                </label>
                <select
                  value={selectedSeries}
                  onChange={e => handleSeriesChange(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="All">All Series ({selectedBrand})</option>
                  {seriesList.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Model Selector */}
            <div className={seriesList.length > 0 && !isOtherBrand ? "" : "md:col-span-2"}>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Vehicle Model: <span className="text-red-400">*</span>
              </label>

              {!isOtherBrand && availableModels.length > 0 ? (
                <select
                  value={isOtherModel ? "Other" : selectedModel}
                  onChange={e => handleModelChange(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-medium"
                >
                  <option value="">-- Select {selectedBrand} Model --</option>
                  {availableModels.map(m => (
                    <option key={m.id} value={m.model}>
                      {m.model} {m.series ? `(${m.series})` : ""}
                    </option>
                  ))}
                  <option value="Other">-- Other Model (Enter Name) --</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Camry, C300, Defender 110, RX 350..."
                  value={productForm.name || ""}
                  onChange={e =>
                    setProductForm(prev => ({
                      ...prev,
                      name: e.target.value,
                      customModel: e.target.value
                    }))
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00B14F] focus:outline-none"
                  required
                />
              )}
            </div>
          </div>

          {/* Custom Model Input if 'Other Model' selected */}
          {isOtherModel && (
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-700 animate-fadeIn space-y-2">
              <label className="block text-xs font-bold text-gray-300">
                Enter Custom Model Name for {selectedBrand}:
              </label>
              <input
                type="text"
                placeholder="e.g., Land Cruiser 300 ZX, Mercedes AMG GT 63..."
                value={customModelInput}
                onChange={e => handleCustomModelText(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00B14F] focus:outline-none"
                required
              />
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: SPECIFICATIONS & VEHICLE DETAILS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#00B14F]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              3. Specifications & Condition
            </h4>
          </div>
          <span className="text-[11px] font-bold text-gray-400">Step 3 of 6</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Year */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00B14F]" />
              Year of Manufacture
            </label>
            <select
              value={String(productForm.year || "2022")}
              onChange={e => setProductForm(prev => ({ ...prev, year: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_YEARS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Condition: <span className="text-red-400">*</span>
            </label>
            <select
              value={productForm.condition || "Foreign Used"}
              onChange={e => setProductForm(prev => ({ ...prev, condition: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none font-semibold text-emerald-400"
            >
              {VEHICLE_CONDITIONS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#00B14F]" />
              Mileage (e.g. 85,000 km)
            </label>
            <input
              type="text"
              placeholder="e.g. 45,000 km or 60000"
              value={productForm.mileage || ""}
              onChange={e => setProductForm(prev => ({ ...prev, mileage: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5 text-[#00B14F]" />
              Transmission
            </label>
            <select
              value={productForm.transmission || "Automatic"}
              onChange={e => setProductForm(prev => ({ ...prev, transmission: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_TRANSMISSIONS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-[#00B14F]" />
              Fuel Type
            </label>
            <select
              value={productForm.fuelType || "Petrol"}
              onChange={e => setProductForm(prev => ({ ...prev, fuelType: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_FUEL_TYPES.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Capacity */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#00B14F]" />
              Engine (e.g. 2.0L Turbo, 3.5L V6)
            </label>
            <input
              type="text"
              placeholder="e.g. 2.5L 4-Cylinder, 3.5L V6"
              value={productForm.engine || ""}
              onChange={e => setProductForm(prev => ({ ...prev, engine: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            />
          </div>

          {/* Drive Type */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Drive Type (Drivetrain)
            </label>
            <select
              value={productForm.driveType || "AWD"}
              onChange={e => setProductForm(prev => ({ ...prev, driveType: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_DRIVE_TYPES.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Body Type
            </label>
            <select
              value={productForm.bodyType || "SUV"}
              onChange={e => setProductForm(prev => ({ ...prev, bodyType: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_BODY_TYPES.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Exterior Color */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#00B14F]" />
              Exterior Colour
            </label>
            <select
              value={productForm.exteriorColor || "Black"}
              onChange={e => setProductForm(prev => ({ ...prev, exteriorColor: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_EXTERIOR_COLORS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Interior Color */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Interior Colour (Optional)
            </label>
            <select
              value={productForm.interiorColor || "Black"}
              onChange={e => setProductForm(prev => ({ ...prev, interiorColor: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_INTERIOR_COLORS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Documentation */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-[#00B14F]" />
              Documentation
            </label>
            <select
              value={productForm.documentation || "Complete"}
              onChange={e => setProductForm(prev => ({ ...prev, documentation: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_DOCUMENTATION_STATUSES.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00B14F]" />
              Vehicle Location
            </label>
            <select
              value={productForm.location || "Lagos"}
              onChange={e => {
                const val = e.target.value;
                if (val === "Other") {
                  setProductForm(prev => ({ ...prev, location: customLocationInput || "Other" }));
                } else {
                  setProductForm(prev => ({ ...prev, location: val }));
                }
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none"
            >
              {VEHICLE_LOCATIONS.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: PRICING & LIVE STOCK INVENTORY */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00B14F]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              4. Pricing & Inventory Management
            </h4>
          </div>
          <span className="text-[11px] font-bold text-gray-400">Step 4 of 6</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selling Price */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Selling Price (₦): <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="25000000"
                value={productForm.price !== undefined ? productForm.price : ""}
                onChange={e =>
                  setProductForm(prev => ({
                    ...prev,
                    price: Number(e.target.value) || 0
                  }))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#00B14F] focus:outline-none"
                required
              />
            </div>
            {productForm.price ? (
              <span className="text-[11px] font-mono text-[#00B14F] mt-1 block">
                {formatNaira(Number(productForm.price))}
              </span>
            ) : null}
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Original / Slash Price (₦) (Optional):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="28000000"
                value={productForm.originalPrice !== undefined ? productForm.originalPrice : ""}
                onChange={e =>
                  setProductForm(prev => ({
                    ...prev,
                    originalPrice: Number(e.target.value) || 0
                  }))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono focus:border-[#00B14F] focus:outline-none"
              />
            </div>
          </div>

          {/* Quantity & Stock Urgency Indicator */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Available Units (Quantity):
            </label>
            <input
              type="number"
              min="0"
              value={productForm.quantity !== undefined ? productForm.quantity : 1}
              onChange={e => handleQuantityChange(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:border-[#00B14F] focus:outline-none"
            />
            {/* Live Indicator Preview */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${stockInfo.bgClass}`}
              >
                <span>{stockInfo.badgeEmoji}</span>
                <span>{stockInfo.label}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                (Storefront badge preview)
              </span>
            </div>
          </div>
        </div>

        {/* Featured on Homepage Toggle */}
        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00B14F]" />
              <span>Feature on Homepage Automotive Portal</span>
            </label>
            <p className="text-[11px] text-gray-400">
              Display this vehicle in the 3–4 featured discovery slots on the MILITO homepage.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!productForm.featured}
              onChange={(e) => setProductForm((prev) => ({ ...prev, featured: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B14F]"></div>
          </label>
        </div>
      </div>

      {/* SECTION 5: VEHICLE IMAGES & GALLERY */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#00B14F]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              5. Vehicle Photos & Gallery
            </h4>
          </div>
          <span className="text-[11px] font-bold text-gray-400">Step 5 of 6</span>
        </div>

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

      {/* SECTION 6: DESCRIPTION GENERATOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00B14F]" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              6. Vehicle Description
            </h4>
          </div>
          <button
            type="button"
            onClick={handleGenerateDescription}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/40 hover:bg-[#00B14F] hover:text-black font-bold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Generate Description
          </button>
        </div>

        <textarea
          rows={4}
          placeholder="Detailed vehicle description and inspection notes..."
          value={productForm.description || ""}
          onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:border-[#00B14F] focus:outline-none leading-relaxed"
        />
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-3 z-20 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving || isUploadingImage}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#00B14F] hover:bg-[#009241] text-black font-black text-xs shadow-lg shadow-[#00B14F]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Publishing Vehicle...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingProduct ? "Save & Update Vehicle" : "Publish Vehicle to Storefront"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

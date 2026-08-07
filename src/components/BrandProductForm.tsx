import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  Trash2,
  X,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Smartphone,
  ShieldCheck,
  Check,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import { Product, resolveImageUrl, CloudinaryImageMeta } from "../types";

interface BrandProductFormProps {
  productForm: Partial<Product>;
  setProductForm: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  editingProduct: Product | null;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  uploadQueue: any[];
  isUploadingImage: boolean;
  uploadProgress: number;
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUploadSuccess?: (
    uploadedFile: CloudinaryImageMeta,
    newGalleryImages: CloudinaryImageMeta[],
    newThumbnail: { secure_url: string; public_id: string }
  ) => Promise<void> | void;
}

const BRANDS = [
  { id: "Apple", name: "Apple (iPhone)", logo: "🍎", tag: "BH% & Face ID", bg: "from-gray-900 to-black" },
  { id: "Samsung", name: "Samsung Galaxy", logo: "🌌", tag: "Knox & S-Pen", bg: "from-blue-900/80 to-slate-900" },
  { id: "Google Pixel", name: "Google Pixel", logo: "🔴", tag: "Tensor AI & Titan M2", bg: "from-red-900/60 to-slate-900" },
  { id: "Xiaomi", name: "Xiaomi / Redmi / POCO", logo: "🧡", tag: "HyperCharge & HyperOS", bg: "from-orange-900/60 to-slate-900" },
  { id: "Tecno / Infinix", name: "Tecno & Infinix", logo: "⚡", tag: "Extended RAM & HiOS/XOS", bg: "from-emerald-900/60 to-slate-900" },
  { id: "Other", name: "Other Smartphone", logo: "📱", tag: "Standard Android", bg: "from-purple-900/60 to-slate-900" }
];

const APPLE_MODELS = [
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini",
  "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 11 Pro Max",
  "iPhone 11", "iPhone XR", "iPhone XS Max", "iPhone SE (2022)"
];

const SAMSUNG_MODELS = [
  "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24",
  "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy Z Fold 5",
  "Galaxy S23 Ultra", "Galaxy S23 FE", "Galaxy S23+", "Galaxy S23",
  "Galaxy S22 Ultra", "Galaxy A55 5G", "Galaxy A35 5G", "Galaxy Note 20 Ultra"
];

const PIXEL_MODELS = [
  "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9",
  "Pixel 8 Pro", "Pixel 8", "Pixel 8a",
  "Pixel 7 Pro", "Pixel 7a", "Pixel 7",
  "Pixel 6 Pro", "Pixel 6a", "Pixel 6"
];

const XIAOMI_MODELS = [
  "Xiaomi 14 Ultra", "Xiaomi 14", "Xiaomi 13T Pro",
  "Redmi Note 13 Pro+ 5G", "Redmi Note 13 Pro", "Redmi Note 13",
  "POCO X6 Pro 5G", "POCO F6 Pro", "POCO M6 Pro", "Redmi 13C"
];

const TRANSSION_MODELS = [
  "Infinix Note 40 Pro+ 5G", "Infinix Note 40 Pro", "Infinix GT 20 Pro",
  "Infinix Zero 30 5G", "Infinix Hot 40 Pro", "Infinix Smart 8",
  "Tecno Camon 30 Premier 5G", "Tecno Camon 30 Pro", "Tecno Phantom V Fold",
  "Tecno Spark 20 Pro+", "Tecno Pova 6 Pro 5G"
];

const APPLE_COLORS = [
  { name: "Titanium Natural", hex: "#8F8B82" },
  { name: "Space Black", hex: "#1C1C1E" },
  { name: "Deep Purple", hex: "#483D8B" },
  { name: "Blue Titanium", hex: "#2C3E50" },
  { name: "Starlight", hex: "#F5F5F0" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Midnight", hex: "#191970" }
];

const SAMSUNG_COLORS = [
  { name: "Titanium Gray", hex: "#6B7280" },
  { name: "Phantom Black", hex: "#18181B" },
  { name: "Cream", hex: "#FEF3C7" },
  { name: "Violet", hex: "#A855F7" },
  { name: "Awesome Navy", hex: "#1E3A8A" }
];

const PIXEL_COLORS = [
  { name: "Obsidian", hex: "#18181B" },
  { name: "Porcelain", hex: "#F4F4F5" },
  { name: "Bay Blue", hex: "#3B82F6" },
  { name: "Hazel", hex: "#71717A" },
  { name: "Rose", hex: "#FB7185" }
];

const ACCESSORY_OPTIONS = [
  "Original Box",
  "Fast Charging Cable",
  "20W Power Adapter",
  "45W Fast Charger",
  "Silicon Case",
  "Screen Guard",
  "Type-C Cable",
  "SIM Ejector Pin"
];

export default function BrandProductForm({
  productForm,
  setProductForm,
  editingProduct,
  onSave,
  onCancel,
  isSaving,
  uploadQueue,
  isUploadingImage,
  uploadProgress,
  uploadError,
  fileInputRef,
  handleFileSelect,
  onImageUploadSuccess
}: BrandProductFormProps) {
  const brand = productForm.brand || "";

  // Helper for specs update
  const updateSpec = (key: string, value: any) => {
    setProductForm(prev => ({
      ...prev,
      specs: {
        ...(prev.specs || {
          screen: "6.7-inch Display",
          camera: "Pro Camera",
          chipset: "High Performance CPU",
          batterySize: "4000 mAh",
          os: "Latest OS",
          warranty: "1-Year Warranty",
          simType: "Unlocked SIM"
        }),
        [key]: value
      }
    }));
  };

  // Helper for Auto-Generating Product Summary Description
  const handleAutoGenerateSummary = () => {
    const selectedBrand = productForm.brand || "Smartphone";
    const model = productForm.name || "Device";
    const condition = productForm.condition || "Premium UK Used";
    const storageStr = (productForm.storageOptions || []).join("/");
    const priceStr = productForm.price ? `₦${Number(productForm.price).toLocaleString()}` : "";
    const specs = (productForm.specs as any) || {};

    let text = `Official ${selectedBrand} ${model} (${condition}${storageStr ? `, ${storageStr}` : ""}). `;

    if (selectedBrand === "Apple") {
      text += `Features certified ${productForm.batteryHealth || "100%"} battery health, ${productForm.faceId === "Working" ? "100% functional Face ID" : "Face ID"}, and ${productForm.network || "Factory Unlocked"} network compatibility. `;
      if (specs.trueTone === "Yes") text += `Active True Tone display enabled. `;
      if (specs.icloudStatus) text += `iCloud status: ${specs.icloudStatus}. `;
    } else if (selectedBrand === "Samsung") {
      if (specs.batterySize) text += `Equipped with ${specs.batterySize} high-capacity battery. `;
      if (specs.knoxStatus) text += `Security status: ${specs.knoxStatus}. `;
      if (specs.sPen && specs.sPen !== "Not Applicable") text += `S-Pen feature: ${specs.sPen}. `;
    } else if (selectedBrand === "Google Pixel") {
      text += `Powered by ${specs.chipset || "Google Tensor AI Chipset"} and ${specs.titanM2 || "Titan M2 Hardware Security"}. `;
      if (specs.batterySize) text += `Features ${specs.batterySize} with Adaptive Battery saver. `;
    } else if (selectedBrand === "Xiaomi") {
      text += `Runs on ${specs.os || "Xiaomi HyperOS"} with ${specs.batterySize || "120W HyperCharge battery"}. `;
      if (specs.ramExtension) text += `Memory configuration: ${specs.ramExtension}. `;
    } else if (selectedBrand === "Tecno / Infinix" || selectedBrand === "Tecno" || selectedBrand === "Infinix") {
      text += `Equipped with ${specs.ramExtension || "Extended RAM Technology"} and ${specs.os || "HiOS / XOS Custom ROM"}. `;
      if (specs.batterySize) text += `Power unit: ${specs.batterySize}. `;
    } else {
      if (specs.ram) text += `Configured with ${specs.ram} RAM and ${specs.batterySize || "long-lasting"} battery. `;
    }

    if (specs.accessories) {
      text += `Package includes: ${specs.accessories}. `;
    }

    if (condition === "Brand New" && specs.warranty) {
      text += `Comes with ${specs.warranty}. `;
    } else {
      text += `Fully tested, 100% original hardware, and backed by MILITO TECH swap warranty guarantee.`;
    }

    setProductForm(prev => ({
      ...prev,
      description: text.trim()
    }));
  };

  return (
    <form onSubmit={onSave} className="space-y-8 text-white">
      {/* REQUIREMENT 1: BRAND SELECTOR IS THE FIRST FIELD */}
      <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] font-bold text-base">
              1
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Select Smartphone Brand <span className="text-red-400">*</span></h3>
              <p className="text-xs text-gray-400">Choose a brand first to unlock tailored device specifications</p>
            </div>
          </div>
          {brand && (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Brand Selected: {brand}
            </span>
          )}
        </div>

        {/* Visual Brand Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BRANDS.map(b => {
            const isSelected = brand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  let brandSpecs = {
                    screen: "6.7-inch Display",
                    camera: "Pro Camera System",
                    chipset: "High Performance CPU",
                    batterySize: "5000 mAh",
                    os: "Latest OS",
                    warranty: "1-Year MILITO Escrow Warranty",
                    simType: "Physical SIM + eSIM"
                  };

                  if (b.id === "Apple") {
                    brandSpecs = {
                      screen: "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
                      camera: "48MP Pro Main + 12MP Telephoto 5x + UltraWide",
                      chipset: "Apple A17 Pro / A18 Pro Bionic",
                      batterySize: "100% Certified Battery Health",
                      os: "iOS 18 / iOS 17",
                      warranty: "1-Year MILITO Escrow Warranty",
                      simType: "Physical Nano SIM + eSIM"
                    };
                  } else if (b.id === "Samsung") {
                    brandSpecs = {
                      screen: "6.8-inch Dynamic AMOLED 2X 120Hz LTPO",
                      camera: "200MP Quad Camera + 100x Space Zoom",
                      chipset: "Snapdragon 8 Gen 3 for Galaxy",
                      batterySize: "5000 mAh (45W Super Fast Charging)",
                      os: "Android 14 / One UI 6.1",
                      warranty: "1-Year MILITO Escrow Warranty",
                      simType: "Dual Physical SIM + eSIM"
                    };
                  } else if (b.id === "Google Pixel") {
                    brandSpecs = {
                      screen: "6.7-inch Super Actua OLED 120Hz",
                      camera: "50MP Dual / Triple Tensor AI Camera",
                      chipset: "Google Tensor G4 Chip + Titan M2",
                      batterySize: "5050 mAh (Adaptive Battery Health 100%)",
                      os: "Stock Android 15 (7-Year OS Updates)",
                      warranty: "1-Year MILITO Escrow Warranty",
                      simType: "Physical Nano SIM + eSIM"
                    };
                  } else if (b.id === "Xiaomi") {
                    brandSpecs = {
                      screen: "6.67-inch 1.5K CrystalRes AMOLED 120Hz",
                      camera: "50MP Leica / Pro Camera System",
                      chipset: "Snapdragon 8 Gen 3 / Dimensity 9300+",
                      batterySize: "5000 mAh (120W HyperCharge)",
                      os: "Xiaomi HyperOS 1.0 (Global ROM)",
                      warranty: "1-Year MILITO Escrow Warranty",
                      simType: "Dual Nano SIM"
                    };
                  } else if (b.id === "Tecno / Infinix") {
                    brandSpecs = {
                      screen: "6.78-inch 3D Curved AMOLED 120Hz",
                      camera: "108MP OIS Ultra Clarity Camera",
                      chipset: "MediaTek Dimensity 8050 / Helio G99",
                      batterySize: "5000 mAh (70W Ultra Fast Charge)",
                      os: "HiOS 14 / XOS 14 (Android 14)",
                      warranty: "1-Year MILITO Escrow Warranty",
                      simType: "Dual Nano SIM"
                    };
                  }

                  setProductForm(prev => ({
                    ...prev,
                    brand: b.id,
                    specs: brandSpecs
                  }));
                }}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#00B14F]/15 border-[#00B14F] ring-2 ring-[#00B14F]/40 scale-[1.01]"
                    : "bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-2xl">{b.logo}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#00B14F] flex items-center justify-center text-black font-black text-[10px]">
                      ✓
                    </div>
                  )}
                </div>
                <span className="text-xs font-black text-white">{b.name}</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5">{b.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* REQUIREMENT 2: DO NOT DISPLAY FULL PRODUCT FORM UNTIL BRAND IS SELECTED */}
      {!brand ? (
        <div className="p-10 bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl text-center">
          <Sparkles className="w-12 h-12 text-[#00B14F] mx-auto mb-3 animate-pulse" />
          <h4 className="text-base font-bold text-gray-300">Brand Selection Required</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Please click on one of the smartphone brands above (e.g. Apple, Samsung, Google Pixel) to unlock the complete intelligent product form.
          </p>
        </div>
      ) : (
        /* DYNAMIC BRAND SPECIFIC FORM FIELDS */
        <div className="space-y-6 animate-fade-in">
          
          {/* Section 2: Model & Basic Info */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">{brand} Model & Condition</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Model Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Model Name <span className="text-red-400">*</span>
                </label>
                {brand === "Apple" ? (
                  <div className="space-y-2">
                    <select
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Apple Model --</option>
                      {APPLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Custom">Type Custom Model...</option>
                    </select>
                    {(!APPLE_MODELS.includes(productForm.name || "") && productForm.name !== "") && (
                      <input
                        type="text"
                        placeholder="Enter custom iPhone model name..."
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    )}
                  </div>
                ) : brand === "Samsung" ? (
                  <div className="space-y-2">
                    <select
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Samsung Model --</option>
                      {SAMSUNG_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Custom">Type Custom Model...</option>
                    </select>
                    {(!SAMSUNG_MODELS.includes(productForm.name || "") && productForm.name !== "") && (
                      <input
                        type="text"
                        placeholder="Enter custom Samsung model name..."
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    )}
                  </div>
                ) : brand === "Google Pixel" ? (
                  <div className="space-y-2">
                    <select
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Pixel Model --</option>
                      {PIXEL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Custom">Type Custom Model...</option>
                    </select>
                    {(!PIXEL_MODELS.includes(productForm.name || "") && productForm.name !== "") && (
                      <input
                        type="text"
                        placeholder="Enter custom Pixel model name..."
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    )}
                  </div>
                ) : brand === "Xiaomi" ? (
                  <div className="space-y-2">
                    <select
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Xiaomi / Redmi / POCO Model --</option>
                      {XIAOMI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Custom">Type Custom Model...</option>
                    </select>
                    {(!XIAOMI_MODELS.includes(productForm.name || "") && productForm.name !== "") && (
                      <input
                        type="text"
                        placeholder="Enter custom Xiaomi/POCO model name..."
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    )}
                  </div>
                ) : (brand === "Tecno / Infinix" || brand === "Tecno" || brand === "Infinix") ? (
                  <div className="space-y-2">
                    <select
                      value={productForm.name || ""}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                    >
                      <option value="">-- Select Tecno / Infinix Model --</option>
                      {TRANSSION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Custom">Type Custom Model...</option>
                    </select>
                    {(!TRANSSION_MODELS.includes(productForm.name || "") && productForm.name !== "") && (
                      <input
                        type="text"
                        placeholder="Enter custom Tecno or Infinix model..."
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={`e.g. ${brand} Device Model...`}
                    value={productForm.name || ""}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Device Condition <span className="text-red-400">*</span>
                </label>
                <select
                  value={productForm.condition || "Premium UK Used"}
                  onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as any })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                >
                  <option value="Brand New">✨ Brand New (Factory Sealed)</option>
                  <option value="Premium UK Used">🇬🇧 Premium UK Used (Grade A++)</option>
                </select>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Price (₦ NGN) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 750000"
                  value={productForm.price || ""}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold text-[#00B14F] focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Original Price / Strikethrough (₦ NGN)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 820000"
                  value={productForm.originalPrice || ""}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={productForm.quantity ?? 1}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setProductForm({
                      ...productForm,
                      quantity: q,
                      availability: q <= 0 ? "Sold Out" : "In Stock"
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Brand Specific Technical Specifications */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">{brand} Specifications & Hardware Features</h4>
            </div>

            {/* Storage Options Multi-select */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Storage Options
              </label>
              <div className="flex flex-wrap gap-2">
                {["64GB", "128GB", "256GB", "512GB", "1TB"].map(size => {
                  const selected = (productForm.storageOptions || []).includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const current = productForm.storageOptions || [];
                        const next = selected ? current.filter(s => s !== size) : [...current, size];
                        setProductForm({ ...productForm, storageOptions: next });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selected
                          ? "bg-[#00B14F] border-[#00B14F] text-black"
                          : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      {selected ? `✓ ${size}` : size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BRAND SPECIFIC FIELDS */}
            {brand === "Apple" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Battery Health (%)
                  </label>
                  <select
                    value={productForm.batteryHealth || "100%"}
                    onChange={(e) => setProductForm({ ...productForm, batteryHealth: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="100%">100% (Certified Max)</option>
                    <option value="98%+">98%+</option>
                    <option value="95%+">95%+</option>
                    <option value="90%+">90%+</option>
                    <option value="88% - 92%">88% - 92%</option>
                    <option value="85%+">85%+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Face ID
                  </label>
                  <select
                    value={productForm.faceId || "Working"}
                    onChange={(e) => setProductForm({ ...productForm, faceId: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Working">🟢 Working Perfectly</option>
                    <option value="Not Working">🔴 Not Working</option>
                    <option value="Not Applicable">🔘 Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    True Tone
                  </label>
                  <select
                    value={productForm.specs?.trueTone || "Yes"}
                    onChange={(e) => updateSpec("trueTone", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Yes">Yes (Original Display)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    iCloud Status
                  </label>
                  <select
                    value={productForm.specs?.icloudStatus || "Clean"}
                    onChange={(e) => updateSpec("icloudStatus", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Clean">Clean (Sign in Ready)</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    SIM Standard
                  </label>
                  <select
                    value={productForm.specs?.simType || "Physical SIM + eSIM"}
                    onChange={(e) => updateSpec("simType", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Physical SIM + eSIM">Physical Nano SIM + eSIM</option>
                    <option value="Dual eSIM">Dual eSIM (US Version)</option>
                    <option value="Physical Dual SIM">Physical Dual Nano SIM (HK Version)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Network Lock Status
                  </label>
                  <select
                    value={productForm.network || "Factory Unlocked"}
                    onChange={(e) => setProductForm({ ...productForm, network: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Factory Unlocked">🔓 Factory Unlocked (Worldwide)</option>
                    <option value="Carrier Locked">🔒 Carrier Locked</option>
                  </select>
                </div>
              </div>
            )}

            {brand === "Samsung" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Knox Security Status</label>
                  <select
                    value={productForm.specs?.knoxStatus || "Knox 0x0 (Untripped / Secure)"}
                    onChange={(e) => updateSpec("knoxStatus", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Knox 0x0 (Untripped / Secure)">🟢 Knox 0x0 Untripped (Secure Pass)</option>
                    <option value="Knox Tripped">🔴 Knox Tripped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Biometrics / Fingerprint</label>
                  <select
                    value={productForm.specs?.biometrics || "Ultrasonic Under-Display Fingerprint"}
                    onChange={(e) => updateSpec("biometrics", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Ultrasonic Under-Display Fingerprint">Ultrasonic Under-Display Fingerprint</option>
                    <option value="Optical Under-Display Fingerprint">Optical Under-Display Fingerprint</option>
                    <option value="Side Sensor">Side Mounted Sensor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">S-Pen Support</label>
                  <select
                    value={productForm.specs?.sPen || "Not Applicable"}
                    onChange={(e) => updateSpec("sPen", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Integrated S-Pen Included">Included / Built-in S-Pen</option>
                    <option value="Supported (Sold Separately)">Supported (Sold Separately)</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Battery & Fast Charge</label>
                  <input
                    type="text"
                    placeholder="e.g. 5000 mAh (45W Super Fast Charging)"
                    value={productForm.specs?.batterySize || "5000 mAh (45W Fast Charge)"}
                    onChange={(e) => updateSpec("batterySize", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Processor / Chipset</label>
                  <input
                    type="text"
                    placeholder="e.g. Snapdragon 8 Gen 3 for Galaxy"
                    value={productForm.specs?.chipset || "Snapdragon 8 Gen 3 for Galaxy"}
                    onChange={(e) => updateSpec("chipset", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {brand === "Google Pixel" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Hardware Security</label>
                  <select
                    value={productForm.specs?.titanM2 || "Titan M2 Verified"}
                    onChange={(e) => updateSpec("titanM2", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Titan M2 Verified">🟢 Titan M2 Security Chip Active</option>
                    <option value="Standard Security">Standard Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Biometrics / Unlock</label>
                  <select
                    value={productForm.specs?.biometrics || "Pixel Imprint Fingerprint + Face Unlock"}
                    onChange={(e) => updateSpec("biometrics", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Pixel Imprint Fingerprint + Face Unlock">Pixel Imprint Fingerprint + Face Unlock</option>
                    <option value="In-Display Fingerprint Only">In-Display Fingerprint Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tensor AI Chipset</label>
                  <select
                    value={productForm.specs?.chipset || "Google Tensor G4 Chip"}
                    onChange={(e) => updateSpec("chipset", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Google Tensor G4 Chip">Google Tensor G4 Chip</option>
                    <option value="Google Tensor G3 Chip">Google Tensor G3 Chip</option>
                    <option value="Google Tensor G2 Chip">Google Tensor G2 Chip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Adaptive Battery Status</label>
                  <input
                    type="text"
                    placeholder="e.g. 5050 mAh (Adaptive Battery Health 100%)"
                    value={productForm.specs?.batterySize || "5050 mAh (Adaptive Battery Health 100%)"}
                    onChange={(e) => updateSpec("batterySize", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {brand === "Xiaomi" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">HyperCharge & Battery</label>
                  <select
                    value={productForm.specs?.batterySize || "5000 mAh (120W HyperCharge)"}
                    onChange={(e) => updateSpec("batterySize", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="5000 mAh (120W HyperCharge)">⚡ 5000 mAh (120W HyperCharge - 19 mins)</option>
                    <option value="5000 mAh (67W Turbo Charge)">⚡ 5000 mAh (67W Turbo Charge)</option>
                    <option value="5000 mAh (33W Fast Charge)">⚡ 5000 mAh (33W Fast Charge)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Xiaomi HyperOS / MIUI</label>
                  <select
                    value={productForm.specs?.os || "Xiaomi HyperOS 1.0 (Global ROM)"}
                    onChange={(e) => updateSpec("os", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="Xiaomi HyperOS 1.0 (Global ROM)">Xiaomi HyperOS 1.0 (Global ROM)</option>
                    <option value="MIUI 14 Global">MIUI 14 Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Extended Virtual RAM</label>
                  <input
                    type="text"
                    placeholder="e.g. 12GB + 8GB Extended RAM (20GB Total)"
                    value={productForm.specs?.ramExtension || "12GB + 8GB Extended RAM"}
                    onChange={(e) => updateSpec("ramExtension", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {(brand === "Tecno / Infinix" || brand === "Tecno" || brand === "Infinix") && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800/60">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Ultra Fast Charge Speed</label>
                  <select
                    value={productForm.specs?.batterySize || "5000 mAh (70W Ultra Fast Charge)"}
                    onChange={(e) => updateSpec("batterySize", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="5000 mAh (70W Ultra Fast Charge)">⚡ 5000 mAh (70W Ultra Fast Charge)</option>
                    <option value="5000 mAh (45W All-Round Charge)">⚡ 5000 mAh (45W All-Round FastCharge)</option>
                    <option value="6000 mAh Power Monster">🔋 6000 mAh Mega Battery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Custom UI / Software</label>
                  <select
                    value={productForm.specs?.os || "HiOS 14 (Android 14)"}
                    onChange={(e) => updateSpec("os", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  >
                    <option value="HiOS 14 (Android 14)">HiOS 14 (Tecno)</option>
                    <option value="XOS 14 (Android 14)">XOS 14 (Infinix)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Fusion Extended RAM</label>
                  <input
                    type="text"
                    placeholder="e.g. 12GB + 12GB Extended RAM (24GB Fusion RAM)"
                    value={productForm.specs?.ramExtension || "12GB + 12GB Extended RAM (24GB Fusion)"}
                    onChange={(e) => updateSpec("ramExtension", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Accessories input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Included Accessories / Package Contents
              </label>
              <input
                type="text"
                placeholder="e.g. Original Box, Fast Charger Cable, Protective Silicon Case"
                value={productForm.specs?.accessories || ""}
                onChange={(e) => updateSpec("accessories", e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Cloudinary Image Upload & Media Manager */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cloudinary Product Images & Media Manager</h4>
                <p className="text-xs text-gray-400">Upload high-res photos directly to Cloudinary. First photo automatically serves as main cover thumbnail.</p>
              </div>
            </div>

            {uploadError && (
              <div className="p-4 bg-red-950/90 border border-red-500/60 rounded-xl text-xs font-mono space-y-1 animate-fadeIn shadow-lg">
                <div className="font-bold text-red-400 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>✓ Upload failed.</span>
                </div>
                <div className="text-gray-300 font-semibold">Reason:</div>
                <div className="text-red-300 leading-relaxed break-words">
                  {uploadError
                    .replace(/^Upload failed\.?\s*(Reason:\s*)?/i, "")
                    .replace(/^Cloudinary upload failed:\s*/i, "")
                    .trim() || "Upload service unavailable."}
                </div>
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
                      original_filename: `Image ${i + 1}`
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
              onChange={({ galleryImages: newImages, thumbnail: newThumb }) => {
                const galleryUrls = newImages.map(img => img.secure_url);
                const galleryPublicIds = newImages.map(img => img.public_id);
                const mainImage = newThumb.secure_url || galleryUrls[0] || "";
                const mainPublicId = newThumb.public_id || galleryPublicIds[0] || "";

                setProductForm(prev => ({
                  ...prev,
                  galleryImages: newImages,
                  thumbnail: newThumb,
                  image: mainImage,
                  imagePublicId: mainPublicId,
                  gallery: galleryUrls,
                  galleryPublicIds: galleryPublicIds
                }));
              }}
              onUploadSuccess={onImageUploadSuccess}
            />
          </div>

          {/* Section 5: Auto Summary & Description */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  5
                </div>
                <h4 className="text-sm font-bold text-white">Product Description Summary</h4>
              </div>

              {/* Requirement: Auto Generate Button */}
              <button
                type="button"
                onClick={handleAutoGenerateSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate Summary
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Detailed description summary of the device..."
              value={productForm.description || ""}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-[#00B14F] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Save & Cancel Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#00B14F] hover:bg-[#009241] text-black shadow-lg shadow-[#00B14F]/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving to Firestore...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingProduct ? "Update Product" : "Publish Product to Catalog"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

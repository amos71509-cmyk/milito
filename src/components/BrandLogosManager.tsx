import React, { useState, useRef } from "react";
import { Plus, Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Image as ImageIcon, Sparkles } from "lucide-react";
import { useBranding } from "../context/BrandingContext";
import { UploadService } from "../services/UploadService";
import { BrandItem } from "../types";

export default function BrandLogosManager() {
  const { branding, updateBrandLogo, addBrand, deleteBrandLogo, deleteBrand } = useBranding();
  const [uploadingBrandId, setUploadingBrandId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Brand Modal / Form State
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandFile, setNewBrandFile] = useState<File | null>(null);
  const [newBrandPreview, setNewBrandPreview] = useState<string | null>(null);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const newBrandFileInputRef = useRef<HTMLInputElement | null>(null);

  const brandList: BrandItem[] = branding.brandLogos && branding.brandLogos.length > 0
    ? branding.brandLogos
    : [
        { id: "apple", name: "Apple" },
        { id: "samsung", name: "Samsung" },
        { id: "tecno", name: "Tecno" },
        { id: "redmi", name: "Redmi / Xiaomi" },
        { id: "google-pixel", name: "Google Pixel" },
        { id: "infinix", name: "Infinix" },
        { id: "oppo", name: "Oppo" },
        { id: "vivo", name: "Vivo" }
      ];

  const handleLogoUpload = async (brandId: string, file: File) => {
    if (!file) return;
    setUploadingBrandId(brandId);
    setUploadProgress(20);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const metas = await UploadService.uploadToCloudinary([file], (prog) => {
        setUploadProgress(prog);
      });

      if (metas && metas.length > 0) {
        await updateBrandLogo(brandId, metas[0]);
        setSuccessMessage(`Logo updated successfully for ${brandList.find(b => b.id === brandId)?.name || "brand"}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error("Unable to upload brand logo. Please try again.");
      }
    } catch (err: any) {
      console.error("Brand logo upload error:", err);
      setErrorMessage(err.message || "Failed to upload brand logo.");
    } finally {
      setUploadingBrandId(null);
      setUploadProgress(0);
      if (fileInputRefs.current[brandId]) {
        fileInputRefs.current[brandId]!.value = "";
      }
    }
  };

  const handleCreateNewBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      setErrorMessage("Please enter a brand name.");
      return;
    }

    setIsCreatingBrand(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let meta = undefined;
      if (newBrandFile) {
        const metas = await UploadService.uploadToCloudinary([newBrandFile]);
        if (metas && metas.length > 0) {
          meta = metas[0];
        }
      }

      await addBrand(newBrandName.trim(), meta);
      setSuccessMessage(`Brand "${newBrandName.trim()}" added to portal successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Reset modal state
      setNewBrandName("");
      setNewBrandFile(null);
      setNewBrandPreview(null);
      setIsAddingNewBrand(false);
    } catch (err: any) {
      console.error("Failed to add brand:", err);
      setErrorMessage(err.message || "Error adding brand.");
    } finally {
      setIsCreatingBrand(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00B14F]" />
            Brand Logos & Manufacturer Catalog
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Manage logos for smartphone brands. These logos appear in brand selectors and device listings across the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddingNewBrand(true);
            setErrorMessage(null);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B14F] text-black text-xs font-extrabold hover:bg-[#009241] shadow-lg shadow-[#00B14F]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Another Brand</span>
        </button>
      </div>

      {/* FEEDBACK NOTIFICATIONS */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs font-bold text-red-300 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* NEW BRAND CREATION FORM MODAL */}
      {isAddingNewBrand && (
        <div className="p-4 sm:p-5 bg-gray-900 border-2 border-[#00B14F]/50 rounded-2xl space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00B14F]" />
              Add New Smartphone Brand
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAddingNewBrand(false);
                setNewBrandName("");
                setNewBrandFile(null);
                setNewBrandPreview(null);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNewBrand} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Brand Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Infinix, Oppo, Honor, OnePlus..."
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Brand Logo Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={newBrandFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewBrandFile(file);
                      setNewBrandPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => newBrandFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{newBrandFile ? "Change Logo File" : "Choose Logo Image"}</span>
                </button>

                {newBrandPreview && (
                  <div className="w-10 h-10 rounded-lg bg-black border border-gray-700 p-1 flex items-center justify-center overflow-hidden">
                    <img src={newBrandPreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNewBrand(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingBrand}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#00B14F] text-black hover:bg-[#009241] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isCreatingBrand ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding Brand...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Brand</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BRAND LOGOS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brandList.map((b) => {
          const isUploading = uploadingBrandId === b.id;
          const hasLogo = !!b.logoUrl;

          return (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white truncate pr-2">{b.name}</span>
                {hasLogo ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    Custom Logo
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 shrink-0">
                    Default
                  </span>
                )}
              </div>

              {/* LOGO PREVIEW DISPLAY BOX */}
              <div className="w-full h-20 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center p-2 relative overflow-hidden group">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <RefreshCw className="w-5 h-5 text-[#00B14F] animate-spin" />
                    <span className="text-[10px] font-bold text-gray-300">Uploading {uploadProgress}%</span>
                  </div>
                ) : hasLogo ? (
                  <img
                    src={b.logoUrl}
                    alt={`${b.name} logo`}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <Smartphone className="w-6 h-6 opacity-60" />
                    <span className="text-[10px] font-bold">{b.name} Logo</span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[b.id] = el)}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(b.id, file);
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRefs.current[b.id]?.click()}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[11px] font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{hasLogo ? "Change Logo" : "Upload Logo"}</span>
                </button>

                {hasLogo && (
                  <button
                    type="button"
                    onClick={() => deleteBrandLogo(b.id)}
                    className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 transition-all"
                    title="Remove custom logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

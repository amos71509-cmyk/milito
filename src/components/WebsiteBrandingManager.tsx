import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ImageIcon,
  Eye,
  Globe,
  ShieldCheck,
  Check,
  Image as ImageIcon2
} from "lucide-react";
import { useBranding } from "../context/BrandingContext";
import { CloudinaryImageMeta } from "../types";
import { UploadService } from "../services/UploadService";
import BrandLogosManager from "./BrandLogosManager";

export default function WebsiteBrandingManager() {
  const { branding, loading, updateLogo, deleteLogo } = useBranding();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP, SVG).");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const uploadedMeta = await UploadService.uploadSingleFile(
        file,
        0,
        1,
        1,
        (progress) => {
          setUploadProgress(progress);
        },
        "milito_branding"
      );

      if (!uploadedMeta || !uploadedMeta.secure_url) {
        throw new Error("Failed to upload website logo. Please try again.");
      }

      setUploadProgress(100);

      // Save to Firestore branding/website
      await updateLogo(uploadedMeta);

      setSuccessMessage("Website logo updated and saved to Cloudinary & Firestore successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("[WebsiteBrandingManager] Upload Error:", err);
      setErrorMessage(err.message || "Failed to upload website logo. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm("Are you sure you want to delete the official website logo? The default MILITO icon badge will be displayed instead.")) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteLogo();
      setSuccessMessage("Website logo removed. Default badge restored.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Delete logo error:", err);
      setErrorMessage("Failed to delete logo: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-white max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-gray-900 to-gray-950 border border-emerald-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00B14F]" />
            <h2 className="text-lg font-black text-white">Website Branding Management</h2>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Upload your official brand logo. It automatically replaces default icons across the Navbar, Footer, Login Modals, Admin Portal, and Browser Favicon.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-emerald-400 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#00B14F]" />
          <span>Firestore Collection: branding/website</span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#00B14F] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/90 border border-red-500/60 text-xs font-mono text-red-300 space-y-1 animate-fadeIn shadow-lg">
          <div className="font-bold text-red-400 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>✓ Upload failed.</span>
          </div>
          <div className="text-gray-300 font-semibold">Reason:</div>
          <div className="text-red-300 leading-relaxed break-words">
            {errorMessage
              .replace(/^Upload failed\.?\s*(Reason:\s*)?/i, "")
              .replace(/^Server returned HTTP \d+:\s*/i, "")
              .trim() || "Upload service unavailable."}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload & Manage Controls */}
        <div className="space-y-6">
          {/* Active Logo Card */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#00B14F]" />
                Current Active Logo
              </h3>
              {branding.logoUrl ? (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                  Active On Live Website
                </span>
              ) : (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Using Default Badge
                </span>
              )}
            </div>

            <div className="relative p-6 bg-black/60 rounded-xl border border-gray-800 flex items-center justify-center min-h-[160px] group overflow-hidden">
              {branding.logoUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={branding.logoUrl}
                    alt="Current Website Logo"
                    className="max-h-24 max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="text-[11px] text-gray-400 font-mono text-center space-y-0.5">
                    <p className="font-bold text-gray-200">
                      {branding.logoMeta?.original_filename || "Official Brand Logo"}
                    </p>
                    <p>
                      {branding.logoMeta?.width && branding.logoMeta?.height
                        ? `${branding.logoMeta.width} x ${branding.logoMeta.height} px`
                        : "Cloudinary CDN Optimized"}
                      {" • "}
                      {formatBytes(branding.logoMeta?.bytes)}
                      {" • "}
                      <span className="text-[#00B14F] uppercase font-bold">
                        {branding.logoMeta?.format || "PNG"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00B14F] flex items-center justify-center font-black text-[#1A2025] text-2xl mx-auto shadow-lg shadow-[#00B14F]/20">
                    M
                  </div>
                  <p className="text-xs text-gray-400">Default MILITO badge currently active</p>
                </div>
              )}
            </div>

            {/* Logo Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#009241] text-black font-extrabold text-xs shadow-lg shadow-[#00B14F]/20 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {branding.logoUrl ? "Replace Website Logo" : "Upload Official Logo"}
              </button>

              {branding.logoUrl && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteLogo}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  title="Delete logo from Cloudinary & Firestore"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Logo</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00B14F]" />
              Upload New Website Logo
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-[#00B14F] bg-[#00B14F]/10 scale-[1.01]"
                  : "border-gray-700 hover:border-[#00B14F] bg-gray-900/60 hover:bg-gray-900/80"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00B14F]/10 border border-[#00B14F]/30 text-[#00B14F] flex items-center justify-center mx-auto mb-3">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <h4 className="text-sm font-bold text-white mb-1">
                {isUploading ? "Uploading Logo to Cloudinary..." : "Drag & Drop Website Logo Here"}
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                or <span className="text-[#00B14F] font-bold underline">click to browse</span> from device
              </p>

              {isUploading && (
                <div className="w-full max-w-xs mx-auto space-y-1.5">
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00B14F] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#00B14F]">
                    {uploadProgress}% Uploading...
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-500 font-medium pt-2">
                <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">
                  PNG, WEBP, SVG, JPG
                </span>
                <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">
                  Transparent Background Recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Website Mockup Previews */}
        <div className="space-y-6">
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00B14F]" />
                Live Website Logo Previews
              </h3>
              <span className="text-[10px] text-gray-400">Real-Time Sync</span>
            </div>

            {/* Preview 1: Header / Navbar (Light Theme) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                1. Main Website Navigation Header (Light Theme)
              </span>
              <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo Preview"
                      className="h-14 max-w-[250px] object-contain mix-blend-multiply bg-transparent p-0 border-0 shadow-none"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#00B14F] flex items-center justify-center font-black text-black text-base">
                      M
                    </div>
                  )}
                  <span className="font-extrabold text-gray-900 text-sm tracking-wider">
                    MILITO <span className="text-[#00B14F]">TECH</span>
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] font-bold text-gray-600 uppercase">
                  <span>Home</span>
                  <span>Shop</span>
                  <span>Trade-In</span>
                </div>
              </div>
            </div>

            {/* Preview 2: Footer (Dark Theme) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                2. Website Footer (Dark Twilight Theme)
              </span>
              <div className="p-4 bg-[#1A2025] rounded-xl border border-gray-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo Preview"
                      className="h-14 max-w-[250px] object-contain bg-transparent p-0 border-0 shadow-none"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#00B14F] flex items-center justify-center font-black text-black text-base">
                      M
                    </div>
                  )}
                  <span className="font-extrabold text-white text-sm tracking-wider font-sans">
                    MILITO <span className="text-[#00B14F]">TECH</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  © 2026 MILITO TECH HOME
                </span>
              </div>
            </div>

            {/* Preview 3: Browser Tab Favicon */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                3. Browser Tab Favicon
              </span>
              <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-[#00B14F] text-black font-black text-[10px] flex items-center justify-center">
                      M
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-300 truncate">
                  MILITO TECH HOME — Official Store & Trade-In
                </span>
              </div>
            </div>

            {/* Cloudinary Metadata Summary */}
            {branding.logoMeta && (
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00B14F]" />
                  Cloudinary & Firestore Asset Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono">
                  <div>
                    <span className="block text-gray-500 text-[10px] uppercase">Public ID</span>
                    <span className="text-gray-200 truncate block">{branding.logoPublicId}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px] uppercase">Dimensions</span>
                    <span className="text-gray-200">
                      {branding.logoMeta.width} x {branding.logoMeta.height} px
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px] uppercase">File Format</span>
                    <span className="text-[#00B14F] uppercase font-bold">{branding.logoMeta.format}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px] uppercase">Last Updated</span>
                    <span className="text-gray-200">
                      {branding.updatedAt ? new Date(branding.updatedAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BRAND LOGOS MANAGEMENT SECTION */}
      <BrandLogosManager />
    </div>
  );
}

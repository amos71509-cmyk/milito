import React, { useState, useRef } from "react";
import {
  Car,
  Upload,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Video,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Play,
  RotateCw,
  ExternalLink,
  Sliders,
  Film,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { useVehicleShowcase } from "../context/VehicleShowcaseContext";
import { ShowcaseMediaItem, VehicleShowcaseConfig } from "../types";
import { UploadService, generateLocalVideoPoster } from "../services/UploadService";

export default function VehicleShowcaseManager() {
  const {
    config,
    saveConfig,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    toggleMediaItemActive,
    reorderMediaItems,
    resetToDefault,
    loading
  } = useVehicleShowcase();

  // Local form state for batch edits
  const [formConfig, setFormConfig] = useState<VehicleShowcaseConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Staging media uploads
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [newPosterUrl, setNewPosterUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // File input refs
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize when remote config loads/changes
  React.useEffect(() => {
    setFormConfig(config);
  }, [config]);

  // Handle saving copy & timing configurations
  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveConfig(formConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("[VehicleShowcaseManager] Save error:", err);
      setErrorMessage(err.message || "Failed to save showcase settings to Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  // Upload main media file (Image or Video) to Cloudinary via UploadService
  const handleProcessMediaFile = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(file.name);
    setNewMediaType(isVideo ? "video" : "image");

    // 1. Instant local object URL for zero perceived lag
    const instantLocalUrl = URL.createObjectURL(file);
    setNewMediaUrl(instantLocalUrl);

    if (!newMediaTitle) {
      setNewMediaTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // 2. If it's a video, extract crisp poster thumbnail frame immediately in background
    if (isVideo) {
      generateLocalVideoPoster(file).then((localPoster) => {
        if (localPoster) setNewPosterUrl(localPoster);
      });
    }

    setIsUploadingMedia(true);
    setUploadProgress(5);
    setUploadStage(isVideo ? "Uploading high-definition video..." : "Uploading image to Cloudinary CDN...");
    setErrorMessage(null);

    try {
      const uploadedMeta = await UploadService.uploadSingleFile(
        file,
        0,
        1,
        1,
        (percent, loaded, total) => {
          setUploadProgress(percent);
          const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (total / (1024 * 1024)).toFixed(1);
          setUploadStage(`Uploading: ${percent}% (${loadedMb}MB / ${totalMb}MB)`);
        },
        "milito_vehicle_showcase"
      );

      setUploadProgress(100);
      setUploadStage("Upload complete!");
      setNewMediaUrl(uploadedMeta.secure_url);

      if (uploadedMeta.posterUrl) {
        setNewPosterUrl(uploadedMeta.posterUrl);
      }
    } catch (err: any) {
      console.error("[VehicleShowcaseManager] Media upload error:", err);
      setErrorMessage(`Upload failed: ${err.message || "Could not upload file to Cloudinary"}`);
    } finally {
      setIsUploadingMedia(false);
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = "";
    }
  };

  const handleUploadMediaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessMediaFile(file);
  };

  // Upload video poster/fallback image to Cloudinary
  const handleUploadPosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const instantPosterUrl = URL.createObjectURL(file);
    setNewPosterUrl(instantPosterUrl);

    setIsUploadingMedia(true);
    setUploadProgress(10);
    setUploadStage("Uploading poster image...");
    setErrorMessage(null);

    try {
      const uploadedMeta = await UploadService.uploadSingleFile(
        file,
        0,
        1,
        1,
        (percent) => setUploadProgress(percent),
        "milito_vehicle_showcase"
      );
      setUploadProgress(100);
      setNewPosterUrl(uploadedMeta.secure_url);
    } catch (err: any) {
      console.error("[VehicleShowcaseManager] Poster upload error:", err);
      setErrorMessage(`Poster upload failed: ${err.message || "Could not upload poster"}`);
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
      if (posterFileInputRef.current) posterFileInputRef.current.value = "";
    }
  };

  // Add the newly staged media item
  const handleAddNewItem = async () => {
    if (!newMediaUrl.trim()) {
      setErrorMessage("Please select or upload a media file first.");
      return;
    }

    const isVideo = newMediaType === "video" || /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(newMediaUrl);

    try {
      await addMediaItem({
        type: isVideo ? "video" : "image",
        url: newMediaUrl.trim(),
        posterUrl: newPosterUrl.trim() || undefined,
        title: newMediaTitle.trim() || (isVideo ? "Featured Vehicle Video" : "Featured Vehicle Photo"),
        active: true
      });

      // Reset modal state
      setNewMediaUrl("");
      setNewPosterUrl("");
      setNewMediaTitle("");
      setShowAddModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(`Failed to add media item: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-gray-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1A2025] to-gray-900 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00B14F] bg-[#00B14F]/10 px-2.5 py-0.5 rounded-full border border-[#00B14F]/20">
                Homepage Showcase
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Firestore: <code className="text-emerald-400">site_settings/vehicle_showcase</code>
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Vehicle Showcase & Auto-Rotation Manager</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Manage the dynamic, auto-rotating cinematic vehicle showcase banner on the main storefront homepage. Mix high-definition videos (.mp4/.webm) and photos (.webp/.jpg) with custom speed, copy, and direct routing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefault}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to default showcase media & texts"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-extrabold text-xs shadow-lg shadow-[#00B14F]/25 hover:shadow-[#00B14F]/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Showcase Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Alert feedback */}
      {errorMessage && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Media Slides List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121824] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#00B14F]" />
                  Showcase Media Slides ({formConfig.items.length})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ordered sequence of background videos and high-res photos displayed in the auto-rotation loop.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#00B14F]/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Media Slide
              </button>
            </div>

            {/* Quick Upload / Add New Slide Dropzone Card */}
            <div className="mb-6 p-4 sm:p-5 bg-[#0e1420] border-2 border-dashed border-emerald-500/30 hover:border-[#00B14F] rounded-2xl transition-all">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F] shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Upload New Slide (Image or Video)
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Drag & drop or click to add .mp4, .webm videos, or high-res photos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMediaUrl("");
                      setNewPosterUrl("");
                      setNewMediaTitle("");
                      setShowAddModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00B14F]/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Slide</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of items */}
            {formConfig.items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-semibold">No media items in showcase</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/30 text-xs font-bold hover:bg-[#00B14F]/30"
                >
                  Upload First Media Item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formConfig.items.map((item, index) => {
                  const isVideo = item.type === "video";
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                        item.active
                          ? "bg-gray-900/90 border-gray-800 hover:border-gray-700"
                          : "bg-gray-950/60 border-gray-900 opacity-60"
                      }`}
                    >
                      {/* Order Index & Drag indicator */}
                      <span className="w-6 text-center text-xs font-bold text-gray-500 font-mono">
                        #{index + 1}
                      </span>

                      {/* Thumbnail Preview */}
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black border border-gray-800 shrink-0 group">
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-950">
                            {item.posterUrl ? (
                              <img
                                src={item.posterUrl}
                                alt="Poster"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={item.url}
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-70"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-4 h-4 text-[#00B14F]" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-black uppercase text-gray-300">
                          {isVideo ? "MP4" : "IMG"}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.title || "Untitled Slide"}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              item.active
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">
                          {item.url}
                        </p>
                        {isVideo && item.posterUrl && (
                          <p className="text-[9px] text-emerald-400/80 truncate mt-0.5">
                            Poster: {item.posterUrl.slice(0, 45)}...
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Active */}
                        <button
                          onClick={() => toggleMediaItemActive(item.id)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition ${
                            item.active
                              ? "text-emerald-400 hover:bg-emerald-500/10"
                              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                          title={item.active ? "Disable slide" : "Enable slide"}
                        >
                          {item.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Move Up */}
                        <button
                          onClick={() => index > 0 && reorderMediaItems(index, index - 1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move slide earlier"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => index < formConfig.items.length - 1 && reorderMediaItems(index, index + 1)}
                          disabled={index === formConfig.items.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move slide later"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${item.title || "this media slide"}" from the showcase?`)) {
                              deleteMediaItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                          title="Delete slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Copy Controls & Timing / Behavior (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Timing & Behavior Settings */}
          <div className="bg-[#121824] border border-gray-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-[#00B14F]" />
              Timing & Behavior Controls
            </h3>

            {/* Auto-Rotate Switch */}
            <div className="flex items-center justify-between p-3.5 bg-gray-900/80 rounded-xl border border-gray-800">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Rotate Showcase</span>
                <span className="text-[10px] text-gray-400">Automatically transitions between media slides</span>
              </div>
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, autoRotate: !formConfig.autoRotate })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formConfig.autoRotate ? "bg-[#00B14F]" : "bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formConfig.autoRotate ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Rotation Interval Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Rotation Interval (Seconds)
                </label>
                <span className="text-xs font-black text-[#00B14F] px-2 py-0.5 rounded bg-[#00B14F]/10 border border-[#00B14F]/20 font-mono">
                  {formConfig.rotationIntervalSeconds}s
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={formConfig.rotationIntervalSeconds}
                onChange={(e) =>
                  setFormConfig({
                    ...formConfig,
                    rotationIntervalSeconds: parseFloat(e.target.value) || 2
                  })
                }
                className="w-full accent-[#00B14F] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                <span>1.0s (Fast)</span>
                <span className="text-emerald-400 font-bold">2.0s (Default)</span>
                <span>10.0s (Slow)</span>
              </div>
            </div>

            {/* Transition Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Transition Effect
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "crossfade", label: "Smooth Cross-fade" },
                  { id: "fade", label: "Soft Dissolve Fade" }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormConfig({ ...formConfig, transitionType: type.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition ${
                      formConfig.transitionType === type.id
                        ? "bg-[#00B14F]/20 text-emerald-300 border-[#00B14F]"
                        : "bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-850"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Showcase Copy Controls */}
          <div className="bg-[#121824] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00B14F]" />
              Showcase Copy & CTA Controls
            </h3>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Headline Text
              </label>
              <input
                type="text"
                value={formConfig.headline}
                onChange={(e) => setFormConfig({ ...formConfig, headline: e.target.value })}
                placeholder="e.g. LOOKING FOR A VEHICLE?"
                className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Subheadline / Punchline
              </label>
              <input
                type="text"
                value={formConfig.subheadline}
                onChange={(e) => setFormConfig({ ...formConfig, subheadline: e.target.value })}
                placeholder="e.g. Source your next ride through MILITO."
                className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Supporting Description
              </label>
              <textarea
                rows={3}
                value={formConfig.description}
                onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                placeholder="Details about vehicle verification, customs clearance, and delivery..."
                className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none leading-relaxed"
              />
            </div>

            {/* CTA Button Text & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={formConfig.ctaText}
                  onChange={(e) => setFormConfig({ ...formConfig, ctaText: e.target.value })}
                  placeholder="e.g. EXPLORE VEHICLES →"
                  className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  CTA Target Route
                </label>
                <input
                  type="text"
                  value={formConfig.ctaTarget}
                  onChange={(e) => setFormConfig({ ...formConfig, ctaTarget: e.target.value })}
                  placeholder="e.g. /vehicles or #vehicles"
                  className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-xs text-emerald-400 font-mono focus:border-[#00B14F] focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00B14F]/25 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ADD MEDIA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121824] border border-gray-800 rounded-3xl max-w-lg w-full shadow-2xl animate-scaleUp flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#0e131d]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Add Showcase Slide</h3>
                  <p className="text-[10px] text-gray-400">Background video or high-res vehicle photo</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* File upload trigger & drop zone */}
              <div className="space-y-2">
                <label className="block text-gray-300 font-bold">
                  Select Video or Photo File
                </label>
                
                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleUploadMediaFile}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessMediaFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => mediaFileInputRef.current?.click()}
                  className={`w-full p-5 sm:p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                    isUploadingMedia
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-gray-700 hover:border-[#00B14F] bg-gray-900/70 hover:bg-gray-900"
                  } text-gray-300`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
                    <Upload className={`w-6 h-6 ${isUploadingMedia ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="text-center">
                    <span className="font-bold block text-xs sm:text-sm text-white">
                      {isUploadingMedia ? "Uploading Media to Cloudinary..." : "Click to Browse or Drag & Drop"}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Supports MP4, WEBM, MOV, JPG, PNG, WEBP
                    </span>
                  </div>
                  <span className="mt-1 px-3 py-1 bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/30 rounded-full text-[10px] font-black">
                    Choose File From Device
                  </span>
                </div>

                {/* Live upload progress bar */}
                {isUploadingMedia && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00B14F]" />
                        <span>{uploadStage}</span>
                      </div>
                      <span className="font-mono text-emerald-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#00B14F] to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Instant visual preview if media URL is set */}
                {newMediaUrl && !isUploadingMedia && (
                  <div className="mt-3 p-3 bg-black/70 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="text-[10px] text-gray-400 font-bold mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Media Ready
                      </span>
                      <span className="text-emerald-400 uppercase font-mono px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                        {newMediaType}
                      </span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden max-h-36 flex items-center justify-center bg-gray-950">
                      {newMediaType === "video" || /\.(mp4|webm|mov)$/i.test(newMediaUrl) ? (
                        <video
                          src={newMediaUrl}
                          poster={newPosterUrl || undefined}
                          controls
                          muted
                          className="max-h-36 w-full object-contain"
                        />
                      ) : (
                        <img
                          src={newMediaUrl}
                          alt="Preview"
                          className="max-h-36 w-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Or Media URL Direct Input */}
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Or Enter Direct URL</label>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => {
                    setNewMediaUrl(e.target.value);
                    const isVid = e.target.value.toLowerCase().includes(".mp4") || e.target.value.toLowerCase().includes("/video/");
                    setNewMediaType(isVid ? "video" : "image");
                  }}
                  placeholder="https://res.cloudinary.com/... or https://..."
                  className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none font-mono"
                />
              </div>

              {/* Slide Title */}
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Slide Label / Caption</label>
                <input
                  type="text"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  placeholder="e.g. 2024 Lexus RX 350 Luxury Tokunbo"
                  className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              {/* Optional Video Poster Image if it's a video */}
              {(newMediaType === "video" || /\.(mp4|webm|mov)$/i.test(newMediaUrl)) && (
                <div className="p-3 bg-gray-900/90 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-200">Video Poster Image (Optional)</span>
                    <span className="text-[10px] text-gray-400">Auto-extracted or custom</span>
                  </div>
                  
                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPosterFile}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPosterUrl}
                      onChange={(e) => setNewPosterUrl(e.target.value)}
                      placeholder="https://... poster image URL"
                      className="flex-1 bg-[#0B0F17] border border-gray-700 rounded-xl p-2 text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => posterFileInputRef.current?.click()}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Upload Poster
                    </button>
                  </div>
                  {newPosterUrl && (
                    <div className="mt-1 flex items-center gap-2">
                      <img src={newPosterUrl} alt="Poster" className="w-10 h-10 object-cover rounded border border-gray-700" />
                      <span className="text-[10px] text-emerald-400">Poster frame ready</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer - Always visible */}
            <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-3 shrink-0 bg-[#0e131d]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewItem}
                disabled={!newMediaUrl.trim() || isUploadingMedia}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00B14F]/25 disabled:opacity-50 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Add to Showcase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

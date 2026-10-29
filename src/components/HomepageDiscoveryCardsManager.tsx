import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  Sparkles,
  Smartphone,
  Tablet,
  Watch,
  Eye,
  Check
} from "lucide-react";
import { useDiscoveryCards, DiscoveryCardId } from "../context/DiscoveryCardsContext";
import { UploadService } from "../services/UploadService";

interface CardMeta {
  id: DiscoveryCardId;
  title: string;
  categoryDesc: string;
  icon: typeof Smartphone;
  recommendation: string;
}

const CARDS_META: CardMeta[] = [
  {
    id: "iphone",
    title: "Find my iPhone",
    categoryDesc: "Links to Apple iPhone catalogue",
    icon: Smartphone,
    recommendation: "Recommended: 800×800 or 1:1 clean high-res photo of iPhone device",
  },
  {
    id: "android",
    title: "Look for my Android",
    categoryDesc: "Links to Android smartphones (Samsung, Pixel, etc.)",
    icon: Smartphone,
    recommendation: "Recommended: 800×800 or 1:1 clean high-res photo of Android device",
  },
  {
    id: "ipad",
    title: "Discover my next iPad",
    categoryDesc: "Links to iPad & tablet catalogue",
    icon: Tablet,
    recommendation: "Recommended: 800×800 or 1:1 clean high-res photo of iPad / tablet",
  },
  {
    id: "wrist",
    title: "Search for my Wrist",
    categoryDesc: "Links to smartwatches & wearables catalogue",
    icon: Watch,
    recommendation: "Recommended: 800×800 or 1:1 clean high-res photo of Apple Watch / smartwatch",
  },
];

export default function HomepageDiscoveryCardsManager() {
  const { config, updateCardImage, removeCardImage, loading } = useDiscoveryCards();

  const [activeUploadingCard, setActiveUploadingCard] = useState<DiscoveryCardId | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Individual file input refs for each card
  const fileInputRefs = {
    iphone: useRef<HTMLInputElement | null>(null),
    android: useRef<HTMLInputElement | null>(null),
    ipad: useRef<HTMLInputElement | null>(null),
    wrist: useRef<HTMLInputElement | null>(null),
  };

  const handleFileUpload = async (cardId: DiscoveryCardId, file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setActiveUploadingCard(cardId);
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
        "milito_discovery_cards"
      );

      if (!uploadedMeta || !uploadedMeta.secure_url) {
        throw new Error("Failed to upload discovery card image. Please try again.");
      }

      setUploadProgress(100);

      // Persist directly to Firestore & localStorage
      await updateCardImage(cardId, uploadedMeta.secure_url, uploadedMeta.public_id);

      setSuccessMessage(`"${config.cards[cardId].title}" image uploaded and saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("[HomepageDiscoveryCardsManager] Upload Error:", err);
      setErrorMessage(err.message || "Failed to upload image. Please try again.");
    } finally {
      setActiveUploadingCard(null);
      setUploadProgress(0);
      const inputEl = fileInputRefs[cardId]?.current;
      if (inputEl) inputEl.value = "";
    }
  };

  const handleRemoveImage = async (cardId: DiscoveryCardId) => {
    const cardTitle = config.cards[cardId]?.title || cardId;
    if (!window.confirm(`Are you sure you want to remove the image for "${cardTitle}"?`)) {
      return;
    }

    try {
      await removeCardImage(cardId);
      setSuccessMessage(`Image for "${cardTitle}" removed successfully.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error("[HomepageDiscoveryCardsManager] Remove Error:", err);
      setErrorMessage("Failed to remove image. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-[#1A2025] p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Homepage Section Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Homepage Discovery Cards
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload and manage the 4 visual category images displayed in the{" "}
              <strong className="text-white">"Find your next device"</strong> section on the homepage.
              Changes persist in Firestore and Cloudinary immediately.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-300">
            <span className="block font-bold text-white mb-0.5">Simple Admin Workflow:</span>
            <span className="text-gray-400">Upload Image → Saved & Displayed on Homepage</span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-start gap-3 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#00B14F]" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button onClick={() => setSuccessMessage(null)} className="text-[#00B14F] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS_META.map((meta, index) => {
          const cardData = config.cards[meta.id];
          const hasImage = Boolean(cardData?.imageUrl);
          const isUploading = activeUploadingCard === meta.id;
          const Icon = meta.icon;

          return (
            <div
              key={meta.id}
              className="bg-[#1A2025] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col shadow-lg transition-all duration-300 hover:border-white/20"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00B14F] bg-[#00B14F]/10 px-2.5 py-0.5 rounded-full border border-[#00B14F]/20">
                    Card {index + 1}
                  </span>
                  {hasImage ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Empty
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-white mt-2 leading-tight">
                  {meta.title}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {meta.categoryDesc}
                </p>
              </div>

              {/* Card Image Area (Aspect 1:1 matching homepage) */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group mb-4">
                  {hasImage ? (
                    <>
                      <img
                        src={cardData.imageUrl}
                        alt={meta.title}
                        className="w-full h-full object-cover block"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <a
                          href={cardData.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white backdrop-blur-md transition"
                          title="Open full size"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(meta.id)}
                          className="p-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white backdrop-blur-md transition cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500 select-none">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-2">
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <span className="text-xs font-bold text-gray-300">No Image Uploaded</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Homepage displays clean placeholder</span>
                    </div>
                  )}

                  {/* Uploading Spinner Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
                      <div className="w-8 h-8 border-2 border-[#00B14F] border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs font-bold text-white">Uploading to Cloudinary...</span>
                      <span className="text-[10px] font-mono text-[#00B14F] mt-1">{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRefs[meta.id]}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(meta.id, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="space-y-2 mt-auto">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRefs[meta.id]?.current?.click()}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      hasImage
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                        : "bg-[#00B14F] hover:bg-[#009643] text-black shadow-lg shadow-[#00B14F]/20 font-black"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{hasImage ? "Change Image" : "Upload Image"}</span>
                  </button>

                  {hasImage && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => handleRemoveImage(meta.id)}
                      className="w-full py-2 px-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

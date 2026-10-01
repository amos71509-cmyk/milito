import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Trash2,
  Star,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Maximize2,
  Images,
  Sparkles
} from "lucide-react";
import { CloudinaryImageMeta, getImageCanonicalKey } from "../types";

export interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  isLocal: boolean;
  meta?: CloudinaryImageMeta;
  original_filename?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  status?: "waiting" | "uploading" | "success" | "error";
  errorMessage?: string;
}

interface MediaUploaderProps {
  galleryImages?: CloudinaryImageMeta[];
  thumbnail?: { secure_url: string; public_id: string };
  initialItems?: MediaItem[];
  onChange?: (data: {
    galleryImages: CloudinaryImageMeta[];
    thumbnail: { secure_url: string; public_id: string };
    mediaItems?: MediaItem[];
    localFiles?: File[];
  }) => void;
  onItemsChange?: (items: MediaItem[]) => void;
  onCloudinaryDelete?: (publicId: string) => Promise<void>;
  onUploadSuccess?: (
    uploadedFile: CloudinaryImageMeta,
    newGalleryImages: CloudinaryImageMeta[],
    newThumbnail: { secure_url: string; public_id: string }
  ) => Promise<void> | void;
  uploadStatus?: {
    isUploading: boolean;
    current: number;
    total: number;
    stageText?: string;
    isSuccess?: boolean;
    errorMessage?: string | null;
  };
}

const MAX_IMAGES = 10;

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  galleryImages = [],
  thumbnail,
  initialItems,
  onChange,
  onItemsChange,
  onCloudinaryDelete,
  uploadStatus
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const createdBlobUrlsRef = useRef<Set<string>>(new Set());

  // Convert initial props to unified MediaItem array with deduplication
  const buildInitialItems = (): MediaItem[] => {
    const rawList: MediaItem[] = [];

    if (initialItems && initialItems.length > 0) {
      rawList.push(...initialItems);
    } else if (galleryImages && galleryImages.length > 0) {
      const itemsFromGallery = galleryImages.map((img, idx) => ({
        id: img.public_id || `existing_${idx}_${Date.now()}`,
        previewUrl: img.secure_url,
        isLocal: false,
        meta: img,
        original_filename: img.original_filename || `Photo ${idx + 1}`,
        bytes: img.bytes,
        width: img.width,
        height: img.height,
        format: img.format || "jpg",
        status: "success" as const
      }));
      rawList.push(...itemsFromGallery);
    } else if (thumbnail?.secure_url) {
      rawList.push({
        id: thumbnail.public_id || `thumb_${Date.now()}`,
        previewUrl: thumbnail.secure_url,
        isLocal: false,
        meta: {
          secure_url: thumbnail.secure_url,
          public_id: thumbnail.public_id || "main_cover",
          original_filename: "Main Cover Photo"
        },
        original_filename: "Main Cover Photo",
        format: "jpg",
        status: "success" as const
      });
    }

    const seenKeys = new Set<string>();
    const deduped: MediaItem[] = [];
    for (const it of rawList) {
      const key = getImageCanonicalKey(it.meta?.secure_url || it.previewUrl || it.id);
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        deduped.push(it);
      }
    }
    return deduped;
  };

  const [items, setItems] = useState<MediaItem[]>(buildInitialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomedItem, setZoomedItem] = useState<MediaItem | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
  const activeUploadIds = useRef<Set<string>>(new Set());

  // Sync items if external initial gallery changes and local state is empty
  useEffect(() => {
    if (items.length === 0 && galleryImages.length > 0) {
      const seenKeys = new Set<string>();
      const deduped: MediaItem[] = [];
      galleryImages.forEach((img, idx) => {
        const key = getImageCanonicalKey(img.secure_url || img.public_id);
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          deduped.push({
            id: img.public_id || `existing_${idx}_${Date.now()}`,
            previewUrl: img.secure_url,
            isLocal: false,
            meta: img,
            original_filename: img.original_filename || `Photo ${idx + 1}`,
            bytes: img.bytes,
            width: img.width,
            height: img.height,
            format: img.format || "jpg",
            status: "success"
          });
        }
      });
      setItems(deduped);
    }
  }, [galleryImages]);

  // Clean up any generated blob URLs when component unmounts
  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          // ignore
        }
      });
      createdBlobUrlsRef.current.clear();
    };
  }, []);

  // Helper to format bytes to human-readable string
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Notify parent component of items state changes
  const notifyParent = (newItems: MediaItem[]) => {
    if (onItemsChange) {
      onItemsChange(newItems);
    }

    if (onChange) {
      const finalGalleryImages: CloudinaryImageMeta[] = newItems
        .filter(item => !item.isLocal && item.meta)
        .map(item => item.meta as CloudinaryImageMeta);

      const mainItem = newItems[0];
      const nextThumb = mainItem
        ? {
            secure_url: mainItem.meta?.secure_url || mainItem.previewUrl,
            public_id: mainItem.meta?.public_id || mainItem.id
          }
        : { secure_url: "", public_id: "" };

      const localFiles = newItems
        .filter(item => item.isLocal && item.file)
        .map(item => item.file as File);

      onChange({
        galleryImages: finalGalleryImages,
        thumbnail: nextThumb,
        mediaItems: newItems,
        localFiles
      });
    }
  };

  // Background upload manager for items
  const startBackgroundUploads = async (currentItems: MediaItem[]) => {
    const pendingItems = currentItems.filter(
      it => it.isLocal && it.file && it.status !== "success" && !activeUploadIds.current.has(it.id)
    );

    if (pendingItems.length === 0) return;

    pendingItems.forEach(it => activeUploadIds.current.add(it.id));

    try {
      const { UploadService } = await import("../services/UploadService");

      // Concurrent queue with max 2 parallel uploads
      const queue = [...pendingItems];
      const concurrency = Math.min(2, queue.length);

      const runWorker = async () => {
        while (queue.length > 0) {
          const target = queue.shift();
          if (!target || !target.file) continue;

          // Mark uploading in state
          setItems(prev =>
            prev.map(it => (it.id === target.id ? { ...it, status: "uploading", errorMessage: undefined } : it))
          );

          try {
            const meta = await UploadService.uploadSingleFile(target.file, 0, currentItems.length);

            // Clean up blob URL
            if (target.previewUrl.startsWith("blob:")) {
              try {
                URL.revokeObjectURL(target.previewUrl);
                createdBlobUrlsRef.current.delete(target.previewUrl);
              } catch (e) {
                // ignore
              }
            }

            let updatedItems: MediaItem[] = [];
            setItems(prev => {
              const next = prev.map(it =>
                it.id === target.id
                  ? {
                      ...it,
                      isLocal: false,
                      meta,
                      previewUrl: meta.secure_url,
                      status: "success" as const,
                      errorMessage: undefined
                    }
                  : it
              );
              updatedItems = next;
              return next;
            });
            if (updatedItems.length > 0) {
              notifyParent(updatedItems);
            }
          } catch (err: any) {
            console.warn(`[MediaUploader] Background upload error for ${target.original_filename}:`, err);
            setItems(prev =>
              prev.map(it =>
                it.id === target.id
                  ? { ...it, status: "error" as const, errorMessage: err.message || "Upload failed" }
                  : it
              )
            );
          } finally {
            activeUploadIds.current.delete(target.id);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => runWorker());
      await Promise.all(workers);
    } catch (err) {
      console.error("[MediaUploader] Background upload loop exception:", err);
      pendingItems.forEach(it => activeUploadIds.current.delete(it.id));
    }
  };

  // Handle instant selection of multiple files (1 to 10 photos)
  const handleFilesAdded = (files: FileList | File[]) => {
    setLimitNotice(null);
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    // Filter duplicates by name & size against current items
    const existingSignatures = new Set(
      items.map(it => `${it.original_filename || ""}_${it.bytes || 0}`.toLowerCase())
    );

    const uniqueFiles = fileArray.filter(
      f => !existingSignatures.has(`${f.name}_${f.size}`.toLowerCase())
    );

    const availableSlots = MAX_IMAGES - items.length;

    if (availableSlots <= 0) {
      setLimitNotice(
        `Maximum of ${MAX_IMAGES} photos reached per product. Please delete an existing photo to upload new ones.`
      );
      return;
    }

    let filesToProcess = uniqueFiles;
    if (uniqueFiles.length > availableSlots) {
      filesToProcess = uniqueFiles.slice(0, availableSlots);
      setLimitNotice(
        `Added first ${availableSlots} photo(s) to stay within the ${MAX_IMAGES} photo maximum.`
      );
    }

    // Instantly generate browser object URLs for every selected image (< 5ms)
    const newItems: MediaItem[] = filesToProcess.map((file, idx) => {
      const objUrl = URL.createObjectURL(file);
      createdBlobUrlsRef.current.add(objUrl);

      const ext = file.name.split(".").pop() || "JPG";
      return {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${idx}`,
        file,
        previewUrl: objUrl,
        isLocal: true,
        original_filename: file.name,
        bytes: file.size,
        format: ext.toUpperCase(),
        status: "waiting"
      };
    });

    const updated = [...items, ...newItems];
    setItems(updated);
    notifyParent(updated);

    // Trigger seamless background upload
    startBackgroundUploads(updated);
  };

  // Dedicated single-file retry handler
  const handleRetrySingle = async (index: number) => {
    const target = items[index];
    if (!target || !target.file) return;

    setRetryingIndex(index);
    const updated = [...items];
    updated[index] = { ...target, status: "uploading", errorMessage: undefined };
    setItems(updated);

    try {
      const { UploadService } = await import("../services/UploadService");
      const meta = await UploadService.uploadSingleFile(target.file, index, items.length);

      const successUpdated = [...items];
      successUpdated[index] = {
        ...target,
        isLocal: false,
        meta,
        previewUrl: meta.secure_url,
        status: "success",
        errorMessage: undefined
      };
      setItems(successUpdated);
      notifyParent(successUpdated);
    } catch (err: any) {
      const failUpdated = [...items];
      failUpdated[index] = {
        ...target,
        status: "error",
        errorMessage: err.message || "Upload failed"
      };
      setItems(failUpdated);
    } finally {
      setRetryingIndex(null);
    }
  };

  // Drag & Drop handlers
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
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Set an image as the MAIN product image (promoted to index 0)
  const handleSetMain = (index: number) => {
    if (index <= 0 || index >= items.length) return;
    const target = items[index];
    const remaining = items.filter((_, idx) => idx !== index);
    const updated = [target, ...remaining];
    setItems(updated);
    notifyParent(updated);
  };

  // Delete an individual image (instantly rearranges remaining images)
  const handleRemoveItem = async (index: number) => {
    const target = items[index];
    if (!target) return;

    // Revoke object URL if it was a local file preview
    if (target.isLocal && target.previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(target.previewUrl);
        createdBlobUrlsRef.current.delete(target.previewUrl);
      } catch (err) {
        // ignore
      }
    } else if (!target.isLocal && target.meta?.public_id && onCloudinaryDelete) {
      onCloudinaryDelete(target.meta.public_id).catch(console.warn);
    }

    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    notifyParent(updated);
  };

  // Reorder images
  const handleMoveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setItems(copy);
    notifyParent(copy);
  };

  // Handle single file replacement
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const oldItem = items[replacingIndex];
    if (oldItem && oldItem.isLocal && oldItem.previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(oldItem.previewUrl);
        createdBlobUrlsRef.current.delete(oldItem.previewUrl);
      } catch (err) {
        // ignore
      }
    } else if (oldItem && !oldItem.isLocal && oldItem.meta?.public_id && onCloudinaryDelete) {
      onCloudinaryDelete(oldItem.meta.public_id).catch(console.warn);
    }

    const objUrl = URL.createObjectURL(file);
    createdBlobUrlsRef.current.add(objUrl);

    const ext = file.name.split(".").pop() || "JPG";
    const replacedItem: MediaItem = {
      id: `local_rep_${Date.now()}`,
      file,
      previewUrl: objUrl,
      isLocal: true,
      original_filename: file.name,
      bytes: file.size,
      format: ext.toUpperCase(),
      status: "waiting"
    };

    const copy = [...items];
    copy[replacingIndex] = replacedItem;
    setItems(copy);
    notifyParent(copy);
    setReplacingIndex(null);
  };

  const totalCount = items.length;

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={replaceInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* HEADER COUNTER & STATUS BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00B14F]/10 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
            <Images className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Product Image Gallery</span>
            <span className="text-[10px] text-gray-400">Select 1 to 10 photos • Previews appear instantly</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
              totalCount >= MAX_IMAGES
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : totalCount > 0
                ? "bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/30"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <span>{totalCount} / {MAX_IMAGES} photos selected</span>
          </div>
        </div>
      </div>

      {/* LIMIT NOTICE */}
      {limitNotice && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{limitNotice}</span>
        </div>
      )}

      {/* UPLOAD & SELECTION DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer group ${
          isDragging
            ? "border-[#00B14F] bg-[#00B14F]/10 scale-[1.01]"
            : totalCount >= MAX_IMAGES
            ? "border-gray-800 bg-gray-950/50 opacity-60 cursor-not-allowed"
            : "border-gray-700 hover:border-[#00B14F] bg-gray-900/60 hover:bg-gray-900/80"
        }`}
        onClick={() => {
          if (totalCount < MAX_IMAGES) {
            fileInputRef.current?.click();
          } else {
            setLimitNotice(`Maximum of ${MAX_IMAGES} photos reached. Please delete an existing photo to add more.`);
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={e => {
            if (e.target.files) {
              handleFilesAdded(e.target.files);
              e.target.value = "";
            }
          }}
          className="hidden"
          disabled={totalCount >= MAX_IMAGES}
        />

        <div className="w-12 h-12 rounded-2xl bg-[#00B14F]/10 border border-[#00B14F]/30 text-[#00B14F] flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-bold text-white mb-1">
          {totalCount >= MAX_IMAGES ? "Maximum 10 Photos Selected" : "Upload Product Images"}
        </h4>
        <p className="text-xs text-gray-400 mb-2">
          {totalCount >= MAX_IMAGES
            ? "Delete an image below to select a replacement"
            : (
              <>
                Drag & drop or <span className="text-[#00B14F] font-bold underline">click to choose up to 10 photos</span>
              </>
            )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-500 font-medium">
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">Select multiple files at once</span>
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">Instant Local Preview</span>
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">JPG, PNG, WEBP</span>
        </div>
      </div>

      {/* UPLOAD PROGRESS / PUBLISH STAGE INDICATOR (IF ACTIVE) */}
      {uploadStatus?.isUploading && (
        <div className="p-4 bg-gray-900 border border-[#00B14F]/40 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#00B14F] animate-spin" />
              {uploadStatus.stageText || "Uploading images to Cloudinary..."}
            </span>
            <span className="font-mono font-bold text-[#00B14F]">
              {uploadStatus.current} / {uploadStatus.total} uploaded
            </span>
          </div>

          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00B14F] transition-all duration-300"
              style={{
                width: `${uploadStatus.total > 0 ? (uploadStatus.current / uploadStatus.total) * 100 : 25}%`
              }}
            />
          </div>
        </div>
      )}

      {/* SUCCESS BANNER AFTER UPLOAD */}
      {uploadStatus?.isSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Images uploaded successfully</span>
        </div>
      )}

      {/* SELECTED IMAGES PREVIEW AREA (RENDERED UNDERNEATH UPLOAD SECTION) */}
      {items.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B14F]" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Selected Images ({items.length} / {MAX_IMAGES})
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              First image is <strong className="text-emerald-400 font-bold">MAIN</strong> • Click "Set as Main" or arrows to change order
            </span>
          </div>

          {/* RESPONSIVE GRID: 2 COLS ON MOBILE, 3-5 ON LARGER SCREENS (NO HORIZONTAL OVERFLOW) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item, index) => {
              const isMain = index === 0;

              return (
                <div
                  key={item.id || index}
                  className={`group relative bg-gray-900 border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
                    isMain
                      ? "border-[#00B14F] ring-2 ring-[#00B14F]/40 shadow-lg shadow-[#00B14F]/10 bg-gray-900/90"
                      : "border-gray-800 hover:border-gray-700 bg-gray-900/60"
                  }`}
                >
                  {/* Visual Header Badge: MAIN vs Gallery Image 2, 3, etc. */}
                  <div className="px-2.5 py-1.5 bg-black/70 border-b border-gray-800/80 flex items-center justify-between gap-1 z-10">
                    <div className="flex items-center gap-1.5">
                      {isMain ? (
                        <span className="bg-[#00B14F] text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          MAIN
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-gray-300 border border-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Photo {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Quick Remove Button (always accessible) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(index);
                      }}
                      className="p-1 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Remove this image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Image Display Container */}
                  <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={item.previewUrl}
                      alt={item.original_filename || `Selected image ${index + 1}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Status Badge Overlays */}
                    {retryingIndex === index || item.status === "uploading" ? (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5 z-20">
                        <RefreshCw className="w-6 h-6 text-[#00B14F] animate-spin" />
                        <span className="text-[10px] font-bold text-[#00B14F]">Uploading...</span>
                      </div>
                    ) : item.status === "error" ? (
                      <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-1.5 text-center gap-1 z-20 overflow-hidden">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-[10px] font-black text-red-200 uppercase tracking-wider">Upload Failed</span>
                        {item.errorMessage && (
                          <span
                            className="text-[9px] text-red-300 line-clamp-2 px-1 leading-tight max-w-full break-words"
                            title={item.errorMessage}
                          >
                            {item.errorMessage}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetrySingle(index);
                          }}
                          className="mt-0.5 px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-[9px] font-extrabold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          Retry
                        </button>
                      </div>
                    ) : !item.isLocal || item.status === "success" ? (
                      <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm z-10">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        Cloudinary
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10">
                        Ready
                      </div>
                    )}

                    {/* Promotion button: "Set as Main" for non-main items */}
                    {!isMain && item.status !== "uploading" && retryingIndex !== index && (
                      <button
                        type="button"
                        onClick={() => handleSetMain(index)}
                        className="absolute top-2 left-2 bg-black/75 hover:bg-[#00B14F] text-white hover:text-black text-[9px] font-extrabold px-2 py-1 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 z-10 shadow-md cursor-pointer"
                        title="Promote to Main Product Image"
                      >
                        <Star className="w-2.5 h-2.5" />
                        Set as Main
                      </button>
                    )}

                    {/* Hover Action Overlay */}
                    {item.status !== "uploading" && retryingIndex !== index && (
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[1px]">
                        {/* Zoom Lightbox Button */}
                        <button
                          type="button"
                          onClick={() => setZoomedItem(item)}
                          className="p-2 bg-gray-900/90 hover:bg-white text-white hover:text-black rounded-xl transition-all shadow-md cursor-pointer"
                          title="View Large Preview"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>

                        {/* If local and not uploaded, allow direct single upload button */}
                        {item.isLocal && item.file && (
                          <button
                            type="button"
                            onClick={() => handleRetrySingle(index)}
                            className="p-2 bg-gray-900/90 hover:bg-[#00B14F] text-white hover:text-black rounded-xl transition-all shadow-md cursor-pointer"
                            title="Upload this photo now"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Replace File Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingIndex(index);
                            replaceInputRef.current?.click();
                          }}
                          className="p-2 bg-gray-900/90 hover:bg-amber-500 text-white hover:text-black rounded-xl transition-all shadow-md cursor-pointer"
                          title="Replace this image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button in Overlay */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 bg-red-600/90 hover:bg-red-500 text-white rounded-xl transition-all shadow-md cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Reorder Arrows on Hover */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveItem(index, index - 1)}
                        className="p-1 bg-black/80 text-white rounded-lg hover:bg-[#00B14F] hover:text-black disabled:opacity-20 transition-all shadow-sm cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => handleMoveItem(index, index + 1)}
                        className="p-1 bg-black/80 text-white rounded-lg hover:bg-[#00B14F] hover:text-black disabled:opacity-20 transition-all shadow-sm cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="p-2 bg-gray-950/90 border-t border-gray-800 text-[10px] space-y-0.5">
                    <p className="font-bold text-gray-200 truncate" title={item.original_filename}>
                      {item.original_filename || `Photo #${index + 1}`}
                    </p>
                    <div className="flex justify-between items-center text-gray-500 font-mono text-[9px]">
                      <span>{formatBytes(item.bytes)}</span>
                      <span
                        className={`font-extrabold uppercase ${
                          !item.isLocal || item.status === "success"
                            ? "text-[#00B14F]"
                            : item.status === "error"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {!item.isLocal || item.status === "success" ? "Cloudinary ✓" : item.status === "error" ? "Failed" : "Ready"}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL PREVIEW LIGHTBOX MODAL */}
      {zoomedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#00B14F]" />
                <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                  {zoomedItem.original_filename || "Image Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setZoomedItem(null)}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-auto min-h-[300px]">
              <img
                src={zoomedItem.previewUrl}
                alt="Full Preview"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>

            {/* Modal Specs Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Filename</span>
                <span className="font-mono text-gray-300 text-[11px] truncate block">
                  {zoomedItem.original_filename || "Image"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">File Size</span>
                <span className="font-mono text-gray-300 text-[11px]">
                  {formatBytes(zoomedItem.bytes)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Status</span>
                <span
                  className={`font-mono text-[11px] uppercase font-bold ${
                    zoomedItem.isLocal ? "text-amber-400" : "text-[#00B14F]"
                  }`}
                >
                  {zoomedItem.isLocal ? "Local Ready for Upload" : "Cloudinary Stored"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

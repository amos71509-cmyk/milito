import React, { useState, useRef } from "react";
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
  Maximize2
} from "lucide-react";
import { CloudinaryImageMeta } from "../types";
import { UploadService } from "../services/UploadService";

interface UploadingQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  errorMessage?: string;
  controller?: AbortController;
}

interface MediaUploaderProps {
  galleryImages: CloudinaryImageMeta[];
  thumbnail?: { secure_url: string; public_id: string };
  onChange: (data: {
    galleryImages: CloudinaryImageMeta[];
    thumbnail: { secure_url: string; public_id: string };
  }) => void;
  onCloudinaryDelete?: (publicId: string) => Promise<void>;
  onUploadSuccess?: (
    uploadedFile: CloudinaryImageMeta,
    newGalleryImages: CloudinaryImageMeta[],
    newThumbnail: { secure_url: string; public_id: string }
  ) => Promise<void> | void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  galleryImages = [],
  thumbnail,
  onChange,
  onCloudinaryDelete,
  onUploadSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const [queue, setQueue] = useState<UploadingQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<CloudinaryImageMeta | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [deletingPublicIds, setDeletingPublicIds] = useState<Set<string>>(new Set());

  // Determine active primary thumbnail
  const activeThumbnail = thumbnail?.secure_url
    ? thumbnail
    : galleryImages[0]
    ? { secure_url: galleryImages[0].secure_url, public_id: galleryImages[0].public_id }
    : { secure_url: "", public_id: "" };

  // Helper to format bytes to human-readable string
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Helper to trigger parent state update with new gallery images & thumbnail
  const updateParent = (newImages: CloudinaryImageMeta[], customThumb?: { secure_url: string; public_id: string }) => {
    const nextThumb = customThumb || (newImages.length > 0
      ? { secure_url: newImages[0].secure_url, public_id: newImages[0].public_id }
      : { secure_url: "", public_id: "" });

    onChange({
      galleryImages: newImages,
      thumbnail: nextThumb
    });

    return nextThumb;
  };

  // Upload single file via centralized UploadService
  const uploadSingleFile = async (
    queueId: string,
    file: File,
    replaceIdx?: number
  ) => {
    setQueue(prev =>
      prev.map(q =>
        q.id === queueId
          ? { ...q, progress: 35, status: "uploading" }
          : q
      )
    );

    try {
      const uploadedMetas = await UploadService.uploadToCloudinary([file], (prog) => {
        setQueue(prev =>
          prev.map(q => (q.id === queueId ? { ...q, progress: Math.min(prog, 90) } : q))
        );
      });

      if (!uploadedMetas || uploadedMetas.length === 0) {
        throw new Error("Upload service unavailable.");
      }

      const uploadedFile = uploadedMetas[0];

      setQueue(prev =>
        prev.map(q => (q.id === queueId ? { ...q, progress: 100, status: "success" } : q))
      );

      // Clear completed queue item after delay
      setTimeout(() => {
        setQueue(prev => prev.filter(q => q.id !== queueId));
      }, 1200);

      if (replaceIdx !== undefined && replaceIdx >= 0 && replaceIdx < galleryImages.length) {
        // Replacing existing image
        const oldImage = galleryImages[replaceIdx];
        if (oldImage?.public_id) {
          UploadService.deleteCloudinaryImages([oldImage.public_id]).catch(console.warn);
          if (onCloudinaryDelete) {
            onCloudinaryDelete(oldImage.public_id).catch(console.warn);
          }
        }
        const updated = [...galleryImages];
        updated[replaceIdx] = uploadedFile;
        const nextThumb = updateParent(updated);
        if (onUploadSuccess) {
          onUploadSuccess(uploadedFile, updated, nextThumb);
        }
      } else {
        // Appending to gallery
        const updated = [...galleryImages, uploadedFile];
        const nextThumb = updateParent(updated);
        if (onUploadSuccess) {
          onUploadSuccess(uploadedFile, updated, nextThumb);
        }
      }
    } catch (err: any) {
      console.error("[MediaUploader] Upload Error:", err);
      const userErr = err.message || "Upload service unavailable.";
      setQueue(prev =>
        prev.map(q =>
          q.id === queueId
            ? { ...q, status: "error", errorMessage: userErr }
            : q
        )
      );
    }
  };

  // Handle file selection
  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    fileArray.forEach(file => {
      const queueId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const queueItem: UploadingQueueItem = {
        id: queueId,
        file,
        progress: 10,
        status: "uploading"
      };

      setQueue(prev => [...prev, queueItem]);
      uploadSingleFile(queueId, file);
    });
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

  // Cancel queued upload
  const handleCancelUpload = (queueId: string) => {
    const item = queue.find(q => q.id === queueId);
    if (item?.controller) {
      item.controller.abort();
    }
    setQueue(prev => prev.filter(q => q.id !== queueId));
  };

  // Set as Primary Thumbnail
  const handleSetThumbnail = (img: CloudinaryImageMeta, index: number) => {
    const customThumb = { secure_url: img.secure_url, public_id: img.public_id };
    // Move selected image to position 0 for optimal gallery order
    const remaining = galleryImages.filter((_, idx) => idx !== index);
    const reordered = [img, ...remaining];
    updateParent(reordered, customThumb);
  };

  // Delete image from Cloudinary & Gallery
  const handleDeleteImage = async (index: number) => {
    const target = galleryImages[index];
    if (!target) return;

    if (target.public_id) {
      setDeletingPublicIds(prev => new Set(prev).add(target.public_id));
      try {
        await UploadService.deleteCloudinaryImages([target.public_id]);
        if (onCloudinaryDelete) {
          await onCloudinaryDelete(target.public_id);
        }
      } catch (err) {
        console.warn("Cloudinary delete error:", err);
      } finally {
        setDeletingPublicIds(prev => {
          const next = new Set(prev);
          next.delete(target.public_id);
          return next;
        });
      }
    }

    const nextGallery = galleryImages.filter((_, i) => i !== index);
    updateParent(nextGallery);
  };

  // Reorder Images
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= galleryImages.length) return;
    const copy = [...galleryImages];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    updateParent(copy);
  };

  // Handle Replacement File
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const queueId = `replace_${Date.now()}`;
    setQueue(prev => [
      ...prev,
      { id: queueId, file, progress: 10, status: "uploading" }
    ]);
    uploadSingleFile(queueId, file, replacingIndex);
    setReplacingIndex(null);
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={replaceInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group ${
          isDragging
            ? "border-[#00B14F] bg-[#00B14F]/10 scale-[1.01]"
            : "border-gray-700 hover:border-[#00B14F] bg-gray-900/60 hover:bg-gray-900/80"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={e => e.target.files && handleFilesAdded(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-[#00B14F]/10 border border-[#00B14F]/30 text-[#00B14F] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-bold text-white mb-1">
          Drag & Drop Product Photos Here
        </h4>
        <p className="text-xs text-gray-400 mb-2">
          or <span className="text-[#00B14F] font-bold underline">click to browse</span> from your computer or phone
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-500 font-medium">
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">JPG, PNG, WEBP</span>
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">Auto Cloudinary Optimization</span>
          <span className="bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">Unlimited Photos</span>
        </div>
      </div>

      {/* Live Upload Progress Queue */}
      {queue.length > 0 && (
        <div className="space-y-2 bg-gray-950 p-4 rounded-xl border border-gray-800">
          <span className="text-xs font-bold text-gray-300 block mb-2 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#00B14F] animate-spin" />
            Active Cloudinary Upload Queue ({queue.length})
          </span>

          {queue.map(item => (
            <div
              key={item.id}
              className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {item.file.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        item.status === "error"
                          ? "text-red-400"
                          : item.status === "success"
                          ? "text-emerald-400"
                          : "text-[#00B14F]"
                      }`}
                    >
                      {item.status === "error"
                        ? "Failed"
                        : item.status === "success"
                        ? "Uploaded!"
                        : `${item.progress}%`}
                    </span>
                  </div>

                  {item.status === "error" ? (
                    <div className="mt-1 p-2 bg-red-950/80 border border-red-500/50 rounded-lg text-xs font-mono space-y-0.5 animate-fadeIn">
                      <div className="font-bold text-red-400 flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>✓ Upload failed.</span>
                      </div>
                      <div className="text-gray-300 font-semibold text-[10px]">Reason:</div>
                      <div className="text-red-300 text-[10px] leading-relaxed break-words">
                        {item.errorMessage || "Upload service unavailable."}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.status === "success" ? "bg-emerald-500" : "bg-[#00B14F]"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.status === "error" && (
                  <button
                    type="button"
                    onClick={() => uploadSingleFile(item.id, item.file)}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black rounded-lg text-[10px] font-bold transition-all"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCancelUpload(item.id)}
                  className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Cancel Upload"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Showcase Grid */}
      {galleryImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B14F]" />
              Uploaded Gallery ({galleryImages.length} Photos)
            </span>
            <span className="text-[11px] text-gray-400">
              Drag or click arrows to reorder • 1st image is Thumbnail
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryImages.map((img, index) => {
              const isThumbnail = activeThumbnail.public_id
                ? activeThumbnail.public_id === img.public_id
                : index === 0;
              const isDeleting = deletingPublicIds.has(img.public_id);

              return (
                <div
                  key={img.public_id || index}
                  className={`group relative bg-gray-900 border rounded-2xl overflow-hidden flex flex-col transition-all ${
                    isThumbnail
                      ? "border-[#00B14F] ring-2 ring-[#00B14F]/40 shadow-lg shadow-[#00B14F]/10"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Image Canvas Container */}
                  <div className="relative aspect-square bg-black overflow-hidden cursor-pointer">
                    <img
                      src={img.secure_url}
                      alt={img.original_filename || `Product Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Thumbnail Badge */}
                    {isThumbnail ? (
                      <div className="absolute top-2 left-2 bg-[#00B14F] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-10">
                        <Star className="w-3 h-3 fill-black" />
                        PRIMARY THUMBNAIL
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetThumbnail(img, index)}
                        className="absolute top-2 left-2 bg-black/60 hover:bg-[#00B14F] text-white hover:text-black text-[9px] font-extrabold px-2 py-1 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 z-10"
                      >
                        <Star className="w-3 h-3" />
                        Set Thumbnail
                      </button>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                      {/* Zoom Modal Button */}
                      <button
                        type="button"
                        onClick={() => setZoomedImage(img)}
                        className="p-2 bg-gray-900/90 hover:bg-white text-white hover:text-black rounded-xl transition-all shadow-md"
                        title="Zoom / Preview Image"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      {/* Replace Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingIndex(index);
                          replaceInputRef.current?.click();
                        }}
                        className="p-2 bg-gray-900/90 hover:bg-amber-500 text-white hover:text-black rounded-xl transition-all shadow-md"
                        title="Replace Image"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteImage(index)}
                        className="p-2 bg-red-600/90 hover:bg-red-500 text-white rounded-xl transition-all shadow-md disabled:opacity-50"
                        title="Delete from Cloudinary"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Reorder Arrows on Mobile / Hover */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveImage(index, index - 1)}
                        className="p-1 bg-black/80 text-white rounded-lg hover:bg-[#00B14F] hover:text-black disabled:opacity-20 transition-all"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === galleryImages.length - 1}
                        onClick={() => handleMoveImage(index, index + 1)}
                        className="p-1 bg-black/80 text-white rounded-lg hover:bg-[#00B14F] hover:text-black disabled:opacity-20 transition-all"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Card Footer */}
                  <div className="p-2.5 bg-gray-950/80 border-t border-gray-800/80 text-[10px] space-y-0.5">
                    <p className="font-bold text-gray-200 truncate">
                      {img.original_filename || `Photo #${index + 1}`}
                    </p>
                    <div className="flex justify-between text-gray-500 font-mono">
                      <span>{img.width && img.height ? `${img.width}x${img.height}` : "HD"}</span>
                      <span>{formatBytes(img.bytes)}</span>
                      <span className="uppercase text-[#00B14F] font-extrabold">{img.format || "WEBP"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom / Full Preview Lightbox Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#00B14F]" />
                <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                  {zoomedImage.original_filename || zoomedImage.public_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-auto min-h-[300px]">
              <img
                src={zoomedImage.secure_url}
                alt="Full Preview"
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </div>

            {/* Modal Specs Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Public ID</span>
                <span className="font-mono text-gray-300 text-[11px] truncate block">{zoomedImage.public_id}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Dimensions</span>
                <span className="font-mono text-gray-300 text-[11px]">{zoomedImage.width || 0} x {zoomedImage.height || 0} px</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">File Size</span>
                <span className="font-mono text-gray-300 text-[11px]">{formatBytes(zoomedImage.bytes)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">CDN Format</span>
                <span className="font-mono text-[#00B14F] text-[11px] uppercase font-bold">{zoomedImage.format || "PNG/WEBP"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

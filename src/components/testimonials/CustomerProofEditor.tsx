import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Crop,
  Square,
  Eye,
  RotateCcw,
  Check,
  Shield,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  Paintbrush,
  Move,
  Maximize2
} from "lucide-react";
import { RedactionBox, RedactionStroke } from "../../types";
import { UploadService } from "../../services/UploadService";

interface CustomerProofEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string; // Original screenshot source URL or blob URL
  onSaveSanitizedImage: (result: {
    publicImageUrl: string;
    publicImagePublicId?: string;
    sanitizedBlobUrl: string;
  }) => void;
}

type ToolMode = "redact-rect" | "redact-brush" | "crop" | "preview";
type RedactionStyle = "solid-black" | "blur" | "dark-gray";

export default function CustomerProofEditor({
  isOpen,
  onClose,
  imageSrc,
  onSaveSanitizedImage
}: CustomerProofEditorProps) {
  const [activeTool, setActiveTool] = useState<ToolMode>("redact-rect");
  const [redactionStyle, setRedactionStyle] = useState<RedactionStyle>("solid-black");
  const [brushSize, setBrushSize] = useState<number>(24);

  // Redactions State
  const [redactionBoxes, setRedactionBoxes] = useState<RedactionBox[]>([]);
  const [redactionStrokes, setRedactionStrokes] = useState<RedactionStroke[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  // Crop State (in percentage 0..100)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [cropApplied, setCropApplied] = useState(false);

  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{ x: number; y: number }[]>([]);

  // Processing & Uploading
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ text: string; percent: number }>({
    text: "",
    percent: 0
  });
  const [flattenedPreviewUrl, setFlattenedPreviewUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setRedactionBoxes([]);
      setRedactionStrokes([]);
      setCropRect({ x: 0, y: 0, width: 100, height: 100 });
      setCropApplied(false);
      setActiveTool("redact-rect");
      setFlattenedPreviewUrl(null);
    }
  }, [isOpen, imageSrc]);

  // Helper: Convert client coordinates to percentage relative to displayed image
  const getImageRelativeCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    return { x, y };
  };

  // Pointer Handlers for drawing redactions or adjusting crop
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === "preview") return;
    const coords = getImageRelativeCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStart(coords);

    if (activeTool === "redact-rect") {
      setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
    } else if (activeTool === "redact-brush") {
      setCurrentStrokePoints([coords]);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStart) return;
    const coords = getImageRelativeCoords(e);
    if (!coords) return;

    if (activeTool === "redact-rect") {
      const minX = Math.min(currentStart.x, coords.x);
      const minY = Math.min(currentStart.y, coords.y);
      const width = Math.abs(coords.x - currentStart.x);
      const height = Math.abs(coords.y - currentStart.y);
      setCurrentBox({ x: minX, y: minY, width, height });
    } else if (activeTool === "redact-brush") {
      setCurrentStrokePoints((prev) => [...prev, coords]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === "redact-rect" && currentBox) {
      if (currentBox.width > 1 && currentBox.height > 1) {
        const newBox: RedactionBox = {
          id: `box_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.width,
          height: currentBox.height,
          style: redactionStyle
        };
        setRedactionBoxes((prev) => [...prev, newBox]);
      }
      setCurrentBox(null);
    } else if (activeTool === "redact-brush" && currentStrokePoints.length > 0) {
      const newStroke: RedactionStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        points: currentStrokePoints,
        radius: brushSize,
        style: redactionStyle
      };
      setRedactionStrokes((prev) => [...prev, newStroke]);
      setCurrentStrokePoints([]);
    }

    setCurrentStart(null);
  };

  // Delete a specific redaction
  const handleDeleteBox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRedactionBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  // Undo last action
  const handleUndo = () => {
    if (redactionStrokes.length > 0) {
      setRedactionStrokes((prev) => prev.slice(0, -1));
    } else if (redactionBoxes.length > 0) {
      setRedactionBoxes((prev) => prev.slice(0, -1));
    }
  };

  // Clear all redactions
  const handleClearAll = () => {
    setRedactionBoxes([]);
    setRedactionStrokes([]);
  };

  /**
   * CRITICAL SECURITY IMPLEMENTATION:
   * Physically renders and permanently flattens the image onto an HTML5 Canvas.
   * All redacted coordinates are permanently painted over with solid black/opaque pixels
   * or pixelated color blocks so that NO sensitive data remains in the exported image buffer.
   */
  const generateFlattenedCanvas = async (): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const naturalWidth = img.naturalWidth || 1200;
        const naturalHeight = img.naturalHeight || 1600;

        // Apply crop calculations
        const cropX = (cropRect.x / 100) * naturalWidth;
        const cropY = (cropRect.y / 100) * naturalHeight;
        const cropW = (cropRect.width / 100) * naturalWidth;
        const cropH = (cropRect.height / 100) * naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(cropW);
        canvas.height = Math.round(cropH);
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return reject(new Error("Could not initialize canvas context"));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 1. Draw base cropped image
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        // 2. Permanently paint Rectangular Redactions
        redactionBoxes.forEach((box) => {
          // Calculate box relative to full image, then translate to cropped canvas space
          const boxAbsX = (box.x / 100) * naturalWidth;
          const boxAbsY = (box.y / 100) * naturalHeight;
          const boxAbsW = (box.width / 100) * naturalWidth;
          const boxAbsH = (box.height / 100) * naturalHeight;

          const targetX = boxAbsX - cropX;
          const targetY = boxAbsY - cropY;

          // Paint solid blackout
          if (box.style === "dark-gray") {
            ctx.fillStyle = "#1E293B";
          } else {
            ctx.fillStyle = "#0B0F17"; // Solid deep black
          }
          ctx.fillRect(targetX, targetY, boxAbsW, boxAbsH);

          // Add clean security marker lines
          ctx.strokeStyle = "#10B981"; // MILITO green accent line
          ctx.lineWidth = Math.max(1.5, Math.min(3, boxAbsH * 0.04));
          ctx.strokeRect(targetX, targetY, boxAbsW, boxAbsH);
        });

        // 3. Permanently paint Freehand / Brush Redactions
        redactionStrokes.forEach((stroke) => {
          if (stroke.points.length === 0) return;
          ctx.fillStyle = stroke.style === "dark-gray" ? "#1E293B" : "#0B0F17";
          ctx.strokeStyle = stroke.style === "dark-gray" ? "#1E293B" : "#0B0F17";
          ctx.lineWidth = (stroke.radius / 100) * naturalWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          const first = stroke.points[0];
          const firstX = (first.x / 100) * naturalWidth - cropX;
          const firstY = (first.y / 100) * naturalHeight - cropY;
          ctx.moveTo(firstX, firstY);

          for (let i = 1; i < stroke.points.length; i++) {
            const pt = stroke.points[i];
            const ptX = (pt.x / 100) * naturalWidth - cropX;
            const ptY = (pt.y / 100) * naturalHeight - cropY;
            ctx.lineTo(ptX, ptY);
          }
          ctx.stroke();
        });

        // Export as permanent high-quality JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to export flattened canvas"));
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          0.92
        );
      };

      img.onerror = (e) => reject(new Error("Failed to load source image into canvas"));
      img.src = imageSrc;
    });
  };

  // Preview the flattened output
  const handleGeneratePreview = async () => {
    try {
      setIsExporting(true);
      setExportProgress({ text: "Flattening sensitive areas...", percent: 40 });
      const { dataUrl } = await generateFlattenedCanvas();
      setFlattenedPreviewUrl(dataUrl);
      setActiveTool("preview");
      setExportProgress({ text: "Preview ready", percent: 100 });
    } catch (err: any) {
      alert("Failed to render preview: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Save and Upload permanently sanitized image to Cloudinary
  const handleSaveAndUploadSanitized = async () => {
    try {
      setIsExporting(true);
      setExportProgress({ text: "Generating sanitized proof...", percent: 20 });

      const { blob, dataUrl } = await generateFlattenedCanvas();

      setExportProgress({ text: "Uploading secure public image...", percent: 50 });

      // Create a clean safe File object
      const safeFilename = `proof_${Date.now()}_sanitized.jpg`;
      const file = new File([blob], safeFilename, { type: "image/jpeg" });

      // Upload to Cloudinary using UploadService with real percentage
      const uploadResult = await UploadService.uploadSingleFile(
        file,
        0,
        1,
        2,
        (percent) => {
          setExportProgress({
            text: `Uploading to CDN (${percent}%)...`,
            percent: Math.min(95, Math.floor(50 + percent * 0.45))
          });
        },
        "milito_testimonials_public"
      );

      setExportProgress({ text: "Proof sanitized & uploaded!", percent: 100 });

      onSaveSanitizedImage({
        publicImageUrl: uploadResult.secure_url,
        publicImagePublicId: uploadResult.public_id,
        sanitizedBlobUrl: dataUrl
      });

      onClose();
    } catch (err: any) {
      console.error("[CustomerProofEditor] Upload error:", err);
      alert("Failed to upload sanitized proof: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0B0F17]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-milito-green/20 text-milito-green">
                <Shield className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-white tracking-wide">Prepare Customer Proof</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Remove private information (phone numbers, account numbers, private chat) before publishing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#111827] border-b border-gray-800">
          {/* Tool selectors */}
          <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => {
                setActiveTool("redact-rect");
                setFlattenedPreviewUrl(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "redact-rect"
                  ? "bg-milito-green text-gray-950 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Redact Box</span>
            </button>

            <button
              onClick={() => {
                setActiveTool("redact-brush");
                setFlattenedPreviewUrl(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "redact-brush"
                  ? "bg-milito-green text-gray-950 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Brush Blackout</span>
            </button>

            <button
              onClick={handleGeneratePreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "preview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Public</span>
            </button>
          </div>

          {/* Style & Action Tools */}
          <div className="flex items-center gap-3">
            {activeTool === "redact-brush" && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Brush:</span>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 accent-milito-green"
                />
                <span className="text-[10px] text-gray-400">{brushSize}px</span>
              </div>
            )}

            <button
              onClick={handleUndo}
              disabled={redactionBoxes.length === 0 && redactionStrokes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Undo last redaction"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleClearAll}
              disabled={redactionBoxes.length === 0 && redactionStrokes.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Clear all redactions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Canvas / Image Work Area */}
        <div className="relative flex-1 bg-[#090D16] p-4 flex items-center justify-center overflow-auto min-h-[380px] max-h-[55vh]">
          {activeTool === "preview" && flattenedPreviewUrl ? (
            <div className="relative flex flex-col items-center">
              <div className="relative border-2 border-milito-green rounded-xl overflow-hidden shadow-2xl max-h-[48vh]">
                <img
                  src={flattenedPreviewUrl}
                  alt="Flattened Sanitized Public Proof"
                  className="max-h-[48vh] w-auto object-contain"
                />
                <div className="absolute top-2 right-2 bg-milito-green text-gray-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow">
                  SANITIZED PUBLIC VERSION
                </div>
              </div>
              <p className="text-xs text-milito-green/90 mt-3 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" /> All sensitive pixels permanently redacted and unrecoverable.
              </p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative inline-block select-none cursor-crosshair border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-h-[48vh]"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source Proof to Redact"
                className="max-h-[48vh] w-auto object-contain pointer-events-none block"
                draggable={false}
              />

              {/* Render Existing Redaction Boxes */}
              {redactionBoxes.map((box) => (
                <div
                  key={box.id}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`
                  }}
                  className="absolute bg-gray-950 border-2 border-milito-green shadow-lg flex items-center justify-center group"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded-md">
                    <button
                      onClick={(e) => handleDeleteBox(box.id, e)}
                      className="text-rose-400 hover:text-rose-300 p-0.5"
                      title="Remove redaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[9px] font-black text-milito-green uppercase tracking-tighter opacity-70 select-none">
                    REDACTED
                  </span>
                </div>
              ))}

              {/* Render Existing Freehand Strokes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {redactionStrokes.map((stroke) => (
                  <polyline
                    key={stroke.id}
                    points={stroke.points.map((p) => `${p.x}%,${p.y}%`).join(" ")}
                    stroke="#0B0F17"
                    strokeWidth={`${stroke.radius * 0.75}px`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}

                {/* Current Active Drawing Stroke */}
                {isDrawing && activeTool === "redact-brush" && currentStrokePoints.length > 0 && (
                  <polyline
                    points={currentStrokePoints.map((p) => `${p.x}%,${p.y}%`).join(" ")}
                    stroke="#0B0F17"
                    strokeWidth={`${brushSize * 0.75}px`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </svg>

              {/* Active Box Being Drawn */}
              {isDrawing && activeTool === "redact-rect" && currentBox && (
                <div
                  style={{
                    left: `${currentBox.x}%`,
                    top: `${currentBox.y}%`,
                    width: `${currentBox.width}%`,
                    height: `${currentBox.height}%`
                  }}
                  className="absolute bg-gray-950/90 border-2 border-dashed border-milito-green animate-pulse"
                />
              )}
            </div>
          )}
        </div>

        {/* Redaction Count & Instructions Bar */}
        <div className="px-6 py-2.5 bg-[#0B0F17] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-milito-green" />
              <span>
                <strong className="text-white">{redactionBoxes.length + redactionStrokes.length}</strong> sensitive areas marked
              </span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              Click & drag over phone numbers, bank details, or addresses.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Private pixels will be physically destroyed on export</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTool !== "preview" && (
              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Public Version</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndUploadSanitized}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-gray-950 bg-milito-green hover:bg-emerald-400 shadow-lg shadow-milito-green/20 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                  <span>{exportProgress.text || "Saving..."}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Save Sanitized Image</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  Smartphone, 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Phone,
  User,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Product, SwapDeviceConditionAnswers, SwapRequest, DevicePhotoMeta } from "../../types";
import { calculateSwapValuation, formatNaira, generateSwapId, saveSwapRequest } from "../../utils/swapUtils";
import { UploadService } from "../../services/UploadService";

interface Step4SubmitRequestProps {
  currentModel: string;
  currentStorage: string;
  currentBrand: string;
  answers: SwapDeviceConditionAnswers;
  targetProduct: Product;
  onBack: () => void;
  onSubmitSuccess: (newRequest: SwapRequest) => void;
}

interface LocalDevicePhoto {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers (Port Harcourt)",
  "Oyo (Ibadan)",
  "Anambra (Awka/Onitsha)",
  "Delta (Warri/Asaba)",
  "Enugu",
  "Edo (Benin City)",
  "Kano",
  "Kaduna",
  "Ogun",
  "Ondo",
  "Imo (Owerri)",
  "Akwa Ibom (Uyo)",
  "Cross River (Calabar)",
  "Plateau (Jos)",
  "Kwara (Ilorin)",
  "Other State in Nigeria"
];

export default function Step4SubmitRequest({
  currentModel,
  currentStorage,
  currentBrand,
  answers,
  targetProduct,
  onBack,
  onSubmitSuccess,
}: Step4SubmitRequestProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("Lagos");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<LocalDevicePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [formError, setFormError] = useState("");

  const { estimatedValue, grade, gradeSummary } = calculateSwapValuation(
    currentModel,
    currentStorage,
    answers,
    currentBrand
  );

  const difference = targetProduct.price - estimatedValue;
  const isTopUp = difference > 0;

  // Clean up object URLs when unmounting or photos change
  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => {
        try {
          URL.revokeObjectURL(p.previewUrl);
        } catch (_) {}
      });
    };
  }, []);

  // Handle local image file selection for preview before uploading to Cloudinary
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const availableSlots = 4 - selectedPhotos.length;

    if (availableSlots <= 0) {
      setFormError("You can upload a maximum of 4 device photos.");
      return;
    }

    const validNewPhotos: LocalDevicePhoto[] = [];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/jpg", "image/gif"];

    for (const file of fileList) {
      if (validNewPhotos.length >= availableSlots) break;

      // Validate file type
      if (!allowedTypes.includes(file.type.toLowerCase()) && !file.type.startsWith("image/")) {
        setFormError(`"${file.name}" is not a valid image. Please select JPG, PNG, WEBP, or HEIC files.`);
        continue;
      }

      // Validate file size (max 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        setFormError(`"${file.name}" exceeds the 10MB limit. Please select a smaller photo.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validNewPhotos.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (validNewPhotos.length > 0) {
      setSelectedPhotos((prev) => [...prev, ...validNewPhotos].slice(0, 4));
    }

    // Reset input value so user can re-select if needed
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const removed = prev[index];
      if (removed) {
        try {
          URL.revokeObjectURL(removed.previewUrl);
        } catch (_) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");

    if (!customerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 8) {
      setFormError("Please enter a valid WhatsApp phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate unique Swap Request ID first
      const newSwapId = generateSwapId();

      // 2. Validate and upload device photos to Cloudinary if customer selected any
      const uploadedMetas: DevicePhotoMeta[] = [];
      const securePhotoUrls: string[] = [];

      if (selectedPhotos.length > 0) {
        for (let i = 0; i < selectedPhotos.length; i++) {
          const photo = selectedPhotos[i];
          const photoNumber = i + 1;
          const totalPhotos = selectedPhotos.length;

          // Pre-upload validation
          if (!photo.file || !(photo.file instanceof Blob)) {
            throw new Error(`Photo ${photoNumber} is invalid. Please re-select the image.`);
          }

          if (photo.file.size > 15 * 1024 * 1024) {
            throw new Error(`Photo ${photoNumber} (${photo.name}) is too large. Please choose an image under 15MB.`);
          }

          setUploadStatusText(`Uploading photo ${photoNumber} of ${totalPhotos}...`);

          try {
            // Upload to Cloudinary via backend /api/upload streaming
            const uploadRes = await UploadService.uploadSingleFile(
              photo.file,
              photoNumber,
              totalPhotos,
              2,
              undefined,
              "milito_swap_appraisals"
            );

            if (uploadRes && uploadRes.secure_url) {
              console.log(`[Swap Appraisal Upload] Photo ${photoNumber}/${totalPhotos} uploaded successfully:`, {
                name: photo.name,
                public_id: uploadRes.public_id,
                secure_url: uploadRes.secure_url
              });

              uploadedMetas.push({
                url: uploadRes.secure_url,
                publicId: uploadRes.public_id,
                original_filename: uploadRes.original_filename || photo.name,
                bytes: uploadRes.bytes || photo.size,
                format: uploadRes.format,
                width: uploadRes.width,
                height: uploadRes.height,
                created_at: uploadRes.created_at || new Date().toISOString(),
              });
              securePhotoUrls.push(uploadRes.secure_url);
              setUploadStatusText(`Photo ${photoNumber} uploaded`);
            } else {
              throw new Error(`Photo ${photoNumber} could not be uploaded.`);
            }
          } catch (uploadErr: any) {
            console.error(`[Swap Appraisal Upload Error] Photo ${photoNumber} ("${photo.name}") failed:`, uploadErr);
            const rawMsg = uploadErr?.message || "";
            if (rawMsg.includes("too large") || rawMsg.includes("LIMIT_FILE_SIZE")) {
              throw new Error(`Photo ${photoNumber} is too large. Please choose a smaller image.`);
            } else if (rawMsg.includes("Unsupported") || rawMsg.includes("format")) {
              throw new Error(`Photo ${photoNumber} file type isn't supported. Please choose a JPG, PNG, or WEBP image.`);
            } else {
              throw new Error(`Photo ${photoNumber} couldn't be uploaded. Please try again.`);
            }
          }
        }
      }

      // 3. Build the SwapRequest object with secure Cloudinary URLs
      setUploadStatusText("Saving appraisal request to database...");

      const newRequest: SwapRequest = {
        id: newSwapId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerLocation: customerLocation,
        currentDevice: {
          brand: currentBrand,
          model: currentModel,
          storage: currentStorage,
          answers: answers,
          estimatedGrade: grade,
          estimatedValue: estimatedValue,
          photos: securePhotoUrls.length > 0 ? securePhotoUrls : undefined,
        },
        devicePhotos: uploadedMetas.length > 0 ? uploadedMetas : undefined,
        targetProduct: {
          id: targetProduct.id,
          name: targetProduct.name,
          brand: targetProduct.brand,
          price: targetProduct.price,
          condition: targetProduct.condition,
          image:
            (typeof targetProduct.thumbnail === "object"
              ? targetProduct.thumbnail?.secure_url
              : targetProduct.thumbnail) ||
            targetProduct.image ||
            "",
          storage: targetProduct.storageOptions?.[0] || "128GB",
        },
        calculation: {
          currentDeviceValue: estimatedValue,
          targetDevicePrice: targetProduct.price,
          difference: Math.max(0, difference),
          isTopUp: isTopUp,
        },
        status: "Submitted",
        customerNotes: customerNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3. Persist to Firestore and local cache
      await saveSwapRequest(newRequest);

      // Clean up object URLs
      selectedPhotos.forEach((p) => {
        try {
          URL.revokeObjectURL(p.previewUrl);
        } catch (_) {}
      });

      setIsSubmitting(false);
      setUploadStatusText("");
      onSubmitSuccess(newRequest);
    } catch (err: any) {
      console.error("Swap submission error:", err);
      setIsSubmitting(false);
      setUploadStatusText("");
      setFormError(
        err?.message || "An unexpected error occurred while saving your request. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-milito-green/10 border border-milito-green/20 text-milito-green text-xs font-extrabold uppercase tracking-wider">
          <Send className="w-3.5 h-3.5" />
          Step 4: Review & Submit
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight font-sans">
          Submit Your Swap Request
        </h2>
        <p className="text-gray-600 text-sm sm:text-base font-medium">
          No sign-up or registration required. Fill in your details below and our team will review your appraisal.
        </p>
      </div>

      {/* Summary Recap Card */}
      <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6 sm:p-7 space-y-6">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-milito-green" />
          Swap Summary Review
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Device Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">
              You Give: Your Current Phone
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-gray-950">
              {currentModel} ({currentStorage})
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                {grade}
              </span>
              <span className="text-gray-500">{gradeSummary}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Estimated Swap Credit:</span>
              <span className="font-extrabold text-emerald-700">{formatNaira(estimatedValue)}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              * Final swap credit is subject to physical inspection.
            </p>
          </div>

          {/* Upgrade Device Box */}
          <div className="bg-white p-4 rounded-2xl border border-milito-green/40 space-y-2">
            <span className="text-[10px] font-extrabold text-milito-green uppercase tracking-wider block">
              You Get: Your Upgrade
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-gray-950 line-clamp-1">
              {targetProduct.name}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                {targetProduct.condition}
              </span>
              <span className="text-gray-500">{targetProduct.brand}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Estimated Top-Up:</span>
              <span className="font-black text-milito-green text-sm">
                {isTopUp ? formatNaira(difference) : "₦0 (Direct Swap)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Photos Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6">
        
        {formError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Chukwuemeka Eze"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
              />
            </div>
          </div>

          {/* WhatsApp Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              WhatsApp Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 0801 234 5678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
              />
            </div>
          </div>
        </div>

        {/* Location / State */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Your Location / State in Nigeria *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-950 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20 cursor-pointer"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Photos of the device */}
        <div className="space-y-2 pt-4 border-t border-gray-150">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Device Photos (Optional, helps appraisal accuracy)
              </label>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Upload clear photos of front screen, back cover, edges, and camera.
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
              {selectedPhotos.length} / 4 photos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {selectedPhotos.map((photo, idx) => (
              <div 
                key={photo.id || idx} 
                className="relative aspect-square rounded-2xl border border-gray-250 overflow-hidden group bg-gray-100 shadow-xs"
              >
                <img 
                  src={photo.previewUrl} 
                  alt={`Device preview ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Index Badge */}
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[10px] font-extrabold text-white rounded-md">
                  Photo {idx + 1}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition cursor-pointer disabled:opacity-50"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {selectedPhotos.length < 4 && (
              <label className={`aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-milito-green bg-gray-50 hover:bg-gray-100/80 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-gray-500 hover:text-gray-900 p-3 text-center group ${isSubmitting ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-milito-green/10 group-hover:bg-milito-green/20 flex items-center justify-center text-milito-green transition">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold">Add Photo</span>
                <span className="text-[9px] text-gray-400 font-medium">JPG, PNG up to 10MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  disabled={isSubmitting}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Additional Note */}
        <div className="space-y-1.5 pt-4 border-t border-gray-150">
          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Special Notes / Requests (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <textarea
              rows={3}
              placeholder="e.g. Comes with original box and 20W fast charger; available for physical inspection on Saturday..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
            />
          </div>
        </div>

        {/* Trust disclaimer */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-milito-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-950 leading-relaxed font-medium">
            <span className="font-extrabold">Zero Upfront Risk:</span> You do not pay anything online. Once submitted, a MILITO swap specialist will review your specs, contact you on WhatsApp, and schedule a physical device inspection.
          </p>
        </div>

        {/* Submission Actions */}
        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upgrades</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>{uploadStatusText || "Submitting Swap Request..."}</span>
              </div>
            ) : (
              <>
                <span>Submit Swap Request</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

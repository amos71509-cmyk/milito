import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Edit3,
  Image as ImageIcon,
  Smartphone,
  MapPin,
  FileText,
  Tag,
  Check,
  RotateCw
} from "lucide-react";
import {
  CustomerTestimonial,
  TestimonialTransactionType,
  TestimonialTransactionStatus,
  TestimonialPublishStatus
} from "../../types";
import CustomerProofEditor from "./CustomerProofEditor";
import { UploadService } from "../../services/UploadService";

interface CreateEditTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonialToEdit?: CustomerTestimonial | null;
  onSave: (testimonial: CustomerTestimonial) => Promise<void>;
}

export default function CreateEditTestimonialModal({
  isOpen,
  onClose,
  testimonialToEdit,
  onSave
}: CreateEditTestimonialModalProps) {
  // Form State
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [transactionType, setTransactionType] = useState<TestimonialTransactionType>("Purchase");
  const [device, setDevice] = useState("");
  const [storage, setStorage] = useState("256GB");
  const [fromDevice, setFromDevice] = useState("");
  const [toDevice, setToDevice] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<TestimonialTransactionStatus>("Purchase Completed");
  const [isVerifiedTransaction, setIsVerifiedTransaction] = useState(false);
  const [verifiedOrderRef, setVerifiedOrderRef] = useState("");

  // Image State
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [originalImagePublicId, setOriginalImagePublicId] = useState<string>("");
  const [publicImageUrl, setPublicImageUrl] = useState<string>("");
  const [publicImagePublicId, setPublicImagePublicId] = useState<string>("");

  // Editor Modal & Tabs
  const [isProofEditorOpen, setIsProofEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state on open / edit
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setActiveTab("form");
      if (testimonialToEdit) {
        setCustomerName(testimonialToEdit.customerName || "");
        setLocation(testimonialToEdit.location || "");
        setTestimonialText(testimonialToEdit.testimonialText || "");
        setTransactionType(testimonialToEdit.transactionType || "Purchase");
        setDevice(testimonialToEdit.device || "");
        setStorage(testimonialToEdit.storage || "256GB");
        setFromDevice(testimonialToEdit.fromDevice || "");
        setToDevice(testimonialToEdit.toDevice || "");
        setTransactionStatus(testimonialToEdit.transactionStatus || "Purchase Completed");
        setIsVerifiedTransaction(!!testimonialToEdit.isVerifiedTransaction);
        setVerifiedOrderRef(testimonialToEdit.verifiedOrderRef || "");
        setOriginalImageSrc(testimonialToEdit.originalImageUrl || "");
        setOriginalImagePublicId(testimonialToEdit.originalImagePublicId || "");
        setPublicImageUrl(testimonialToEdit.publicImageUrl || "");
        setPublicImagePublicId(testimonialToEdit.publicImagePublicId || "");
      } else {
        // Reset for new creation
        setCustomerName("");
        setLocation("Lagos, Nigeria");
        setTestimonialText("");
        setTransactionType("Purchase");
        setDevice("iPhone 14 Pro Max");
        setStorage("256GB");
        setFromDevice("");
        setToDevice("");
        setTransactionStatus("Purchase Completed");
        setIsVerifiedTransaction(false);
        setVerifiedOrderRef("");
        setOriginalImageSrc("");
        setOriginalImagePublicId("");
        setPublicImageUrl("");
        setPublicImagePublicId("");
      }
    }
  }, [isOpen, testimonialToEdit]);

  // Adjust default transaction status label when transaction type changes
  const handleTransactionTypeChange = (type: TestimonialTransactionType) => {
    setTransactionType(type);
    if (type === "Swap") {
      setTransactionStatus("Swap Completed");
      if (!fromDevice) setFromDevice("Galaxy A05s");
      if (!toDevice) setToDevice(device || "iPhone 14 Pro Max");
    } else {
      setTransactionStatus("Purchase Completed");
    }
  };

  // Upload original customer screenshot (PRIVATE SOURCE)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local object URL for instant preview & editing
    const localUrl = URL.createObjectURL(file);
    setOriginalImageSrc(localUrl);

    // Prompt user into the redaction & cropping editor
    setIsProofEditorOpen(true);
  };

  // Callback when editor flattens and saves sanitized public version
  const handleSaveSanitizedImage = (result: {
    publicImageUrl: string;
    publicImagePublicId?: string;
    sanitizedBlobUrl: string;
  }) => {
    setPublicImageUrl(result.publicImageUrl || result.sanitizedBlobUrl);
    if (result.publicImagePublicId) {
      setPublicImagePublicId(result.publicImagePublicId);
    }
  };

  // Save handler (Draft or Publish)
  const handleSave = async (publishStatus: TestimonialPublishStatus) => {
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage("Please enter the customer name.");
      setActiveTab("form");
      return;
    }

    if (!testimonialText.trim()) {
      setErrorMessage("Please enter the customer's testimonial quote.");
      setActiveTab("form");
      return;
    }

    if (publishStatus === "Published" && !publicImageUrl) {
      setErrorMessage("A sanitized public proof image is required before publishing.");
      setActiveTab("form");
      return;
    }

    try {
      setIsSaving(true);

      const record: CustomerTestimonial = {
        id: testimonialToEdit ? testimonialToEdit.id : `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        customerName: customerName.trim(),
        location: location.trim() || "Nigeria",
        testimonialText: testimonialText.trim(),
        transactionType,
        device: device.trim() || (transactionType === "Swap" ? toDevice : "Device"),
        storage: storage.trim(),
        fromDevice: transactionType === "Swap" ? fromDevice.trim() : undefined,
        toDevice: transactionType === "Swap" ? toDevice.trim() : undefined,
        transactionStatus,
        isVerifiedTransaction,
        verifiedOrderRef: verifiedOrderRef.trim() || undefined,
        originalImageUrl: originalImageSrc.startsWith("http") ? originalImageSrc : undefined,
        originalImagePublicId: originalImagePublicId || undefined,
        publicImageUrl: publicImageUrl,
        publicImagePublicId: publicImagePublicId || undefined,
        status: publishStatus,
        orderIndex: testimonialToEdit?.orderIndex ?? Date.now(),
        createdAt: testimonialToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(record);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save testimonial.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-[#0F172A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0B0F17]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-milito-green/10 border border-milito-green/20 text-milito-green">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {testimonialToEdit ? "Edit Testimonial Proof" : "Create Customer Testimonial"}
                </h3>
                <p className="text-xs text-gray-400">
                  Manage real customer stories, redact private information, and publish verified proofs.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 px-6 py-2.5 bg-[#111827] border-b border-gray-800">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "form"
                  ? "bg-milito-green text-gray-950 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Details & Proof</span>
            </button>

            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Live Preview</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "form" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Customer & Transaction Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chisom O. or Daniel A."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-milito-green transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Customer Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Lekki Phase 1, Lagos or Garki, Abuja"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-milito-green transition-colors"
                      />
                    </div>
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Transaction Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Purchase", "Swap", "Gadget Purchase", "Other"] as TestimonialTransactionType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTransactionTypeChange(type)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                            transactionType === type
                              ? "bg-milito-green/15 border-milito-green text-milito-green shadow-sm"
                              : "bg-[#1E293B] border-gray-700 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span>{type}</span>
                          {transactionType === type && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Swap Specific: From Device -> To Device */}
                  {transactionType === "Swap" ? (
                    <div className="p-3.5 bg-[#162032] border border-milito-green/30 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-milito-green">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Swap Story: FROM THIS → TO THIS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                            From Device
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Galaxy A05s"
                            value={fromDevice}
                            onChange={(e) => setFromDevice(e.target.value)}
                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-milito-green"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                            To Device
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. iPhone 14 Pro Max"
                            value={toDevice}
                            onChange={(e) => {
                              setToDevice(e.target.value);
                              setDevice(e.target.value);
                            }}
                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-milito-green"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                          Device
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. iPhone 14 Pro Max"
                          value={device}
                          onChange={(e) => setDevice(e.target.value)}
                          className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-milito-green"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                          Storage
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 256GB"
                          value={storage}
                          onChange={(e) => setStorage(e.target.value)}
                          className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-milito-green"
                        />
                      </div>
                    </div>
                  )}

                  {/* Transaction Status Label */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Transaction Status Badge
                    </label>
                    <select
                      value={transactionStatus}
                      onChange={(e) => setTransactionStatus(e.target.value as TestimonialTransactionStatus)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-milito-green"
                    >
                      <option value="Purchase Completed">✓ Purchase Completed</option>
                      <option value="Swap Completed">🔄 Swap Completed</option>
                      <option value="Transaction Completed">✓ Transaction Completed</option>
                    </select>
                  </div>

                  {/* Verification Checkbox */}
                  <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-gray-700/80 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVerifiedTransaction}
                        onChange={(e) => setIsVerifiedTransaction(e.target.checked)}
                        className="w-4 h-4 accent-milito-green rounded"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-milito-green" />
                        <span>Verified Transaction</span>
                      </span>
                    </label>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Only mark verified if an authentic order reference or receipt exists in the MILITO system.
                    </p>

                    {isVerifiedTransaction && (
                      <input
                        type="text"
                        placeholder="Order/Swap Ref (e.g. MIL-20260815-4491)"
                        value={verifiedOrderRef}
                        onChange={(e) => setVerifiedOrderRef(e.target.value)}
                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-milito-green mt-1"
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: Testimonial Quote & Screenshot Redaction */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Customer Testimonial Quote *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. 'Received my UK Used iPhone 14 Pro Max in pristine Grade A condition...'"
                      value={testimonialText}
                      onChange={(e) => setTestimonialText(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-milito-green transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Screenshot Proof Manager */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>Customer Screenshot Proof</span>
                      <span className="text-[10px] text-milito-green font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Redaction Mandatory
                      </span>
                    </label>

                    {publicImageUrl ? (
                      <div className="relative border border-gray-700 rounded-xl overflow-hidden bg-[#1E293B] p-3 space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-black/50 max-h-48 flex items-center justify-center">
                          <img
                            src={publicImageUrl}
                            alt="Sanitized Public Customer Proof"
                            className="max-h-48 w-auto object-contain rounded"
                          />
                          <div className="absolute top-2 right-2 bg-milito-green text-gray-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                            SANITIZED PUBLIC
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsProofEditorOpen(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white bg-gray-700 hover:bg-gray-600 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5 text-milito-green" />
                            <span>Edit / Redact More</span>
                          </button>

                          <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : originalImageSrc ? (
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-center space-y-3">
                        <p className="text-xs text-amber-300 font-medium">
                          Original screenshot uploaded. Please remove private information before publishing.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsProofEditorOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-milito-green hover:bg-emerald-400 transition-all shadow"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Launch Redaction Editor</span>
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-700 hover:border-milito-green/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#1E293B]/40 hover:bg-[#1E293B]">
                        <div className="p-3 rounded-full bg-gray-800 text-milito-green mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-white mb-1">
                          Upload Customer Screenshot
                        </span>
                        <span className="text-xs text-gray-400 max-w-xs">
                          WhatsApp chats, review receipts, delivery confirmations. Original remains private.
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Public Live Preview Tab */
              <div className="flex flex-col items-center justify-center py-4 space-y-6">
                <div className="text-center max-w-md">
                  <span className="text-[10px] font-black uppercase tracking-widest text-milito-green bg-milito-green/10 border border-milito-green/20 px-3 py-1 rounded-full">
                    Public Version Preview
                  </span>
                  <h4 className="text-base font-bold text-white mt-2">
                    This is exactly how visitors will see this customer story:
                  </h4>
                </div>

                {/* Simulated Public Testimonial Card */}
                <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 hover:border-milito-green/40 transition-all">
                  
                  {/* Sanitized Customer Screenshot */}
                  {publicImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner group">
                      <img
                        src={publicImageUrl}
                        alt="Customer Proof"
                        className="w-full max-h-56 object-cover object-top"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-milito-green text-[10px] font-black px-2.5 py-1 rounded-full border border-milito-green/30 flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3 text-milito-green" />
                        <span>Customer Proof</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-2xl bg-gray-800/50 border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 text-xs">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span>No sanitized screenshot attached yet</span>
                    </div>
                  )}

                  {/* Swap Format or Single Device */}
                  {transactionType === "Swap" && fromDevice && toDevice ? (
                    <div className="p-3 rounded-2xl bg-[#090D16] border border-milito-green/20 flex items-center justify-between text-xs">
                      <div className="text-gray-400">
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">From</span>
                        <strong className="text-white">{fromDevice}</strong>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] text-milito-green font-extrabold uppercase">MILITO SWAP</span>
                        <ArrowRight className="w-4 h-4 text-milito-green" />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-milito-green block">To</span>
                        <strong className="text-white">{toDevice}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-bold text-white">
                        {device} {storage ? `· ${storage}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Testimonial Quote */}
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
                    "{testimonialText || "Customer testimonial will appear here..."}"
                  </p>

                  {/* Customer details & completion badge */}
                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{customerName || "Customer Name"}</h5>
                      <span className="text-[10px] text-gray-400 block">{location || "Lagos, Nigeria"}</span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-milito-green bg-milito-green/10 border border-milito-green/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {transactionStatus}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave("Draft")}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave("Published")}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-milito-green hover:bg-emerald-400 shadow-lg shadow-milito-green/20 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publish Testimonial</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded Redaction & Cropping Tool */}
      {isProofEditorOpen && originalImageSrc && (
        <CustomerProofEditor
          isOpen={isProofEditorOpen}
          onClose={() => setIsProofEditorOpen(false)}
          imageSrc={originalImageSrc}
          onSaveSanitizedImage={handleSaveSanitizedImage}
        />
      )}
    </>
  );
}

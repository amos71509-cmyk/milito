import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  ArrowRight, 
  MessageCircle, 
  ArrowLeftRight,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  Sparkles,
  Check,
  HardDrive,
  Cpu,
  BadgeAlert
} from "lucide-react";
import { SwapRequest, SwapStatus } from "../../types";
import { verifyAndLookupSwapRequest, formatNaira } from "../../utils/swapUtils";

interface SwapTrackerModalProps {
  initialSwapId?: string;
  isOpen: boolean;
  onClose: () => void;
}

type SearchState = "idle" | "loading" | "found" | "not_found" | "phone_mismatch";

export default function SwapTrackerModal({
  initialSwapId = "",
  isOpen,
  onClose,
}: SwapTrackerModalProps) {
  const [swapIdQuery, setSwapIdQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [searchedId, setSearchedId] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Execute lookup and verification
  const executeLookup = useCallback(async (targetId: string, targetPhone: string) => {
    const cleanId = targetId.trim();
    const cleanPhone = targetPhone.trim();

    if (!cleanId) {
      setInputError("Enter your Swap Reference ID to track your request.");
      return;
    }

    if (!cleanPhone) {
      setInputError("Enter the phone number submitted with your request to verify your identity.");
      return;
    }

    setInputError(null);
    setSearchedId(cleanId.toUpperCase());
    setSearchState("loading");
    setSelectedRequest(null);

    try {
      const result = await verifyAndLookupSwapRequest(cleanId, cleanPhone);
      if (result.verified && result.swap) {
        setSelectedRequest(result.swap);
        setSearchState("found");
      } else if (result.code === "PHONE_MISMATCH") {
        setSelectedRequest(null);
        setSearchState("phone_mismatch");
        setInputError(result.error || "Phone number does not match this Swap reference.");
      } else {
        setSelectedRequest(null);
        setSearchState("not_found");
        setInputError(result.error || `No swap request found for ID '${cleanId}'.`);
      }
    } catch (err: any) {
      console.error("[SwapTracker] Error checking Swap ID:", err);
      setSelectedRequest(null);
      setSearchState("not_found");
      setInputError("Failed to verify request. Please try again.");
    }
  }, []);

  // Reset or run initial ID on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialSwapId && initialSwapId.trim()) {
        const cleanInitial = initialSwapId.trim();
        setSwapIdQuery(cleanInitial);
        // Do not auto-execute without phone; user must provide phone to verify!
        setSearchState("idle");
        setInputError("Please enter your registered phone number to verify and view request details.");
      } else {
        setSwapIdQuery("");
        setPhoneQuery("");
        setSelectedRequest(null);
        setSearchState("idle");
        setInputError(null);
        setSearchedId("");
      }
    } else {
      setSelectedRequest(null);
      setSearchState("idle");
      setInputError(null);
    }
  }, [isOpen, initialSwapId]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(swapIdQuery, phoneQuery);
  };

  const getStatusBadge = (status: SwapStatus) => {
    switch (status) {
      case "Pending":
      case "Submitted":
        return {
          label: status,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          desc: "Your swap request is in the appraisal queue. Our technicians will begin reviewing specifications shortly."
        };
      case "Under Review":
        return {
          label: "Under Review",
          className: "bg-amber-50 text-amber-800 border-amber-200 font-extrabold",
          desc: "Our valuation team is currently examining your device condition, specifications, and uploaded photos."
        };
      case "Offer Ready":
        return {
          label: "Offer Ready",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200 font-extrabold",
          desc: "Good news! Your official trade-in valuation is ready. See offer details below or contact us on WhatsApp to proceed."
        };
      case "Approved":
        return {
          label: "Approved",
          className: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black",
          desc: "Appraisal approved! You can now visit our store or arrange courier handover for physical inspection & exchange."
        };
      case "Rejected":
      case "Declined":
        return {
          label: "Rejected",
          className: "bg-rose-50 text-rose-700 border-rose-200",
          desc: "This request could not be approved at this time based on device condition or policy guidelines."
        };
      case "Awaiting Inspection":
        return {
          label: "Awaiting Inspection",
          className: "bg-purple-50 text-purple-700 border-purple-200",
          desc: "Awaiting physical handover and inspection at our store before completing the swap."
        };
      case "Value Adjusted":
        return {
          label: "Value Adjusted",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
          desc: "The valuation was adjusted following physical verification. Please review the updated offer."
        };
      case "Swap Confirmed":
      case "Completed":
        return {
          label: status,
          className: "bg-emerald-100 text-emerald-900 border-emerald-300 font-black",
          desc: "Swap deal successfully concluded! Enjoy your upgraded device."
        };
      case "Cancelled":
        return {
          label: "Cancelled",
          className: "bg-gray-100 text-gray-700 border-gray-300",
          desc: "This swap appraisal was cancelled."
        };
      default:
        return {
          label: status || "Pending",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          desc: "Request status is active."
        };
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        id="swap-tracker-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200 overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-milito-green/10 border border-milito-green/25 flex items-center justify-center text-milito-green shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-950 text-base sm:text-lg font-sans tracking-tight flex items-center gap-2">
                <span>Track Swap Request</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Protected
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Verify phone number & reference to view real-time appraisal review
              </p>
            </div>
          </div>

          <button
            id="close-swap-tracker-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200/70 rounded-full text-gray-500 hover:text-black transition cursor-pointer"
            aria-label="Close Swap Tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Phone Verification Form */}
        <div className="p-4 sm:p-6 bg-white border-b border-gray-150 space-y-3">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Swap Reference ID Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="swap-tracking-id-input"
                  type="text"
                  placeholder="Swap Reference (e.g. MIL-SWAP-73060)"
                  value={swapIdQuery}
                  onChange={(e) => {
                    setSwapIdQuery(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  disabled={searchState === "loading"}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-milito-green focus:bg-white transition uppercase placeholder:normal-case"
                />
              </div>

              {/* Customer Phone Input for Verification */}
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="swap-tracking-phone-input"
                  type="tel"
                  placeholder="Your Phone Number (e.g. 08012345678)"
                  value={phoneQuery}
                  onChange={(e) => {
                    setPhoneQuery(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  disabled={searchState === "loading"}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-milito-green focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-gray-400 hidden sm:inline flex items-center gap-1">
                <Lock className="w-3 h-3 text-gray-400" />
                Phone number is required to protect private customer details.
              </span>
              <button
                id="submit-swap-tracking-btn"
                type="submit"
                disabled={searchState === "loading"}
                className="w-full sm:w-auto px-6 py-2.5 bg-milito-green text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {searchState === "loading" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {inputError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Body Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. INITIAL IDLE STATE */}
          {searchState === "idle" && (
            <div className="py-10 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-gray-900">
                  Track Your Swap Appraisal Status
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your unique Swap ID and the phone number provided at submission to view your review status (Pending, Under Review, Offer Ready, Approved, or Rejected).
                </p>
              </div>
            </div>
          )}

          {/* 2. LOADING STATE */}
          {searchState === "loading" && (
            <div className="py-14 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-milito-green/10 border border-milito-green/20 flex items-center justify-center mx-auto text-milito-green">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-gray-950">
                  Verifying Swap Request Ownership...
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Checking ID: {searchedId}
                </p>
              </div>
            </div>
          )}

          {/* 3. PHONE MISMATCH (SECURITY ERROR) */}
          {searchState === "phone_mismatch" && (
            <div id="swap-phone-mismatch-state" className="py-8 px-4 text-center space-y-3 bg-rose-50/60 rounded-3xl border border-rose-200 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-gray-950">
                  Phone Verification Required
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The phone number entered does not match the record for Swap ID <span className="font-mono font-bold text-gray-900">{searchedId}</span>. For your privacy and security, swap request details are protected.
                </p>
                <p className="text-[11px] text-gray-500 pt-1">
                  Please verify that you are entering the same WhatsApp/phone number provided during submission.
                </p>
              </div>
            </div>
          )}

          {/* 4. NOT FOUND STATE */}
          {searchState === "not_found" && (
            <div id="swap-not-found-state" className="py-10 px-4 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-150 flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-gray-950">
                  Swap Request Not Found
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We couldn't find a Swap Request with reference ID <span className="font-mono font-bold text-gray-900">{searchedId}</span>. Please verify the ID on your confirmation note.
                </p>
              </div>
            </div>
          )}

          {/* 5. VERIFIED FOUND STATE */}
          {searchState === "found" && selectedRequest && (
            <div id="swap-request-details-card" className="space-y-6 animate-fadeIn">
              
              {/* Swap ID & Status Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                    Swap Reference
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black text-gray-950 tracking-tight">
                    {selectedRequest.id}
                  </span>
                  {selectedRequest.createdAt && (
                    <span className="text-[11px] text-gray-500 block">
                      Submitted on {formatDate(selectedRequest.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block mb-1">
                    Current Review Status
                  </span>
                  <span
                    id="swap-tracking-status-badge"
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      getStatusBadge(selectedRequest.status).className
                    }`}
                  >
                    {getStatusBadge(selectedRequest.status).label}
                  </span>
                </div>
              </div>

              {/* Status Explanation Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
                <span className="font-extrabold text-emerald-950 uppercase tracking-wider block">
                  Status Update:
                </span>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  {getStatusBadge(selectedRequest.status).desc}
                </p>
                {selectedRequest.adminNotes && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 text-emerald-950 font-semibold">
                    <span className="font-bold">Appraisal Team Note:</span> {selectedRequest.adminNotes}
                  </div>
                )}
              </div>

              {/* Devices Breakdown Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Your Current Phone */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-milito-green" />
                    Your Trade-In Device
                  </span>
                  <h4 className="text-sm font-extrabold text-gray-950 font-sans">
                    {selectedRequest.currentDevice?.brand} {selectedRequest.currentDevice?.model}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-gray-500" />
                      {selectedRequest.currentDevice?.storage || "128GB"} Storage
                    </span>
                    {selectedRequest.currentDevice?.ram && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-gray-500" />
                        {selectedRequest.currentDevice.ram} RAM
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                      {selectedRequest.currentDevice?.estimatedGrade || "Grade B"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedRequest.officialOfferValue ? "Official Offer:" : "Estimated Credit:"}
                    </span>
                    <span className="text-sm font-black text-milito-green font-mono">
                      {formatNaira(
                        selectedRequest.officialOfferValue ||
                        selectedRequest.currentDevice?.estimatedValue ||
                        selectedRequest.calculation?.currentDeviceValue ||
                        0
                      )}
                    </span>
                  </div>
                </div>

                {/* Target Upgrade Device */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Target Upgrade Device
                  </span>
                  <h4 className="text-sm font-extrabold text-gray-950 font-sans">
                    {selectedRequest.targetProduct?.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold">
                      {selectedRequest.targetProduct?.condition || "Pristine"}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-gray-900">
                      {formatNaira(selectedRequest.targetProduct?.price || 0)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedRequest.calculation?.isTopUp ? "Top-Up Required:" : "Balance / Surplus:"}
                    </span>
                    <span className="text-sm font-black text-gray-950 font-mono">
                      {formatNaira(selectedRequest.calculation?.difference || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Contact Verification Notice */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-milito-green" />
                  Verified for: <strong className="text-gray-900">{selectedRequest.customerName}</strong>
                </span>
                <span className="text-gray-500 font-mono">
                  {selectedRequest.customerPhone}
                </span>
              </div>

              {/* WhatsApp Live Agent CTA */}
              <div className="p-4 bg-gray-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs font-bold text-milito-green block">
                    Have questions about this swap?
                  </span>
                  <p className="text-xs text-gray-300">
                    Chat directly with our appraisal team regarding Reference #{selectedRequest.id}.
                  </p>
                </div>
                <a
                  href={`https://wa.me/2348000000000?text=${encodeURIComponent(
                    `Hello MILITO TECH, I am checking my Swap Request reference ${selectedRequest.id} for my ${selectedRequest.currentDevice?.brand} ${selectedRequest.currentDevice?.model}. Please provide me with an update.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-milito-green text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

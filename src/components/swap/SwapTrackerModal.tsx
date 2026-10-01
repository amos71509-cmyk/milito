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
  HelpCircle,
  Sparkles,
  Check
} from "lucide-react";
import { SwapRequest, SwapStatus } from "../../types";
import { lookupSwapRequestByTrackingId, formatNaira } from "../../utils/swapUtils";

interface SwapTrackerModalProps {
  initialSwapId?: string;
  isOpen: boolean;
  onClose: () => void;
}

type SearchState = "idle" | "loading" | "found" | "not_found";

export default function SwapTrackerModal({
  initialSwapId = "",
  isOpen,
  onClose,
}: SwapTrackerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [searchedId, setSearchedId] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Execute lookup strictly against Firestore / backend records
  const executeLookup = useCallback(async (targetId: string) => {
    const cleanId = targetId.trim();
    if (!cleanId) {
      setInputError("Enter your Swap ID to track your request.");
      return;
    }

    setInputError(null);
    setSearchedId(cleanId.toUpperCase());
    setSearchState("loading");
    // Clear previous results immediately
    setSelectedRequest(null);

    try {
      const result = await lookupSwapRequestByTrackingId(cleanId);
      if (result && result.id) {
        setSelectedRequest(result);
        setSearchState("found");
      } else {
        setSelectedRequest(null);
        setSearchState("not_found");
      }
    } catch (err) {
      console.error("[SwapTracker] Error checking Swap ID:", err);
      setSelectedRequest(null);
      setSearchState("not_found");
    }
  }, []);

  // Reset or run initial ID on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialSwapId && initialSwapId.trim()) {
        const cleanInitial = initialSwapId.trim();
        setSearchQuery(cleanInitial);
        executeLookup(cleanInitial);
      } else {
        // Initial state: empty result area, only search input
        setSearchQuery("");
        setSelectedRequest(null);
        setSearchState("idle");
        setInputError(null);
        setSearchedId("");
      }
    } else {
      // Clear state on close
      setSelectedRequest(null);
      setSearchState("idle");
      setInputError(null);
    }
  }, [isOpen, initialSwapId, executeLookup]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(searchQuery);
  };

  const getStatusBadge = (status: SwapStatus) => {
    switch (status) {
      case "Submitted":
        return {
          label: "Submitted",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "Under Review":
        return {
          label: "Under Review",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "Awaiting Inspection":
        return {
          label: "Awaiting Inspection",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "Value Adjusted":
        return {
          label: "Value Adjusted",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "Approved":
        return {
          label: "Approved",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "Swap Confirmed":
        return {
          label: "Swap Confirmed",
          className: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "Completed":
        return {
          label: "Completed",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300 font-black",
        };
      case "Cancelled":
      case "Declined":
        return {
          label: status,
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: status || "Submitted",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  // Status progression index for timeline calculations
  const getStatusIndex = (status: SwapStatus): number => {
    const sequence: SwapStatus[] = [
      "Submitted",
      "Under Review",
      "Awaiting Inspection",
      "Approved",
      "Swap Confirmed",
      "Completed"
    ];
    if (status === "Value Adjusted") return 2; // alongside inspection
    const idx = sequence.indexOf(status);
    return idx >= 0 ? idx : 0;
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
              <h3 className="font-extrabold text-gray-950 text-base sm:text-lg font-sans tracking-tight">
                Track Swap Request
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Check real-time appraisal & inspection status
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

        {/* Search Bar Form */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-150">
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="swap-tracking-id-input"
                  type="text"
                  placeholder="Enter Swap ID (e.g. MIL-SWAP-73060)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  disabled={searchState === "loading"}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-milito-green focus:bg-white transition uppercase placeholder:normal-case"
                />
              </div>
              <button
                id="submit-swap-tracking-btn"
                type="submit"
                disabled={searchState === "loading"}
                className="px-5 sm:px-6 py-2.5 bg-milito-green text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {searchState === "loading" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <span>Track</span>
                )}
              </button>
            </div>

            {inputError && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pl-1 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{inputError}</span>
              </p>
            )}
          </form>
        </div>

        {/* Body Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. INITIAL IDLE STATE: Result area is completely clean and empty */}
          {searchState === "idle" && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-gray-900">
                  Enter your Swap ID to track your request
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Input the unique Swap ID (e.g. <span className="font-mono font-bold text-gray-700">MIL-SWAP-73060</span>) provided upon submitting your swap appraisal.
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
                  Checking Swap Request...
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Verifying ID: {searchedId}
                </p>
              </div>
            </div>
          )}

          {/* 3. INVALID / NOT FOUND STATE */}
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
                  We couldn't find a Swap Request with that tracking ID. Please check the ID and try again.
                </p>
                {searchedId && (
                  <p className="text-[11px] text-gray-400 font-mono pt-1">
                    Searched ID: <span className="text-gray-700 font-semibold">{searchedId}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 4. VALID FOUND STATE: Real Firestore Request Details */}
          {searchState === "found" && selectedRequest && (
            <div id="swap-request-details-card" className="space-y-6 animate-fadeIn">
              
              {/* Swap ID & Firestore Status Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/90 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                    Swap ID
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black text-gray-950 tracking-tight">
                    {selectedRequest.id}
                  </span>
                  {selectedRequest.createdAt && (
                    <span className="text-[11px] text-gray-500 block pt-0.5">
                      Submitted on {formatDate(selectedRequest.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-bold text-gray-500">Status:</span>
                  <span className={`px-3 py-1.5 font-extrabold text-xs rounded-full border shadow-2xs ${getStatusBadge(selectedRequest.status).className}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Status Notice if Cancelled or Declined */}
              {(selectedRequest.status === "Cancelled" || selectedRequest.status === "Declined") && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Swap Request {selectedRequest.status}</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    This swap appraisal has been closed. Please contact MILITO customer care if you require any assistance.
                  </p>
                </div>
              )}

              {/* Appraisal Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Appraisal Timeline
                  </h4>
                  {selectedRequest.updatedAt && (
                    <span className="text-[11px] text-gray-400">
                      Last updated: {formatDate(selectedRequest.updatedAt)}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                  {[
                    {
                      label: "Request Submitted",
                      statusKey: "Submitted" as SwapStatus,
                      desc: "Appraisal request logged in MILITO database",
                      date: formatDate(selectedRequest.createdAt),
                      minIdx: 0,
                    },
                    {
                      label: "Under Review",
                      statusKey: "Under Review" as SwapStatus,
                      desc: "Appraisal team reviewing device condition & specifications",
                      date: selectedRequest.status !== "Submitted" ? formatDate(selectedRequest.updatedAt) : null,
                      minIdx: 1,
                    },
                    {
                      label: "Physical Inspection",
                      statusKey: "Awaiting Inspection" as SwapStatus,
                      desc: "Hardware diagnostic & condition verification at branch",
                      date: null,
                      minIdx: 2,
                    },
                    {
                      label: "Appraisal & Valuation Approved",
                      statusKey: "Approved" as SwapStatus,
                      desc: "Trade-in value verified & upgrade agreement ready",
                      date: null,
                      minIdx: 3,
                    },
                    {
                      label: "Swap Completed",
                      statusKey: "Completed" as SwapStatus,
                      desc: "Device exchange finalized & warranty activated",
                      date: selectedRequest.status === "Completed" ? formatDate(selectedRequest.updatedAt) : null,
                      minIdx: 5,
                    },
                  ].map((milestone, idx) => {
                    const currentIdx = getStatusIndex(selectedRequest.status);
                    const isDone = currentIdx >= milestone.minIdx;
                    const isCurrent = currentIdx === milestone.minIdx;

                    return (
                      <div key={milestone.label} className="flex items-start gap-3 relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-colors ${
                            isDone
                              ? "bg-milito-green text-black shadow-xs"
                              : "bg-gray-100 text-gray-400 border border-gray-300"
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`text-xs font-extrabold ${
                                isCurrent 
                                  ? "text-milito-green" 
                                  : isDone 
                                  ? "text-gray-900" 
                                  : "text-gray-400"
                              }`}
                            >
                              {milestone.label}
                            </h5>
                            {milestone.date && (
                              <span className="text-[10px] font-medium text-gray-400">
                                {milestone.date}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-normal">
                            {milestone.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Devices & Valuation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                    Current Phone
                  </span>
                  <h5 className="text-xs font-black text-gray-950 truncate">
                    {selectedRequest.currentDevice.brand} {selectedRequest.currentDevice.model}
                  </h5>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {selectedRequest.currentDevice.storage} • {selectedRequest.currentDevice.estimatedGrade}
                  </p>
                  <div className="pt-1 text-xs font-bold text-gray-900">
                    Est. Value: <span className="font-extrabold text-gray-950">{formatNaira(selectedRequest.currentDevice.estimatedValue)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                    Target Upgrade
                  </span>
                  <h5 className="text-xs font-black text-gray-950 truncate">
                    {selectedRequest.targetProduct.name}
                  </h5>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    {selectedRequest.targetProduct.condition} • {selectedRequest.targetProduct.brand}
                  </p>
                  <div className="pt-1 text-xs font-black text-milito-green">
                    Top-Up: {selectedRequest.calculation.isTopUp ? formatNaira(selectedRequest.calculation.difference) : "₦0 (Direct Swap)"}
                  </div>
                </div>
              </div>

              {/* Appraisal Note from MILITO if available */}
              {selectedRequest.adminNotes && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                  <span className="font-extrabold text-amber-900 uppercase text-[10px] tracking-wider block">
                    Appraisal Note from MILITO:
                  </span>
                  <p className="text-amber-800 leading-relaxed font-medium">
                    {selectedRequest.adminNotes}
                  </p>
                </div>
              )}

              {/* WhatsApp Support Contact */}
              <div className="pt-2">
                <a
                  id="whatsapp-swap-support-btn"
                  href={`https://wa.me/2349000000000?text=${encodeURIComponent(
                    `Hello MILITO TECH HOME, I am inquiring about my Swap Request ${selectedRequest.id} for ${selectedRequest.currentDevice.model} to ${selectedRequest.targetProduct.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Contact WhatsApp Support for this Swap</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

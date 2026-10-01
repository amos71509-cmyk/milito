import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowLeftRight, 
  Smartphone, 
  User, 
  Phone, 
  MapPin, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  X,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ZoomIn,
  RefreshCw
} from "lucide-react";
import { SwapRequest, SwapStatus, DevicePhotoMeta } from "../types";
import { 
  getStoredSwapRequests, 
  updateSwapRequestStatus, 
  deleteSwapRequest,
  fetchSwapRequestsFromFirestore,
  listenToSwapRequests,
  formatNaira, 
  SWAP_STATUSES 
} from "../utils/swapUtils";

interface LightboxState {
  photos: { url: string; title?: string }[];
  currentIndex: number;
  requestId: string;
  deviceTitle: string;
}

export default function AdminSwapManager() {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedSwapId, setSelectedSwapId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load and listen to real-time updates from Firestore & local storage
  useEffect(() => {
    // 1. Initial local load
    setSwapRequests(getStoredSwapRequests());

    // 2. Fetch latest from Firestore
    fetchSwapRequestsFromFirestore().then((res) => {
      if (res && res.length > 0) {
        setSwapRequests(res);
      }
    });

    // 3. Attach real-time listener
    const unsubscribe = listenToSwapRequests((latest) => {
      setSwapRequests(latest);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSwapRequestsFromFirestore();
      setSwapRequests(data);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) => {
          if (!prev || prev.photos.length <= 1) return prev;
          return {
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.photos.length,
          };
        });
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) => {
          if (!prev || prev.photos.length <= 1) return prev;
          return {
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  // Helper to extract device photos from any schema variation
  const getRequestPhotos = (req: SwapRequest): { url: string; title?: string }[] => {
    const list: { url: string; title?: string }[] = [];

    if (Array.isArray(req.devicePhotos) && req.devicePhotos.length > 0) {
      req.devicePhotos.forEach((item, idx) => {
        if (typeof item === "object" && item?.url) {
          list.push({
            url: item.url,
            title: item.original_filename || `Device Photo ${idx + 1}`,
          });
        } else if (typeof item === "string") {
          list.push({ url: item, title: `Device Photo ${idx + 1}` });
        }
      });
    } else if (Array.isArray(req.currentDevice?.photos) && req.currentDevice.photos.length > 0) {
      req.currentDevice.photos.forEach((src, idx) => {
        if (typeof src === "string" && src.trim().length > 0) {
          list.push({ url: src, title: `Device Photo ${idx + 1}` });
        } else if (typeof src === "object" && (src as any)?.url) {
          list.push({ url: (src as any).url, title: `Device Photo ${idx + 1}` });
        }
      });
    }

    return list;
  };

  const openLightbox = (req: SwapRequest, startIndex: number = 0) => {
    const photos = getRequestPhotos(req);
    if (photos.length === 0) return;
    setLightbox({
      photos,
      currentIndex: Math.max(0, Math.min(startIndex, photos.length - 1)),
      requestId: req.id,
      deviceTitle: `${req.currentDevice.brand} ${req.currentDevice.model}`,
    });
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return swapRequests.filter((req) => {
      // 1. Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesId = req.id.toLowerCase().includes(q);
        const matchesName = req.customerName.toLowerCase().includes(q);
        const matchesPhone = req.customerPhone.includes(q);
        const matchesModel =
          req.currentDevice.model.toLowerCase().includes(q) ||
          req.targetProduct.name.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesModel) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "All" && req.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [swapRequests, searchQuery, statusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: swapRequests.length,
      submitted: swapRequests.filter((r) => r.status === "Submitted").length,
      underReview: swapRequests.filter((r) => r.status === "Under Review").length,
      inspection: swapRequests.filter((r) => r.status === "Awaiting Inspection").length,
      approved: swapRequests.filter(
        (r) => r.status === "Approved" || r.status === "Swap Confirmed"
      ).length,
      completed: swapRequests.filter((r) => r.status === "Completed").length,
    };
  }, [swapRequests]);

  const handleStatusChange = async (id: string, newStatus: SwapStatus) => {
    await updateSwapRequestStatus(id, newStatus);
  };

  const handleSaveNote = async (id: string) => {
    const note = editingNotes[id];
    if (note !== undefined) {
      const currentReq = swapRequests.find((r) => r.id === id);
      if (currentReq) {
        await updateSwapRequestStatus(id, currentReq.status, note);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete swap request ${id}?`)) {
      await deleteSwapRequest(id);
      if (selectedSwapId === id) setSelectedSwapId(null);
    }
  };

  const getStatusBadgeStyle = (status: SwapStatus) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "Under Review":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      case "Awaiting Inspection":
        return "bg-purple-500/20 text-purple-300 border-purple-400/30";
      case "Approved":
      case "Swap Confirmed":
      case "Completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-300 border-red-400/30";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Total Requests", val: stats.total, color: "text-white" },
          { label: "New Submitted", val: stats.submitted, color: "text-blue-400" },
          { label: "Under Review", val: stats.underReview, color: "text-amber-400" },
          { label: "Awaiting Inspection", val: stats.inspection, color: "text-purple-400" },
          { label: "Approved / Confirmed", val: stats.approved, color: "text-emerald-400" },
          { label: "Completed", val: stats.completed, color: "text-emerald-300" },
        ].map((s, idx) => (
          <div key={idx} className="p-3.5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
              {s.label}
            </span>
            <span className={`text-xl font-black font-mono mt-0.5 block ${s.color}`}>
              {s.val}
            </span>
          </div>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Swap ID, customer name, phone, or device model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-700 rounded-xl text-xs font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-milito-green"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-950 border border-gray-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-milito-green cursor-pointer"
          >
            <option value="All">All Statuses ({swapRequests.length})</option>
            {SWAP_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleManualRefresh}
            title="Sync with Firestore"
            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-milito-green" : ""}`} />
          </button>
        </div>
      </div>

      {/* Swap Requests List / Table */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800 space-y-2">
          <ArrowLeftRight className="w-8 h-8 text-gray-500 mx-auto" />
          <h4 className="text-sm font-extrabold text-white">No swap requests found</h4>
          <p className="text-xs text-gray-400">
            Requests submitted on the Swap Deals page will automatically synchronize and appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isExpanded = selectedSwapId === req.id;
            const topUp = req.calculation.difference;
            const photos = getRequestPhotos(req);

            return (
              <div
                key={req.id}
                className={`bg-gray-900 border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-milito-green/50 ring-2 ring-milito-green/10"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* Request Row Summary */}
                <div
                  onClick={() => setSelectedSwapId(isExpanded ? null : req.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-850 transition"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-milito-green/10 border border-milito-green/20 flex items-center justify-center text-milito-green flex-shrink-0">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-milito-green">
                          {req.id}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {req.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                          {req.customerLocation}
                        </span>
                        {photos.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-bold">
                            <ImageIcon className="w-2.5 h-2.5" />
                            {photos.length} Photo{photos.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                        <span className="font-semibold">{req.currentDevice.model}</span>
                        <span className="text-gray-500">➔</span>
                        <span className="font-semibold text-white">{req.targetProduct.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        Est. Top-Up
                      </span>
                      <span className="text-xs sm:text-sm font-black text-milito-green font-mono">
                        {req.calculation.isTopUp ? formatNaira(topUp) : "₦0"}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-800 bg-gray-950 space-y-6">
                    
                    {/* Device Comparison Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Current Phone */}
                      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                          Current Device Specs
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {req.currentDevice.brand} {req.currentDevice.model}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span>Storage: {req.currentDevice.storage}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{req.currentDevice.estimatedGrade}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-800 flex justify-between text-xs">
                          <span className="text-gray-400">Estimated Value:</span>
                          <span className="font-bold text-white">{formatNaira(req.currentDevice.estimatedValue)}</span>
                        </div>

                        {/* Inspection Answers */}
                        {req.currentDevice.answers && (
                          <div className="pt-2 border-t border-gray-800 space-y-1 text-[11px] text-gray-400">
                            <div>Screen: <span className="text-gray-200">{req.currentDevice.answers.screen}</span></div>
                            <div>Body: <span className="text-gray-200">{req.currentDevice.answers.body}</span></div>
                            <div>Camera: <span className="text-gray-200">{req.currentDevice.answers.camera}</span></div>
                            <div>Battery: <span className="text-gray-200">{req.currentDevice.answers.batteryHealth}%</span></div>
                          </div>
                        )}
                      </div>

                      {/* Upgrade Phone */}
                      <div className="p-4 bg-gray-900 border border-milito-green/30 rounded-xl space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-milito-green tracking-wider block">
                          Desired Target Upgrade
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {req.targetProduct.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span>Brand: {req.targetProduct.brand}</span>
                          <span>•</span>
                          <span>{req.targetProduct.condition}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-800 flex justify-between text-xs">
                          <span className="text-gray-400">Catalogue Price:</span>
                          <span className="font-bold text-white">{formatNaira(req.targetProduct.price)}</span>
                        </div>
                        <div className="pt-1 flex justify-between text-xs text-milito-green font-black">
                          <span>Top-Up Difference:</span>
                          <span>{req.calculation.isTopUp ? formatNaira(topUp) : "₦0 (Direct Swap)"}</span>
                        </div>
                      </div>

                    </div>

                    {/* Dedicated Device Photos Section */}
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-milito-green" />
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                            Device Photos
                          </h4>
                        </div>
                        {photos.length > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                            {photos.length} photo{photos.length > 1 ? "s" : ""} uploaded
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-medium">
                            No photos attached
                          </span>
                        )}
                      </div>

                      {photos.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-gray-400">
                            Click any photo below to inspect full-size image in high resolution.
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {photos.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => openLightbox(req, idx)}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-750 bg-gray-950 cursor-pointer hover:border-milito-green transition-all shadow-md"
                              >
                                <img
                                  src={item.url}
                                  alt={`Device inspection ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                                  <ZoomIn className="w-4 h-4 text-milito-green" />
                                  <span className="text-[10px] font-bold">Enlarge</span>
                                </div>

                                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-[9px] font-extrabold text-gray-200 rounded">
                                  Photo {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-xl text-center space-y-1">
                          <p className="text-xs text-gray-400 font-medium">
                            No device photos were provided with this request.
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Customer will present the device during in-person branch inspection.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customer Notes if provided */}
                    {req.customerNotes && (
                      <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Customer Note:</span>
                        <p className="text-gray-300">{req.customerNotes}</p>
                      </div>
                    )}

                    {/* Admin Status & Notes Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                      
                      {/* Status Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold uppercase text-gray-400">
                          Update Appraisal Status:
                        </label>
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as SwapStatus)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-milito-green cursor-pointer font-bold"
                        >
                          {SWAP_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Admin Notes Field */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold uppercase text-gray-400">
                          Internal / Appraisal Notes:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add note e.g. Customer to visit Ikeja branch on Friday..."
                            value={editingNotes[req.id] !== undefined ? editingNotes[req.id] : req.adminNotes || ""}
                            onChange={(e) =>
                              setEditingNotes({ ...editingNotes, [req.id]: e.target.value })
                            }
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-milito-green"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(req.id)}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
                      
                      {/* WhatsApp Direct Chat with Customer */}
                      <a
                        href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${req.customerName}, this is MILITO TECH HOME regarding your device swap request ${req.id} (${req.currentDevice.model} to ${req.targetProduct.name}). Status: ${req.status}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        <span>Message Customer ({req.customerPhone})</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Request</span>
                      </button>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Lightbox Gallery for Device Photos */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scaleUp"
          >
            {/* Lightbox Header */}
            <div className="p-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black text-milito-green">
                    {lightbox.requestId}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {lightbox.deviceTitle}
                  </span>
                  <span className="text-[11px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full font-bold">
                    Photo {lightbox.currentIndex + 1} of {lightbox.photos.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={lightbox.photos[lightbox.currentIndex]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Open original Cloudinary photo in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>

                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image Area */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-4 min-h-[360px] max-h-[72vh] overflow-hidden">
              <img
                src={lightbox.photos[lightbox.currentIndex]?.url}
                alt={`Device inspection ${lightbox.currentIndex + 1}`}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-2xl transition-all"
              />

              {/* Navigation Arrows */}
              {lightbox.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              currentIndex:
                                (prev.currentIndex - 1 + prev.photos.length) %
                                prev.photos.length,
                            }
                          : null
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer backdrop-blur-xs border border-white/10"
                    title="Previous Photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              currentIndex: (prev.currentIndex + 1) % prev.photos.length,
                            }
                          : null
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer backdrop-blur-xs border border-white/10"
                    title="Next Photo (Right Arrow)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnail Strip if multiple photos */}
            {lightbox.photos.length > 1 && (
              <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-2 overflow-x-auto">
                {lightbox.photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setLightbox((prev) => (prev ? { ...prev, currentIndex: idx } : null))
                    }
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                      idx === lightbox.currentIndex
                        ? "border-milito-green scale-105 ring-2 ring-milito-green/30"
                        : "border-gray-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

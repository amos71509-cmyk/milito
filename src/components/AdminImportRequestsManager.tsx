import React, { useState, useEffect, useMemo } from "react";
import {
  Car,
  Search,
  Copy,
  Check,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FileText,
  Sparkles,
  User,
  Calendar,
  Hash,
  ShieldCheck,
  Save
} from "lucide-react";
import { VehicleImportRequest, VehicleImportStatus, resolveImageUrl } from "../types";
import {
  subscribeToVehicleImportRequests,
  fetchVehicleImportRequests,
  updateVehicleImportStatus,
  deleteVehicleImportRequest
} from "../utils/vehicleImportUtils";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatNaira = (amount: number) => nairaFormatter.format(Number(amount) || 0);

export default function AdminImportRequestsManager() {
  const [requests, setRequests] = useState<VehicleImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VehicleImportStatus>("ALL");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToVehicleImportRequests(list => {
      setRequests(list);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    const list = await fetchVehicleImportRequests();
    setRequests(list);
    setLoading(false);
    showToast("Import requests synced with Firestore.");
  };

  const handleCopyRef = (refNum: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refNum);
      setCopiedRef(refNum);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const handleStatusChange = async (req: VehicleImportRequest, newStatus: VehicleImportStatus) => {
    const idKey = req.id || req.referenceNumber;
    setUpdatingId(idKey);
    const currentNotes = notesDraft[idKey] !== undefined ? notesDraft[idKey] : (req.adminNotes || "");
    await updateVehicleImportStatus(idKey, newStatus, currentNotes);
    setRequests(prev =>
      prev.map(r =>
        r.id === req.id || r.referenceNumber === req.referenceNumber
          ? { ...r, status: newStatus, adminNotes: currentNotes, updatedAt: new Date().toISOString() }
          : r
      )
    );
    setUpdatingId(null);
    showToast(`Reference ${req.referenceNumber} updated to "${newStatus}"`);
  };

  const handleSaveNotes = async (req: VehicleImportRequest) => {
    const idKey = req.id || req.referenceNumber;
    setUpdatingId(idKey);
    const currentNotes = notesDraft[idKey] !== undefined ? notesDraft[idKey] : (req.adminNotes || "");
    await updateVehicleImportStatus(idKey, req.status, currentNotes);
    setRequests(prev =>
      prev.map(r =>
        r.id === req.id || r.referenceNumber === req.referenceNumber
          ? { ...r, adminNotes: currentNotes, updatedAt: new Date().toISOString() }
          : r
      )
    );
    setUpdatingId(null);
    showToast(`Notes saved for ${req.referenceNumber}`);
  };

  const handleDelete = async (req: VehicleImportRequest) => {
    const idKey = req.id || req.referenceNumber;
    setUpdatingId(idKey);
    await deleteVehicleImportRequest(idKey);
    setRequests(prev => prev.filter(r => r.id !== req.id && r.referenceNumber !== req.referenceNumber));
    setUpdatingId(null);
    showToast(`Enquiry ${req.referenceNumber} removed.`);
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === "Pending").length,
      inProgress: requests.filter(r => r.status === "Contacted" || r.status === "Quote Sent").length,
      completed: requests.filter(r => r.status === "Completed").length
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        (req.referenceNumber || "").toLowerCase().includes(q) ||
        (req.customerName || "").toLowerCase().includes(q) ||
        (req.customerPhone || "").toLowerCase().includes(q) ||
        (req.deliveryState || "").toLowerCase().includes(q) ||
        (req.deliveryCity || "").toLowerCase().includes(q) ||
        (req.vehicleName || "").toLowerCase().includes(q) ||
        (req.vehicleBrand || "").toLowerCase().includes(q) ||
        (req.vehicleId || "").toLowerCase().includes(q)
      );
    });
  }, [requests, statusFilter, searchTerm]);

  const getStatusBadgeClasses = (status: VehicleImportStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Availability Confirmed":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "Payment Pending":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse";
      case "Paid":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Contacted":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "Quote Sent":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Completed":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Cancelled":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.startsWith("0") && digits.length === 11) {
      return `234${digits.slice(1)}`;
    }
    if (digits.startsWith("234")) return digits;
    return digits;
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00B14F] text-black px-4 py-3 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Vehicle Import Requests</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Phase 1 Ordering
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              View customer import quote enquiries, delivery states/cities, and selected vehicles from Firebase Firestore.
            </p>
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-extrabold border border-gray-700 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Sync Requests</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Enquiries</p>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Pending Review</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-[#111827] border border-purple-500/30 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-purple-400">Contacted / Quoted</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Completed Imports</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Reference (MIL-AUTO-...), customer name, phone, state/city, or vehicle..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {(["ALL", "Pending", "Contacted", "Quote Sent", "Completed", "Cancelled"] as const).map(status => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {status === "ALL" ? "All Requests" : status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-extrabold text-white">Loading Vehicle Import Enquiries...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-white">No Vehicle Orders Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            When customers click &ldquo;Order This Car&rdquo; on any vehicle specification page, their order, reference code, and selected car details will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const idKey = req.id || req.referenceNumber;
            const waNumber = formatPhoneForWhatsApp(req.customerPhone);
            const waText = encodeURIComponent(
              `Hello ${req.customerName}, this is MILITO Automobile Desk regarding your Vehicle Import Quote Request (Ref: ${req.referenceNumber}) for the ${req.vehicleYear ? `${req.vehicleYear} ` : ""}${req.vehicleName} (${formatNaira(req.vehiclePrice)}) to ${req.deliveryCity ? `${req.deliveryCity}, ` : ""}${req.deliveryState}.`
            );
            const currentNotesValue =
              notesDraft[idKey] !== undefined ? notesDraft[idKey] : (req.adminNotes || "");

            return (
              <div
                key={idKey}
                className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all space-y-4"
              >
                {/* Top Row: Reference, Status Badge, Date & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-gray-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black tracking-wider text-white font-mono">
                        {req.referenceNumber}
                      </span>
                      <button
                        onClick={() => handleCopyRef(req.referenceNumber)}
                        className="ml-1 text-gray-400 hover:text-white transition-colors"
                        title="Copy Reference Number"
                      >
                        {copiedRef === req.referenceNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusBadgeClasses(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleString("en-NG", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Just now"}
                    </span>
                  </div>

                  {/* Status Selector, Confirm Availability & Delete */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {req.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange(req, "Availability Confirmed")}
                        disabled={updatingId === idKey}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Confirm Availability</span>
                      </button>
                    )}

                    <select
                      value={req.status}
                      disabled={updatingId === idKey}
                      onChange={e => handleStatusChange(req, e.target.value as VehicleImportStatus)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-extrabold text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Availability Confirmed">Availability Confirmed</option>
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quote Sent">Quote Sent</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleDelete(req)}
                      disabled={updatingId === idKey}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Delete Import Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Grid: Customer Details + Selected Vehicle Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Customer Info Column */}
                  <div className="lg:col-span-5 bg-gray-900/70 border border-gray-800/90 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Customer Details
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-400 font-bold">Full Name:</span>
                        <span className="font-black text-white">{req.customerName}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-400 font-bold">Phone / WhatsApp:</span>
                        <span className="font-black text-emerald-400 font-mono">{req.customerPhone}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-400 font-bold">Delivery Destination:</span>
                        <span className="font-extrabold text-white inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {req.deliveryCity ? `${req.deliveryCity}, ` : ""}
                          {req.deliveryState}
                        </span>
                      </div>
                    </div>

                    {req.message && (
                      <div className="pt-2 border-t border-gray-800">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-gray-500" />
                          Customer Note / Message
                        </p>
                        <p className="text-xs text-gray-200 bg-gray-950/70 border border-gray-800 rounded-lg p-2.5 leading-relaxed">
                          {req.message}
                        </p>
                      </div>
                    )}

                    {/* Direct Contact Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B14F] hover:bg-[#009943] text-black font-black text-xs transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Quote</span>
                        </a>
                      )}
                      {req.customerPhone && (
                        <a
                          href={`tel:${req.customerPhone}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Selected Vehicle Card Column */}
                  <div className="lg:col-span-7 bg-gray-900/70 border border-gray-800/90 rounded-xl p-4 flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {req.vehicleImage ? (
                        <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-gray-950 border border-gray-800 shrink-0">
                          <img
                            src={resolveImageUrl(req.vehicleImage, { width: 320 })}
                            alt={req.vehicleName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-600 shrink-0">
                          <Car className="w-7 h-7" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            Selected Vehicle
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                            ID: {req.vehicleId}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-white truncate">
                          {req.vehicleYear ? `${req.vehicleYear} ` : ""}
                          {req.vehicleBrand && !req.vehicleName.toLowerCase().includes(req.vehicleBrand.toLowerCase())
                            ? `${req.vehicleBrand} `
                            : ""}
                          {req.vehicleName}
                        </h4>

                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm sm:text-base font-black text-amber-400">
                            {formatNaira(req.vehiclePrice)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            (Total Purchase Price)
                          </span>
                        </div>

                        {/* Deposit Breakdown */}
                        <div className="p-2 rounded-lg bg-gray-950/70 border border-gray-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-amber-300">
                            <span className="font-bold flex items-center gap-1">
                              <span>Deposit ({req.depositPercentage || 30}%):</span>
                              {req.depositPaymentStatus && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-black ${
                                  req.depositPaymentStatus === "paid"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : req.depositPaymentStatus === "pending_verification"
                                    ? "bg-amber-500/20 text-amber-300 animate-pulse"
                                    : "bg-gray-800 text-gray-400"
                                }`}>
                                  {req.depositPaymentStatus === "paid" ? "Paid ✓" : req.depositPaymentStatus === "pending_verification" ? "Proof Submitted" : "Pending"}
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-black">
                              {formatNaira(req.requiredDepositAmount || (req.vehiclePrice * ((req.depositPercentage || 30) / 100)))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span className="font-bold">Remaining Balance:</span>
                            <span className="font-mono font-black">
                              {formatNaira(req.remainingBalanceAmount || (req.vehiclePrice - (req.requiredDepositAmount || (req.vehiclePrice * ((req.depositPercentage || 30) / 100)))))}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {req.vehicleCondition && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-200 text-[10px] font-bold">
                              {req.vehicleCondition}
                            </span>
                          )}
                          {req.vehicleTransmission && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-bold">
                              {req.vehicleTransmission}
                            </span>
                          )}
                          {req.vehicleMileage && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-bold">
                              {req.vehicleMileage}
                            </span>
                          )}
                          {req.vehicleFuelType && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-bold">
                              {req.vehicleFuelType}
                            </span>
                          )}
                          {req.vehicleEngine && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-bold">
                              {req.vehicleEngine}
                            </span>
                          )}
                          {req.vehicleLocation && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-bold">
                              {req.vehicleLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Internal Quote Notes */}
                    <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={currentNotesValue}
                        onChange={e =>
                          setNotesDraft(prev => ({
                            ...prev,
                            [idKey]: e.target.value
                          }))
                        }
                        placeholder="Add internal quote notes (e.g. customs clearance estimate, landed price sent)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleSaveNotes(req)}
                        disabled={updatingId === idKey}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-extrabold border border-gray-700 transition-all shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

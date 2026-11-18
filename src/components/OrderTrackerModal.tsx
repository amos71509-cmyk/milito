import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ShieldCheck,
  Box,
  Truck,
  Check,
  Loader2,
  Smartphone,
  AlertCircle,
  Car,
  Copy,
  CreditCard,
  CheckCircle2,
  FileText,
  UploadCloud,
  Eye,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";
import { ProtectedOrder } from "../types";

interface OrderTrackerModalProps {
  onClose: () => void;
  initialOrderId?: string;
  vehicleDepositSettings?: {
    depositPercentage: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    termsText: string;
  };
}

const PRESET_TRACKING_DATA: Record<string, {
  client: string;
  item: string;
  state: string;
  currentStep: number;
  steps: { title: string; desc: string; date: string; finished: boolean }[];
}> = {
  "MLT-LAG-821": {
    client: "Babatunde Alao",
    item: "Apple iPhone 14 Pro (Premium UK Used - 256GB Space Black)",
    state: "Lagos State Delivery",
    currentStep: 3,
    steps: [
      { title: "Order Confirmed", desc: "Order details confirmed for Lagos State processing.", date: "Today, 9:20 AM", finished: true },
      { title: "35-Point Diagnostic Cleared", desc: "Passes battery test (94%), TrueTone, and RF carrier inspections.", date: "Today, 11:30 AM", finished: true },
      { title: "Dispatched with Courier", desc: "Handover complete. Passed to Lagos State express dispatch.", date: "Today, 2:15 PM", finished: true },
      { title: "Out for Delivery", desc: "Rider in route. Package will be unboxed and inspected by client upon arrival.", date: "Estimated: Within 2 Hours", finished: false }
    ]
  },
  "MLT-ABV-405": {
    client: "Dr. Kunle Adeleke",
    item: "Toyota RAV4 2021 Sourcing (European Port Importation)",
    state: "Abuja Custom Port Delivery",
    currentStep: 2,
    steps: [
      { title: "Auction Bid Clearance Success", desc: "Landed container bidding cleared at Antwerp Port, Belgium.", date: "June 14, 2026", finished: true },
      { title: "Atlantic Ocean Transit", desc: "Ocean freight container loaded and currently in transit to Tin Can Port, Lagos.", date: "June 16, 2026", finished: true },
      { title: "Tin Can Port Customs Clearing", desc: "Custom documentation clearance and duty valuation matching estimated parameters.", date: "In Progress (ETA: 4 Days)", finished: false },
      { title: "Abuja Flatbed Dispatch", desc: "Secured on flatbed truck for transit to Abuja Wuse 2 Center.", date: "Pending Clearing Completion", finished: false }
    ]
  }
};

export default function OrderTrackerModal({ onClose, initialOrderId, vehicleDepositSettings }: OrderTrackerModalProps) {
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  const [trackCode, setTrackCode] = useState(initialOrderId || "");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [isProtectedDbOrder, setIsProtectedDbOrder] = useState(false);

  // Bank Transfer Notification Form State
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [paymentTypeToSubmit, setPaymentTypeToSubmit] = useState<"deposit" | "balance">("deposit");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Receipt Upload State
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUploadError, setProofUploadError] = useState<string | null>(null);
  const [viewingZoomReceiptUrl, setViewingZoomReceiptUrl] = useState<string | null>(null);

  // Default Bank details
  const bankName = vehicleDepositSettings?.bankName || "Moniepoint MFB / Zenith Bank";
  const accountName = vehicleDepositSettings?.accountName || "MILITO TECH & AUTOMOBILE LTD";
  const accountNumber = vehicleDepositSettings?.accountNumber || "8089456201";
  const termsText = vehicleDepositSettings?.termsText || "1. A mandatory deposit is required to lock vehicle availability and initiate port clearing & logistics. 2. Deposits are 100% refundable if vehicle inspection fails or customs documentation is incomplete. 3. Remaining balance is due upon arrival at Lagos port or final delivery location before handover.";

  // Auto-search if initialOrderId is provided
  useEffect(() => {
    if (initialOrderId) {
      performSearch(initialOrderId);
    } else {
      const saved = sessionStorage.getItem("last_created_order_id");
      if (saved) {
        setTrackCode(saved);
      }
    }
  }, [initialOrderId]);

  const performSearch = async (codeToSearch: string) => {
    const formattedCode = codeToSearch.trim().toUpperCase();
    if (!formattedCode) return;
    setErrorText("");
    setIsLoading(false);
    setIsProtectedDbOrder(false);
    setTransferSuccessMessage(null);

    // 1. Check if it is a preset demo code
    if (PRESET_TRACKING_DATA[formattedCode]) {
      setActiveResult(PRESET_TRACKING_DATA[formattedCode]);
      setIsLoading(false);
      return;
    }

    // 2. Query backend for real MIL- orders (including MIL-CAR- and MIL-YYYYMMDD-)
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(formattedCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const ord: ProtectedOrder = data.order;
          setIsProtectedDbOrder(true);

          const isVehicleOrder =
            ord.orderType === "vehicle" ||
            ord.productType === "vehicle" ||
            ord.orderId?.startsWith("MIL-CAR") ||
            ord.orderId?.startsWith("MIL-AUTO");

          const isAvailabilityConfirmed =
            Boolean(ord.availabilityConfirmed) ||
            ord.orderStatus === "availability_confirmed" ||
            ord.paymentStatus === "ready_for_payment" ||
            ord.paymentStatus === "paid" ||
            ord.depositPaymentStatus === "paid";

          const totalAmount = ord.totalPurchasePrice || ord.totalAmount || 0;
          const depositPercentage = ord.depositPercentage || vehicleDepositSettings?.depositPercentage || 30;
          const requiredDepositAmount = ord.requiredDepositAmount || Math.round(totalAmount * (depositPercentage / 100));
          const remainingBalanceAmount = ord.remainingBalanceAmount || (totalAmount - requiredDepositAmount);

          const isPaid = ord.paymentStatus === "paid" || (ord.depositPaymentStatus === "paid" && ord.balancePaymentStatus === "paid");
          const isDepositPaid = ord.depositPaymentStatus === "paid" || isPaid;
          const isBalancePaid = ord.balancePaymentStatus === "paid" || isPaid;
          const isDepositPending = ord.depositPaymentStatus === "pending_verification" || (!isDepositPaid && ord.paymentStatus === "pending_verification");
          const isBalancePending = ord.balancePaymentStatus === "pending_verification";

          const steps = isVehicleOrder
            ? [
                {
                  title: "Order Placed & Vehicle Attached",
                  desc: `Order ${ord.orderId} recorded with chosen specifications and delivery location (${ord.customer.state}).`,
                  date: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Logged",
                  finished: true
                },
                {
                  title: "Vehicle Availability Physical Check",
                  desc: isAvailabilityConfirmed
                    ? "Vehicle availability confirmed by MILITO Automobile Desk. Deposit payment is now unlocked."
                    : "MILITO Automobile Desk is currently physically inspecting port/depot inventory. Deposit payment is locked until verified.",
                  date: ord.availabilityConfirmedAt
                    ? new Date(ord.availabilityConfirmedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : isAvailabilityConfirmed
                    ? "Verified Available"
                    : "Verification in Progress",
                  finished: isAvailabilityConfirmed
                },
                {
                  title: `Vehicle Deposit Payment (${depositPercentage}%)`,
                  desc: isDepositPaid
                    ? `Deposit of ${formatPrice(requiredDepositAmount)} confirmed & verified by MILITO Admin. Vehicle secured.`
                    : isDepositPending
                    ? `Deposit transfer proof submitted (${formatPrice(requiredDepositAmount)}). Automobile desk is verifying with the bank.`
                    : isAvailabilityConfirmed
                    ? `Vehicle confirmed available! Transfer required deposit of ${formatPrice(requiredDepositAmount)} below to initiate port clearing.`
                    : "Deposit unlocks once vehicle availability is confirmed by Admin.",
                  date: isDepositPaid
                    ? "Deposit Verified"
                    : isDepositPending
                    ? "Reviewing Transfer"
                    : isAvailabilityConfirmed
                    ? "Action Required"
                    : "Locked",
                  finished: isDepositPaid
                },
                {
                  title: "Customs Clearing & Port Processing",
                  desc: "Nigerian Customs assessment, authentic documentation, and port exit clearance.",
                  date: isDepositPaid ? "In Progress" : "Pending Deposit",
                  finished: isDepositPaid && isBalancePaid
                },
                {
                  title: `Outstanding Balance Payment (${100 - depositPercentage}%)`,
                  desc: isBalancePaid
                    ? `Full remaining balance of ${formatPrice(remainingBalanceAmount)} cleared. Vehicle 100% paid.`
                    : isBalancePending
                    ? `Balance payment transfer receipt submitted (${formatPrice(remainingBalanceAmount)}). Verifying with the bank.`
                    : isDepositPaid
                    ? `Remaining balance of ${formatPrice(remainingBalanceAmount)} payable according to MILITO terms prior to final handover.`
                    : "Payable after port customs clearing.",
                  date: isBalancePaid ? "Paid in Full" : isBalancePending ? "Reviewing Transfer" : isDepositPaid ? "Payable Later" : "Pending",
                  finished: isBalancePaid
                },
                {
                  title: "Interstate Transit & Direct Handover",
                  desc: `Inspected delivery to ${ord.customer.city || ord.customer.address}, ${ord.customer.state}. Customer confirms vehicle before final release.`,
                  date: isBalancePaid ? "Dispatch Ready" : "Pending Balance",
                  finished: false
                }
              ]
            : [
                {
                  title: "Order Placed",
                  desc: `Order generated with ID ${ord.orderId} and recorded in database.`,
                  date: new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  finished: true
                },
                {
                  title: isPaid ? "Payment Verified" : "Payment / Confirmation Pending",
                  desc: isPaid
                    ? `Payment confirmed. Reference: ${ord.paymentReference || "Direct Verification"}`
                    : "Awaiting order confirmation or payment verification.",
                  date: ord.paidAt ? new Date(ord.paidAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Pending",
                  finished: isPaid
                },
                {
                  title: "Device Inspection & Order Preparation",
                  desc: "35-Point diagnostic inspection for battery health, cameras, and factory seals.",
                  date: isPaid ? "In Progress" : "Pending Confirmation",
                  finished: isPaid
                },
                {
                  title: "Delivery & Completion",
                  desc: `Courier dispatch to ${ord.customer.address}. Device unboxed and verified upon handover.`,
                  date: "Pending Dispatch",
                  finished: false
                }
              ];

          setActiveResult({
            isRealOrder: true,
            isVehicleOrder,
            isAvailabilityConfirmed,
            isPaid,
            isDepositPaid,
            isBalancePaid,
            isDepositPending,
            isBalancePending,
            depositPercentage,
            requiredDepositAmount,
            remainingBalanceAmount,
            depositPaymentProofUrl: ord.depositPaymentProofUrl || ord.paymentProofUrl || ord.transferNotice?.paymentProofUrl,
            balancePaymentProofUrl: ord.balancePaymentProofUrl || ord.balanceTransferNotice?.paymentProofUrl,
            orderId: ord.orderId,
            client: ord.customer.name,
            phone: ord.customer.phone,
            address: `${ord.customer.city ? ord.customer.city + ", " : ""}${ord.customer.address || ""}, ${ord.customer.state}`,
            item: ord.productName + (ord.selectedSpecification ? ` (${ord.selectedSpecification})` : ""),
            vehicleDetails: ord.vehicleDetails,
            productImage: ord.productImage,
            totalAmount,
            totalPurchasePrice: totalAmount,
            unitPrice: ord.unitPrice,
            quantity: ord.quantity,
            state: `${ord.customer.state} Delivery`,
            paymentStatus: ord.paymentStatus,
            orderStatus: ord.orderStatus,
            createdAt: ord.createdAt,
            paidAt: ord.paidAt,
            steps
          });

          // Pre-fill sender name if empty
          if (!senderName && ord.customer.name) {
            setSenderName(ord.customer.name);
          }

          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("[OrderTracker] DB search error:", err);
    }

    setActiveResult(null);
    setErrorText("No order found with this tracking ID. Please check the code or use a sample token.");
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackCode);
  };

  const handleCopyAccount = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2200);
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    setProofUploadError(null);
    setPaymentProofFileName(file.name);

    try {
      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("folder", "milito_payment_proofs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.files?.[0]?.secure_url) {
        throw new Error(data.error || "Failed to upload payment receipt.");
      }

      setPaymentProofUrl(data.files[0].secure_url);
    } catch (err: any) {
      console.error("[OrderTracker] Receipt upload error:", err);
      setProofUploadError(err.message || "Failed to upload receipt. Please check file format (JPG, PNG) or size.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResult?.orderId) return;

    setIsSubmittingTransfer(true);
    setTransferSuccessMessage(null);
    try {
      const res = await fetch("/api/orders/notify-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeResult.orderId,
          senderName: senderName || activeResult.client,
          senderBank: senderBank || "Direct Bank Transfer",
          transferReference: transferRef || `TRANS-${Date.now()}`,
          paymentProofUrl: paymentProofUrl || null,
          paymentType: paymentTypeToSubmit
        })
      });

      if (res.ok) {
        const typeLabel = paymentTypeToSubmit === "balance" ? "Outstanding balance payment" : "Deposit payment";
        setTransferSuccessMessage(`${typeLabel} details submitted successfully! MILITO Automobile Desk has been notified to verify your bank transaction.`);
        setShowTransferForm(false);
        setPaymentProofUrl(null);
        setPaymentProofFileName(null);
        // Refresh tracker data
        performSearch(activeResult.orderId);
      } else {
        const data = await res.json();
        setErrorText(data.error || "Failed to submit transfer notification.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Network error submitting transfer notice.");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(p || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden my-auto animate-scaleUp text-gray-900">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-150 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-extrabold text-gray-950 text-xs sm:text-sm font-sans">
              MILITO Order &amp; Automobile Tracker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 text-gray-500 hover:text-black bg-gray-100 rounded transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tracker Search Bar form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">
              Enter Tracking Code / Order ID (e.g. MIL-CAR-XXXXXX)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="e.g. MIL-CAR-XXXXXX or MIL-20260820-A7F9"
                className="w-full bg-white border border-gray-300 focus:border-[#10B981] rounded-xl py-3 pl-4 pr-12 focus:outline-none text-gray-950 text-xs placeholder-gray-400 uppercase font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-[#10B981] text-black hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {errorText && (
              <p className="text-xs text-red-600 font-semibold">{errorText}</p>
            )}

            {/* Helper presets for demo */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl relative space-y-1.5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Quick Sample Tracking Tokens:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTrackCode("MLT-LAG-821");
                    performSearch("MLT-LAG-821");
                  }}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-emerald-800 font-mono text-[10px] font-bold hover:bg-gray-100 transition cursor-pointer shadow-2xs"
                >
                  MLT-LAG-821 (Phone Order)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrackCode("MLT-ABV-405");
                    performSearch("MLT-ABV-405");
                  }}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-emerald-800 font-mono text-[10px] font-bold hover:bg-gray-100 transition cursor-pointer shadow-2xs"
                >
                  MLT-ABV-405 (Vehicle Demo)
                </button>
              </div>
            </div>
          </form>

          {/* Transfer Success Alert */}
          {transferSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{transferSuccessMessage}</span>
            </div>
          )}

          {/* Result Block */}
          {activeResult && (
            <div className="border-t border-gray-200 pt-5 animate-fadeIn space-y-4">
              
              {/* Status Header Badge for DB Orders */}
              {isProtectedDbOrder && (
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  activeResult.isVehicleOrder
                    ? "bg-amber-50/80 border-amber-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}>
                  <div className="flex items-center gap-1.5">
                    {activeResult.isVehicleOrder ? (
                      <Car className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Box className="w-4 h-4 text-[#10B981]" />
                    )}
                    <span className="text-xs font-black text-gray-950 uppercase">
                      {activeResult.isVehicleOrder ? "AUTOMOBILE ORDER" : "GADGET ORDER"}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    activeResult.isPaid
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : activeResult.isDepositPaid && !activeResult.isBalancePaid
                      ? "bg-blue-100 text-blue-900 border-blue-300"
                      : activeResult.isDepositPending || activeResult.isBalancePending
                      ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                      : activeResult.isAvailabilityConfirmed
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                  }`}>
                    {activeResult.isPaid
                      ? "Payment Verified (Paid in Full)"
                      : activeResult.isDepositPaid && !activeResult.isBalancePaid
                      ? "Deposit Paid (30%) • Balance Pending"
                      : activeResult.isDepositPending
                      ? "Deposit Transfer Under Review"
                      : activeResult.isBalancePending
                      ? "Balance Transfer Under Review"
                      : activeResult.isAvailabilityConfirmed
                      ? "Availability Confirmed • Ready for Deposit"
                      : "Awaiting Availability Confirmation"}
                  </span>
                </div>
              )}

              {/* Order Summary Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-black text-gray-950">{activeResult.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient Name:</span> 
                  <span className="font-bold text-gray-950">{activeResult.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{activeResult.isVehicleOrder ? "Vehicle Model:" : "Item / Spec:"}</span> 
                  <span className="font-bold text-gray-950 text-right line-clamp-1 max-w-[280px]">{activeResult.item}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span> 
                  <span className="font-semibold text-emerald-800">{activeResult.state}</span>
                </div>

                {/* Price Breakdown */}
                {activeResult.totalAmount && (
                  <div className="pt-2 border-t border-gray-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-extrabold">
                        {activeResult.isVehicleOrder ? "Total Purchase Price:" : "Total Amount:"}
                      </span> 
                      <span className="font-mono font-black text-gray-950 text-sm">
                        {formatPrice(activeResult.totalAmount)}
                      </span>
                    </div>

                    {activeResult.isVehicleOrder && (
                      <>
                        <div className="flex justify-between items-center text-emerald-700">
                          <span className="font-bold">Required Deposit ({activeResult.depositPercentage || 30}%):</span>
                          <span className="font-mono font-black">
                            {formatPrice(activeResult.requiredDepositAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Remaining Balance ({100 - (activeResult.depositPercentage || 30)}%):</span>
                          <span className="font-mono font-bold">
                            {formatPrice(activeResult.remainingBalanceAmount)}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800 font-bold pt-1 border-t border-gray-150">
                          ✓ Includes shipping &amp; customs clearing to Nigeria • 0 hidden fees
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* VEHICLE AVAILABILITY NOTICE (LOCKED STATE) */}
              {activeResult.isVehicleOrder && !activeResult.isAvailabilityConfirmed && !activeResult.isPaid && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Availability Verification in Progress</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Admin is physically confirming vehicle availability at the port/depot. Deposit payment is locked until physical verification is completed by the desk.
                  </p>
                </div>
              )}

              {/* VEHICLE ESCROW PAYMENT WORKFLOW (DEPOSIT OR BALANCE) */}
              {activeResult.isVehicleOrder && activeResult.isAvailabilityConfirmed && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-400 space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-950 inline-flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Availability Confirmed</span>
                      </span>
                      <h4 className="text-sm font-black text-gray-950 mt-1">
                        {!activeResult.isDepositPaid
                          ? `Pay Required Deposit (${activeResult.depositPercentage || 30}%: ${formatPrice(activeResult.requiredDepositAmount)})`
                          : !activeResult.isBalancePaid
                          ? `Pay Remaining Balance (${formatPrice(activeResult.remainingBalanceAmount)})`
                          : "Vehicle Payment Complete"}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {!activeResult.isDepositPaid
                          ? `Transfer your required ${activeResult.depositPercentage || 30}% deposit to secure this vehicle and initiate port clearing.`
                          : !activeResult.isBalancePaid
                          ? `Your deposit is verified! You can pay your outstanding balance now or according to MILITO terms before final handover.`
                          : "Both deposit and balance payments have been verified. Vehicle is ready for final handover."}
                      </p>
                    </div>
                  </div>

                  {/* Terms & Policies Card */}
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-[10.5px] space-y-1 text-gray-700">
                    <p className="font-black text-gray-950 uppercase text-[10px]">MILITO Escrow &amp; Refund Terms:</p>
                    <p>• <strong>Deposit:</strong> Secures vehicle allocation &amp; customs documentation.</p>
                    <p>• <strong>Refund:</strong> 100% money-back guarantee if the vehicle fails physical inspection or documentation.</p>
                    <p>• <strong>Balance:</strong> Payable upon port clearance or prior to direct handover.</p>
                  </div>

                  {/* Official Bank Account Details Box */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Bank Name:</span>
                      <span className="font-extrabold text-gray-950">{bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Account Name:</span>
                      <span className="font-extrabold text-gray-950">{accountName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-emerald-700 text-sm tracking-wider">{accountNumber}</span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="p-1 text-gray-500 hover:text-black transition"
                          title="Copy Account Number"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-150 text-[11px]">
                      <span className="text-gray-500">Payment Narration / Ref:</span>
                      <span className="font-mono font-bold text-gray-900">{activeResult.orderId}</span>
                    </div>
                  </div>

                  {/* Attached Proof Previews if already submitted */}
                  {activeResult.depositPaymentProofUrl && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        Deposit Transfer Receipt (Attached)
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src={activeResult.depositPaymentProofUrl}
                          alt="Deposit Receipt"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 cursor-pointer hover:scale-105 transition"
                          onClick={() => setViewingZoomReceiptUrl(activeResult.depositPaymentProofUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => setViewingZoomReceiptUrl(activeResult.depositPaymentProofUrl)}
                          className="text-xs font-bold text-emerald-700 underline cursor-pointer"
                        >
                          View Receipt Screenshot
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Forms / Buttons */}
                  {(!activeResult.isDepositPaid || (!activeResult.isBalancePaid && activeResult.isDepositPaid)) && (
                    <>
                      {activeResult.isDepositPending && !activeResult.isDepositPaid ? (
                        <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                          <span>
                            <strong>Deposit Transfer Submitted:</strong> Admin is verifying your deposit transaction with the bank. Status will update once confirmed.
                          </span>
                        </div>
                      ) : activeResult.isBalancePending && activeResult.isDepositPaid ? (
                        <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                          <span>
                            <strong>Balance Transfer Submitted:</strong> Admin is verifying your remaining balance payment with the bank.
                          </span>
                        </div>
                      ) : !showTransferForm ? (
                        <button
                          type="button"
                          id="ive-made-payment-btn"
                          onClick={() => {
                            setPaymentTypeToSubmit(!activeResult.isDepositPaid ? "deposit" : "balance");
                            setShowTransferForm(true);
                          }}
                          className="w-full py-3.5 px-4 rounded-xl bg-[#00B14F] hover:bg-[#009943] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>
                            {!activeResult.isDepositPaid
                              ? "I've Made Payment"
                              : "Pay Outstanding Balance"}
                          </span>
                        </button>
                      ) : (
                        <form onSubmit={handleTransferSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 text-xs animate-fadeIn">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-black text-gray-950 uppercase text-[11px]">
                              {paymentTypeToSubmit === "deposit"
                                ? `Submit Deposit Payment Receipt (${formatPrice(activeResult.requiredDepositAmount)})`
                                : `Submit Balance Payment Receipt (${formatPrice(activeResult.remainingBalanceAmount)})`}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowTransferForm(false);
                                setPaymentProofUrl(null);
                                setPaymentProofFileName(null);
                              }}
                              className="text-gray-400 hover:text-black text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                              Sender Full Name (as on your bank account) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="e.g. Babatunde Adeleke"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-950 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Your Bank <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={senderBank}
                                onChange={(e) => setSenderBank(e.target.value)}
                                placeholder="e.g. GTBank / Zenith"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-950 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                Reference / Session ID
                              </label>
                              <input
                                type="text"
                                value={transferRef}
                                onChange={(e) => setTransferRef(e.target.value)}
                                placeholder="Optional session ID"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-950 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Upload Receipt / Proof Section */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase">
                              Upload Bank Transfer Receipt / Screenshot
                            </label>
                            
                            {paymentProofUrl ? (
                              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={paymentProofUrl}
                                    alt="Receipt Preview"
                                    className="w-10 h-10 rounded-lg object-cover border border-emerald-400 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <span className="text-[11px] font-bold text-emerald-950 block truncate">
                                      {paymentProofFileName || "Receipt Attached"}
                                    </span>
                                    <span className="text-[9px] text-emerald-700 font-semibold">Ready to submit</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentProofUrl(null);
                                    setPaymentProofFileName(null);
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                  title="Remove receipt"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReceiptFileChange}
                                  disabled={isUploadingProof}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="p-3 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50 hover:bg-gray-100 transition flex flex-col items-center justify-center gap-1">
                                  {isUploadingProof ? (
                                    <>
                                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                      <span className="text-[10px] font-bold text-gray-700">Uploading receipt to secure vault...</span>
                                    </>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-5 h-5 text-gray-500" />
                                      <span className="text-xs font-bold text-gray-800">Click to upload payment receipt</span>
                                      <span className="text-[9.5px] text-gray-500">Supports JPG, PNG, WEBP screenshots</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {proofUploadError && (
                              <p className="text-[10px] font-bold text-red-600">{proofUploadError}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingTransfer || isUploadingProof}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingTransfer ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <Check className="w-4 h-4 stroke-[3]" />
                            )}
                            <span>Confirm Payment Sent</span>
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Milestones Vertical path */}
              <div className="space-y-4 relative pl-4 after:absolute after:top-2 after:bottom-2 after:left-5 after:w-0.5 after:bg-gray-200">
                {activeResult.steps.map((st: any, i: number) => {
                  const isDone = st.finished;
                  return (
                    <div key={i} className="flex gap-4 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                        isDone 
                          ? "bg-[#10B981] border-[#10B981] scale-110" 
                          : "bg-transparent border-gray-300"
                      }`}>
                        {isDone && <Check className="w-2.5 h-2.5 text-black" />}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold leading-none ${isDone ? "text-gray-900" : "text-gray-500"}`}>
                          {st.title}
                        </h5>
                        <p className="text-[10px] text-gray-600 mt-1 leading-relaxed max-w-sm">
                          {st.desc}
                        </p>
                        <span className="text-[9px] font-semibold text-gray-400 mt-0.5 block font-mono">{st.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status footer alert box */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-[10.5px] text-emerald-950 leading-relaxed flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>
                  {activeResult.isVehicleOrder
                    ? "MILITO Automobile Procurement Escrow: All vehicles undergo physical diagnostic inspection and custom documentation clearance before delivery."
                    : "Inspect device specifications, battery health, cameras, and physical condition upon delivery."}
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FULL RECEIPT ZOOM MODAL */}
      {viewingZoomReceiptUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs text-gray-900">Transfer Receipt Screenshot</span>
              <button
                type="button"
                onClick={() => setViewingZoomReceiptUrl(null)}
                className="p-1 rounded bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-lg bg-gray-100 flex items-center justify-center">
              <img
                src={viewingZoomReceiptUrl}
                alt="Receipt Zoom"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

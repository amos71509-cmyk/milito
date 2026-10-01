import React, { useState, useEffect } from "react";
import { Search, X, ShieldCheck, Box, Landmark, Truck, Check, Lock, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";
import { ProtectedOrder, resolveImageUrl } from "../types";

interface OrderTrackerModalProps {
  onClose: () => void;
  initialOrderId?: string;
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

export default function OrderTrackerModal({ onClose, initialOrderId }: OrderTrackerModalProps) {
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
    setIsLoading(true);
    setIsProtectedDbOrder(false);

    // 1. Check if it is a preset demo code
    if (PRESET_TRACKING_DATA[formattedCode]) {
      setActiveResult(PRESET_TRACKING_DATA[formattedCode]);
      setIsLoading(false);
      return;
    }

    // 2. Query backend for real MIL-YYYYMMDD-XXXX protected orders
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(formattedCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const ord: ProtectedOrder = data.order;
          setIsProtectedDbOrder(true);
          
          const isPaid = ord.paymentStatus === "paid";
          const isProtected = ord.orderStatus === "protected";

          setActiveResult({
            isRealOrder: true,
            orderId: ord.orderId,
            client: ord.customer.name,
            phone: ord.customer.phone,
            address: `${ord.customer.address}, ${ord.customer.state}`,
            item: `${ord.productName} (${ord.selectedSpecification})`,
            productImage: ord.productImage,
            totalAmount: ord.totalAmount,
            unitPrice: ord.unitPrice,
            quantity: ord.quantity,
            state: `${ord.customer.state} Delivery`,
            paymentStatus: ord.paymentStatus,
            orderStatus: ord.orderStatus,
            createdAt: ord.createdAt,
            paidAt: ord.paidAt,
            steps: [
              {
                title: "Order Placed",
                desc: `Order generated with ID ${ord.orderId} and recorded in database.`,
                date: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                finished: true
              },
              {
                title: isPaid ? "Payment Verified" : "Payment / Confirmation Pending",
                desc: isPaid 
                  ? `Payment confirmed. Reference: ${ord.paymentReference || "Direct Verification"}`
                  : "Awaiting order confirmation or payment verification.",
                date: ord.paidAt ? new Date(ord.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending",
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
            ]
          });
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

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden my-auto animate-scaleUp text-gray-900">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-150 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-extrabold text-gray-950 text-xs sm:text-sm font-sans">
              MILITO Order Delivery Tracker
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
              Enter Tracking Code / Order ID (e.g. MIL-XXXXXXXX)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="e.g. MIL-20260820-A7F9 or MLT-LAG-821"
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

            {/* Helper presets for client demo */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl relative space-y-1.5">
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
                  MLT-ABV-405 (Vehicle Import)
                </button>
              </div>
            </div>
          </form>

          {/* Result Block */}
          {activeResult && (
            <div className="border-t border-gray-200 pt-5 animate-fadeIn space-y-4">
              
              {/* Status Header Badge for DB Orders */}
              {isProtectedDbOrder && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs font-black text-emerald-950 uppercase">
                      {activeResult.orderStatus === "completed" ? "ORDER COMPLETED" : "ORDER IN PROGRESS"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    activeResult.paymentStatus === "paid" 
                      ? "bg-emerald-200 text-emerald-950" 
                      : "bg-amber-100 text-amber-900"
                  }`}>
                    Status: {activeResult.paymentStatus}
                  </span>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient Name:</span> 
                  <span className="font-bold text-gray-950">{activeResult.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Item / Spec:</span> 
                  <span className="font-bold text-gray-950 text-right line-clamp-1 max-w-[280px]">{activeResult.item}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span> 
                  <span className="font-semibold text-emerald-800">{activeResult.state}</span>
                </div>
                {activeResult.totalAmount && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500 font-bold">Total Amount:</span> 
                    <span className="font-mono font-black text-gray-950">{formatPrice(activeResult.totalAmount)}</span>
                  </div>
                )}
              </div>

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
                  Inspect device specifications, battery health, cameras, and physical condition upon delivery.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

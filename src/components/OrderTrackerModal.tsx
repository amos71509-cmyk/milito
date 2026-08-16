import React, { useState } from "react";
import { Search, X, ShieldCheck, Box, Landmark, Truck, Check } from "lucide-react";

interface OrderTrackerModalProps {
  onClose: () => void;
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
      { title: "Escrow Deposit Confirmed", desc: "Security deposit of ₦930,000 confirmed in MILITO protection vault.", date: "Today, 9:20 AM", finished: true },
      { title: "35-Point Diagnostic Cleared", desc: "Passes battery test (94%), TrueTone, and RF carrier inspections.", date: "Today, 11:30 AM", finished: true },
      { title: "Dispatched with Secure Courier", desc: "Handover complete. Passed to Lagos State premium express dispatch.", date: "Today, 2:15 PM", finished: true },
      { title: "Out for Inspection Delivery", desc: "Rider in route. Package will be unboxed and verified by client before release code is given.", date: "Estimated: Within 2 Hours", finished: false }
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

export default function OrderTrackerModal({ onClose }: OrderTrackerModalProps) {
  const [trackCode, setTrackCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [activeResult, setActiveResult] = useState<typeof PRESET_TRACKING_DATA[string] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = trackCode.trim().toUpperCase();
    if (!formattedCode) return;

    if (PRESET_TRACKING_DATA[formattedCode]) {
      setActiveResult(PRESET_TRACKING_DATA[formattedCode]);
      setErrorText("");
    } else {
      setActiveResult(null);
      setErrorText("Invalid tracking token. Try using one of our demo codes listed below.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl border border-gray-250 shadow-2xl flex flex-col overflow-hidden my-auto animate-scaleUp">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-150 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-milito-green" />
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm font-sans">MILITO Secure Parcel Tracker</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 text-gray-550 hover:text-black bg-gray-100 rounded transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tracker Search Bar form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">
              Enter Tracking Code / Reference Waybill
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="e.g. MLT-LAG-821"
                className="w-full bg-white border border-gray-300 focus:border-milito-green rounded-xl py-3 pl-4 pr-12 focus:outline-none text-gray-950 text-xs placeholder-gray-400 uppercase font-mono tracking-wider"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-milito-green text-black hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <p className="text-xs text-red-500 font-semibold">{errorText}</p>
            )}

            {/* Helper presets for client demo */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl relative">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Active Client Demo Tracking Tokens:
              </span>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTrackCode("MLT-LAG-821");
                    setActiveResult(PRESET_TRACKING_DATA["MLT-LAG-821"]);
                    setErrorText("");
                  }}
                  className="bg-white border border-gray-250 px-3 py-1.5 rounded-lg text-milito-green font-mono text-[10px] font-bold hover:bg-gray-100 transition cursor-pointer shadow-sm"
                >
                  MLT-LAG-821 (Phone order)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrackCode("MLT-ABV-405");
                    setActiveResult(PRESET_TRACKING_DATA["MLT-ABV-405"]);
                    setErrorText("");
                  }}
                  className="bg-white border border-gray-250 px-3 py-1.5 rounded-lg text-milito-green font-mono text-[10px] font-bold hover:bg-gray-100 transition cursor-pointer shadow-sm"
                >
                  MLT-ABV-405 (Vehicle Import)
                </button>
              </div>
            </div>
          </form>

          {/* Result Block */}
          {activeResult && (
            <div className="border-t border-gray-200 pt-6 animate-fadeIn space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Recipient Name:</span> <span className="font-bold text-gray-950">{activeResult.client}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Device/Sourcing:</span> <span className="font-bold text-gray-950 text-right line-clamp-1 max-w-[280px]">{activeResult.item}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Custom Destination:</span> <span className="font-semibold text-milito-green">{activeResult.state}</span></div>
              </div>

              {/* Milestones Vertical path */}
              <div className="space-y-5 relative pl-4 after:absolute after:top-2 after:bottom-2 after:left-5 after:w-0.5 after:bg-gray-200">
                {activeResult.steps.map((st, i) => {
                  const isDone = st.finished;
                  return (
                    <div key={i} className="flex gap-4 relative z-10">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                        isDone 
                          ? "bg-milito-green border-milito-green scale-110" 
                          : "bg-transparent border-gray-300"
                      }`}>
                        {isDone && <Check className="w-2.5 h-2.5 text-black" />}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold leading-none ${isDone ? "text-gray-900" : "text-gray-500"}`}>
                          {st.title}
                        </h5>
                        <p className="text-[10px] text-gray-650 mt-1 leading-relaxed max-w-sm">
                          {st.desc}
                        </p>
                        <span className="text-[9px] font-semibold text-gray-500 mt-0.5 block font-mono">{st.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status footer alert box */}
              <div className="bg-milito-green/10 border border-milito-green/20 p-3.5 rounded-xl text-[10.5px] text-gray-750 leading-relaxed flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-milito-green flex-shrink-0" />
                <span>
                  Delivery is fully insured. Our dispatch rider will hand you the original receipt, battery statistics check sheet, and original accessories for inspection.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

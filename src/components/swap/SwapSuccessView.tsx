import React, { useState } from "react";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Search,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { SwapRequest } from "../../types";
import { formatNaira } from "../../utils/swapUtils";

interface SwapSuccessViewProps {
  request: SwapRequest;
  onTrackSwap: (swapId: string) => void;
  onStartNewSwap: () => void;
  onBackToShop: () => void;
}

export default function SwapSuccessView({
  request,
  onTrackSwap,
  onStartNewSwap,
  onBackToShop,
}: SwapSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate WhatsApp message with all prefilled details
  const getWhatsAppChatUrl = () => {
    const text = 
      `Hello MILITO TECH HOME, I just submitted a device swap request on your website.\n\n` +
      `📌 *Swap ID:* ${request.id}\n` +
      `👤 *Name:* ${request.customerName}\n` +
      `📍 *Location:* ${request.customerLocation}\n\n` +
      `📱 *My Current Device:*\n` +
      `- Model: ${request.currentDevice.brand} ${request.currentDevice.model} (${request.currentDevice.storage})\n` +
      `- Condition: ${request.currentDevice.estimatedGrade}\n` +
      `- Estimated Value: ${formatNaira(request.currentDevice.estimatedValue)}\n\n` +
      `🚀 *Desired Upgrade:*\n` +
      `- Device: ${request.targetProduct.name} (${request.targetProduct.condition})\n` +
      `- Catalogue Price: ${formatNaira(request.targetProduct.price)}\n` +
      `- Estimated Top-Up: ${request.calculation.isTopUp ? formatNaira(request.calculation.difference) : "₦0 (Direct Swap)"}\n\n` +
      `Please let me know the next inspection steps. Thank you!`;

    return `https://wa.me/2349000000000?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-scaleUp py-6">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-[#1A2025] to-gray-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-milito-green/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-milito-green/20 border-2 border-milito-green text-milito-green flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,177,79,0.4)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs uppercase tracking-widest font-black text-milito-green bg-milito-green/10 px-3 py-1 rounded-full border border-milito-green/20">
            Request Received
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 font-sans">
            Swap Request Submitted!
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm max-w-lg mt-2 font-medium leading-relaxed">
            Your trade-in estimation has been recorded. Our appraisal team will review your specifications and reach out to you via WhatsApp.
          </p>

          {/* Swap ID Copy Box */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-md px-5 py-3 rounded-2xl">
            <span className="text-xs text-gray-300 font-medium">Your Swap ID:</span>
            <span className="font-mono text-sm sm:text-base font-black text-milito-green tracking-wider">
              {request.id}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition cursor-pointer"
              title="Copy Swap ID"
            >
              {copied ? <Check className="w-4 h-4 text-milito-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Details Recap Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-milito-green" />
          Swap Breakdown & Financials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Current device */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
              Current Device Traded In
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-gray-950">
              {request.currentDevice.model}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{request.currentDevice.storage}</span>
              <span>•</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {request.currentDevice.estimatedGrade}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-xs">
              <span className="text-gray-500">Estimated Value:</span>
              <span className="font-bold text-gray-900">{formatNaira(request.currentDevice.estimatedValue)}</span>
            </div>
          </div>

          {/* Target device */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
              Desired Upgrade Device
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-gray-950 line-clamp-1">
              {request.targetProduct.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{request.targetProduct.condition}</span>
              <span>•</span>
              <span>{request.targetProduct.brand}</span>
            </div>
            <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-xs">
              <span className="text-gray-600 font-bold">Estimated Top-Up:</span>
              <span className="font-black text-milito-green text-sm">
                {request.calculation.isTopUp ? formatNaira(request.calculation.difference) : "₦0 (Direct Swap)"}
              </span>
            </div>
          </div>

        </div>

        {/* Customer Contact */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-gray-500">Customer: </span>
            <span className="font-bold text-gray-950">{request.customerName}</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-500">WhatsApp: </span>
            <span className="font-bold text-gray-950">{request.customerPhone}</span>
          </div>
          <div>
            <span className="text-gray-500">State: </span>
            <span className="font-bold text-gray-950">{request.customerLocation}</span>
          </div>
        </div>

        {/* What Happens Next Roadmap */}
        <div className="pt-4 border-t border-gray-150 space-y-3">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
            Next Steps in the Swap Process
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Review & Reach Out", desc: "We review your specs and send an initial confirmation on WhatsApp." },
              { step: "2", title: "Physical Inspection", desc: "Device is inspected at our hub or verified during doorstep exchange." },
              { step: "3", title: "Instant Swap", desc: "Pay the top-up balance and walk away with your upgraded phone." }
            ].map((s) => (
              <div key={s.step} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="w-5 h-5 rounded-full bg-milito-green/20 text-milito-green font-extrabold text-[10px] flex items-center justify-center">
                  {s.step}
                </span>
                <h5 className="text-xs font-bold text-gray-900">{s.title}</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* WhatsApp Direct Chat Button */}
          <a
            href={getWhatsAppChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp Now</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onTrackSwap(request.id)}
              className="flex-1 sm:flex-initial px-5 py-3.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track This Swap</span>
            </button>

            <button
              type="button"
              onClick={onStartNewSwap}
              className="flex-1 sm:flex-initial px-4 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Swap</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

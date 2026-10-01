import React from "react";
import { Car, ArrowRight, ShieldCheck, FileCheck2, Calculator, Sparkles } from "lucide-react";

interface VehicleCalloutBannerProps {
  onExploreVehicles: () => void;
  onOpenEstimator: () => void;
  vehicleCount?: number;
}

export default function VehicleCalloutBanner({
  onExploreVehicles,
  onOpenEstimator,
  vehicleCount = 0,
}: VehicleCalloutBannerProps) {
  return (
    <section className="py-12 bg-white" id="vehicle-spotlight-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A2025] text-white p-8 sm:p-10 lg:p-12 border border-emerald-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.15)] group">
          {/* Ambient background glow & grid */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#00B14F]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00B14F]/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs uppercase font-black tracking-widest text-[#00B14F] bg-[#00B14F]/15 px-3.5 py-1.5 rounded-full mb-4 border border-[#00B14F]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#00B14F]" />
                <span>MILITO Automotive Hub</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                🚗 Looking for Clean Tokunbo Cars or Customs Clearance?
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                Beyond smartphones & gadgets, MILITO imports and sells certified <span className="text-white font-bold">Foreign Used (Tokunbo)</span> and <span className="text-white font-bold">Nigerian Used vehicles</span> with 100% genuine Nigeria Customs Service clearance papers, mechanical inspections, and nationwide delivery.
              </p>

              {/* Feature Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 bg-white/10 text-gray-200 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs font-semibold">
                  <Car className="w-3.5 h-3.5 text-[#00B14F]" />
                  <span>Direct Tokunbo Stock {vehicleCount > 0 ? `(${vehicleCount} live)` : ""}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 text-gray-200 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs font-semibold">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#00B14F]" />
                  <span>Authentic Customs Papers</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 text-gray-200 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B14F]" />
                  <span>Engine & Transmission Scan</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 text-gray-200 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5 text-[#00B14F]" />
                  <span>Customs Duty Estimator</span>
                </div>
              </div>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 flex-shrink-0">
              <button
                onClick={onExploreVehicles}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#00B14F] hover:bg-[#00c95a] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00B14F]/25 hover:shadow-[#00B14F]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <span>Explore MILITO Vehicles Hub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenEstimator}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#00B14F]" />
                <span>Estimate Customs Duty</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

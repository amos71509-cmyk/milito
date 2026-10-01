import React from "react";
import { ArrowRight, Car, Sparkles, ShieldCheck, FileCheck2, Gauge, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface HomepageAutomotiveTeaserProps {
  vehicles: Product[];
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onExploreVehicles: () => void;
}

export default function HomepageAutomotiveTeaser({
  vehicles,
  compareList,
  onToggleCompare,
  onOpenDetails,
  onQuickAdd,
  onExploreVehicles,
}: HomepageAutomotiveTeaserProps) {
  const shouldReduceMotion = useReducedMotion();

  // Filter 3 to 4 real vehicle products from catalogue (prioritize featured if available)
  const teaserVehicles = React.useMemo(() => {
    const vehicleOnly = vehicles.filter((p) => p.productType === "vehicle");
    const featured = vehicleOnly.filter((p) => p.featured);
    const regular = vehicleOnly.filter((p) => !p.featured);
    const combined = [...featured, ...regular];
    return combined.slice(0, 4);
  }, [vehicles]);

  if (teaserVehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#111827] via-[#0F172A] to-[#111827] text-white border-y border-gray-800 relative overflow-hidden" id="automotive-teaser">
      {/* Background ambient automotive light */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#00B14F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-3xl">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B14F]/15 border border-[#00B14F]/30 text-[#00B14F] text-xs font-black uppercase tracking-widest mb-3.5"
            >
              <Car className="w-3.5 h-3.5" />
              <span>MILITO AUTOMOTIVE PORTAL</span>
            </motion.div>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight"
            >
              MY BRO, IF YOU DON'T HAVE A CAR NOW, YOU'LL HATE YOURSELF LATER.
            </motion.h2>

            <motion.h3
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-base sm:text-lg md:text-xl font-extrabold text-[#00B14F] mt-2.5"
            >
              Source your next ride through MILITO.
            </motion.h3>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-gray-300 mt-2.5 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl"
            >
              Browse Foreign Used (Tokunbo) and Nigerian Used vehicles with clear vehicle information, inspection details and delivery options across Nigeria.
            </motion.p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-gray-300 bg-gray-900/80 border border-gray-800 p-3.5 sm:p-4 rounded-2xl shrink-0"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00B14F] shrink-0" />
              <span className="font-bold text-white">Physical Diagnostic Inspection</span>
            </div>
            <span className="hidden sm:inline text-gray-600">•</span>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#00B14F] shrink-0" />
              <span>Verified Customs Papers</span>
            </div>
          </motion.div>
        </div>

        {/* 3-4 Real Vehicles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start">
          {teaserVehicles.map((vehicle) => (
            <ProductCard
              key={vehicle.id}
              product={vehicle}
              isComparing={compareList.some((p) => p.id === vehicle.id)}
              onToggleCompare={onToggleCompare}
              onOpenDetails={onOpenDetails}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>

        {/* Direct Action Callout to Full Vehicles Catalogue */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <button
            type="button"
            id="homepage-browse-all-vehicles-btn"
            onClick={onExploreVehicles}
            className="group inline-flex items-center justify-center gap-3 bg-[#00B14F] hover:bg-[#009643] text-black px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_4px_25px_rgba(0,177,79,0.35)] hover:shadow-[0_8px_30px_rgba(0,177,79,0.5)] transition-all duration-200 cursor-pointer active:scale-98"
          >
            <Car className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>BROWSE ALL VEHICLES →</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
          </button>
          <p className="text-gray-400 text-xs mt-3">
            Showing {teaserVehicles.length} of {vehicles.filter(p => p.productType === "vehicle").length} live inspected vehicles
          </p>
        </motion.div>

      </div>
    </section>
  );
}

import React from "react";
import { ArrowRight, ArrowLeftRight, ShieldCheck, Award } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import swapImage from "../assets/images/swap_deals_hands_1787342145412.jpg";

interface SwapDealsSectionProps {
  onSwapClick?: () => void;
}

export default function SwapDealsSection({ onSwapClick }: SwapDealsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleCtaClick = () => {
    if (onSwapClick) {
      onSwapClick();
    } else {
      const el = document.getElementById("trade-in");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section 
      id="swap-deals" 
      className="relative w-full bg-white border-y border-gray-200 overflow-hidden"
    >
      {/* 1. Full-Bleed Edge-to-Edge Banner Container (Spans 100% width of website) */}
      <div className="relative w-full min-h-[420px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-gray-50">
        
        {/* Full-bleed bright, natural, plain image showing both hands clearly at both sides */}
        <img
          src={swapImage}
          alt="MILITO Device Swap - Two hands exchanging devices on both sides"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          referrerPolicy="no-referrer"
          loading="eager"
        />

        {/* 2. Foreground Content (Badge, Title, Subtitle, and Button written directly ON the bright image) */}
        <div className="relative z-10 w-full max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center">
          
          {/* Badge: ↔ SWAP DEALS ON IMAGE */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00B14F]/40 bg-white/90 backdrop-blur-md text-[#00B14F] text-xs sm:text-sm font-black uppercase tracking-wider mb-3 sm:mb-4 shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00B14F] stroke-[2.5]" />
            <span>Swap Deals</span>
          </motion.div>

          {/* Main Headline ON IMAGE */}
          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-950 tracking-tight leading-[1.15] sm:leading-[1.12]"
          >
            <span className="block text-gray-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
              Your Phone Could Be
            </span>
            <span className="block text-[#00B14F] mt-1 sm:mt-2 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
              Your Next Upgrade
            </span>
          </motion.h2>

          {/* Subtitle / Description Text ON IMAGE */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-gray-900 font-semibold mt-3 sm:mt-4 text-sm sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(255,255,255,0.95)] px-2"
          >
            Trade in your current device and discover what you can upgrade to.
          </motion.p>

          {/* Swap Deals Button ON IMAGE */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-6 sm:mt-7"
          >
            <motion.button
              type="button"
              id="swap-deals-cta-btn"
              onClick={handleCtaClick}
              whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#00B14F] hover:bg-[#009643] text-white px-8 sm:px-11 py-3.5 sm:py-4 rounded-full font-black text-sm sm:text-base shadow-[0_8px_24px_rgba(0,177,79,0.4)] hover:shadow-[0_12px_28px_rgba(0,177,79,0.5)] transition-all cursor-pointer select-none"
            >
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5] group-hover:rotate-180 transition-transform duration-500" />
              <span>Start Your Swap</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5] group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.button>
          </motion.div>

        </div>
      </div>

      {/* 3. Three Clean Benefit Pillars Below Full-Bleed Image Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
          
          {/* Benefit 1: Easy Swap */}
          <div className="flex items-center justify-start sm:justify-center gap-3 group bg-gray-50 sm:bg-transparent p-3.5 sm:p-0 rounded-2xl sm:rounded-none border border-gray-200/80 sm:border-0">
            <div className="w-10 h-10 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B14F] transition-colors duration-300">
              <ArrowLeftRight className="w-4 h-4 text-[#00B14F] group-hover:text-white transition-colors duration-300 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1A2025]">Easy Swap</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">Quick and hassle-free exchange</p>
            </div>
          </div>

          {/* Benefit 2: Best Value */}
          <div className="flex items-center justify-start sm:justify-center gap-3 group bg-gray-50 sm:bg-transparent p-3.5 sm:p-0 rounded-2xl sm:rounded-none border border-gray-200/80 sm:border-0">
            <div className="w-10 h-10 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B14F] transition-colors duration-300">
              <ShieldCheck className="w-4 h-4 text-[#00B14F] group-hover:text-white transition-colors duration-300 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1A2025]">Best Value</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">Get top market trade-in valuation</p>
            </div>
          </div>

          {/* Benefit 3: Verified Inventory */}
          <div className="flex items-center justify-start sm:justify-center gap-3 group bg-gray-50 sm:bg-transparent p-3.5 sm:p-0 rounded-2xl sm:rounded-none border border-gray-200/80 sm:border-0">
            <div className="w-10 h-10 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B14F] transition-colors duration-300">
              <Award className="w-4 h-4 text-[#00B14F] group-hover:text-white transition-colors duration-300 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1A2025]">Verified Inventory</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">Safe, genuine upgrade devices</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

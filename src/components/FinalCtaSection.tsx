import React from "react";
import { ArrowRight, ShoppingBag, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface FinalCtaSectionProps {
  onExploreStore: () => void;
  onStartSwap: () => void;
}

export default function FinalCtaSection({
  onExploreStore,
  onStartSwap,
}: FinalCtaSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 sm:py-24 bg-[#080C14] text-white relative overflow-hidden border-t border-gray-800" id="final-cta">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00B14F]/[0.05] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
        >
          Ready for Your <span className="text-[#00B14F]">Next Device?</span>
        </motion.h2>

        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Find your next device or turn the one you have into your next upgrade.
        </motion.p>

        {/* Dual Primary Buttons */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
        >
          {/* Primary CTA: Explore Store */}
          <button
            type="button"
            onClick={onExploreStore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#00B14F] hover:bg-[#009643] text-black px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(0,177,79,0.35)] hover:brightness-110 active:scale-98 transition duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Secondary CTA: Start a Swap */}
          <button
            type="button"
            onClick={onStartSwap}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider backdrop-blur-md active:scale-98 transition duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5] text-[#00B14F]" />
            <span>Start a Swap</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}

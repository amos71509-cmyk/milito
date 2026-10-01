import React from "react";
import { ShieldCheck, Truck, Smartphone, RefreshCw, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export default function MilitoStandards() {
  const shouldReduceMotion = useReducedMotion();

  const standards = [
    {
      id: "checks",
      icon: Check,
      title: "35-Point Checks",
      desc: "Screen, battery, cameras, network & hardware",
    },
    {
      id: "delivery",
      icon: Truck,
      title: "Nationwide Delivery",
      desc: "Monitored delivery across Nigeria",
    },
    {
      id: "details",
      icon: Smartphone,
      title: "Clear Device Details",
      desc: "Condition, storage, battery & specifications",
    },
    {
      id: "swaps",
      icon: RefreshCw,
      title: "Easy Device Swaps",
      desc: "Trade your current phone toward an upgrade",
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-[#F8FAFC] border-b border-gray-200 text-gray-900 relative overflow-hidden" id="standards">
      {/* Subtle light ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00B14F]/[0.04] blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#00B14F] bg-[#00B14F]/10 border border-[#00B14F]/25 px-3 py-1 rounded-full mb-3"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MILITO STANDARDS</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight"
          >
            Every Device. Clearly Checked.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-gray-600 mt-2.5 text-xs sm:text-sm md:text-base leading-relaxed"
          >
            We keep device quality, pricing and delivery straightforward — so you know what you're getting before you order.
          </motion.p>
        </div>

        {/* 4 Compact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-6xl mx-auto">
          {standards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                className="group relative p-4 sm:p-5 rounded-2xl bg-white hover:bg-white border border-gray-200/90 hover:border-[#00B14F]/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,177,79,0.08)] transition-all duration-300 flex flex-col items-start"
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center text-[#00B14F] mb-3.5 group-hover:bg-[#00B14F] group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#00B14F] transition-colors duration-200">
                  {item.title}
                </h3>

                {/* Short Supporting Text */}
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

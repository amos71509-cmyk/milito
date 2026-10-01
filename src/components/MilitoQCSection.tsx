import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Cpu, Smartphone, Scan, Sparkles, Activity } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export default function MilitoQCSection() {
  const shouldReduceMotion = useReducedMotion();
  const [activeScanIndex, setActiveScanIndex] = useState(0);

  const diagnosticCategories = [
    {
      id: "screen",
      title: "Screen",
      desc: "Multi-touch responsiveness, pixel health, True Tone & glass clarity",
    },
    {
      id: "battery",
      title: "Battery",
      desc: "Authentic capacity verification, charging cycle health & thermal safety",
    },
    {
      id: "cameras",
      title: "Cameras",
      desc: "Front, rear, telephoto & ultra-wide lens clarity, optical focus & flash",
    },
    {
      id: "biometrics",
      title: "Biometrics",
      desc: "Face ID, Touch ID and optical fingerprint sensor responsiveness",
    },
    {
      id: "network",
      title: "Network",
      desc: "Factory unlocked for all Nigerian SIMs (MTN, Airtel, Glo, 9mobile 4G/5G)",
    },
    {
      id: "hardware",
      title: "Hardware",
      desc: "Stereo speakers, dual mics, volume buttons, vibration motor & charging port",
    },
  ];

  const scannerItems = [
    { name: "SCREEN", status: "PASSED" },
    { name: "BATTERY", status: "PASSED" },
    { name: "CAMERAS", status: "PASSED" },
    { name: "BIOMETRICS", status: "PASSED" },
    { name: "NETWORK", status: "PASSED" },
    { name: "HARDWARE", status: "PASSED" },
  ];

  // Cycling scan animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScanIndex((prev) => (prev + 1) % scannerItems.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [scannerItems.length]);

  return (
    <section className="py-20 sm:py-24 bg-[#080C14] border-t border-b border-gray-800/80 text-white relative overflow-hidden" id="qc-process">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00B14F]/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#00B14F] bg-[#00B14F]/10 border border-[#00B14F]/25 px-3.5 py-1.5 rounded-full mb-3"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>35-POINT MILITO QC</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            What Happens Before Your Device Reaches You
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-gray-400 mt-3 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Every eligible device goes through our quality-control process before it reaches the customer.
          </motion.p>
        </div>

        {/* Two-Column Layout: Left Diagnostic Categories & Right Scanner UI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* LEFT: 35-Point Diagnostic Categories */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-3.5"
          >
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Core Inspection Areas</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-full border border-[#00B14F]/20">
                  Standardized
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Each unit is evaluated across hardware, software, and physical condition to ensure standard operation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {diagnosticCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#00B14F]/15 text-[#00B14F] flex items-center justify-center font-black text-xs shrink-0">
                      ✓
                    </div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {cat.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed pl-7">
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Condition Grading Note */}
            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 flex items-start gap-2.5 mt-4">
              <Sparkles className="w-4 h-4 text-[#00B14F] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">MILITO Condition Standard:</strong> Clearly classified as <span className="text-[#00B14F] font-bold">Brand New</span> or verified <span className="text-white font-bold">Grade A, B, C, D</span> so you always know cosmetic and functional tier before purchasing.
              </span>
            </div>
          </motion.div>

          {/* RIGHT: Animated QC Scanner Visual */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 16 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl bg-[#0F172A]/90 border border-gray-800 p-5 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-md">
              
              {/* Top Bar with Status Tag */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00B14F] animate-pulse" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                    MILITO QC SCANNER
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                  ILLUSTRATIVE QC PREVIEW
                </span>
              </div>

              {/* Scanning Ray Line */}
              <div className="relative overflow-hidden rounded-xl bg-[#0A0E17] border border-gray-800/80 p-4 mb-4">
                <motion.div
                  animate={{
                    y: [0, 140, 0],
                    opacity: [0.3, 0.9, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00B14F] to-transparent pointer-events-none shadow-[0_0_12px_#00B14F]"
                />

                {/* Scanner Checklist Items */}
                <div className="space-y-2.5 font-mono text-xs">
                  {scannerItems.map((item, idx) => {
                    const isCurrent = idx === activeScanIndex;
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                          isCurrent
                            ? "bg-[#00B14F]/15 border border-[#00B14F]/40 text-white"
                            : "bg-white/[0.02] border border-transparent text-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Activity className={`w-3.5 h-3.5 ${isCurrent ? "text-[#00B14F] animate-spin" : "text-gray-600"}`} />
                          <span className="font-bold tracking-wider">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-[#00B14F]">
                          <span>✓</span>
                          <span className="text-[10px] tracking-wider">{item.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Footer */}
              <div className="p-3 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/30 text-center">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">
                  DEVICE STATUS
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#00B14F] flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#00B14F]" />
                  <span>QUALITY CHECK COMPLETE</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Smartphone,
  Wallet,
  CalendarRange,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calculator,
  MessageCircle,
  HelpCircle,
  BadgePercent
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  calculateEasyBuy,
  formatNaira,
  generateEasyBuyWhatsAppUrl
} from "../utils/easyBuyUtils";

interface EasyBuySectionProps {
  onExploreStore?: () => void;
}

interface PresetDevice {
  name: string;
  price: number;
  tag: string;
}

const PRESET_DEVICES: PresetDevice[] = [
  { name: "iPhone 13", price: 650000, tag: "Popular" },
  { name: "Galaxy A05s", price: 180000, tag: "Budget" },
  { name: "iPhone 15 Pro Max", price: 1450000, tag: "Flagship" },
  { name: "Samsung S24 Ultra", price: 1350000, tag: "Power" },
  { name: "Apple Watch Series 8", price: 280000, tag: "Smartwatch" },
  { name: "iPad 10th Gen", price: 480000, tag: "Tablet" }
];

export default function EasyBuySection({ onExploreStore }: EasyBuySectionProps) {
  const shouldReduceMotion = useReducedMotion();

  // Mini Calculator State
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(650000);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customDeviceName, setCustomDeviceName] = useState<string>("My Preferred Device");
  const [weeks, setWeeks] = useState<4 | 8 | 12>(12);
  const [depositPercent, setDepositPercent] = useState<number>(30);

  // Active price and title
  const activePrice = isCustomMode ? customPrice : PRESET_DEVICES[selectedDeviceIndex]?.price || 650000;
  const activeDeviceName = isCustomMode
    ? customDeviceName || "Custom Device"
    : PRESET_DEVICES[selectedDeviceIndex]?.name || "iPhone 13";

  // Calculation
  const calculation = useMemo(() => {
    return calculateEasyBuy(activePrice, weeks, depositPercent);
  }, [activePrice, weeks, depositPercent]);

  // WhatsApp click URL
  const whatsAppUrl = useMemo(() => {
    return generateEasyBuyWhatsAppUrl(activeDeviceName, activePrice, weeks, depositPercent);
  }, [activeDeviceName, activePrice, weeks, depositPercent]);

  const handleSelectPreset = (index: number) => {
    setIsCustomMode(false);
    setSelectedDeviceIndex(index);
    setCustomPrice(PRESET_DEVICES[index].price);
  };

  return (
    <section
      id="easy-buy"
      className="relative w-full bg-[#080C14] text-white py-20 sm:py-24 border-y border-gray-800/80 overflow-hidden"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00B14F]/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/30 text-[#00B14F] text-xs font-black uppercase tracking-wider mb-3 shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#00B14F]" />
            <span>EASY BUY</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]"
          >
            Can't Pay Once? <span className="text-[#00B14F]">Pay Small Small.</span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            Spread the cost of any device in the store over weeks, with a simple deposit and a schedule you agree before delivery.
          </motion.p>
        </div>

        {/* 3 Step Cards in Trust Card Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 max-w-5xl mx-auto">
          {/* Step 1 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center text-[#00B14F] group-hover:bg-[#00B14F] group-hover:text-black transition-colors duration-300">
                  <Smartphone className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-black font-mono text-gray-500 uppercase tracking-widest bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                  Step 01
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00B14F] transition-colors">
                Pick Your Device
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Any phone, iPad or smartwatch in the store qualifies. Choose your model, storage, and preferred grade.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-[#00B14F]" />
              <span>Full catalogue eligible</span>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center text-[#00B14F] group-hover:bg-[#00B14F] group-hover:text-black transition-colors duration-300">
                  <Wallet className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-black font-mono text-gray-500 uppercase tracking-widest bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                  Step 02
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00B14F] transition-colors">
                Pay a Deposit
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                30% to 50% today. A manageable initial down payment to securely lock in your chosen gadget.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <BadgePercent className="w-3.5 h-3.5 text-[#00B14F]" />
              <span>30% standard deposit</span>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/20 flex items-center justify-center text-[#00B14F] group-hover:bg-[#00B14F] group-hover:text-black transition-colors duration-300">
                  <CalendarRange className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-black font-mono text-gray-500 uppercase tracking-widest bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                  Step 03
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00B14F] transition-colors">
                Spread the Balance
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Spread over 4 to 12 weeks. Your schedule is agreed and written down in black and white before delivery.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00B14F]" />
              <span>4, 8 or 12 weeks flexible</span>
            </div>
          </motion.div>
        </div>

        {/* Three Trust Lines Under the Cards */}
        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-xs sm:text-sm font-bold text-gray-300">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00B14F] shrink-0" />
            <span>Valid ID required.</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00B14F] shrink-0" />
            <span>Your payment schedule is agreed before delivery.</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00B14F] shrink-0" />
            <span>No hidden charges.</span>
          </div>
        </div>

        {/* Mini Calculator Console (Requirement 3) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 max-w-4xl mx-auto bg-gradient-to-b from-[#111827] to-[#0D131F] border border-gray-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Easy Buy Installment Calculator
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pick a device price and duration to calculate your exact deposit and weekly amount.
                </p>
              </div>
            </div>

            {/* Quick Switch: Presets vs Custom */}
            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer ${
                  !isCustomMode
                    ? "bg-[#00B14F] text-black shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Store Models
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer ${
                  isCustomMode
                    ? "bg-[#00B14F] text-black shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Custom Price
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left Column: Device & Terms Selection (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Device Selector */}
              {!isCustomMode ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">
                    1. Select Popular Device
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_DEVICES.map((item, idx) => {
                      const isSelected = selectedDeviceIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(idx)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#00B14F]/15 border-[#00B14F] shadow-sm shadow-[#00B14F]/10"
                              : "bg-gray-900/80 border-gray-800 hover:border-gray-700 text-gray-300"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? "text-[#00B14F]" : "text-gray-500"}`}>
                            {item.tag}
                          </span>
                          <span className="text-xs font-extrabold text-white mt-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-400 mt-0.5">
                            {formatNaira(item.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">
                      1. Device Name
                    </label>
                    <input
                      type="text"
                      value={customDeviceName}
                      onChange={(e) => setCustomDeviceName(e.target.value)}
                      placeholder="e.g. iPhone 14 Pro Max 256GB"
                      className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#00B14F]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Device Price
                      </label>
                      <span className="text-sm font-mono font-black text-[#00B14F]">
                        {formatNaira(customPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={2500000}
                      step={10000}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full accent-[#00B14F] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                      <span>₦100,000</span>
                      <span>₦1,000,000</span>
                      <span>₦2,500,000</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Duration Selector (4, 8, 12 weeks) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">
                  2. Choose Duration
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { w: 4, label: "4 Weeks", sub: "1 Month" },
                    { w: 8, label: "8 Weeks", sub: "2 Months" },
                    { w: 12, label: "12 Weeks", sub: "3 Months (Popular)" }
                  ] as const).map((opt) => {
                    const isSelected = weeks === opt.w;
                    return (
                      <button
                        key={opt.w}
                        type="button"
                        onClick={() => setWeeks(opt.w)}
                        className={`py-3 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-[#00B14F] text-black border-[#00B14F] font-black shadow-md shadow-[#00B14F]/20"
                            : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700"
                        }`}
                      >
                        <span className="text-xs font-black">{opt.label}</span>
                        <span className={`text-[10px] ${isSelected ? "text-black/80 font-bold" : "text-gray-500 font-medium"} mt-0.5`}>
                          {opt.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deposit Percentage Toggle (30% vs 50%) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  3. Deposit Percentage
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositPercent(30)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${
                      depositPercent === 30
                        ? "bg-[#00B14F]/20 border-[#00B14F] text-[#00B14F]"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    30% Initial Deposit (Lowest Down Payment)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositPercent(50)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${
                      depositPercent === 50
                        ? "bg-[#00B14F]/20 border-[#00B14F] text-[#00B14F]"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    50% Initial Deposit (Lower Weekly)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Breakdown & WhatsApp CTA (5 Cols) */}
            <div className="lg:col-span-5 bg-gray-950/90 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00B14F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calculated Payment Summary</span>
                </span>

                {/* Big Weekly Highlight */}
                <div className="bg-[#111827] border border-[#00B14F]/30 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Weekly Installment ({weeks} Weeks)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#00B14F] font-mono tracking-tight">
                    {formatNaira(calculation.weeklyAmount)}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium block">
                    paid weekly until completed
                  </span>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 text-xs divide-y divide-gray-800/80 pt-1">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-400">Selected Device:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">{activeDeviceName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-400">Total Device Price:</span>
                    <span className="font-mono font-bold text-white">{formatNaira(calculation.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-[#00B14F]">
                    <span className="font-extrabold">Initial Deposit ({calculation.depositPercent}%):</span>
                    <span className="font-mono font-black">{formatNaira(calculation.depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-gray-300">
                    <span className="font-bold">Remaining Balance:</span>
                    <span className="font-mono font-black">{formatNaira(calculation.balanceAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-gray-400 text-[11px]">
                    <span>Payment Schedule:</span>
                    <span className="font-bold text-white">{weeks} Weekly Payments</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="easy-buy-whatsapp-cta"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#00B14F] hover:bg-[#009643] active:scale-98 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#00B14F]/25 cursor-pointer text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Start an Easy Buy on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>

                {onExploreStore && (
                  <button
                    type="button"
                    onClick={onExploreStore}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <span>Browse All Devices Qualifying for Easy Buy</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

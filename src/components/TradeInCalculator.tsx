import React, { useState, useMemo } from "react";
import { Coins, RefreshCw, Smartphone, CheckCircle, HandCoins, ArrowRight } from "lucide-react";
import { TRADE_IN_MODELS_DB, SAMPLE_PRODUCTS } from "../data";

export default function TradeInCalculator() {
  const [currentBrand, setCurrentBrand] = useState("Apple");
  const [currentModel, setCurrentModel] = useState("iPhone 13 Pro Max");
  const [currentStorage, setCurrentStorage] = useState("256GB");
  const [currentGrading, setCurrentGrading] = useState<"A" | "B" | "C" | "D">("A");
  
  // Target Device
  const [targetProductId, setTargetProductId] = useState(SAMPLE_PRODUCTS[0].id);

  // Form states
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userState, setUserState] = useState("Lagos");
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  // Get models for selected brand
  const filteredModels = useMemo(() => {
    return Object.keys(TRADE_IN_MODELS_DB).filter((m) => {
      if (currentBrand === "Apple") return m.startsWith("iPhone");
      if (currentBrand === "Samsung") return m.startsWith("Galaxy");
      if (currentBrand === "Google") return m.startsWith("Pixel");
      return false;
    });
  }, [currentBrand]);

  // Adjust model automatically when brand changes
  const handleBrandChange = (brand: string) => {
    setCurrentBrand(brand);
    if (brand === "Apple") {
      setCurrentModel("iPhone 13 Pro Max");
      setCurrentStorage("256GB");
    } else if (brand === "Samsung") {
      setCurrentModel("Galaxy S23 Ultra");
      setCurrentStorage("256GB");
    } else {
      setCurrentModel("Pixel 8 Pro");
      setCurrentStorage("256GB");
    }
  };

  // Get storage options for selected model
  const availableStorages = useMemo(() => {
    return TRADE_IN_MODELS_DB[currentModel]?.versions || ["128GB", "256GB"];
  }, [currentModel]);

  // Retrieve selected target product
  const targetProduct = useMemo(() => {
    return SAMPLE_PRODUCTS.find((p) => p.id === targetProductId) || SAMPLE_PRODUCTS[0];
  }, [targetProductId]);

  // Trade-In Valuation Mathematics
  const calculation = useMemo(() => {
    const dbEntry = TRADE_IN_MODELS_DB[currentModel];
    if (!dbEntry) return { valuation: 0, targetPrice: targetProduct.price, balance: targetProduct.price };

    let baseVal = dbEntry.baseValue;

    // Adjust for storage (base calculation assumes lowest storage version)
    const baseStorageIdx = dbEntry.versions.indexOf(dbEntry.versions[0]);
    const currentStorageIdx = dbEntry.versions.indexOf(currentStorage);
    const storageDiff = currentStorageIdx - baseStorageIdx;
    if (storageDiff > 0) {
      baseVal += (storageDiff * 45000); // Add ₦45,000 per next storage level
    }

    // Grading multiplier:
    // Grade A: 100% of value
    // Grade B: 85% of value
    // Grade C: 60% of value
    // Grade D: 30% of value
    let multiplier = 1.0;
    if (currentGrading === "B") multiplier = 0.85;
    if (currentGrading === "C") multiplier = 0.60;
    if (currentGrading === "D") multiplier = 0.30;

    const finalValuation = Math.round(baseVal * multiplier);
    const balance = Math.max(0, targetProduct.price - finalValuation);

    return {
      valuation: finalValuation,
      targetPrice: targetProduct.price,
      balance: balance
    };
  }, [currentModel, currentStorage, currentGrading, targetProduct]);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(p);
  };

  const handleTradeInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) return;
    setIsSubmitSuccessful(true);
  };

  // Pre-filled WhatsApp direct link generator
  const getWhatsAppLink = () => {
    const message = `Hello MILITO TECH HOME, I want to swap my device:\n\n` +
      `- Brand: ${currentBrand}\n` +
      `- Model: ${currentModel}\n` +
      `- Storage: ${currentStorage}\n` +
      `- Physical Grade: ${currentGrading === "A" ? "Grade A (Pristine/No scratch)" : currentGrading === "B" ? "Grade B (Minor scuffs)" : currentGrading === "C" ? "Grade C (Flawed/Scratches)" : "Grade D (Faulty)"}\n` +
      `- Desired Upgrade: ${targetProduct.name}\n` +
      `- Estimated Value: ${formatPrice(calculation.valuation)}\n` +
      `- Upgrade Cost Difference: ${formatPrice(calculation.balance)}\n\n` +
      `Contact Name: ${userName}\n` +
      `Location State: ${userState}\n\n` +
      `Please schedule an appraisal for me. Thanks!`;
    
    return `https://wa.me/2349000000000?text=${encodeURIComponent(message)}`;
  };  return (
    <section className="py-24 bg-white border-b border-gray-100" id="trade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Description & Grading definitions */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block border border-milito-green/20">
              Upgrade Your Device
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Trade in Your Old Phone for a Premium Upgrade
            </h2>
            <p className="text-gray-650 text-sm leading-relaxed">
              Don't leave your old phone sitting in a drawer. MILITO TECH HOME offers instant, clear upgrade values. Estimate your valuation in minutes, add the top-up balance, and walk away with your brand-new or premium UK used smartphone.
            </p>

            {/* Quality Grade Definitions */}
            <div className="space-y-3.5 pt-4">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-655">
                MILITO Physical Grading Guidelines
              </span>
              {[
                { grade: "A", title: "Grade A (Pristine)", desc: "Flawless metal edges, zero screen scratches, perfect battery health metrics." },
                { grade: "B", title: "Grade B (Minor Scuffs)", desc: "1 or 2 small scratches restrictable to frame, completely active features." },
                { grade: "C", title: "Grade C (Fair)", desc: "Visible micro-scratches or frame scuffs, 100% stable touch & display." },
                { grade: "D", title: "Grade D (Faulty)", desc: "Cracked glass, loose ports, faulty camera glass, or battery warnings." }
              ].map((gr) => (
                <div key={gr.grade} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 border ${
                    currentGrading === gr.grade
                      ? "bg-milito-green text-[#1A2025] border-milito-green shadow-md"
                      : "bg-gray-200 text-gray-600 border-gray-300"
                  }`}>
                    {gr.grade}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">{gr.title}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{gr.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Dynamic Swap math Widget Calculator */}
          <div className="lg:col-span-7 bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden p-6 md:p-8 shadow-md relative">
            
            {isSubmitSuccessful ? (
              <div className="py-12 px-6 text-center space-y-6 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-milito-green/15 text-milito-green flex items-center justify-center mx-auto border border-milito-green/35">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Valuation Registered!</h3>
                  <p className="text-xs text-gray-550 mt-2 max-w-sm mx-auto leading-relaxed">
                    Request ID: <span className="text-milito-green font-mono font-bold">MLT-TRD-{Math.floor(Math.random() * 8000) + 1000}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    We have saved your valuation request. To finalize physical inspection or schedule home pick-up in Lagos/Abuja, click below to chat with our swap manager on private WhatsApp.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 text-left max-w-md mx-auto text-xs font-mono space-y-1.5 text-gray-700">
                  <div className="flex justify-between"><span className="text-gray-450">Device Swap:</span> <span className="font-semibold text-gray-900">{currentModel}</span></div>
                  <div className="flex justify-between"><span className="text-gray-450">Valuation:</span> <span className="text-green-650 font-bold">{formatPrice(calculation.valuation)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-450">Upgrading To:</span> <span className="font-semibold text-gray-900">{targetProduct.name}</span></div>
                  <div className="flex justify-between border-t border-gray-150 pt-1.5 mt-1.5 font-bold"><span className="text-gray-600">Balance to Pay:</span> <span className="text-milito-green font-extrabold">{formatPrice(calculation.balance)}</span></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-milito-green text-[#1A2025] font-bold text-xs hover:brightness-105 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Proceed to WhatsApp Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setIsSubmitSuccessful(false);
                      setShowSubmitForm(false);
                      setUserName("");
                      setUserPhone("");
                    }}
                    className="px-6 py-3 rounded-xl border border-gray-300 bg-transparent text-gray-600 text-xs hover:text-black hover:bg-gray-100 font-semibold transition cursor-pointer"
                  >
                    Recalculate Swap
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-xl bg-milito-green/10 text-milito-green flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Device Swap Estimator</h4>
                    <span className="text-[10px] text-gray-500 font-medium">Real-time valuation based on device condition grading</span>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Brand select */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-2">Current Brand</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Apple", "Samsung", "Google"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleBrandChange(b)}
                          className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            currentBrand === b
                              ? "bg-white text-milito-green border-milito-green shadow-sm"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Select */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-2">Device Model</label>
                    <select
                      value={currentModel}
                      onChange={(e) => {
                        setCurrentModel(e.target.value);
                        // Reset storage allocation to first available index for safety
                        const stor = TRADE_IN_MODELS_DB[e.target.value]?.versions[0] || "128GB";
                        setCurrentStorage(stor);
                      }}
                      className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green cursor-pointer"
                    >
                      {filteredModels.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Storage Select */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-2">Internal Storage</label>
                    <select
                      value={currentStorage}
                      onChange={(e) => setCurrentStorage(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green cursor-pointer"
                    >
                      {availableStorages.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grading Select */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-2">Physical Condition Grading</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["A", "B", "C", "D"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCurrentGrading(g as any)}
                          className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            currentGrading === g
                              ? "bg-white text-milito-green border-milito-green shadow-sm"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-200"
                          }`}
                          title={g === "A" ? "Grade A Flawless" : g === "B" ? "Grade B Minor Scuffs" : g === "C" ? "Grade C Heavy Scratches" : "Grade D Faulty State"}
                        >
                          Grade {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Device selection */}
                <div className="pt-4 border-t border-gray-205">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-2">Desired Target Phone for Upgrade</label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-milito-green cursor-pointer font-semibold"
                  >
                    {SAMPLE_PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.condition}) — {formatPrice(prod.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculation Screen Outputs */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      <HandCoins className="w-4 h-4 text-gray-500" />
                      Estimated value of old phone:
                    </span>
                    <span className="font-bold text-gray-950 text-sm font-mono">{formatPrice(calculation.valuation)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      Cost of target {targetProduct.name}:
                    </span>
                    <span className="font-bold text-gray-950 text-sm font-mono">{formatPrice(calculation.targetPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-150 pt-3 text-sm font-bold">
                    <span className="text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <RefreshCw className="w-4 h-4 text-milito-green animate-spin-slow" />
                      Swap Top-Up Balance:
                    </span>
                    <span className="text-lg text-milito-green font-black font-mono">{formatPrice(calculation.balance)}</span>
                  </div>
                </div>

                {/* Form Toggle logic */}
                {showSubmitForm ? (
                  <form onSubmit={handleTradeInSubmit} className="space-y-4 pt-2 border-t border-gray-150 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="WhatsApp number e.g. 090333..."
                          className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-milito-green text-black font-extrabold text-xs hover:bg-opacity-90 transition cursor-pointer"
                      >
                        Submit Secure Appraise Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubmitForm(false)}
                        className="py-3 px-4 rounded-xl border border-gray-300 bg-transparent text-gray-600 hover:text-black hover:bg-gray-150 text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full py-4 rounded-xl bg-milito-green text-black font-extrabold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4.5 h-4.5" />
                    <span>Get Device Valuation Now</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

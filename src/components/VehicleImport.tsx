import React, { useState, useMemo } from "react";
import { Car, Globe, Heart, ArrowRight, ShieldCheck, HelpCircle, FileText, CheckCircle } from "lucide-react";

export default function VehicleImport() {
  const [carType, setCarType] = useState<"Sedan" | "SUV" | "Truck">("SUV");
  const [carYear, setCarYear] = useState<number>(2021);
  const [engineType, setEngineType] = useState<"4-cyl" | "6-cyl" | "v8">("6-cyl");
  const [sourcingLocation, setSourcingLocation] = useState<"US" | "Europe">("US");

  // Request quote modal Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [carInquiry, setCarInquiry] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dynamic Clearing & Import Cost calculations
  const estimates = useMemo(() => {
    // Basic approximation matching Nigeria customs (Naira valuation estimates)
    let baseCustomsClearing = 2200000; // Base clearing for 2018 Sedan
    let oceanFreight = 1500000; // Shipping from US
    let agencyFee = 450000; // Scurrying clearing documentation

    // Adjust by vehicle category
    if (carType === "SUV") {
      baseCustomsClearing += 1400000;
      oceanFreight += 400000;
    } else if (carType === "Truck") {
      baseCustomsClearing += 2500000;
      oceanFreight += 900000;
    }

    // Adjust by model year (newer cars pay far higher customs duties in Nigeria)
    const yearDiff = Math.max(0, carYear - 2018);
    baseCustomsClearing += (yearDiff * 600000);

    // Adjust by engine size
    if (engineType === "6-cyl") {
      baseCustomsClearing += 400000;
    } else if (engineType === "v8") {
      baseCustomsClearing += 1200000;
    }

    // Adjust by origin location
    if (sourcingLocation === "Europe") {
      oceanFreight += 250000; // Europe generally slight shipping premium or container charge variation
    }

    const totalLandedCost = baseCustomsClearing + oceanFreight + agencyFee;

    return {
      customs: baseCustomsClearing,
      shipping: oceanFreight,
      agency: agencyFee,
      total: totalLandedCost
    };
  }, [carType, carYear, engineType, sourcingLocation]);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(p);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !carInquiry) return;
    setIsSubmitted(true);
  };

  const getWhatsAppCarInquiryLink = () => {
    const message = `Hello MILITO TECH HOME, I am interested in importing a vehicle:\n\n` +
      `- Sourcing Inquiry: ${carInquiry}\n` +
      `- Client Budget: ${maxBudget ? formatPrice(parseInt(maxBudget)) || maxBudget : "Flexible"}\n` +
      `- Sourcing Hub: ${sourcingLocation === "US" ? "USA/Canada Bidding" : "European Markets"}\n` +
      `- Estimated Clearing (via math model): ${formatPrice(estimates.customs)}\n` +
      `- Calculated Landed Cost: ${formatPrice(estimates.total)}\n\n` +
      `Contact Name: ${clientName}\n` +
      `WhatsApp Phone: ${clientPhone}\n\n` +
      `Please provide me a verified auction checklist and quote.`;
    return `https://wa.me/2349000000000?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="py-24 bg-white border-b border-gray-100" id="vehicle-import">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Clearing Cost Calculator */}
          <div className="lg:col-span-12 lg:col-span-7 bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-3xl order-2 lg:order-1 relative shadow-md">
            <div className="flex items-center gap-2 pb-5 border-b border-gray-200 mb-6">
              <div className="w-10 h-10 rounded-xl bg-milito-green/10 text-milito-green flex items-center justify-center">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Customs Duties & Clearing Estimator</h4>
                <p className="text-[10px] text-gray-600">Transparent approximations based on Nigerian customs parameters</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-650 mb-1.5">Vehicle Year</label>
                  <select
                    value={carYear}
                    onChange={(e) => setCarYear(parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green cursor-pointer"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Sourcing Origin */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-655 mb-1.5">Sourcing Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "US", label: "US/Canada" },
                      { key: "Europe", label: "Europe Hub" }
                    ].map((loc) => (
                      <button
                        key={loc.key}
                        onClick={() => setSourcingLocation(loc.key as any)}
                        className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          sourcingLocation === loc.key
                            ? "bg-white text-milito-green border-milito-green shadow-sm"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-655 mb-1.5">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Sedan", "SUV", "Truck"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setCarType(t as any)}
                        className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          carType === t
                            ? "bg-white text-milito-green border-milito-green shadow-sm"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Cylinder */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-655 mb-1.5">Engine Cylinders</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "4-cyl", label: "4-Cyl" },
                      { key: "6-cyl", label: "6-Cyl/V6" },
                      { key: "v8", label: "V8/Specs" }
                    ].map((eng) => (
                      <button
                        key={eng.key}
                        onClick={() => setEngineType(eng.key as any)}
                        className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          engineType === eng.key
                            ? "bg-white text-milito-green border-milito-green shadow-sm"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {eng.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outputs display */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-3.5 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">Ocean Shipping Container Freight:</span>
                  <span className="font-bold text-gray-950 font-mono">{formatPrice(estimates.shipping)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">Estimated Customs Clearance Duties:</span>
                  <span className="font-bold text-gray-950 font-mono">{formatPrice(estimates.customs)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">MILITO Import Documentation Agency fee:</span>
                  <span className="font-bold text-gray-950 font-mono">{formatPrice(estimates.agency)}</span>
                </div>
                
                <div className="border-t border-gray-150 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-700">Total Landed Estimate (Lagos):</span>
                  <span className="text-lg text-milito-green font-black font-mono">{formatPrice(estimates.total)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-milito-green/5 border border-milito-green/15 text-[10px] text-gray-650 leading-relaxed">
                *Approximations are highly contingent on the custom-exchange rate published on the Nigeria Customs portal. Estimated values exclude bidding auction price of the car itself.
              </div>
            </div>
          </div>

          {/* Right Block: Content explanation & CTA trigger */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block border border-milito-green/20">
              Vehicle Sourcing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Import Your Absolute Dream Vehicle
            </h2>
            <p className="text-gray-650 text-sm leading-relaxed">
              Why settle for heavily used local cars? We provide an end-to-end vehicle sourcing, container shipment, custom documentation clearing, and nationwide delivery framework straight to your driveway in Nigeria.
            </p>

            <div className="space-y-4 pt-2">
              {[
                "Direct bidding access to major US vehicle auction hubs (Copart, IAAI).",
                "Full clean CARFAX background check reports provided prior to bids.",
                "Fully insured container shipments protecting against salt-water/collisions.",
                "Hassle-free custom clearing and door-step courier transit."
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-750">
                  <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-250 text-milito-green flex items-center justify-center font-bold flex-shrink-0 text-[10px] mt-0.5">✓</div>
                  <span className="leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-milito-green hover:brightness-105 active:scale-98 text-black font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                <span>Request Vehicle Sourcing Quote</span>
                <Car className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Contact Popup */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 overflow-hidden shadow-2xl animate-scaleUp">
              
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-950 font-extrabold text-sm">
                  <Car className="w-5 h-5 text-milito-green animate-pulse" />
                  <span>Sourcing Request</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {isSubmitted ? (
                <div className="p-8 text-center space-y-6">
                  <div className="w-14 h-14 bg-milito-green/10 text-milito-green rounded-full flex items-center justify-center mx-auto border border-milito-green/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-lg">Query Handled Successfully!</h4>
                    <p className="text-xs text-gray-650 mt-2 max-w-sm mx-auto leading-relaxed">
                      We have compiled your clearance estimation and vehicle preferences. Touch below to connect directly with our container coordinator to receive certified auction catalog recommendations on WhatsApp.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                    <a
                      href={getWhatsAppCarInquiryLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 rounded-lg bg-milito-green text-black font-bold text-xs hover:brightness-105 transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Connect with Container Agent</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 rounded-lg border border-gray-300 bg-transparent text-gray-600 hover:text-black hover:bg-gray-100 text-xs transition font-semibold cursor-pointer"
                    >
                      Back to Page
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="p-6 space-y-4">
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-milito-green flex-shrink-0 mt-0.5" />
                    <span>Your request features the clearing estimate: <strong className="text-gray-900 font-semibold">{formatPrice(estimates.total)}</strong> for a <strong className="text-gray-900 font-semibold">{carYear} {carType}</strong>.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">What vehicle model are you trying to source?</label>
                    <input
                      type="text"
                      required
                      value={carInquiry}
                      onChange={(e) => setCarInquiry(e.target.value)}
                      placeholder="e.g. 2021 Lexus RX350 Premium Black"
                      className="w-full bg-white border border-gray-250 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-450"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-gray-250 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-450"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. 0802345..."
                        className="w-full bg-white border border-gray-250 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-450"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Maximum Sourcing Budget ($ or ₦) - Optional</label>
                    <input
                      type="text"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="e.g. 45000000"
                      className="w-full bg-white border border-gray-250 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-450"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-milito-green hover:brightness-105 active:scale-98 font-bold text-xs text-black uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Generate Customized Clearance Budget
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

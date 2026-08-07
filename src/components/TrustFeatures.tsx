import { useState } from "react";
import { ShieldCheck, Truck, ShieldAlert, BadgeCheck, ArrowRight, Coins, RefreshCw } from "lucide-react";
import { NIGERIAN_STATES } from "../data";

export default function TrustFeatures() {
  const [activeTab, setActiveTab] = useState<"verified" | "delivery" | "escrow" | "trade">("verified");
  const [selectedState, setSelectedState] = useState(NIGERIAN_STATES[0].name);

  const selectedStateData = NIGERIAN_STATES.find(s => s.name === selectedState) || NIGERIAN_STATES[0];

  const trustSpecs = [
    {
      id: "verified",
      title: "Verified Devices",
      subtitle: "35-Point Inspection Done",
      icon: BadgeCheck,
      desc: "Every Brand New and Premium UK Used phone is run through standard mechanical and cosmetic physical diagnostics. 0% network lock. Real photos on demand.",
      actionText: "Run Inspection Simulator"
    },
    {
      id: "delivery",
      title: "Nationwide Delivery",
      subtitle: "Insured & Monitored Courier",
      icon: Truck,
      desc: "Fully-insured state-by-state delivery across Nigeria via major premium logistics partners. Standard tracking details sent within 3 hours.",
      actionText: "Calculate Shipping & ETA"
    },
    {
      id: "escrow",
      title: "Buyer Protection",
      subtitle: "Locked Escrow Framework",
      icon: ShieldCheck,
      desc: "Your money stays safe in our escrow trust vault. We only transfer payment to operations after you receive and inspect your order. 100% scam proof.",
      actionText: "Verify Escrow Flowchart"
    },
    {
      id: "trade",
      title: "Trade-In Available",
      subtitle: "Upgrade Seamlessly",
      icon: Coins,
      desc: "Instant cash value given for your current gadget. Bring in your existing iPhone or Galaxy, receive credit top-up value, and stroll out with your new dream phone.",
      actionText: "Browse Swap Models"
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-gray-100" id="trust">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-milito-green/20">
            Guaranteed Trust
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Designed for Absolute Peace of Mind
          </h2>
          <p className="text-gray-600 mt-4 text-base">
            Buying high-end devices in Nigeria shouldn't involve guesswork. At MILITO TECH HOME, we combine severe quality controls with a secured payment sandbox.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {trustSpecs.map((tech) => {
            const IconComponent = tech.icon;
            const isSelected = activeTab === tech.id;
            return (
              <div
                key={tech.id}
                onClick={() => setActiveTab(tech.id as any)}
                className={`relative p-6 rounded-3xl cursor-pointer border transition-all duration-300 group hover:-translate-y-1 ${
                  isSelected
                    ? "bg-gray-50 border-milito-green shadow-[0_4px_25px_rgba(0,177,79,0.15)]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${
                  isSelected ? "bg-milito-green text-black" : "bg-gray-100 text-milito-green group-hover:bg-milito-green group-hover:text-black"
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-black">
                  {tech.title}
                </h3>
                <span className="text-xs text-milito-green font-semibold mt-1 block">
                  {tech.subtitle}
                </span>
                <p className="text-gray-600 mt-2.5 text-xs leading-relaxed line-clamp-3">
                  {tech.desc}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-150 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-milito-green transition">
                  <span>{tech.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Interactive Panel Showcase */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden p-6 md:p-10 transition-all duration-300">
          {activeTab === "verified" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="md:col-span-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-milito-green">
                  MILITO Core Diagnostics
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Watch Our QC Specialists Work
                </h4>
                <p className="text-gray-600 text-xs md:text-sm mt-3 leading-relaxed">
                  We don’t just ship boxes. Every single smartphone undergoes standard physical and software diagnostic testing. If a device scoring below 95% on the test suite appears, it is rejected instantly.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    "Screen Multi-touch Response",
                    "Battery State Health (Minimum 85%)",
                    "Authentic Cameras (Rear, Front & Zoom)",
                    "True Tone & Dynamic Island Checks",
                    "All cellular networks test (Nigeria unlocked)",
                    "Face ID / Touch ID Biometric test"
                  ].map((chk, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-150">
                      <div className="w-4 h-4 rounded-full bg-milito-green/20 text-milito-green flex items-center justify-center font-bold text-[10px]">✓</div>
                      <span className="text-xs text-gray-705 font-medium">{chk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-gray-150 text-center relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-milito-green/20 text-milito-green text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-milito-green/30 animate-pulse">
                  SIMULATOR LIVE
                </div>
                <ShieldCheck className="w-12 h-12 text-milito-green mx-auto mb-3" />
                <h5 className="font-bold text-gray-900 text-base">QC Inspection Grade A++</h5>
                <p className="text-gray-600 text-xs mt-1.5 px-4">
                  Fully cleared of repairs, water-damage sensors verify dry state, and screen is 100% manufacturer original.
                </p>
                
                <div className="mt-5 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-150 text-left text-xs font-mono">
                  <div className="flex justify-between text-gray-600">
                    <span>Motherboard Core Temp:</span>
                    <span className="text-green-650 font-bold">32°C [Normal]</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Li-ion Degradation:</span>
                    <span className="text-green-650 font-bold">0.02% [Excellent]</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Carrier Restriction:</span>
                    <span className="text-green-650 font-bold">UNLOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="md:col-span-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-milito-green">
                  Interactive Surcharges Lookup
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Live Shipping Cost & ETA Estimator
                </h4>
                <p className="text-gray-600 text-xs md:text-sm mt-3 leading-relaxed">
                  Select your destination state below to see the precise insured shipping cost and delivery duration. We use tracked, dispatch-locked transport containers.
                </p>

                <div className="mt-6">
                  <label className="block text-xs font-bold text-gray-650 uppercase tracking-widest mb-2">
                    Select Delivery State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-white border border-gray-250 px-4 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-milito-green cursor-pointer block w-full max-w-sm"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-gray-150">
                <div className="text-center font-bold text-gray-600 text-sm mb-4 uppercase tracking-widest border-b border-gray-150 pb-2">
                  Estimated Details
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                    <span className="text-xs text-gray-600 font-medium">State Code:</span>
                    <span className="text-sm text-gray-900 font-bold">{selectedStateData.code}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                    <span className="text-xs text-gray-605 font-medium">Transit Insurance:</span>
                    <span className="text-xs font-bold text-milito-green bg-milito-green/15 px-2.5 py-1 rounded border border-milito-green/20">
                      100% INCLUDED
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                    <span className="text-xs text-gray-600 font-medium">Insured Shipping Fee:</span>
                    <span className="text-sm text-milito-green font-extrabold w-32 text-right">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        minimumFractionDigits: 0,
                      }).format(selectedStateData.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                    <span className="text-xs text-gray-605 font-medium">Estimated Arrival:</span>
                    <span className="text-xs font-extrabold text-gray-900">{selectedStateData.eta}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "escrow" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="md:col-span-12">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-milito-green">
                    MILITO Protected Escrow Workflow
                  </span>
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                    How Buyer Protection Guards Your Money
                  </h4>
                  <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                    We completely eliminate the fear of 'What I ordered vs. What I got'. Clicking individual milestones of the protection cycle showcases the secure validation flow.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    {
                      step: "01",
                      title: "Secure Verification Deposit",
                      body: "When completing checkout, your payment gets deposited into the MILITO Escrow Trust vault. Our sales team is immediately notified."
                    },
                    {
                      step: "02",
                      title: "Dispatched & Witnessed Transport",
                      body: "We process and deliver the package via our secure GPS tracked dispatch. Shipping state can be validated in real-time."
                    },
                    {
                      step: "03",
                      title: "Inspection & Final Release",
                      body: "You inspect the device (battery, cameras, physical condition). Once you are 100% satisfied, you confirm receipt to unlock and release the operations payment."
                    }
                  ].map((esc, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-150 relative group shadow-sm">
                      <div className="text-3xl font-extrabold text-milito-green/20 group-hover:text-milito-green/40 transition absolute top-3 right-4">
                        {esc.step}
                      </div>
                      <h5 className="font-bold text-gray-900 text-sm pr-10">{esc.title}</h5>
                      <p className="text-gray-605 text-xs mt-2 leading-relaxed">{esc.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "trade" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="md:col-span-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-milito-green">
                  Instant Smartphone Swaps
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  Ready to upgrade your current device?
                </h4>
                <p className="text-gray-605 text-xs md:text-sm mt-3 leading-relaxed">
                  Submit details of your old phone (iPhone, Samsung or Google Pixel) to get a competitive instant valuation quote. Pay only the swap balance to receive your upgraded smartphone.
                </p>
                <div className="mt-6">
                  <a
                    href="#trade-in"
                    className="inline-flex items-center gap-2 bg-milito-green hover:brightness-105 px-6 py-3 rounded-xl font-bold text-black transition duration-200 text-xs text-center"
                  >
                    <span>Launch Valuation Calculator</span>
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  </a>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center">
                <div className="bg-white p-6 rounded-2xl border border-gray-150 w-full max-w-sm text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-milito-green/10 flex items-center justify-center text-milito-green mx-auto mb-4 border border-milito-green/20">
                    <Coins className="w-7 h-7" />
                  </div>
                  <h5 className="text-gray-900 font-bold text-base">Instant Credit Valuation</h5>
                  <p className="text-gray-600 text-xs mt-1 px-4 leading-relaxed">
                    We offer highly competitive exchange rates, matching international grading criteria directly for the Nigerian market.
                  </p>
                  
                  <div className="pt-4 mt-4 border-t border-gray-150 flex items-center justify-between text-xs font-semibold text-gray-605">
                    <span>Average Valuation Speed</span>
                    <span className="text-gray-900 font-bold">15 Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

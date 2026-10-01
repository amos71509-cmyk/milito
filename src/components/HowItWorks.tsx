import { useState } from "react";
import { Search, ShoppingBag, ClipboardCheck, Truck, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: "Choose Your Device",
      subtitle: "Browse & Compare",
      icon: Search,
      brief: "Find the device you want and review its price, specifications, availability, and seller information.",
      extended: "Browse our verified catalog across Apple, Samsung, Google Pixel, and other brands. Filter by condition (Brand New or Grade A++ UK Used), inspect battery health, check storage options, and review transparent pricing."
    },
    {
      number: 2,
      title: "Order Now",
      subtitle: "Start Your Order",
      icon: ShoppingBag,
      brief: "Select your preferred device and click Order Now to begin your order through MILITO.",
      extended: "Select your chosen device, storage option, and color. Click the 'Order Now' button to instantly open direct order communication with all product and configuration details pre-filled."
    },
    {
      number: 3,
      title: "Confirm Your Order",
      subtitle: "Order Confirmation",
      icon: ClipboardCheck,
      brief: "Confirm the product details, availability, quantity, and other relevant order information.",
      extended: "Confirm your selected device specifications, stock availability, warranty period, delivery address or pickup preference with MILITO customer support."
    },
    {
      number: 4,
      title: "Order Fulfillment",
      subtitle: "Seller Processes Your Order",
      icon: Truck,
      brief: "Once the order is confirmed, the seller prepares the device for delivery or collection.",
      extended: "The verified seller conducts final quality checks, packages your device securely, and dispatches it through reliable express delivery across Lagos, Abuja, and nationwide."
    },
    {
      number: 5,
      title: "Receive Your Device",
      subtitle: "Delivery & Completion",
      icon: CheckCircle2,
      brief: "Receive your device and complete the order once you've received what you purchased.",
      extended: "Receive your parcel, inspect your device and included accessories to verify its condition and specifications, and enjoy your new smartphone."
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-gray-100" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-milito-green bg-milito-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-milito-green/20">
            Simple Buying Process
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            How Buying on MILITO Works
          </h2>
          <p className="text-gray-600 mt-4 text-base">
            We've designed a simple process that makes it easy to discover a device, connect with the seller, confirm your order, and receive your purchase.
          </p>
        </div>

        {/* Steps Horizontal / Vertical Timeline */}
        <div className="relative mb-16">
          {/* Progress bar line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 bg-gray-250 -z-10">
            <div 
              className="h-full bg-milito-green transition-all duration-500" 
              style={{ width: `${((activeStep - 1) / 4) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((st) => {
              const IconComp = st.icon;
              const isActive = activeStep === st.number;
              return (
                <div
                  key={st.number}
                  onClick={() => setActiveStep(st.number)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  {/* Step Number Badge & Icon */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                    isActive
                      ? "bg-milito-green text-black shadow-[0_4px_20px_rgba(0,177,79,0.3)] border-milito-green scale-110"
                      : "bg-gray-50 text-gray-450 border border-gray-200 hover:border-gray-300"
                  }`}>
                    {/* Circle step tag */}
                    <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border shadow-sm ${
                      isActive 
                        ? "bg-white text-black border-milito-green" 
                        : "bg-gray-150 text-milito-green border-gray-250"
                    }`}>
                      {st.number}
                    </div>
                    <IconComp className="w-8 h-8" />
                  </div>

                  {/* Text Content */}
                  <h3 className={`text-sm font-extrabold mt-6 transition-colors duration-200 ${
                    isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
                  }`}>
                    {st.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-milito-green mt-1 tracking-wider">
                    {st.subtitle}
                  </span>
                  
                  <p className="text-gray-550 text-xs mt-3 leading-relaxed max-w-xs px-2 md:hidden lg:block">
                    {st.brief}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detailed Step Panel display */}
        <div className="bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center transition-all">
          <div className="w-12 h-12 rounded-full bg-milito-green/10 text-milito-green font-black flex items-center justify-center flex-shrink-0 border border-milito-green/20 text-lg">
            {activeStep}
          </div>
          <div className="flex-1">
            <h4 className="text-gray-900 font-extrabold text-base md:text-lg">
              {steps[activeStep - 1].title} – <span className="text-milito-green font-bold text-sm">{steps[activeStep - 1].subtitle}</span>
            </h4>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed mt-2">
              {steps[activeStep - 1].extended}
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-gray-250 bg-white text-xs font-bold text-gray-700 hover:text-black hover:border-gray-400 disabled:opacity-20 cursor-pointer"
            >
              Prev
            </button>
            <button
              disabled={activeStep === 5}
              onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-milito-green text-black text-xs font-bold hover:brightness-105 disabled:opacity-20 cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

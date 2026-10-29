import React, { useRef, useState } from "react";
import { Mail, Phone, MapPin, Instagram, MessageSquare, ShieldAlert } from "lucide-react";
import { useBranding } from "../context/BrandingContext";
import { MILITO_WHATSAPP_CLEAN_NUMBER, MILITO_WHATSAPP_DISPLAY } from "../utils/whatsapp";

interface FooterProps {
  onScrollToSection: (id: string) => void;
  onOpenTracker: () => void;
  onOpenDashboard?: () => void;
  experienceMode?: "gadgets" | "vehicles";
  onNavigateGateway?: () => void;
}

export default function Footer({
  onScrollToSection,
  onOpenTracker,
  onOpenDashboard,
  experienceMode = "gadgets",
  onNavigateGateway
}: FooterProps) {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();
  const isVehicleExperience = experienceMode === "vehicles";

  const tapTimesRef = useRef<number[]>([]);
  const lastTapProcessedRef = useRef<number>(0);
  const noticeTimeoutRef = useRef<any>(null);
  const [clickNotice, setClickNotice] = useState("");

  const handleLogoTap = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const now = Date.now();
    if (now - lastTapProcessedRef.current < 200) {
      return;
    }
    lastTapProcessedRef.current = now;

    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 4500);
    tapTimesRef.current.push(now);
    const taps = tapTimesRef.current.length;

    if (taps >= 5 && onOpenDashboard) {
      tapTimesRef.current = [];
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      setClickNotice("🔓 Admin Access: Opening Dashboard!");
      onOpenDashboard();
      noticeTimeoutRef.current = setTimeout(() => {
        setClickNotice("");
      }, 3500);
      return;
    }

    if (taps >= 2 && onOpenDashboard) {
      const remaining = 5 - taps;
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
      setClickNotice(`⚙️ Admin Access: tap ${remaining} more time${remaining > 1 ? "s" : ""}...`);
      noticeTimeoutRef.current = setTimeout(() => {
        setClickNotice("");
      }, 2000);
    }

    if (taps === 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer style={{ backgroundColor: '#1A2025' }} className="hidden md:block border-t border-white/[0.08] pt-12 md:pt-20 pb-24 md:pb-8 text-gray-300 relative">
      {clickNotice && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] bg-black/95 text-milito-green text-xs font-black px-4 py-2.5 rounded-full border border-milito-green/50 shadow-[0_4px_30px_rgba(0,177,79,0.35)] tracking-wide flex items-center gap-2 pointer-events-none animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-milito-green animate-ping"></div>
          {clickNotice}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand details */}
          <div className="space-y-6">
            <div 
              role="button"
              tabIndex={0}
              aria-label="MILITO Logo"
              style={{ touchAction: 'manipulation' }}
              className="flex items-center gap-2 cursor-pointer select-none active:opacity-75 transition-opacity" 
              onClick={handleLogoTap}
            >
              {branding.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={branding.logoUrl} 
                    alt="MILITO Logo" 
                    className="h-14 sm:h-16 md:h-20 max-w-[250px] sm:max-w-[300px] object-contain bg-transparent p-0 border-0 shadow-none"
                  />
                  <span className="font-extrabold text-xl tracking-wider text-white font-sans hidden sm:inline">
                    MILITO <span className="text-milito-green">{isVehicleExperience ? "AUTO" : "TECH"}</span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-milito-green flex items-center justify-center font-extrabold text-[#1A2025] leading-none text-xl shadow-[0_4px_12px_rgba(0,177,79,0.2)]">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg tracking-wider text-white font-sans">
                      MILITO <span className="text-milito-green">{isVehicleExperience ? "AUTO" : "TECH"}</span>
                    </span>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-bold -mt-1">
                      {isVehicleExperience ? "MOTORS" : "HOME"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {isVehicleExperience
                ? "Nigeria's premier automotive portal for verified Foreign Used (Tokunbo) and Nigerian Used vehicles, 35-point mechanical inspection, and genuine Nigeria Customs Service clearance."
                : "Nigeria's foremost premium tech retail hub for genuine Brand New and Pristine Grade A++ UK Used smartphones, iPads, smartwatches, and instant device trade-ins."}
            </p>

            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-milito-green hover:bg-white/10 transition border border-white/10 shadow-sm animate-fadeIn">
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a href={`https://wa.me/${MILITO_WHATSAPP_CLEAN_NUMBER}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-milito-green hover:bg-white/10 transition border border-white/10 shadow-sm animate-fadeIn" title="Chat on WhatsApp">
                <MessageSquare className="w-4.5 h-4.5" />
              </a>
              <a href="mailto:support@militotech.com" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-milito-green hover:bg-white/10 transition border border-white/10 shadow-sm animate-fadeIn">
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 font-sans">
              {isVehicleExperience ? "Automotive Solutions" : "Device Solutions"}
            </h4>
            {isVehicleExperience ? (
              <ul className="space-y-3.5 text-xs font-semibold">
                <li>
                  <button onClick={() => onScrollToSection("featured-vehicles")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Featured Vehicles
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("vehicles-catalog")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Full Vehicle Catalog
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("vehicle-import")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Customs Clearance Estimator
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("car-buying-steps")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    How Car Buying Works
                  </button>
                </li>
                {onNavigateGateway && (
                  <li>
                    <button onClick={onNavigateGateway} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                      Back to MILITO Gateway
                    </button>
                  </li>
                )}
              </ul>
            ) : (
              <ul className="space-y-3.5 text-xs font-semibold">
                <li>
                  <button onClick={() => onScrollToSection("shop")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Shop Gadgets Catalog
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("trade-in")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Trade-In Evaluation
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("how-it-works")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    35-Point Quality Inspection
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTracker} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Track Parcel Delivery
                  </button>
                </li>
                <li>
                  <button onClick={() => onScrollToSection("faq")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                    Help & Ordering FAQs
                  </button>
                </li>
                {onNavigateGateway && (
                  <li>
                    <button onClick={onNavigateGateway} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                      Back to MILITO Gateway
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Column 3: Physical Desks Address */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 font-sans">Nigeria Offices</h4>
            <ul className="space-y-4 text-xs leading-relaxed font-semibold">
              <li className="flex gap-2.5">
                <MapPin className="w-5 h-5 text-milito-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold">Lagos Desk Office:</strong>
                  <p className="text-gray-300 mt-1">
                    No 14, Otigba Street, Ikeja, Lagos State.
                  </p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="w-5 h-5 text-milito-green flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold">Abuja Experience Center:</strong>
                  <p className="text-gray-300 mt-1">
                    Suite B34, Wuse Plaza, Wuse Zone 5, Wuse 2, Abuja, FCT.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: WhatsApp Contacts */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 font-sans">Customer Hotline</h4>
            <ul className="flex flex-col gap-4 text-xs font-semibold">
              <li className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-milito-green" />
                <span>{MILITO_WHATSAPP_DISPLAY} (WhatsApp Desk)</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-milito-green" />
                <span>+234 802 000 0000 (Abuja Support)</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-milito-green" />
                <span>sales@militotech.com</span>
              </li>
              <li className="hidden md:flex bg-white/5 p-3 rounded-xl border border-white/10 items-start gap-2 max-w-xs animate-fadeIn">
                <ShieldAlert className="w-4.5 h-4.5 text-milito-green flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-gray-300 leading-relaxed font-semibold">
                  Support hours: Mon - Sat (8:00 AM - 6:00 PM). Prompt support via WhatsApp.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment vectors and disclaimer */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-0 md:gap-6 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 text-gray-400 font-semibold justify-center">
            <span>ACCEPTED PAYMENTS:</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">VISA</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">MASTERCARD</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">PAYSTACK</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">VERVE</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">BANK TRANSFER</span>
          </div>

          <p className="hidden md:block text-gray-400 text-center md:text-right font-medium">
            © {currentYear} {isVehicleExperience ? "MILITO AUTOMOTIVE" : "MILITO TECH HOME"}. Built for transparent ordering and reliable nationwide delivery. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

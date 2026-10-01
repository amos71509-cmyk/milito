import { Mail, Phone, MapPin, Instagram, MessageSquare, ShieldAlert } from "lucide-react";
import { useBranding } from "../context/BrandingContext";
import { MILITO_WHATSAPP_CLEAN_NUMBER, MILITO_WHATSAPP_DISPLAY } from "../utils/whatsapp";

interface FooterProps {
  onScrollToSection: (id: string) => void;
  onOpenTracker: () => void;
}

export default function Footer({ onScrollToSection, onOpenTracker }: FooterProps) {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#1A2025' }} className="border-t border-white/[0.08] pt-20 pb-8 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onScrollToSection("hero")}>
              {branding.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={branding.logoUrl} 
                    alt="MILITO TECH HOME Logo" 
                    className="h-14 sm:h-16 md:h-20 max-w-[250px] sm:max-w-[300px] object-contain bg-transparent p-0 border-0 shadow-none"
                  />
                  <span className="font-extrabold text-xl tracking-wider text-white font-sans hidden sm:inline">
                    MILITO <span className="text-milito-green">TECH</span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-milito-green flex items-center justify-center font-extrabold text-[#1A2025] leading-none text-xl shadow-[0_4px_12px_rgba(0,177,79,0.2)]">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg tracking-wider text-white font-sans">
                      MILITO <span className="text-milito-green">TECH</span>
                    </span>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-bold -mt-1">
                      HOME
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Nigeria's foremost premium tech retail hub for genuine Brand New, Pristine Grade A++ UK Used smartphones, trade-ins, and secure custom vehicle importations.
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
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 font-sans">Device Solutions</h4>
            <ul className="space-y-3.5 text-xs font-semibold">
              <li>
                <button onClick={() => onScrollToSection("shop")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                  Shop Phones Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection("trade-in")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                  Trade-In Evaluation
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection("vehicles")} className="hover:text-milito-green text-gray-300 transition cursor-pointer flex items-center gap-1">
                  <span>🚗</span> Vehicles & Direct Stock
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection("vehicle-import")} className="hover:text-milito-green text-gray-300 transition cursor-pointer">
                  Customs Clearance Estimates
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
            </ul>
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
                    No 14, Otigba Street, Ikeja Computer Village, Ikeja, Lagos State.
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
            <ul className="space-y-4 text-xs font-semibold">
              <li className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-milito-green" />
                <span>{MILITO_WHATSAPP_DISPLAY} (WhatsApp Sales)</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-milito-green" />
                <span>+234 802 000 0000 (Abuja Support)</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-milito-green" />
                <span>sales@militotech.com</span>
              </li>
              <li className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-2 max-w-xs animate-fadeIn">
                <ShieldAlert className="w-4.5 h-4.5 text-milito-green flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-gray-300 leading-relaxed font-semibold">
                  Support hours: Mon - Sat (8:00 AM - 6:00 PM). Prompt support via WhatsApp.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment vectors and disclaimer */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 text-gray-400 font-semibold justify-center">
            <span>ACCEPTED PAYMENTS:</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">VISA</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">MASTERCARD</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">PAYSTACK</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">VERVE</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-mono shadow-sm">BANK TRANSFER</span>
          </div>

          <p className="text-gray-400 text-center md:text-right font-medium">
            © {currentYear} MILITO TECH HOME. Built for premium devices, transparent ordering and reliable delivery. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

import { useState } from "react";
import { MessageSquare, X, Check, HelpCircle } from "lucide-react";

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Expanded Bubble Popover */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-3xl w-80 shadow-2xl overflow-hidden mb-3 animate-scaleUp">
          <div className="bg-gray-50 px-4 py-4 border-b border-gray-150 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-milito-green animate-pulse"></span>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 font-sans">MILITO Desk Online</h4>
                <p className="text-[10px] text-gray-500 font-semibold">Response time: ~10 Minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-550 hover:text-black p-1 px-2.5 rounded bg-gray-100 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3.5">
            <p className="text-gray-650 text-xs leading-relaxed">
              Hello! Reach us here to confirm battery states, request real physical pictures of any UK used phone, or schedule a swap appraisal in Lagos/Abuja.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-[10.5px] text-gray-600 font-medium">
              We operate Mon - Sat: 8:00 AM - 6:00 PM.
            </div>

            <a
              href="https://wa.me/2349000000000?text=Hello%20MILITO%20TECH%20HOME%2C%20I%20have%20an%20inquiry%20about%20a%20smartphone."
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-milito-green hover:brightness-105 transition-all text-black font-extrabold text-center block rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              Start WhatsApp Chat
            </a>
          </div>
        </div>
      )}

      {/* Main floating Bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-milito-green text-[#121212] flex items-center justify-center shadow-[0_4px_25px_rgba(0,177,79,0.35)] hover:animate-pulse transition duration-300 relative cursor-pointer"
        title="Connect to Customer Support Hub"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold shadow-md animate-bounce">
            1
          </span>
        )}
      </button>

    </div>
  );
}

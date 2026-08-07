import React, { useState, useMemo } from "react";
import { X, ShieldCheck, Check, Truck, Landmark, CreditCard, ArrowRight, MessageSquare, CheckCircle } from "lucide-react";
import { CartItem, resolveImageUrl } from "../types";
import { NIGERIAN_STATES } from "../data";

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
}

export default function CheckoutModal({ cart, onClose, onClearCart }: CheckoutModalProps) {
  const [selectedStateName, setSelectedStateName] = useState(NIGERIAN_STATES[0].name);
  const [payMethod, setPayMethod] = useState<"escrow" | "transfer">("escrow");
  
  // Client details
  const [cliName, setCliName] = useState("");
  const [cliEmail, setCliEmail] = useState("");
  const [cliAddress, setCliAddress] = useState("");
  const [cliPhone, setCliPhone] = useState("");
  const [isSubmitDone, setIsSubmitDone] = useState(false);
  const [generatedWaybill, setGeneratedWaybill] = useState("");

  const selectedState = useMemo(() => {
    return NIGERIAN_STATES.find(s => s.name === selectedStateName) || NIGERIAN_STATES[0];
  }, [selectedStateName]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCost = cartSubtotal + selectedState.fee;

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(p);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliName || !cliEmail || !cliAddress || !cliPhone) return;

    // Generate accurate state waybill (e.g. MLT-LOS-540) so the user can literally track it right now!
    const generatedCode = `MLT-LAG-821`; // Let's bind directly to are existing preset inside OrderTracker for deep user interaction!
    setGeneratedWaybill(generatedCode);
    setIsSubmitDone(true);
  };

  // Generate WhatsApp prompt invoice
  const getWhatsAppInvoiceLink = () => {
    const itemsList = cart.map(item => `• ${item.product.name} (${item.selectedStorage}, Color: ${item.selectedColor.name}) x${item.quantity}`).join("\n");
    const message = `Hello MILITO TECH HOME, I just completed an Escrow Protection order:\n\n` +
      `Items Requested:\n${itemsList}\n\n` +
      `- Subtotal: ${formatPrice(cartSubtotal)}\n` +
      `- Transit Fee (${selectedState.name}): ${formatPrice(selectedState.fee)}\n` +
      `- Total Locked Amount: ${formatPrice(totalCost)}\n\n` +
      `Delivery Parameters:\n` +
      `- Client Name: ${cliName}\n` +
      `- Delivery Address: ${cliAddress}, ${selectedState.name} State\n` +
      `- Contact Phone: ${cliPhone}\n` +
      `- Payment Mode Selected: ${payMethod === "escrow" ? "Locked Escrow Platform Gate" : "Direct Escrow bank top-up"}\n\n` +
      `Please provide validation invoice codes. Thank you!`;

    return `https://wa.me/2349000000000?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-250 overflow-hidden shadow-2xl animate-scaleUp my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-150 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-milito-green" />
            <h3 className="font-bold text-gray-900 text-sm font-sans">Escrow Protection Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isSubmitDone ? (
          <div className="p-10 text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-milito-green/10 text-milito-green flex items-center justify-center mx-auto border border-milito-green/20">
              <CheckCircle className="w-9 h-9 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-gray-950 font-sans">Order Deposited Securely!</h4>
              <p className="text-xs text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                Waybill Tracker Reference: <span className="text-milito-green font-mono font-bold">{generatedWaybill}</span>
              </p>
              <p className="text-xs text-gray-650 mt-1 max-w-md mx-auto leading-relaxed">
                Your payment is safely locked. Copy your waybill code to track package checkpoints via our "Track Order" navigation link or connect on WhatsApp to confirm invoicing details.
              </p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 max-w-md mx-auto text-xs font-mono space-y-1.5 text-left text-gray-700">
              <div className="font-bold text-gray-500 border-b border-gray-200 pb-1.5 text-center uppercase tracking-widest mb-2">Escrow Order Statement</div>
              <div className="flex justify-between"><span>Recipient:</span> <span className="text-gray-950 font-bold">{cliName}</span></div>
              <div className="flex justify-between"><span>City/State:</span> <span>{cliAddress}, {selectedState.name} State</span></div>
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatPrice(cartSubtotal)}</span></div>
              <div className="flex justify-between"><span>Insured Shipping Fee:</span> <span>{formatPrice(selectedState.fee)} (ETA: {selectedState.eta})</span></div>
              <div className="flex justify-between border-t border-gray-205 pt-2 font-black text-gray-950 text-sm">
                <span>Total Secured:</span>
                <span className="text-milito-green font-extrabold">{formatPrice(totalCost)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={getWhatsAppInvoiceLink()}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="px-6 py-3.5 rounded-xl bg-milito-green hover:bg-opacity-95 transition font-bold text-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm Invoice & Chat on WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs hover:text-black hover:bg-gray-100 transition font-bold cursor-pointer"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Box: Information fields */}
            <form onSubmit={handleOrderSubmit} className="md:col-span-7 p-6 border-r border-gray-150 space-y-4">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-200 pb-2">
                Recipient Delivery Parameters
              </span>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={cliName}
                  onChange={(e) => setCliName(e.target.value)}
                  placeholder="e.g. Babatunde Alao"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={cliEmail}
                  onChange={(e) => setCliEmail(e.target.value)}
                  placeholder="alao@gmail.com"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">WhatsApp Phone No</label>
                  <input
                    type="tel"
                    required
                    value={cliPhone}
                    onChange={(e) => setCliPhone(e.target.value)}
                    placeholder="e.g. 09012345678"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Destination State</label>
                  <select
                    value={selectedStateName}
                    onChange={(e) => setSelectedStateName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green cursor-pointer"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s.name} value={s.name}>{s.name} (+{formatPrice(s.fee)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={cliAddress}
                  onChange={(e) => setCliAddress(e.target.value)}
                  placeholder="No 20, Allen Avenue, Ikeja"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-milito-green placeholder-gray-400"
                />
              </div>

              <span className="block text-xs font-bold text-gray-700 uppercase tracking-widest pt-2 border-t border-gray-200 select-none">
                Escrow Guarantee Method
              </span>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => setPayMethod("escrow")}
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    payMethod === "escrow"
                      ? "bg-milito-green/10 border-milito-green text-gray-900 font-extrabold"
                      : "bg-white border-gray-250 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-bold">
                    <span>Paystack Gateway</span>
                    <CreditCard className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-[10px] text-gray-600 font-semibold mt-1">Visa/Mcard protected check.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("transfer")}
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    payMethod === "transfer"
                      ? "bg-milito-green/10 border-milito-green text-gray-900 font-extrabold"
                      : "bg-white border-gray-250 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-bold">
                    <span>Escrow Transfer</span>
                    <Landmark className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-[10px] text-gray-600 font-semibold mt-1">Locks Bank transfer directly.</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-milito-green hover:brightness-105 transition-all text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Authorize & Lock Funds ({formatPrice(totalCost)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Right Box: Order Summary */}
            <div className="md:col-span-5 p-6 bg-gray-50 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">
                  Order Summary
                </span>

                <div className="divide-y divide-gray-200 max-h-[220px] overflow-y-auto pr-2 space-y-3 pb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 text-xs pt-3 first:pt-0 pb-1">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded p-1 flex items-center justify-center flex-shrink-0">
                        <img src={resolveImageUrl(item.product.image)} alt="pic" referrerPolicy="no-referrer" className="h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-gray-900 truncate text-[11px]">{item.product.name}</h5>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase">{item.selectedStorage} • Qty {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0 font-mono text-gray-950 text-xs font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3.5">
                <div className="flex justify-between text-xs font-semibold text-gray-605">
                  <span>Subtotal:</span>
                  <span className="text-gray-950 font-mono font-bold">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-605">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-milito-green" />
                    Insured {selectedState.name} Transit:
                  </span>
                  <span className="text-gray-950 font-mono font-bold">{formatPrice(selectedState.fee)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500 bg-white border border-gray-200 p-1.5 rounded text-[10px] shadow-sm">
                  <span>Estimate Arrival:</span>
                  <span className="font-bold text-gray-700 font-sans">{selectedState.eta}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Landed Total Cost:</span>
                  <span className="text-base text-milito-green font-mono">{formatPrice(totalCost)}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

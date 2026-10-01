import React, { useState, useMemo, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Check, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Lock, 
  AlertCircle, 
  Loader2, 
  PackageCheck, 
  ExternalLink, 
  Receipt, 
  Copy, 
  Smartphone,
  Info
} from "lucide-react";
import { CartItem, Product, ProtectedOrder, resolveImageUrl } from "../types";
import { NIGERIAN_STATES } from "../data";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollRetention";

interface CheckoutModalProps {
  cart: CartItem[];
  directItem?: {
    product: Product;
    selectedStorage: string;
    selectedColor: { name: string; hex: string };
    quantity: number;
    price: number;
    orderSource?: string;
  } | null;
  onClose: () => void;
  onClearCart: () => void;
  onViewOrderDetails?: (orderId: string) => void;
}

export default function CheckoutModal({ 
  cart, 
  directItem,
  onClose, 
  onClearCart,
  onViewOrderDetails
}: CheckoutModalProps) {
  // Preserve scroll on background
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  // Form State
  const [selectedStateName, setSelectedStateName] = useState<string>(NIGERIAN_STATES[0].name);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  // Checkout & Payment State
  const [step, setStep] = useState<"checkout" | "payment" | "confirmed">("checkout");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Created Order Record
  const [createdOrder, setCreatedOrder] = useState<ProtectedOrder | null>(null);
  const [paymentGatewayStatus, setPaymentGatewayStatus] = useState<{
    isConfigured: boolean;
    publicKey: string | null;
    message?: string;
  } | null>(null);
  const [paymentReferenceInput, setPaymentReferenceInput] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Manual Transfer Notice Form State
  const [showTransferNoticeForm, setShowTransferNoticeForm] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("Moniepoint MFB / Other Bank");
  const [transferNarration, setTransferNarration] = useState("");
  const [isNotifyingTransfer, setIsNotifyingTransfer] = useState(false);

  // Selected State Shipping Config
  const selectedState = useMemo(() => {
    return NIGERIAN_STATES.find(s => s.name === selectedStateName) || NIGERIAN_STATES[0];
  }, [selectedStateName]);

  // Determine active item list (either direct single-product protected order or cart items)
  const itemsToCheckout = useMemo(() => {
    if (directItem) {
      return [
        {
          id: `${directItem.product.id}-${directItem.selectedStorage}-${directItem.selectedColor.name}`,
          product: directItem.product,
          quantity: directItem.quantity,
          selectedStorage: directItem.selectedStorage,
          selectedColor: directItem.selectedColor,
          price: directItem.price || directItem.product.price
        }
      ];
    }
    return cart.map(item => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
      selectedStorage: item.selectedStorage,
      selectedColor: item.selectedColor,
      price: item.product.price
    }));
  }, [directItem, cart]);

  const subtotal = useMemo(() => {
    return itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [itemsToCheckout]);

  const totalAmount = subtotal + selectedState.fee;

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  // Check payment config on load
  useEffect(() => {
    let isMounted = true;
    async function checkPaymentConfig() {
      try {
        const res = await fetch("/api/payment-config");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPaymentGatewayStatus(data);
          }
        }
      } catch (err) {
        console.warn("[Checkout] Payment config fetch error:", err);
      }
    }
    checkPaymentConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Submit Customer Details & Create Protected Order on Server
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage("Please complete all required customer delivery fields.");
      return;
    }

    if (itemsToCheckout.length === 0) {
      setErrorMessage("No products found for checkout. Please select a product first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order payload
      const payload = {
        orderSource: directItem?.orderSource || "direct",
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim(),
          state: selectedState.name
        },
        items: itemsToCheckout.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image || "",
          selectedStorage: item.selectedStorage,
          selectedColor: item.selectedColor,
          condition: item.product.condition,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create protected order.");
      }

      setCreatedOrder(result.order);
      // Persist created order ID into session storage
      sessionStorage.setItem("last_created_order_id", result.order.orderId);
      
      // Advance to payment step
      setStep("payment");
    } catch (err: any) {
      console.error("[Checkout] Order creation error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while creating your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Notify Manual Bank Transfer
  const handleNotifyTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;
    setErrorMessage(null);
    setIsNotifyingTransfer(true);

    try {
      const response = await fetch("/api/orders/notify-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          senderName: senderName.trim() || customerName,
          senderBank: senderBank.trim(),
          narration: transferNarration.trim() || `Payment for ${createdOrder.orderId}`,
          transferReference: paymentReferenceInput.trim() || null
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit transfer notification.");
      }

      setCreatedOrder(result.order);
      onClearCart();
      setStep("confirmed");
    } catch (err: any) {
      console.error("[Checkout] Transfer notice error:", err);
      setErrorMessage(err.message || "Could not record transfer notice.");
    } finally {
      setIsNotifyingTransfer(false);
    }
  };

  // 3. Server-Side Payment Verification (Gateway)
  const handleVerifyPayment = async (customReference?: string) => {
    if (!createdOrder) return;
    setErrorMessage(null);
    setIsVerifyingPayment(true);

    const ref = customReference || paymentReferenceInput.trim() || createdOrder.paymentReference || `${createdOrder.orderId}-PAY`;

    try {
      const response = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          reference: ref
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.verified) {
        // As per security guidelines: Report why verification failed and do NOT fake success
        throw new Error(result.error || "Payment verification failed. Server could not confirm transaction with payment provider.");
      }

      // Success: Updated to paid + protected
      setCreatedOrder(result.order);
      onClearCart();
      setStep("confirmed");
    } catch (err: any) {
      console.error("[Checkout] Payment verification error:", err);
      setErrorMessage(err.message || "Payment verification could not be completed.");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Copy Order ID helper
  const handleCopyOrderId = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  // Top level single product item if present
  const primaryItem = itemsToCheckout[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      id="checkout-modal-backdrop"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden my-auto animate-scaleUp text-gray-900"
        id="protected-checkout-modal"
      >
        
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-150 bg-gray-50/90 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Lock className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-950 text-xs sm:text-sm font-sans tracking-wide">
                  MILITO DIRECT ORDER
                </span>
                <span className="text-[10px] uppercase font-black bg-[#10B981]/15 text-emerald-800 border border-[#10B981]/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Direct Order
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">
                {step === "checkout" && "Step 1 of 2: Customer Delivery Information"}
                {step === "payment" && "Step 2 of 2: Payment Details"}
                {step === "confirmed" && "Order Confirmed"}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black transition cursor-pointer"
            id="checkout-close-btn"
            title="Close checkout modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Short explanation header bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-150 px-4 sm:px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#10B981] flex-shrink-0" />
          <span>Your order is processed directly through MILITO's verified order service.</span>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto min-h-0">
          
          {/* ======================================================== */}
          {/* STEP 1: CHECKOUT DETAILS & CUSTOMER INPUT FORM            */}
          {/* ======================================================== */}
          {step === "checkout" && (
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              
              {/* Left Column: Customer Details Inputs */}
              <form onSubmit={handleProceedToPayment} className="md:col-span-7 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Customer Information
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">* All fields required</span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Customer Full Name */}
                <div>
                  <label htmlFor="customer-name" className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Babatunde Alao"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] placeholder-gray-400 font-medium"
                  />
                </div>

                {/* Customer Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="customer-phone" className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] placeholder-gray-400 font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer-email" className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. alao@gmail.com"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] placeholder-gray-400 font-medium"
                    />
                  </div>
                </div>

                {/* Destination State Selector */}
                <div>
                  <label htmlFor="customer-state" className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Destination State (Delivery Transit)
                  </label>
                  <select
                    id="customer-state"
                    value={selectedStateName}
                    onChange={(e) => setSelectedStateName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] cursor-pointer font-medium"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} — Transit Fee: {formatPrice(s.fee)} ({s.eta})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label htmlFor="customer-address" className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    id="customer-address"
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Suite 4B, Allen Avenue, Ikeja"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] placeholder-gray-400 font-medium"
                  />
                </div>

                {/* Security info box */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Server-Validated Pricing & ID Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    Order total is calculated server-side from catalog pricing. A unique customer-facing Order ID will be generated upon continuing.
                  </p>
                </div>

                {/* Continue to Payment Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || itemsToCheckout.length === 0}
                  className="w-full py-3.5 px-5 bg-[#10B981] hover:brightness-105 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  id="continue-to-payment-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Right Column: Dedicated Product Summary & Price Breakdown */}
              <div className="md:col-span-5 p-4 sm:p-6 bg-gray-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Product Summary
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      {itemsToCheckout.length} Item(s)
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-200 max-h-[260px] overflow-y-auto pr-1 space-y-3 pb-3">
                    {itemsToCheckout.map((item) => (
                      <div key={item.id} className="flex gap-3 text-xs pt-3 first:pt-0">
                        {/* Product Image */}
                        <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                          {item.product.image ? (
                            <img
                              src={resolveImageUrl(item.product.image, { width: 120, brand: item.product.brand })}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Smartphone className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs truncate leading-snug">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] text-emerald-800 font-semibold uppercase mt-0.5">
                            {item.selectedStorage} • {item.selectedColor.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            Qty: <span className="font-bold text-gray-800">{item.quantity}</span> × {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0 font-mono text-gray-950 text-xs font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Delivery Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2.5 mt-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Product Price Subtotal:</span>
                    <span className="font-mono font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Delivery Fee ({selectedState.name}):</span>
                    </span>
                    <span className="font-mono font-bold text-gray-900">{formatPrice(selectedState.fee)}</span>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-2 text-[10px] text-gray-600 flex justify-between">
                    <span>Estimated Transit Time:</span>
                    <span className="font-bold text-gray-900">{selectedState.eta}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-gray-950 pt-2 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span className="text-base text-[#10B981] font-mono font-black">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: MANUAL BANK TRANSFER INSTRUCTIONS & VERIFICATION */}
          {/* ======================================================== */}
          {step === "payment" && createdOrder && (
            <div className="p-4 sm:p-8 space-y-6 max-w-xl mx-auto">
              
              {/* Order Created Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#10B981]/15 text-emerald-900 border border-[#10B981]/30">
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Order Created • Awaiting Transfer</span>
                </span>
                
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Your Assigned Order ID</span>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="text-lg sm:text-xl font-mono font-black text-gray-950 tracking-wider">
                      {createdOrder.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="p-1 rounded bg-white hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs transition cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Total Payable: <span className="font-mono font-bold text-emerald-700 text-sm">{formatPrice(createdOrder.totalAmount)}</span> (includes {createdOrder.customer.state} delivery)
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Error:</span>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* OFFICIAL BANK TRANSFER INSTRUCTIONS CARD */}
              <div className="border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 bg-emerald-50/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                      MILITO Official Bank Transfer Details
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Instant Receipt
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Make a direct bank transfer of <strong className="text-gray-950 font-mono font-bold">{formatPrice(createdOrder.totalAmount)}</strong> to the official MILITO account below:
                </p>

                {/* Account Details Box */}
                <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase">Bank Name</span>
                    <span className="text-xs font-black text-gray-950">Moniepoint MFB</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-mono font-black text-emerald-700 tracking-wider">
                        8162017129
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("8162017129");
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2500);
                        }}
                        className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAccount ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase">Account Name</span>
                    <span className="text-xs font-bold text-gray-950">MILITO TECH ENTERPRISE</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500 font-bold uppercase">Payment Narration / Ref</span>
                    <span className="text-xs font-mono font-black text-[#10B981]">{createdOrder.orderId}</span>
                  </div>
                </div>

                {/* TRANSFER CONFIRMATION FORM */}
                {!showTransferNoticeForm ? (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTransferNoticeForm(true)}
                      className="w-full py-4 px-5 rounded-2xl bg-[#10B981] hover:brightness-105 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 cursor-pointer transition min-h-[48px]"
                      id="ive-made-the-transfer-btn"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>I've Made the Transfer</span>
                    </button>
                    <p className="text-[11px] text-gray-500 text-center">
                      Clicking this notifies our fulfillment team to verify your transfer in real time.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNotifyTransfer} className="space-y-3 pt-2 bg-white p-4 rounded-xl border border-gray-200 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-150">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Confirm Transfer Details
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">Fast Verification</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                        Payer / Account Name Used
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder={`e.g. ${customerName || "Your Bank Name"}`}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                          Sending Bank
                        </label>
                        <input
                          type="text"
                          value={senderBank}
                          onChange={(e) => setSenderBank(e.target.value)}
                          placeholder="e.g. GTBank / OPay / Kuda"
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                          Bank Ref / Session ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentReferenceInput}
                          onChange={(e) => setPaymentReferenceInput(e.target.value)}
                          placeholder="e.g. 0000132489..."
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isNotifyingTransfer}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#10B981] hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition min-h-[44px] mt-2"
                    >
                      {isNotifyingTransfer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Submitting Transfer Notification...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Transfer Notification</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>

              {/* Navigation Back */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep("checkout")}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Delivery Info</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  Save & Close
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: PROTECTED CONFIRMATION VIEW                       */}
          {/* ======================================================== */}
          {step === "confirmed" && createdOrder && (
            <div className="p-6 sm:p-10 text-center space-y-6 animate-scaleUp max-w-xl mx-auto">
              
              {/* Checkmark Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>

              {/* Status Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Payment Verification Pending</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-950 font-sans tracking-tight">
                  TRANSFER NOTICE RECEIVED
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                  Your order has been recorded in the MILITO dispatch queue. Our verification desk will confirm the transfer and dispatch your device.
                </p>
              </div>

              {/* Order ID Card */}
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-[11px] font-bold uppercase text-gray-500">Assigned Order ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-mono font-black text-[#10B981]">
                      {createdOrder.orderId}
                    </span>
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 transition cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Product Summary */}
                <div className="flex gap-3 items-center py-1">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl p-1 flex items-center justify-center flex-shrink-0">
                    {createdOrder.productImage ? (
                      <img
                        src={resolveImageUrl(createdOrder.productImage, { width: 100 })}
                        alt={createdOrder.productName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Smartphone className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <h5 className="font-bold text-gray-900 truncate">{createdOrder.productName}</h5>
                    <p className="text-[10px] text-gray-500 font-semibold">{createdOrder.selectedSpecification} • Qty {createdOrder.quantity}</p>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-gray-900">
                    {formatPrice(createdOrder.unitPrice * createdOrder.quantity)}
                  </div>
                </div>

                {/* Amount & Recipient */}
                <div className="border-t border-gray-200 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Recipient:</span>
                    <span className="font-bold text-gray-900">{createdOrder.customer.name} ({createdOrder.customer.phone})</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Destination State:</span>
                    <span className="font-bold text-gray-900">{createdOrder.customer.state}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-black text-gray-950">
                    <span>Total Amount:</span>
                    <span className="text-base text-[#10B981] font-mono">{formatPrice(createdOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Contact CTA */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/2348162017129?text=${encodeURIComponent(`Hello MILITO 👋, I have completed the manual bank transfer for Order ID: ${createdOrder.orderId} (₦${createdOrder.totalAmount.toLocaleString()}). Please confirm and prepare for dispatch.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>Send Receipt / Follow up on WhatsApp</span>
                </a>
              </div>

              {/* Action Buttons: View My Order & Close */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    if (onViewOrderDetails && createdOrder) {
                      onViewOrderDetails(createdOrder.orderId);
                    }
                    onClose();
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 cursor-pointer min-h-[44px]"
                  id="view-my-order-btn"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Track My Order</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition cursor-pointer min-h-[44px]"
                >
                  Return to Storefront
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

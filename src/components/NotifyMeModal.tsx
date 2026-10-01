import React, { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Loader2, 
  Phone, 
  Mail, 
  User, 
  TrendingDown, 
  Package, 
  ShieldCheck
} from "lucide-react";
import { Product, ProductAlertType, SubscribeAlertResult } from "../types";
import { subscribeProductAlert, validatePhoneNumber, validateEmail } from "../services/AlertService";
import { formatNaira, getProductDisplayId } from "../utils/whatsapp";
import { getStockStatus } from "../utils/stockUtils";

interface NotifyMeModalProps {
  isOpen: boolean;
  product: Product | null;
  initialAlertType?: ProductAlertType;
  onClose: () => void;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  isOpen,
  product,
  initialAlertType,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  const stockInfo = getStockStatus(product);
  const defaultType: ProductAlertType = initialAlertType || (stockInfo.isSoldOut ? "RESTOCK" : "PRICE_CHANGE");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [alertType, setAlertType] = useState<ProductAlertType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [result, setResult] = useState<SubscribeAlertResult | null>(null);

  // Sync initial type when product changes
  useEffect(() => {
    if (product) {
      const isSold = getStockStatus(product).isSoldOut;
      setAlertType(initialAlertType || (isSold ? "RESTOCK" : "PRICE_CHANGE"));
      setResult(null);
      setFormError(null);
      setFieldErrors({});
    }
  }, [product, initialAlertType, isOpen]);

  // Validate form
  const validate = (): boolean => {
    const errors: { name?: string; phone?: string; email?: string } = {};

    if (!customerName.trim()) {
      errors.name = "Please enter your name";
    }

    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.isValid) {
      errors.phone = phoneCheck.error || "Please enter a valid WhatsApp phone number";
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error || "Please enter a valid email address";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await subscribeProductAlert({
        productId: product.id,
        productName: product.name,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : undefined,
        alertType,
      });

      if (res.success) {
        setResult(res);
      } else {
        setFormError(res.message || "Failed to submit subscription. Please try again.");
      }
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setResult(null);
    setFormError(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleModalClose}
      id="notify-me-modal-backdrop"
    >
      <div
        className="w-full sm:max-w-lg bg-[#0F1420] text-white rounded-t-3xl sm:rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        id="notify-me-modal-container"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800/80 flex items-center justify-between bg-[#131929]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00B14F]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                {alertType === "RESTOCK" ? "Restock Notification" : "Price Change Alert"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {alertType === "RESTOCK" ? "Get notified when this device is back in stock" : "Get notified when this device price changes"}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
            aria-label="Close"
            id="notify-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Product Summary Card */}
          <div className="p-3 bg-[#161F33] rounded-2xl border border-gray-800 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-700/60 overflow-hidden shrink-0 flex items-center justify-center p-1">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Smartphone className="w-6 h-6 text-gray-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  {product.condition || "Grade A"}
                </span>
                <span className="text-[10px] font-semibold text-gray-400">
                  {getProductDisplayId(product)}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-[#00B14F]">
                  {formatNaira(product.price)}
                </span>
                {stockInfo.isSoldOut ? (
                  <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {stockInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form or Result View */}
          {result ? (
            /* SUCCESS OR DUPLICATE CONFIRMATION VIEW */
            <div className="py-4 space-y-4 text-center animate-fade-in" id="notify-success-view">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00B14F]">
                {result.isExisting ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <Bell className="w-7 h-7 text-[#00B14F] animate-bounce" />
                )}
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-white">
                  {result.isExisting ? "You're already on the list ✓" : "You're on the list 🔔"}
                </h4>
                <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                  {result.isExisting
                    ? `We already have your active subscription for ${product.name}. You'll be notified automatically via WhatsApp.`
                    : alertType === "RESTOCK"
                    ? `We'll let you know on WhatsApp as soon as fresh stock arrives for ${product.name}.`
                    : `We'll let you know on WhatsApp when the price updates for ${product.name}.`}
                </p>
              </div>

              <div className="p-3 bg-[#161F33] rounded-xl border border-gray-800 text-left space-y-1 text-[11px] text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Device:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{product.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Alert Type:</span>
                  <span className="font-semibold text-emerald-400">
                    {alertType === "RESTOCK" ? "Restock Notification" : "Price Change Alert"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">WhatsApp:</span>
                  <span className="font-mono text-gray-200">{phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-full py-3 px-4 rounded-xl bg-[#00B14F] hover:bg-[#009944] text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-98"
                  id="notify-done-btn"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* SUBSCRIPTION FORM */
            <form onSubmit={handleSubmit} className="space-y-4" id="notify-subscription-form">
              {/* Context prompt */}
              <div className="p-3 rounded-xl bg-[#161F33]/80 border border-gray-800/80 text-[11px] text-gray-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00B14F] shrink-0 mt-0.5" />
                <p>
                  {alertType === "RESTOCK"
                    ? "Tell us where to notify you when this device becomes available in stock."
                    : "Tell us where to notify you when this device has a price change or discount."}
                </p>
              </div>

              {/* Alert Type Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 block">Notification Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType("RESTOCK")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      alertType === "RESTOCK"
                        ? "bg-emerald-950/60 border-[#00B14F] text-[#00B14F] shadow-xs"
                        : "bg-[#161F33] border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Back in Stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertType("PRICE_CHANGE")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      alertType === "PRICE_CHANGE"
                        ? "bg-emerald-950/60 border-[#00B14F] text-[#00B14F] shadow-xs"
                        : "bg-[#161F33] border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Price Changes</span>
                  </button>
                </div>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1">
                <label htmlFor="notify-name" className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                  <span>Your Full Name <span className="text-red-400">*</span></span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="notify-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                    }}
                    placeholder="e.g. Chisom Okafor"
                    className={`w-full bg-[#161F33] border rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00B14F] ${
                      fieldErrors.name ? "border-red-500" : "border-gray-800 focus:border-[#00B14F]"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[10px] text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              {/* WhatsApp Phone Field */}
              <div className="space-y-1">
                <label htmlFor="notify-phone" className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                  <span>WhatsApp Number <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-gray-500">Nigeria or International</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="notify-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
                    }}
                    placeholder="e.g. 0816 201 7129 or +2348162017129"
                    className={`w-full bg-[#161F33] border rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00B14F] ${
                      fieldErrors.phone ? "border-red-500" : "border-gray-800 focus:border-[#00B14F]"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="text-[10px] text-red-400">{fieldErrors.phone}</p>
                ) : (
                  <p className="text-[10px] text-gray-500">We'll alert you via WhatsApp directly without spam</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label htmlFor="notify-email" className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                  <span>Email Address <span className="text-gray-500 font-normal">(Optional)</span></span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="notify-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                    }}
                    placeholder="e.g. chisom@example.com"
                    className={`w-full bg-[#161F33] border rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00B14F] ${
                      fieldErrors.email ? "border-red-500" : "border-gray-800 focus:border-[#00B14F]"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#00B14F] hover:bg-[#009944] text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="notify-form-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Preference...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>{alertType === "RESTOCK" ? "Notify Me on Restock" : "Notify Me on Price Drop"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

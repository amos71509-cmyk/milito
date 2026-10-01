import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Sparkles,
  MessageCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { Product, resolveImageUrl } from "../types";
import { 
  getProductPublicUrl, 
  generateProductShareText, 
  copyTextToClipboard,
  getWhatsAppShareUrl,
  getFacebookShareUrl,
  getXShareUrl,
  isNativeShareSupported,
  triggerNativeProductShare,
  trackFunnelEvent
} from "../utils/productUrl";
import { formatNaira } from "../utils/whatsapp";
import { getStockStatus } from "../utils/stockUtils";

interface ShareProductModalProps {
  product: Product;
  onClose: () => void;
  isOpen?: boolean;
}

export default function ShareProductModal({ product, onClose, isOpen = true }: ShareProductModalProps) {
  if (isOpen === false || !product) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [whatsAppFailed, setWhatsAppFailed] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Exact public URL for this product
  const publicUrl = getProductPublicUrl(product);
  
  // Ready-made dynamic share message with actual specs, condition, and price
  const shareMessageText = generateProductShareText(product, "whatsapp");

  // WhatsApp click-to-chat URL
  const whatsAppUrl = getWhatsAppShareUrl(product, "whatsapp");

  // Copy Exact Public Link Handler with Fallback
  const handleCopyLink = async () => {
    setCopyError(false);
    const success = await copyTextToClipboard(publicUrl);
    if (success) {
      setCopiedLink(true);
      trackFunnelEvent("product_viewed", {
        productId: product.id,
        productName: product.name,
        source: "share_modal",
        metadata: { method: "copy_link" }
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopyError(true);
    }
  };

  // Copy Full Dynamic Message Handler
  const handleCopyText = async () => {
    setCopyError(false);
    const success = await copyTextToClipboard(shareMessageText);
    if (success) {
      setCopiedText(true);
      trackFunnelEvent("product_viewed", {
        productId: product.id,
        productName: product.name,
        source: "share_modal",
        metadata: { method: "copy_text" }
      });
      setTimeout(() => setCopiedText(false), 2500);
    } else {
      setCopyError(true);
    }
  };

  // WhatsApp click handler that tracks and safely triggers external navigation
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setWhatsAppFailed(false);
    trackFunnelEvent("product_viewed", {
      productId: product.id,
      productName: product.name,
      source: "share_modal",
      metadata: { method: "whatsapp" }
    });
  };

  // Native share trigger if supported
  const handleNativeShare = async () => {
    const shared = await triggerNativeProductShare(product, "device_share");
    if (shared) {
      onClose();
    }
  };

  const stockInfo = getStockStatus(product);
  const hasNativeShare = isNativeShareSupported();

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100050] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div 
        className="bg-[#111827] rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl overflow-hidden flex flex-col my-auto text-white animate-scaleUp relative z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#0E131F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Share Product</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/30">
                  Public Link
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Share this verified device directly via WhatsApp or copy the public link.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
            title="Close Share Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh] space-y-5">
          
          {/* PRODUCT PREVIEW SUMMARY */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={resolveImageUrl(product.image || product.thumbnail?.secure_url || product.gallery?.[0], { width: 150, brand: product.brand })}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {product.brand} • {product.condition}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${stockInfo.isSoldOut ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {stockInfo.label}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white truncate mt-0.5">{product.name}</h4>
              <p className="text-sm font-black text-[#00B14F] font-mono mt-0.5">{formatNaira(product.price)}</p>
            </div>
          </div>

          {/* PRIMARY ACTION: WHATSAPP SHARE BUTTON */}
          <div className="space-y-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-[#25D366]/20 active:scale-98 cursor-pointer"
              id="share-modal-whatsapp-btn"
            >
              <MessageCircle className="w-5 h-5 fill-black stroke-none" />
              <span>Share to WhatsApp</span>
            </a>

            {whatsAppFailed && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp could not be opened. You can copy the product link instead.</span>
              </div>
            )}
          </div>

          {/* GUARANTEED SECONDARY ACTION: COPY LINK BOX */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Public Product Link</span>
              <span className="text-[10px] text-gray-400 font-normal">Select or copy link</span>
            </label>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                onClick={(e) => e.currentTarget.select()}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#00B14F] select-all cursor-text"
                title="Click to select all text"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#00B14F] hover:brightness-105 active:scale-95 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-md min-w-[110px] justify-center"
                id="share-modal-copy-link-btn"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Link copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {copyError && (
              <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Unable to copy automatically. Please select and copy the link above.</span>
              </div>
            )}
          </div>

          {/* MORE SHARING OPTIONS (NATIVE SHARE / OTHER PLATFORMS) */}
          <div className="space-y-2 pt-1 border-t border-gray-800">
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              More Sharing Options
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              
              {/* Native Device Share (when supported) */}
              {hasNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 col-span-2 sm:col-span-1"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>More Apps</span>
                </button>
              )}

              {/* X / Twitter */}
              <a
                href={getXShareUrl(product, "x")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnelEvent("product_viewed", { productId: product.id, productName: product.name, source: "share_modal", metadata: { method: "x" } })}
                className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <span className="font-mono text-sm font-black">𝕏</span>
                <span>Share to X</span>
              </a>

              {/* Facebook */}
              <a
                href={getFacebookShareUrl(product, "facebook")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnelEvent("product_viewed", { productId: product.id, productName: product.name, source: "share_modal", metadata: { method: "facebook" } })}
                className="py-2.5 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-blue-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <span className="font-bold">f</span>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* DYNAMIC SHORT MESSAGE PREVIEW & COPY */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00B14F]" />
                <span>Product Share Message</span>
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-[#00B14F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Message copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={5}
              value={shareMessageText}
              onClick={(e) => e.currentTarget.select()}
              className="w-full bg-gray-900/90 border border-gray-700 rounded-2xl p-3 text-xs text-gray-200 font-sans focus:outline-none focus:border-gray-500 select-all resize-none leading-relaxed"
            />
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-gray-800 bg-[#0E131F] flex items-center justify-between">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#00B14F] hover:underline flex items-center gap-1"
          >
            <span>Open Public Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

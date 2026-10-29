import React, { useState, useMemo } from "react";
import { X, Heart, User, LogOut, Package, ArrowRight, ExternalLink, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { Product, extractProductOriginalImages, resolveImageUrl } from "../types";
import { formatNaira } from "../utils/whatsapp";
import { getStockStatus } from "../utils/stockUtils";

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenTracker: () => void;
  onOrderNow?: (product: Product) => void;
}

export default function CustomerAccountModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onOpenTracker,
  onOrderNow,
}: CustomerAccountModalProps) {
  const { currentUser, logout, likedProductIds, toggleLikeProduct } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<"saved" | "account">("saved");

  const savedProducts = useMemo(() => {
    if (!likedProductIds || likedProductIds.length === 0) return [];
    return likedProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [likedProductIds, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200 shadow-2xl overflow-hidden animate-scaleUp text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-milito-green/20 text-[#00B14F] flex items-center justify-center font-black">
              <User className="w-5 h-5 text-[#00B14F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-950 leading-tight">
                  {currentUser?.name || "Customer Account"}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-250 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-xs font-bold text-gray-700 cursor-pointer shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-black transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-gray-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "saved"
                ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Saved Products ({savedProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "account"
                ? "bg-emerald-50 text-[#00B14F] border border-emerald-200 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#00B14F]" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === "saved" ? (
            <div>
              {savedProducts.length === 0 ? (
                <div className="py-12 sm:py-16 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-400 border border-rose-100 flex items-center justify-center mx-auto">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-gray-900">No Liked Products Yet</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tap the ❤️ icon on any phone or gadget in the store to save it here for fast comparisons, restock alerts, and easy ordering.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#00B14F] hover:brightness-105 active:scale-98 text-black text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Browse Devices
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {savedProducts.map((prod) => {
                    const uploadedImages = extractProductOriginalImages(prod);
                    const mainImage = uploadedImages.length > 0 ? uploadedImages[0] : "";
                    const stock = getStockStatus(prod);

                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div 
                          onClick={() => {
                            onSelectProduct(prod);
                            onClose();
                          }}
                          className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative cursor-pointer flex items-center justify-center"
                        >
                          {mainImage ? (
                            <img
                              src={resolveImageUrl(mainImage, { width: 350, brand: prod.brand })}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                              <Package className="w-8 h-8 stroke-[1.5] mb-1" />
                              <span className="text-[10px] font-bold text-gray-500">No Photo Uploaded</span>
                            </div>
                          )}

                          {/* Quick Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeProduct(prod.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-rose-500 hover:bg-rose-50 border border-gray-200 shadow-xs transition cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Stock Status Badge */}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs border border-gray-200 text-[9px] font-extrabold flex items-center gap-1 shadow-2xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${stock.dotColor}`} />
                            <span className={stock.colorClass}>{stock.label}</span>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#00B14F]">
                              {prod.brand} • {prod.condition}
                            </span>
                            <h4 
                              onClick={() => {
                                onSelectProduct(prod);
                                onClose();
                              }}
                              className="text-xs sm:text-sm font-bold text-gray-950 hover:text-[#00B14F] transition cursor-pointer line-clamp-1 mt-0.5"
                            >
                              {prod.name}
                            </h4>
                            <p className="text-xs sm:text-sm font-black text-gray-950 font-mono mt-1">
                              {formatNaira(prod.price)}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-gray-150 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectProduct(prod);
                                onClose();
                              }}
                              className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-gray-250 bg-gray-50 hover:bg-gray-150 text-gray-800 transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Specs</span>
                              <ArrowRight className="w-3 h-3 text-[#00B14F]" />
                            </button>

                            {onOrderNow && !stock.isSoldOut && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOrderNow(prod);
                                  onClose();
                                }}
                                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#00B14F] hover:brightness-105 active:scale-95 text-black transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Order</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto py-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Account ID</span>
                <p className="font-mono text-xs text-gray-900 break-all">{currentUser?.id}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Full Name</span>
                <p className="font-bold text-sm text-gray-900">{currentUser?.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Registered Email</span>
                <p className="font-semibold text-sm text-gray-900">{currentUser?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-emerald-950 uppercase">Parcel Delivery Tracking</h5>
                  <p className="text-[11px] text-emerald-800">Track shipments with your order reference</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenTracker();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00B14F] text-black font-extrabold text-xs cursor-pointer shadow-2xs hover:brightness-105"
                >
                  Track Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

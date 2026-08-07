import React, { useState } from "react";
import { X, Check, ShieldCheck, Award, Star, Info, Zap, ArrowLeft } from "lucide-react";
import { Product, resolveImageUrl } from "../types";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, storage: string, color: { name: string; hex: string }) => void;
}

export default function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions[0]);
  const [selectedColor, setSelectedColor] = useState(product.colorOptions[0]);
  const [activeImageTab, setActiveImageTab] = useState(0);

  // Dynamic price delta depending on storage
  const getSelectedPrice = () => {
    const baseIdx = product.storageOptions.indexOf(product.storageOptions[0]);
    const currentIdx = product.storageOptions.indexOf(selectedStorage);
    const diff = currentIdx - baseIdx;
    
    // Add 80,000 NGN per next storage tier as general market guideline
    return product.price + (diff * 80000);
  };

  const currentPrice = getSelectedPrice();

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-gray-250 overflow-hidden shadow-2xl animate-scaleUp my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-150 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-black hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-xs text-xs font-bold font-sans"
              id="product-back-btn"
              title="Go back to previous menu"
            >
              <ArrowLeft className="w-4 h-4 text-milito-green" />
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-gray-250 mx-1"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-milito-green/10 text-milito-green border border-milito-green/30 px-2.5 py-0.5 rounded-full">
              {product.condition}
            </span>
            <h3 className="text-sm font-bold text-gray-750 font-sans">Device Specifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-550 hover:text-black hover:bg-gray-200 transition cursor-pointer"
            id="product-close-x"
            title="Close specifications modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Interactive Image Slider */}
          <div className="p-8 bg-gray-50 flex flex-col justify-between border-r border-gray-150">
            <div className="flex-1 flex items-center justify-center w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-gray-150 shadow-md mb-6 group relative">
              <img
                src={resolveImageUrl(product.gallery[activeImageTab] || product.image || "")}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-3xl transition-all duration-500 group-hover:scale-105"
              />
            </div>

            {/* Gallery Thumbs */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex justify-center gap-3.5 flex-wrap">
                {product.gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageTab(index)}
                    className={`w-18 h-18 rounded-2xl overflow-hidden p-0 border transition-all duration-300 ${
                      activeImageTab === index
                        ? "border-milito-green ring-4 ring-milito-green/20 scale-105"
                        : "border-gray-250 hover:border-gray-450"
                    }`}
                  >
                    <img src={resolveImageUrl(img)} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-2xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Battery Quality Alert (Crucial specs context in Nigeria) */}
            <div className="mt-6 p-4 rounded-2xl bg-milito-green/10 border border-milito-green/20 flex items-start gap-3 shadow-xs">
              <Zap className="w-5 h-5 text-milito-green flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">QC Battery Health Guard</h5>
                <p className="text-[11px] text-gray-650 mt-1 leading-relaxed">
                  {product.condition === "Brand New"
                    ? "100% Battery capacity. Guaranteed brand-sealed. Ships with official multi-month worldwide manufacturer backing tracker."
                    : `We guarantee a tested Battery Health state between ${product.specs.batterySize.includes("tested") ? product.specs.batterySize : "88% and 95%"} for our pristine grade UK used stock.`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Purchasing */}
          <div className="p-8 max-h-[580px] overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-milito-green font-bold tracking-wider">{product.brand} flagship</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs text-gray-700 font-bold">{product.rating}</span>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-950 mt-1">{product.name}</h2>
              <p className="text-milito-green text-2xl font-black mt-2 font-mono">{formatPrice(currentPrice)}</p>
            </div>

            <p className="text-xs text-gray-650 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
              {product.description}
            </p>

            {/* Storage Config */}
            <div>
              <span className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-2.5">
                Storage Allocation
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.storageOptions.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStorage(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                      selectedStorage === st
                        ? "bg-milito-green text-black border-milito-green"
                        : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-sm"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Config */}
            <div>
              <span className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-2.5">
                Color Options: <span className="text-gray-550 font-medium lowercase italic">({selectedColor.name})</span>
              </span>
              <div className="flex gap-3">
                {product.colorOptions.map((col) => {
                  const isSelected = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition focus:outline-none cursor-pointer border relative ${
                        isSelected ? "border-milito-green scale-110 shadow-md" : "border-gray-200 hover:border-gray-450 shadow-xs"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hard Specs Sheet */}
            <div className="pt-4 border-t border-gray-250 space-y-3">
              <span className="block text-xs font-extrabold text-gray-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-milito-green" />
                Technical Spec Sheet
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                {[
                  { label: "Display", val: product.specs.screen },
                  { label: "Processor", val: product.specs.chipset },
                  { label: "Main Cameras", val: product.specs.camera },
                  { label: "Factory Power", val: product.specs.batterySize },
                  { label: "Platform OS", val: product.specs.os },
                  { label: "Sim Standard", val: product.specs.simType },
                  { label: "Store Warranty", val: product.specs.warranty }
                ].map((spec) => (
                  <div key={spec.label} className="border-b border-gray-200 pb-1.5 last:border-b-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">{spec.label}</span>
                    <span className="text-gray-800 font-semibold leading-relaxed mt-0.5 block">{spec.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Validation and Purchasing Trigger */}
            <div className="pt-4 border-t border-gray-250 space-y-4">
              <div className="p-3.5 bg-milito-green/10 border border-milito-green/20 rounded-xl flex items-center gap-2 text-[11px] text-gray-750 font-medium shadow-xs">
                <ShieldCheck className="w-5 h-5 text-milito-green flex-shrink-0" />
                <span>
                  Escrow Lock Enabled: Your funds are secured on order, and only released post physical verification.
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {product.availability === "Sold Out" || product.quantity === 0 ? (
                  <button
                    disabled
                    className="w-full py-4 px-6 rounded-xl bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed font-extrabold text-sm flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Sold Out (Out of Stock)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Create augmented product with custom storage price
                      const finalProduct = { ...product, price: currentPrice };
                      onAddToCart(finalProduct, selectedStorage, selectedColor);
                      onClose();
                    }}
                    className="w-full py-4 px-6 rounded-xl bg-milito-green hover:brightness-105 active:scale-98 font-extrabold text-black shadow-[0_4px_20px_rgba(0,177,79,0.25)] transition duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    Add to Protected Order ({formatPrice(currentPrice)})
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-250 text-gray-700 hover:text-black transition-colors duration-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-milito-green" />
                  Go Back to Device Listings
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

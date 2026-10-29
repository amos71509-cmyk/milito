import React, { useState } from "react";
import { Package, Plus, Check, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { Product, ProductAccessory } from "../types";
import { formatNaira } from "../utils/whatsapp";

interface CompletePackageSectionProps {
  product: Product;
  assignedAccessories?: ProductAccessory[];
  selectedAccessoryIds: string[];
  onToggleAccessory: (accessory: ProductAccessory) => void;
  onAddAccessoryDirectly?: (accessory: ProductAccessory) => void;
}

export default function CompletePackageSection({
  product,
  assignedAccessories,
  selectedAccessoryIds,
  onToggleAccessory,
}: CompletePackageSectionProps) {
  // Track images that failed to load to prevent broken placeholders
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Strictly filter to valid admin-saved accessories with non-empty admin images
  const validAccessories = (assignedAccessories || []).filter((acc) => {
    return (
      acc &&
      acc.id &&
      acc.name &&
      acc.price > 0 &&
      acc.image &&
      acc.image.trim().length > 0 &&
      !failedImages[acc.id]
    );
  });

  if (validAccessories.length === 0) {
    return null;
  }

  const selectedAccessories = validAccessories.filter((acc) =>
    selectedAccessoryIds.includes(acc.id)
  );
  const accessoriesTotal = selectedAccessories.reduce(
    (sum, acc) => sum + (Number(acc.price) || 0),
    0
  );

  return (
    <section className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-6 shadow-sm space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
              <Sparkles className="w-3 h-3 text-[#00B14F]" />
              Verified Add-Ons
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-gray-950 mt-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#00B14F]" />
            <span>Complete Your Package</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select genuine accessories for your {product.name}. Add them alongside your phone in one package.
          </p>
        </div>

        {selectedAccessories.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900">
              {selectedAccessories.length} selected:
            </span>
            <span className="text-xs font-black text-[#00873c] font-mono">
              +{formatNaira(accessoriesTotal)}
            </span>
          </div>
        )}
      </div>

      {/* Grid of Accessories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {validAccessories.map((acc) => {
          const isSelected = selectedAccessoryIds.includes(acc.id);

          return (
            <div
              key={acc.id}
              onClick={() => onToggleAccessory(acc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleAccessory(acc);
                }
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border p-2.5 sm:p-3 transition-all duration-200 cursor-pointer select-none text-left ${
                isSelected
                  ? "bg-emerald-50/60 border-[#00B14F] shadow-md ring-2 ring-[#00B14F]/25"
                  : "bg-gray-50/60 hover:bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs"
              }`}
            >
              {/* Type Badge & Selected Check */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-tight text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md truncate">
                  {acc.type || "Accessory"}
                </span>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[#00B14F] text-black shadow-xs"
                      : "bg-white border border-gray-300 group-hover:border-[#00B14F]"
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3 h-3 text-gray-400 group-hover:text-[#00B14F]" />
                  )}
                </div>
              </div>

              {/* Image Container - strictly admin-uploaded, clean presentation */}
              <div className="w-full aspect-square bg-white rounded-xl border border-gray-150 overflow-hidden flex items-center justify-center p-2 mb-2 relative group-hover:bg-gray-50 transition-colors">
                <img
                  src={acc.image}
                  alt={acc.name}
                  loading="lazy"
                  decoding="async"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [acc.id]: true }))
                  }
                  className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Name & Price */}
              <div className="space-y-1">
                <h4
                  className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight min-h-[28px]"
                  title={acc.name}
                >
                  {acc.name}
                </h4>

                <div className="pt-1 flex items-baseline justify-between border-t border-gray-150/70">
                  <span className="text-xs sm:text-sm font-black text-gray-950 font-mono">
                    +{formatNaira(acc.price)}
                  </span>
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? "text-[#00873c]" : "text-gray-500"
                    }`}
                  >
                    {isSelected ? "Added" : "Tap to add"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Value Banner if items selected */}
      {selectedAccessories.length > 0 && (
        <div className="p-3 rounded-2xl bg-gray-950 text-white flex flex-col xs:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00B14F] text-black flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">
                Package: {product.name} + {selectedAccessories.length} {selectedAccessories.length === 1 ? "accessory" : "accessories"}
              </p>
              <p className="text-[11px] text-gray-400">
                Packed and delivered together in one insured parcel
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Total Package</span>
            <span className="text-sm sm:text-base font-black text-[#00B14F] font-mono">
              {formatNaira(product.price + accessoriesTotal)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

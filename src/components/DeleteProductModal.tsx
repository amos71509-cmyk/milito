import React from "react";
import { Trash2, AlertTriangle, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { Product, resolveImageUrl } from "../types";

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (product: Product) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export default function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirmDelete,
  isDeleting,
  error
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#111827] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Product</h3>
              <p className="text-xs text-gray-400">Permanent inventory & media deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Card Summary */}
        <div className="flex items-center gap-4 p-3 mb-4 bg-gray-900/80 rounded-xl border border-gray-800">
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-contain bg-gray-800 border border-gray-700 p-0.5"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              {product.brand} • {product.condition}
            </span>
            <h4 className="text-sm font-bold text-white truncate mt-1">{product.name}</h4>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-[#00B14F] font-black">₦{product.price?.toLocaleString()}</span>
              <span className="text-gray-400">Stock: {product.quantity ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Deletion Scope Warning */}
        <div className="p-3.5 mb-5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-200/90 leading-relaxed">
            <p className="font-semibold text-red-300 mb-1">Are you sure you want to delete this product?</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-300">
              <li>Permanently deletes the product document from <strong>Firebase Firestore</strong></li>
              <li>Deletes main thumbnail photo & gallery images from <strong>Cloudinary</strong></li>
              <li>Removes the item immediately from both Admin Dashboard and Live Website</li>
            </ul>
          </div>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-900/30 border border-red-600/50 text-xs text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all disabled:opacity-50 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(product)}
            disabled={isDeleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Deleting from Firestore & Cloudinary...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirm Permanent Deletion
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

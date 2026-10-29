import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UploadCloud,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Loader2,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { ProductAccessory } from "../types";
import { AccessoryService, DEFAULT_ACCESSORIES } from "../services/AccessoryService";
import { formatNaira } from "../utils/whatsapp";

const ACCESSORY_TYPES = [
  "Charger",
  "AirPods/Earpods",
  "Power Bank",
  "Screen Guard",
  "Camera Guard",
  "Pouch/Case",
  "Headset",
  "Other"
] as const;

export default function AdminAccessoriesManager() {
  const [accessories, setAccessories] = useState<ProductAccessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"All" | "In Stock" | "Out of Stock">("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<ProductAccessory | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    type: string;
    price: number;
    image: string;
    inStock: boolean;
  }>({
    name: "",
    type: "Charger",
    price: 5000,
    image: "",
    inStock: true
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load accessories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const items = await AccessoryService.fetchAll();
      setAccessories(items);
    } catch (e) {
      console.error("[AdminAccessoriesManager] Load error:", e);
      setAccessories(DEFAULT_ACCESSORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = AccessoryService.subscribe((updated) => {
      setAccessories(updated);
    });
    return () => unsubscribe();
  }, []);

  // Filtered List
  const filteredAccessories = accessories.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedTypeFilter === "All" || acc.type.toLowerCase() === selectedTypeFilter.toLowerCase();
    const matchesStock =
      stockFilter === "All" ||
      (stockFilter === "In Stock" && acc.inStock !== false) ||
      (stockFilter === "Out of Stock" && acc.inStock === false);
    return matchesSearch && matchesType && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingAccessory(null);
    setFormData({
      id: undefined,
      name: "",
      type: "Charger",
      price: 5000,
      image: "",
      inStock: true
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: ProductAccessory) => {
    setEditingAccessory(acc);
    setFormData({
      id: acc.id,
      name: acc.name,
      type: acc.type || "Other",
      price: acc.price || 0,
      image: acc.image || "",
      inStock: acc.inStock !== false
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("folder", "milito_accessories");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.files?.[0]?.secure_url) {
        throw new Error(result.error || "Failed to upload image.");
      }

      setFormData((prev) => ({
        ...prev,
        image: result.files[0].secure_url
      }));
    } catch (err: any) {
      console.error("[AdminAccessoriesManager] Upload error:", err);
      setUploadError(err.message || "Failed to upload image. Please try another or enter an image URL.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const accessoryToSave: ProductAccessory = {
      id: formData.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: formData.name.trim(),
      type: formData.type || "Other",
      price: Math.max(0, Number(formData.price) || 0),
      image: formData.image.trim(),
      inStock: formData.inStock
    };

    await AccessoryService.saveAccessory(accessoryToSave);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await AccessoryService.deleteAccessory(id);
    setDeleteConfirmId(null);
  };

  const handleToggleStock = async (acc: ProductAccessory) => {
    const updated = { ...acc, inland: true, inStock: !acc.inStock };
    await AccessoryService.saveAccessory(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00B14F]/15 border border-[#00B14F]/30 flex items-center justify-center text-[#00B14F]">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Accessories Management</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00B14F]/20 text-[#00B14F] border border-[#00B14F]/30 font-mono">
                {accessories.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage gadget accessories (Chargers, AirPods, Power Banks, Screen Guards, Cases) and assign them to phone packages.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#009944] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00B14F]/20 active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Accessory</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessory by name or category..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00B14F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 shrink-0">
            {(["All", "In Stock", "Out of Stock"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  stockFilter === filter
                    ? "bg-[#00B14F] text-black shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-gray-500 mr-1 shrink-0">Category:</span>
          {["All", ...ACCESSORY_TYPES].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer border ${
                selectedTypeFilter === type
                  ? "bg-[#00B14F]/20 text-[#00B14F] border-[#00B14F]/40"
                  : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B14F]" />
          <span className="text-xs font-bold">Loading accessories catalog...</span>
        </div>
      ) : filteredAccessories.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-gray-800 rounded-2xl space-y-3">
          <Package className="w-10 h-10 text-gray-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No accessories found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || selectedTypeFilter !== "All"
              ? "No accessory matches your current search or category filter."
              : "No accessories are currently created in the system."}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#00B14F] text-black font-bold text-xs"
          >
            Add First Accessory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccessories.map((acc) => {
            const inStock = acc.inStock !== false;
            return (
              <div
                key={acc.id}
                className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-700 transition shadow-lg group relative"
              >
                <div>
                  {/* Image & Type Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {acc.image ? (
                        <img
                          src={acc.image}
                          alt={acc.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-extrabold uppercase border border-gray-700">
                        {acc.type || "Other"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleStock(acc)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                          inStock
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                        title="Click to toggle stock status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span>{inStock ? "In Stock" : "Out of Stock"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                    {acc.name}
                  </h4>

                  {/* Price */}
                  <p className="text-sm sm:text-base font-black text-[#00B14F] font-mono mt-1">
                    {formatNaira(acc.price)}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between mt-3">
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID: {acc.id.slice(0, 10)}...
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer"
                      title="Edit accessory"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === acc.id ? (
                      <div className="flex items-center gap-1 bg-red-950/80 border border-red-800/60 p-1 rounded-lg">
                        <span className="text-[10px] text-red-300 font-bold px-1">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id)}
                          className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(acc.id)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition cursor-pointer"
                        title="Delete accessory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] rounded-3xl max-w-lg w-full border border-gray-800 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00B14F]" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  {editingAccessory ? "Edit Accessory" : "Add New Accessory"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                  Accessory Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apple 20W USB-C Adapter, AirPods Pro 2, MagSafe Case..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00B14F]"
                />
              </div>

              {/* Category & Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                    Category / Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B14F]"
                  >
                    {ACCESSORY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                    Price (NGN ₦) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    placeholder="e.g. 18500"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00B14F]"
                  />
                </div>
              </div>

              {/* Stock Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
                <div>
                  <span className="text-xs font-bold text-white block">Stock Availability</span>
                  <span className="text-[10px] text-gray-400">
                    {formData.inStock ? "Item is currently in stock and purchasable" : "Item is sold out"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                    formData.inStock
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {formData.inStock ? "In Stock" : "Out of Stock"}
                </button>
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Accessory Image *
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-gray-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    )}
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 p-0.5 rounded-md bg-black/70 text-red-400 hover:text-red-300"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Upload Trigger Button */}
                  <div className="flex-1 w-full space-y-1.5">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-gray-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#00B14F]" />
                          <span>Uploading image to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-[#00B14F]" />
                          <span>Upload Image from Device</span>
                        </>
                      )}
                    </button>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-[11px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#00B14F]"
                    />
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage || !formData.name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#009944] text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {editingAccessory ? "Save Changes" : "Create Accessory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

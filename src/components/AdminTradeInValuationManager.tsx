import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Sparkles,
  RefreshCw,
  Smartphone,
  Save,
  X,
  Check,
  HardDrive,
  Info,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag
} from "lucide-react";
import { TradeInValuationRecord, ConditionAdjustmentRule, TradeInBrandName } from "../types";
import {
  getStoredTradeInValuations,
  saveTradeInValuations,
  upsertTradeInValuation,
  deleteTradeInValuation,
  getStoredConditionAdjustmentRules,
  saveConditionAdjustmentRules,
  buildValuationRecordId
} from "../utils/tradeInValuationDb";
import { formatNaira } from "../utils/swapUtils";
import { TRADE_IN_BRANDS } from "../data";
import {
  saveAdminTradeInDraft,
  getStoredAdminTradeInDraft,
  AdminTradeInDraft
} from "../utils/userProgressPersistence";

const COMMON_STORAGE_OPTIONS = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

export default function AdminTradeInValuationManager() {
  const [valuations, setValuations] = useState<TradeInValuationRecord[]>([]);
  const [conditionRules, setConditionRules] = useState<ConditionAdjustmentRule[]>([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [selectedValuationFilter, setSelectedValuationFilter] = useState<"All" | "Valued" | "Unset">("All");
  const [seriesFilter, setSeriesFilter] = useState<string>("All");

  // Edit / Add Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TradeInValuationRecord | null>(null);

  // Quick Inline Edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string>("");

  // Add Variant Modal State
  const [variantTargetModel, setVariantTargetModel] = useState<{ brand: string; model: string } | null>(null);
  const [newVariantStorage, setNewVariantStorage] = useState("128GB");
  const [newVariantPrice, setNewVariantPrice] = useState("");

  // Check stored draft on mount
  const storedDraft = useMemo(() => getStoredAdminTradeInDraft(), []);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(() => Boolean(storedDraft?.isDirty));

  // Form state for Add/Edit Device Modal
  const [formData, setFormData] = useState<{
    brand: string;
    model: string;
    storage: string;
    baseTradeInValue: string;
    status: "Active" | "Inactive";
    notes: string;
  }>(() => {
    if (storedDraft?.isDirty) {
      return {
        brand: storedDraft.brand || "Apple",
        model: storedDraft.model || "",
        storage: storedDraft.storage || "128GB",
        baseTradeInValue: storedDraft.baseTradeInValue || "",
        status: storedDraft.status || "Active",
        notes: storedDraft.notes || "",
      };
    }
    return {
      brand: "Apple",
      model: "",
      storage: "128GB",
      baseTradeInValue: "",
      status: "Active",
      notes: ""
    };
  });

  // Auto-save draft when editing in modal
  useEffect(() => {
    if (isAddModalOpen) {
      const isDirty = Boolean(formData.model.trim() || formData.baseTradeInValue.trim() || formData.notes.trim());
      setHasUnsavedDraft(isDirty);
      saveAdminTradeInDraft({
        ...formData,
        editingId: editingRecord?.id || null,
        isDirty,
        updatedAt: Date.now()
      });
    }
  }, [formData, isAddModalOpen, editingRecord]);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const loadData = () => {
    const vals = getStoredTradeInValuations();
    const rules = getStoredConditionAdjustmentRules();
    setValuations(vals);
    setConditionRules(rules);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("milito_tradein_valuations_updated", handleUpdate);
    window.addEventListener("milito_condition_rules_updated", handleUpdate);
    return () => {
      window.removeEventListener("milito_tradein_valuations_updated", handleUpdate);
      window.removeEventListener("milito_condition_rules_updated", handleUpdate);
    };
  }, []);

  // Filtered Valuations
  const filteredValuations = useMemo(() => {
    return valuations.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesModel = item.model.toLowerCase().includes(q);
        const matchesStorage = item.storage.toLowerCase().includes(q);
        if (!matchesBrand && !matchesModel && !matchesStorage) return false;
      }

      // 2. Brand Filter
      if (selectedBrandFilter !== "All") {
        if (item.brand.toLowerCase() !== selectedBrandFilter.toLowerCase()) return false;
      }

      // 3. Status Filter
      if (selectedStatusFilter !== "All") {
        if (item.status !== selectedStatusFilter) return false;
      }

      // 4. Valuation Set vs Unset
      if (selectedValuationFilter === "Valued") {
        if (item.baseTradeInValue === null || item.baseTradeInValue <= 0) return false;
      } else if (selectedValuationFilter === "Unset") {
        if (item.baseTradeInValue !== null && item.baseTradeInValue > 0) return false;
      }

      // 5. Samsung Series Filter (Galaxy S, A, Z)
      if (selectedBrandFilter === "Samsung" && seriesFilter !== "All") {
        if (seriesFilter === "S-Series" && !item.model.includes("Galaxy S")) return false;
        if (seriesFilter === "A-Series" && !item.model.includes("Galaxy A")) return false;
        if (seriesFilter === "Z-Series" && !item.model.includes("Galaxy Z")) return false;
      }

      return true;
    });
  }, [valuations, searchQuery, selectedBrandFilter, selectedStatusFilter, selectedValuationFilter, seriesFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = valuations.length;
    const active = valuations.filter((v) => v.status === "Active").length;
    const valued = valuations.filter((v) => v.baseTradeInValue !== null && v.baseTradeInValue > 0).length;
    const unset = total - valued;
    const appleCount = valuations.filter((v) => v.brand.toLowerCase() === "apple").length;
    const samsungCount = valuations.filter((v) => v.brand.toLowerCase() === "samsung").length;
    return { total, active, valued, unset, appleCount, samsungCount };
  }, [valuations]);

  // Handlers
  const handleToggleStatus = (record: TradeInValuationRecord) => {
    const newStatus = record.status === "Active" ? "Inactive" : "Active";
    upsertTradeInValuation({ ...record, status: newStatus });
    showToast(`${record.model} (${record.storage}) is now ${newStatus}.`, "info");
  };

  const handleDeleteRecord = (id: string, model: string, storage: string) => {
    if (confirm(`Are you sure you want to delete valuation record for ${model} (${storage})?`)) {
      deleteTradeInValuation(id);
      showToast(`Deleted ${model} (${storage}) from Trade-In Database.`, "info");
    }
  };

  const handleStartInlineEdit = (record: TradeInValuationRecord) => {
    setInlineEditingId(record.id);
    setInlinePriceValue(record.baseTradeInValue ? String(record.baseTradeInValue) : "");
  };

  const handleSaveInlineEdit = (record: TradeInValuationRecord) => {
    const cleanVal = inlinePriceValue.trim() ? Number(inlinePriceValue.replace(/[^0-9]/g, "")) : null;
    upsertTradeInValuation({
      ...record,
      baseTradeInValue: cleanVal && cleanVal > 0 ? cleanVal : null
    });
    setInlineEditingId(null);
    showToast(`Updated base trade-in value for ${record.model} (${record.storage})!`);
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      brand: selectedBrandFilter !== "All" ? selectedBrandFilter : "Apple",
      model: "",
      storage: "128GB",
      baseTradeInValue: "",
      status: "Active",
      notes: ""
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (record: TradeInValuationRecord) => {
    setEditingRecord(record);
    setFormData({
      brand: record.brand,
      model: record.model,
      storage: record.storage,
      baseTradeInValue: record.baseTradeInValue ? String(record.baseTradeInValue) : "",
      status: record.status,
      notes: record.notes || ""
    });
    setIsAddModalOpen(true);
  };

  const handleDiscardDraft = () => {
    saveAdminTradeInDraft(null);
    setHasUnsavedDraft(false);
    setFormData({
      brand: selectedBrandFilter !== "All" ? selectedBrandFilter : "Apple",
      model: "",
      storage: "128GB",
      baseTradeInValue: "",
      status: "Active",
      notes: ""
    });
    setEditingRecord(null);
    setIsAddModalOpen(false);
    showToast("Discarded unsaved valuation draft.", "info");
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim() || !formData.storage.trim()) {
      alert("Please fill in Brand, Model, and Storage variant.");
      return;
    }

    const priceNum = formData.baseTradeInValue.trim()
      ? Number(formData.baseTradeInValue.replace(/[^0-9]/g, ""))
      : null;

    upsertTradeInValuation({
      id: editingRecord ? editingRecord.id : undefined,
      brand: formData.brand,
      model: formData.model,
      storage: formData.storage,
      baseTradeInValue: priceNum && priceNum > 0 ? priceNum : null,
      status: formData.status,
      notes: formData.notes
    });

    // Clear unsaved draft on successful publish
    saveAdminTradeInDraft(null);
    setHasUnsavedDraft(false);

    setIsAddModalOpen(false);
    showToast(
      editingRecord
        ? `Saved & Published valuation for ${formData.model} (${formData.storage})`
        : `Added & Published new valuation record for ${formData.model} (${formData.storage})`
    );
  };

  const handleAddStorageVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantTargetModel) return;

    const priceNum = newVariantPrice.trim()
      ? Number(newVariantPrice.replace(/[^0-9]/g, ""))
      : null;

    upsertTradeInValuation({
      brand: variantTargetModel.brand,
      model: variantTargetModel.model,
      storage: newVariantStorage,
      baseTradeInValue: priceNum && priceNum > 0 ? priceNum : null,
      status: "Active"
    });

    setVariantTargetModel(null);
    setNewVariantPrice("");
    showToast(`Added ${newVariantStorage} storage variant for ${variantTargetModel.model}!`);
  };

  const handleSaveConditionRule = (grade: string, value: number) => {
    const updated = conditionRules.map((r) => (r.grade === grade ? { ...r, adjustmentValue: value } : r));
    setConditionRules(updated);
    saveConditionAdjustmentRules(updated);
    showToast(`Condition deduction rule for ${grade} updated to ${value}%`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all border ${
            toastMessage.type === "success"
              ? "bg-[#00B14F] text-black border-emerald-400"
              : toastMessage.type === "error"
              ? "bg-red-600 text-white border-red-400"
              : "bg-blue-600 text-white border-blue-400"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="p-5 sm:p-6 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B14F] to-emerald-700 flex items-center justify-center text-black shadow-lg shadow-[#00B14F]/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Trade-In Valuation Database
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Engine
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Set and control the Base Trade-In Values that supply the Estimated Swap Credit for customer trades.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center gap-2 border border-gray-700 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#00B14F]" />
            <span>Condition Rules</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#00B14F] hover:bg-[#009241] text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-[#00B14F]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device / Variant</span>
          </button>
        </div>
      </div>

      {/* STATS METRIC BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-[#111827] border border-gray-800 rounded-2xl">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">Total Device Variants</span>
          <span className="text-xl sm:text-2xl font-black text-white font-sans block mt-1">{stats.total}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">{stats.appleCount} Apple • {stats.samsungCount} Samsung</span>
        </div>

        <div className="p-4 bg-[#111827] border border-gray-800 rounded-2xl">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 block">Active In Swap Deals</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-sans block mt-1">{stats.active}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Available for customer selection</span>
        </div>

        <div className="p-4 bg-[#111827] border border-gray-800 rounded-2xl">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400 block">Valuations Configured</span>
          <span className="text-xl sm:text-2xl font-black text-blue-400 font-sans block mt-1">{stats.valued}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Ready with base trade-in pricing</span>
        </div>

        <div className={`p-4 bg-[#111827] border rounded-2xl ${stats.unset > 0 ? "border-amber-500/40 bg-amber-950/10" : "border-gray-800"}`}>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block">Valuation Not Set</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-sans block mt-1">{stats.unset}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">Awaiting admin base price</span>
        </div>
      </div>

      {/* BRAND & SERIES FILTER PILLS */}
      <div className="p-3 bg-[#111827] border border-gray-800 rounded-2xl space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 px-2 py-1 shrink-0">Brand:</span>
          {["All", "Apple", "Samsung", "Google", "Tecno", "Infinix", "Xiaomi", "OnePlus"].map((brand) => {
            const isSelected = selectedBrandFilter.toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  setSelectedBrandFilter(brand);
                  setSeriesFilter("All");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00B14F] text-black shadow-md shadow-[#00B14F]/20"
                    : "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>

        {/* Sub-series pills if Samsung is selected */}
        {selectedBrandFilter === "Samsung" && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 px-2 py-1 shrink-0">Samsung Series:</span>
            {["All", "S-Series", "A-Series", "Z-Series"].map((series) => {
              const isSelected = seriesFilter === series;
              return (
                <button
                  key={series}
                  type="button"
                  onClick={() => setSeriesFilter(series)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
                  }`}
                >
                  {series}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SEARCH AND QUICK FILTER CONTROLS */}
      <div className="p-3 sm:p-4 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Model name, storage, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-[#00B14F] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {/* Pricing Status Filter */}
          <select
            value={selectedValuationFilter}
            onChange={(e) => setSelectedValuationFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00B14F] focus:outline-none font-bold"
          >
            <option value="All">All Valuations</option>
            <option value="Valued">Base Price Set</option>
            <option value="Unset">⚠️ Valuation Not Set ({stats.unset})</option>
          </select>
        </div>
      </div>

      {/* VALUATIONS TABLE */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-[11px] uppercase font-black tracking-wider text-gray-400">
                <th className="py-3 px-4">Brand & Model</th>
                <th className="py-3 px-4">Storage Variant</th>
                <th className="py-3 px-4">Base Trade-In Value (₦)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {filteredValuations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Smartphone className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                    <p className="font-bold text-gray-400 text-sm">No device valuations match your filter.</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or clear filters.</p>
                  </td>
                </tr>
              ) : (
                filteredValuations.map((item) => {
                  const isInlineEditing = inlineEditingId === item.id;
                  const hasValuation = item.baseTradeInValue !== null && item.baseTradeInValue > 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-900/40 transition-colors group">
                      {/* Brand & Model */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm shrink-0 border border-gray-700">
                            {item.brand === "Apple" ? "🍎" : item.brand === "Samsung" ? "📱" : "✨"}
                          </div>
                          <div>
                            <span className="font-extrabold text-white block">{item.model}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{item.brand}</span>
                          </div>
                        </div>
                      </td>

                      {/* Storage */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 font-extrabold text-xs border border-gray-700">
                          <HardDrive className="w-3 h-3 text-gray-400" />
                          {item.storage}
                        </span>
                      </td>

                      {/* Base Trade-In Value */}
                      <td className="py-3.5 px-4">
                        {isInlineEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={inlinePriceValue}
                              onChange={(e) => setInlinePriceValue(e.target.value)}
                              placeholder="e.g. 65000"
                              autoFocus
                              className="w-32 bg-gray-950 border border-[#00B14F] rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(item)}
                              className="p-1 rounded-lg bg-[#00B14F] text-black hover:bg-[#009241] cursor-pointer"
                              title="Save Base Value"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlineEditingId(null)}
                              className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : hasValuation ? (
                          <div
                            onClick={() => handleStartInlineEdit(item)}
                            className="cursor-pointer group/price inline-flex items-center gap-1.5 hover:bg-gray-800/80 px-2 py-1 rounded-lg transition"
                            title="Click to edit Base Trade-In Value"
                          >
                            <span className="text-sm font-black text-emerald-400 font-sans">
                              {formatNaira(item.baseTradeInValue!)}
                            </span>
                            <Edit className="w-3 h-3 text-gray-500 opacity-0 group-hover/price:opacity-100 transition" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/20 transition cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Valuation Not Set</span>
                            <span className="text-[10px] underline ml-1 text-amber-200">+ Add Price</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer ${
                            item.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-400" : "bg-gray-500"}`} />
                          <span>{item.status}</span>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {item.lastUpdated || "Auto"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setVariantTargetModel({ brand: item.brand, model: item.model })}
                            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
                            title="Add another storage variant (e.g. 256GB)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
                            title="Edit full record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(item.id, item.model, item.storage)}
                            className="p-1.5 rounded-lg bg-gray-800 text-red-400 hover:text-white hover:bg-red-600 transition"
                            title="Delete valuation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT DEVICE VALUATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#00B14F]" />
                  {editingRecord ? `Edit Valuation: ${editingRecord.model}` : "Add Device Trade-In Valuation"}
                </h3>
                {hasUnsavedDraft && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                    Unsaved Draft
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Brand */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Brand</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-[#00B14F] focus:outline-none"
                >
                  {TRADE_IN_BRANDS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Galaxy A05s or iPhone 13"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              {/* Storage */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Storage Variant</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setFormData({ ...formData, storage: cap })}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        formData.storage === cap
                          ? "bg-[#00B14F] text-black border-[#00B14F]"
                          : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Custom storage e.g. 16GB"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-white focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              {/* Base Trade-In Value */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  Base Trade-In Value (₦)
                  <span className="text-[11px] text-gray-400 font-normal ml-2">
                    (Starting value before condition adjustments)
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Leave empty if valuation is not set yet (e.g. 65000)"
                  value={formData.baseTradeInValue}
                  onChange={(e) => setFormData({ ...formData, baseTradeInValue: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-black text-sm focus:border-[#00B14F] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  If left empty, the customer swap calculator will clearly display "Valuation Not Set".
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Status</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                    <input
                      type="radio"
                      checked={formData.status === "Active"}
                      onChange={() => setFormData({ ...formData, status: "Active" })}
                      className="accent-[#00B14F]"
                    />
                    <span>Active (Available in Swap Calculator)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                    <input
                      type="radio"
                      checked={formData.status === "Inactive"}
                      onChange={() => setFormData({ ...formData, status: "Inactive" })}
                      className="accent-[#00B14F]"
                    />
                    <span>Inactive (Hidden)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-gray-800">
                <div>
                  {hasUnsavedDraft && (
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/20 transition cursor-pointer text-xs"
                    >
                      Discard Draft
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#00B14F] text-black font-black hover:bg-[#009241] shadow-lg shadow-[#00B14F]/20 cursor-pointer"
                  >
                    Save & Publish
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STORAGE VARIANT MODAL */}
      {variantTargetModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-black text-white">Add Storage Variant</h3>
                <p className="text-xs text-[#00B14F] font-bold">{variantTargetModel.brand} {variantTargetModel.model}</p>
              </div>
              <button
                type="button"
                onClick={() => setVariantTargetModel(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStorageVariant} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Select Storage</label>
                <select
                  value={newVariantStorage}
                  onChange={(e) => setNewVariantStorage(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-[#00B14F] focus:outline-none"
                >
                  {COMMON_STORAGE_OPTIONS.map((cap) => (
                    <option key={cap} value={cap}>{cap}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Base Trade-In Value (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 75000 (leave empty if not set)"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-black text-sm focus:border-[#00B14F] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setVariantTargetModel(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00B14F] text-black font-black hover:bg-[#009241]"
                >
                  Add Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONDITION ADJUSTMENT RULES CONFIGURATION MODAL */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 animate-scaleUp shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#00B14F]" />
                  Condition Adjustment Rules
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure how customer condition answers modify the Base Trade-In Value.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Formula applied during customer swap: <br />
                  <strong className="text-white">Base Trade-In Value + Condition Adjustment = Estimated Swap Credit</strong>
                </p>
              </div>

              <div className="space-y-3">
                {conditionRules.map((rule) => (
                  <div key={rule.grade} className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                          rule.grade === "Grade A" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" :
                          rule.grade === "Grade B" ? "bg-blue-500/20 text-blue-300 border border-blue-400/30" :
                          rule.grade === "Grade C" ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" :
                          "bg-red-500/20 text-red-300 border border-red-400/30"
                        }`}>
                          {rule.grade}
                        </span>
                        <span className="font-extrabold text-white text-xs">{rule.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">Deduction:</span>
                        <input
                          type="number"
                          value={rule.adjustmentValue}
                          onChange={(e) => handleSaveConditionRule(rule.grade, Number(e.target.value))}
                          className="w-20 bg-black border border-gray-700 rounded-lg p-1.5 text-center font-black text-white focus:border-[#00B14F] focus:outline-none"
                        />
                        <span className="text-gray-400 font-bold">%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00B14F] text-black font-black hover:bg-[#009241]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

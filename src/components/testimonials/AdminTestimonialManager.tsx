import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Shield,
  MessageSquare,
  Sparkles,
  Smartphone,
  MapPin,
  Lock,
  ArrowRight,
  AlertTriangle,
  RotateCw
} from "lucide-react";
import { CustomerTestimonial, TestimonialPublishStatus } from "../../types";
import { TestimonialService } from "../../services/TestimonialService";
import CreateEditTestimonialModal from "./CreateEditTestimonialModal";

export default function AdminTestimonialManager() {
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TestimonialPublishStatus>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<CustomerTestimonial | null>(null);
  const [previewTestimonial, setPreviewTestimonial] = useState<CustomerTestimonial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load testimonials
  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await TestimonialService.fetchAllTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("[AdminTestimonialManager] Failed to load testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Save new or edited testimonial
  const handleSaveTestimonial = async (testimonial: CustomerTestimonial) => {
    await TestimonialService.saveTestimonial(testimonial);
    await loadTestimonials();
  };

  // Delete testimonial
  const handleDeleteTestimonial = async (id: string) => {
    await TestimonialService.deleteTestimonial(id);
    setDeleteConfirmId(null);
    await loadTestimonials();
  };

  // Toggle status
  const handleToggleStatus = async (id: string, newStatus: TestimonialPublishStatus) => {
    await TestimonialService.setStatus(id, newStatus);
    await loadTestimonials();
  };

  // Move Up / Move Down in list
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setTestimonials(reordered);
    await TestimonialService.updateOrder(reordered.map((t) => t.id));
  };

  // Filtered List
  const filteredTestimonials = testimonials.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.testimonialText && item.testimonialText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = testimonials.filter((t) => t.status === "Published").length;
  const draftCount = testimonials.filter((t) => t.status === "Draft").length;
  const swapCount = testimonials.filter((t) => t.transactionType === "Swap").length;

  return (
    <div className="space-y-6">
      {/* Section Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-gray-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-milito-green/10 text-milito-green border border-milito-green/20">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-wide">Testimonials & Customer Proof</h2>
          </div>
          <p className="text-xs text-gray-400">
            Curate authentic customer feedback, redact sensitive chat/receipt details, and publish verified proofs.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setSelectedForEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-milito-green hover:bg-emerald-400 text-gray-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-milito-green/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-gray-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Stories</span>
          <span className="text-2xl font-black text-white mt-1 block">{testimonials.length}</span>
        </div>

        <div className="bg-[#0F172A] border border-gray-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Published Live</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{publishedCount}</span>
        </div>

        <div className="bg-[#0F172A] border border-gray-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Draft Proofs</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{draftCount}</span>
        </div>

        <div className="bg-[#0F172A] border border-gray-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Swap Deals</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">{swapCount}</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] border border-gray-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, device, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-milito-green"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "Published", "Draft", "Unpublished"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? "bg-milito-green text-gray-950 shadow-sm"
                  : "bg-gray-800/80 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "ALL" ? "All Testimonials" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Table / List */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#0F172A] border border-gray-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-milito-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400">Loading verified testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] border border-gray-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No testimonials found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "No testimonials match your filter criteria. Try adjusting your search query."
              : "Start by creating and sanitizing your first real customer proof story."}
          </p>
          <button
            onClick={() => {
              setSelectedForEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-milito-green text-gray-950 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Testimonial</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTestimonials.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-[#0F172A] hover:bg-[#131D33] border border-gray-800 hover:border-gray-700 rounded-2xl transition-all"
            >
              {/* Order & Thumbnail */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex flex-col gap-1 text-gray-500">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === testimonials.length - 1}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Proof Image Preview */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-gray-700 flex-shrink-0">
                  {item.publicImageUrl ? (
                    <img
                      src={item.publicImageUrl}
                      alt={item.customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">
                      No Image
                    </div>
                  )}
                  {item.publicImageUrl && (
                    <div className="absolute top-1 right-1 bg-milito-green p-0.5 rounded-full" title="Sanitized Proof Attached">
                      <Shield className="w-2.5 h-2.5 text-gray-950" />
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{item.customerName}</h4>
                    {item.isVerifiedTransaction && (
                      <span className="flex items-center gap-0.5 text-[9px] font-black text-milito-green bg-milito-green/10 border border-milito-green/20 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {item.location}
                  </span>
                </div>
              </div>

              {/* Transaction & Quote Summary */}
              <div className="flex-1 max-w-lg">
                {item.transactionType === "Swap" && item.fromDevice && item.toDevice ? (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-milito-green bg-[#162032] border border-milito-green/20 px-2.5 py-1 rounded-lg mb-1">
                    <RotateCw className="w-3 h-3" />
                    <span className="text-gray-300">{item.fromDevice}</span>
                    <ArrowRight className="w-3 h-3 text-milito-green" />
                    <span>{item.toDevice}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded-md mb-1">
                    <Smartphone className="w-3 h-3 text-milito-green" />
                    <span>{item.device} {item.storage ? `(${item.storage})` : ""}</span>
                  </div>
                )}

                <p className="text-xs text-gray-400 line-clamp-1 italic">
                  "{item.testimonialText}"
                </p>
              </div>

              {/* Status Pill & Action Buttons */}
              <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-800">
                {/* Status Dropdown */}
                <select
                  value={item.status}
                  onChange={(e) => handleToggleStatus(item.id, e.target.value as TestimonialPublishStatus)}
                  className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                    item.status === "Published"
                      ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                      : item.status === "Draft"
                      ? "bg-amber-950/60 border-amber-800 text-amber-300"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <option value="Published">● Published</option>
                  <option value="Draft">● Draft</option>
                  <option value="Unpublished">● Unpublished</option>
                </select>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewTestimonial(item)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedForEdit(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <CreateEditTestimonialModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedForEdit(null);
          }}
          testimonialToEdit={selectedForEdit}
          onSave={handleSaveTestimonial}
        />
      )}

      {/* Preview Modal */}
      {previewTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-milito-green bg-milito-green/10 border border-milito-green/20 px-2.5 py-1 rounded-full">
                Public Card Preview
              </span>
              <button
                onClick={() => setPreviewTestimonial(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Sanitized Customer Screenshot */}
            {previewTestimonial.publicImageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner">
                <img
                  src={previewTestimonial.publicImageUrl}
                  alt="Customer Proof"
                  className="w-full max-h-64 object-cover object-top"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-milito-green text-[10px] font-black px-2.5 py-1 rounded-full border border-milito-green/30 flex items-center gap-1 shadow">
                  <CheckCircle2 className="w-3 h-3 text-milito-green" />
                  <span>Customer Proof</span>
                </div>
              </div>
            )}

            {/* Swap Story vs Regular Device */}
            {previewTestimonial.transactionType === "Swap" && previewTestimonial.fromDevice && previewTestimonial.toDevice ? (
              <div className="p-3 rounded-2xl bg-[#090D16] border border-milito-green/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">From</span>
                  <strong className="text-white">{previewTestimonial.fromDevice}</strong>
                </div>
                <div className="flex flex-col items-center px-2">
                  <span className="text-[9px] text-milito-green font-extrabold uppercase">MILITO SWAP</span>
                  <ArrowRight className="w-4 h-4 text-milito-green" />
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-milito-green block">To</span>
                  <strong className="text-white">{previewTestimonial.toDevice}</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-white">
                {previewTestimonial.device} {previewTestimonial.storage ? `· ${previewTestimonial.storage}` : ""}
              </div>
            )}

            {/* Quote */}
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
              "{previewTestimonial.testimonialText}"
            </p>

            {/* Footer details */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">{previewTestimonial.customerName}</h5>
                <span className="text-[10px] text-gray-400 block">{previewTestimonial.location}</span>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-black text-milito-green bg-milito-green/10 border border-milito-green/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {previewTestimonial.transactionStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] border border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Delete Testimonial?</h4>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to delete this customer testimonial? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTestimonial(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

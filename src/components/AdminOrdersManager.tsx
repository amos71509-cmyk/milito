import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Smartphone,
  CreditCard,
  Check,
  X,
  Loader2,
  RefreshCw,
  FileText
} from "lucide-react";
import { ProtectedOrder } from "../types";
import { formatNaira } from "../utils/whatsapp";

export default function AdminOrdersManager() {
  const [orders, setOrders] = useState<ProtectedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "pending_verification" | "paid" | "failed">("ALL");

  // Receipt Modal
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("[AdminOrdersManager] Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, paymentStatus: "paid" | "pending_verification" | "failed", orderStatus?: string) => {
    setUpdatingOrderId(orderId);
    setActionSuccessMessage(null);
    try {
      const finalOrderStatus = orderStatus || (paymentStatus === "paid" ? "protected" : paymentStatus === "failed" ? "cancelled" : "payment_verification_pending");
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus,
          orderStatus: finalOrderStatus,
          adminNotes: `Status updated to ${paymentStatus} by Admin on ${new Date().toLocaleTimeString()}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrders(prev => prev.map(o => (o.orderId === orderId ? data.order : o)));
          setActionSuccessMessage(`Order ${orderId} updated to ${paymentStatus.toUpperCase()}!`);
          setTimeout(() => setActionSuccessMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error("[AdminOrdersManager] Status update error:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Metrics
  const pendingCount = orders.filter(o => o.paymentStatus === "pending_verification" || o.paymentStatus === "pending").length;
  const verifiedCount = orders.filter(o => o.paymentStatus === "paid").length;
  const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      (order.productName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "pending_verification" && (order.paymentStatus === "pending_verification" || order.paymentStatus === "pending")) ||
      (statusFilter === "paid" && order.paymentStatus === "paid") ||
      (statusFilter === "failed" && (order.paymentStatus === "failed" || order.orderStatus === "cancelled"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Orders & Payment Verification</span>
              {pendingCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono animate-pulse">
                  {pendingCount} Awaiting Review
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review customer transfers, inspect uploaded payment screenshots/receipts, and mark orders as Verified or Rejected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{orders.length}</span>
          </div>
          <Clock className="w-8 h-8 text-gray-600" />
        </div>

        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Pending Verification</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{pendingCount}</span>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-500/60" />
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Verified (Paid)</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">{verifiedCount}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">{formatNaira(totalRevenue)} total</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, phone, or device..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 shrink-0 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "pending_verification", label: `Pending (${pendingCount})` },
            { id: "paid", label: `Verified (${verifiedCount})` },
            { id: "failed", label: "Rejected" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-emerald-500 text-black shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-bold">Loading live orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-gray-800 rounded-2xl space-y-2">
          <Clock className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No orders found</h4>
          <p className="text-xs text-gray-400">
            {searchQuery ? "Try a different search query." : "No orders are in this filter category yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.paymentStatus === "pending_verification" || order.paymentStatus === "pending";
            const isPaid = order.paymentStatus === "paid";
            const isFailed = order.paymentStatus === "failed" || order.orderStatus === "cancelled";
            const proofUrl = order.paymentProofUrl || order.transferNotice?.paymentProofUrl;

            // Separate items into Phone vs Accessories
            const items = order.items || [];

            return (
              <div
                key={order.orderId}
                className={`bg-[#111827] rounded-2xl border p-4 sm:p-5 transition shadow-lg space-y-4 ${
                  isPending
                    ? "border-amber-500/40 bg-gradient-to-r from-[#111827] to-amber-950/10"
                    : isPaid
                    ? "border-emerald-500/30"
                    : "border-gray-800"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-black text-white font-mono tracking-wider">
                      {order.orderId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isPaid
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : isPending
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                          : "bg-red-500/20 text-red-300 border-red-500/40"
                      }`}
                    >
                      {isPaid ? "Payment Verified" : isPending ? "Pending Verification" : "Payment Rejected"}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString("en-NG") : "Recent"}
                  </span>
                </div>

                {/* Details 3-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Col 1: Customer Details */}
                  <div className="md:col-span-4 space-y-2 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800/80">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Customer Details</span>
                    </span>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white">{order.customer.name}</p>
                      <p className="text-gray-300 flex items-center gap-1.5 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{order.customer.phone}</span>
                      </p>
                      <p className="text-gray-400 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{order.customer.email}</span>
                      </p>
                      <p className="text-gray-300 flex items-start gap-1.5 pt-1 border-t border-gray-800 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{order.customer.address}, {order.customer.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Purchased Phone & Accessories */}
                  <div className="md:col-span-5 space-y-2 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Purchased Items ({items.length})</span>
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {formatNaira(order.totalAmount)}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-800/80 max-h-[160px] overflow-y-auto pr-1 space-y-2">
                      {items.map((it, idx) => {
                        const isAccessory = it.productId?.startsWith("acc_") || it.selectedSpecification?.storage === "Standard" && !it.productName.toLowerCase().includes("iphone") && !it.productName.toLowerCase().includes("samsung");
                        return (
                          <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate flex items-center gap-1.5">
                                {isAccessory ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                                    Accessory
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                                    Phone
                                  </span>
                                )}
                                <span className="truncate">{it.productName}</span>
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Qty: {it.quantity} {it.selectedSpecification?.storage ? `• ${it.selectedSpecification.storage}` : ""} {it.selectedSpecification?.color ? `• ${it.selectedSpecification.color}` : ""}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-gray-200 shrink-0 text-xs">
                              {formatNaira(it.totalPrice || it.unitPrice * it.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-gray-800 flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>Delivery ({order.customer.state}):</span>
                      <span>{formatNaira(order.deliveryFee)}</span>
                    </div>
                  </div>

                  {/* Col 3: Payment Screenshot & Verification Actions */}
                  <div className="md:col-span-3 space-y-3 flex flex-col justify-between">
                    {/* Payment Proof Preview Box */}
                    <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800/80 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center justify-between">
                        <span>Payment Proof</span>
                        {proofUrl ? (
                          <span className="text-emerald-400 text-[9px] font-bold">Uploaded</span>
                        ) : (
                          <span className="text-gray-500 text-[9px]">None</span>
                        )}
                      </span>

                      {proofUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingReceiptUrl(proofUrl)}
                            className="w-14 h-14 rounded-lg bg-black border border-gray-700 overflow-hidden relative group shrink-0 cursor-pointer"
                            title="Click to view full receipt"
                          >
                            <img
                              src={proofUrl}
                              alt="Payment Proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setViewingReceiptUrl(proofUrl)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline block truncate cursor-pointer"
                            >
                              View Screenshot
                            </button>
                            {order.transferNotice?.senderBank && (
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                Bank: {order.transferNotice.senderBank}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 text-center rounded-lg bg-gray-950/60 border border-dashed border-gray-800 text-[10px] text-gray-500">
                          Customer has not attached a screenshot
                        </div>
                      )}
                    </div>

                    {/* Verification Actions */}
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        disabled={updatingOrderId === order.orderId}
                        onClick={() => handleUpdateStatus(order.orderId, "paid")}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition disabled:opacity-50"
                      >
                        {updatingOrderId === order.orderId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>Mark Verified (Paid)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          disabled={updatingOrderId === order.orderId}
                          onClick={() => handleUpdateStatus(order.orderId, "pending_verification")}
                          className="py-1.5 px-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-amber-300 text-[10px] font-bold border border-gray-700 transition cursor-pointer"
                        >
                          Mark Pending
                        </button>
                        <button
                          type="button"
                          disabled={updatingOrderId === order.orderId}
                          onClick={() => handleUpdateStatus(order.orderId, "failed")}
                          className="py-1.5 px-2 rounded-lg bg-gray-800 hover:bg-red-950/60 text-red-400 text-[10px] font-bold border border-gray-700 transition cursor-pointer"
                        >
                          Mark Rejected
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Meta Note if present */}
                {order.transferNotice && (
                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-gray-400 text-[10px] uppercase font-black">Transfer Details:</span>
                    <span><strong>Sender:</strong> {order.transferNotice.senderName}</span>
                    <span><strong>Bank:</strong> {order.transferNotice.senderBank}</span>
                    {order.transferNotice.transferReference && (
                      <span><strong>Ref:</strong> {order.transferNotice.transferReference}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FULL RECEIPT ZOOM MODAL */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#111827] rounded-3xl max-w-2xl w-full border border-gray-800 shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Customer Payment Screenshot / Receipt</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingReceiptUrl(null)}
                  className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex items-center justify-center bg-black/60 min-h-[300px]">
              <img
                src={viewingReceiptUrl}
                alt="Payment proof receipt"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-gray-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

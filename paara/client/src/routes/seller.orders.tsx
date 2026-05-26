import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/seller/orders")({ component: SellerOrdersPage });

const STATUSES = ["pending","confirmed","dispatched","in_transit","delivered","cancelled"] as const;
const STATUS_LABELS: Record<string, string> = { pending:"Pending", confirmed:"Confirmed", dispatched:"Dispatched", in_transit:"In Transit", delivered:"Delivered", cancelled:"Cancelled" };

function SellerOrdersPage() {
  const qc = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);
  const [courierForm, setCourierForm] = useState<Record<string, any>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => { try { return (await ordersApi.getSellerOrders()).data.orders; } catch { return []; } },
  });

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await ordersApi.updateStatus(orderId, status, courierForm[orderId] || {});
      qc.invalidateQueries({ queryKey: ["seller-orders"] });
      toast.success("Order status updated");
    } catch { toast.error("Could not update status"); } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Fulfillment</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Orders</h1>
      </header>

      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        (data || []).length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
            <Receipt size={40} className="text-[rgba(28,58,42,0.2)] mx-auto mb-4" />
            <p className="display-serif text-xl text-[#1C3A2A]">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(data || []).map((order: any) => (
              <div key={order._id} className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#6B645A] mb-0.5">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-[#1C3A2A]">{order.buyer?.name} · {order.buyer?.phone || ""}</p>
                    <p className="text-xs text-[#6B645A]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-[#C9921A] font-semibold">{formatPKR(order.pricing?.total || 0)}</p>
                    <p className="text-xs text-[#6B645A]">{order.payment?.method?.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex-shrink-0 flex items-center gap-2 text-xs text-[#3D2914]">
                      <div className="w-10 h-10 rounded-lg overflow-hidden"><ProductImage src={item.image} alt="" size="sm" /></div>
                      <div><p className="font-medium">{item.name}</p><p className="text-[#6B645A]">×{item.quantity}</p></div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <select value={order.status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-[rgba(28,58,42,0.18)] bg-[#FFF8EC] focus:outline-none focus:border-[#C9921A]">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  {updating === order._id && <Loader2 size={14} className="animate-spin text-[#C9921A]" />}
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                    className="text-xs text-[#C9921A] font-semibold hover:underline">
                    {expandedId === order._id ? "Hide courier" : "Add courier info"}
                  </button>
                </div>

                {expandedId === order._id && (
                  <div className="mt-4 p-4 rounded-[12px] bg-[#FFF8EC] grid sm:grid-cols-3 gap-3">
                    {[["Courier name", "courierName", "TCS, Leopard…"], ["Tracking number", "courierTrackingNumber", ""], ["Tracking URL", "courierTrackingUrl", "https://…"]].map(([label, key, ph]) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1C3A2A] mb-1">{label}</label>
                        <input placeholder={ph} value={courierForm[order._id]?.[key] || ""} onChange={(e) => setCourierForm(p => ({ ...p, [order._id]: { ...(p[order._id] || {}), [key]: e.target.value } }))}
                          className="w-full bg-white border border-[rgba(28,58,42,0.14)] rounded-full px-3 py-2 text-xs focus:outline-none focus:border-[#C9921A]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

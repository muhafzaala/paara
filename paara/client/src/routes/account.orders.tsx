import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, Check, Clock, X, Loader2, ArrowRight } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/account/orders")({ component: OrdersPage });

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: typeof Package }> = {
  pending:    { bg: "rgba(201,146,26,0.12)",  color: "#C9921A",  icon: Clock },
  confirmed:  { bg: "rgba(28,58,42,0.10)",    color: "#1C3A2A",  icon: Check },
  dispatched: { bg: "rgba(74,144,164,0.12)",  color: "#4A90A4",  icon: Truck },
  in_transit: { bg: "rgba(74,144,164,0.12)",  color: "#4A90A4",  icon: Truck },
  delivered:  { bg: "rgba(42,92,63,0.12)",    color: "#2A5C3F",  icon: Check },
  cancelled:  { bg: "rgba(139,26,26,0.10)",   color: "#8B1A1A",  icon: X },
};

const TABS = ["All", "pending", "dispatched", "delivered", "cancelled"] as const;

function OrdersPage() {
  const [tab, setTab] = useState<string>("All");
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      try { return (await ordersApi.getMyOrders()).data.orders; } catch { return []; }
    },
  });

  const orders = (data || []).filter((o: any) => tab === "All" || o.status === tab);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">History</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Your orders</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.14em] whitespace-nowrap transition-colors"
            style={{ background: tab === t ? "#1C3A2A" : "#fff", color: tab === t ? "#F5EDD8" : "#1C3A2A", border: "1px solid rgba(28,58,42,0.12)" }}>
            {t === "All" ? "All orders" : t.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
          <Package size={40} className="text-[rgba(28,58,42,0.2)] mx-auto mb-4" />
          <p className="display-serif text-xl text-[#1C3A2A] mb-2">No orders yet</p>
          <Link to="/products" className="btn btn-primary">Start exploring</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const style = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
            const Icon = style.icon;
            return (
              <div key={order._id} className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6B645A] mb-0.5">Order ID</p>
                    <p className="font-display font-semibold text-[#1C3A2A]">{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B645A]">{new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="font-display text-lg font-semibold text-[#C9921A]">{formatPKR(order.pricing?.total || 0)}</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.12em]"
                    style={{ background: style.bg, color: style.color }}>
                    <Icon size={12} /> {order.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 mb-4">
                  {order.items?.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-[#FFF8EC]">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#FFF8EC] grid place-items-center text-xs text-[#6B645A] font-semibold">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#6B645A]">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                  <Link to="/account/orders" className="text-xs text-[#C9921A] font-semibold flex items-center gap-1 hover:underline">
                    Track order <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

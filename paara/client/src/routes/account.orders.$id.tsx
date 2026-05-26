import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Truck, Check, Clock, X, Loader2, MapPin, CreditCard, Phone } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/account/orders/$id")({ component: OrderDetailPage });

// Timeline stages in canonical order. Stage shown as "active" when current order
// status is at or past it. Cancelled orders short-circuit to a single error state.
const STAGES: { key: string; label: string; icon: typeof Package }[] = [
  { key: "pending",    label: "Order placed",  icon: Clock },
  { key: "confirmed",  label: "Confirmed",     icon: Check },
  { key: "dispatched", label: "Dispatched",    icon: Package },
  { key: "in_transit", label: "In transit",    icon: Truck },
  { key: "delivered",  label: "Delivered",     icon: Check },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "#C9921A",
  confirmed: "#1C3A2A",
  dispatched: "#4A90A4",
  in_transit: "#4A90A4",
  delivered: "#2A5C3F",
  cancelled: "#8B1A1A",
};

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: async () => (await ordersApi.getTracking(id)).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#C9921A]" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="text-center py-16 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
        <X size={40} className="text-[rgba(139,26,26,0.5)] mx-auto mb-4" />
        <p className="display-serif text-xl text-[#1C3A2A] mb-2">Order not found</p>
        <p className="text-sm text-[#6B645A] mb-6">We couldn't find this order in your history.</p>
        <Link to="/account/orders" className="btn btn-primary">Back to orders</Link>
      </div>
    );
  }

  const order = data.order;
  const tracking = data.tracking;
  const isCancelled = order.status === "cancelled";
  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);

  // Build a map of statusHistory entries by status for showing timestamps next to stages
  const historyByStatus = new Map<string, { createdAt: string; notes?: string }>();
  for (const h of tracking.statusHistory || []) {
    if (!historyByStatus.has(h.status)) historyByStatus.set(h.status, h);
  }

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B645A] hover:text-[#1C3A2A] transition-colors">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="display-serif text-3xl text-[#1C3A2A]">
            {order._id?.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-[#6B645A] mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.14em]"
          style={{ background: `${STATUS_COLOR[order.status] || "#6B645A"}22`, color: STATUS_COLOR[order.status] || "#6B645A" }}
        >
          {order.status?.replace("_", " ")}
        </span>
      </header>

      {/* Timeline */}
      <section className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
        <p className="eyebrow mb-5">Journey</p>
        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[rgba(139,26,26,0.06)]">
            <X size={20} className="text-[#8B1A1A]" />
            <div>
              <p className="font-display font-semibold text-[#8B1A1A]">Order cancelled</p>
              {tracking.statusHistory?.find((h: any) => h.status === "cancelled")?.notes && (
                <p className="text-sm text-[#6B645A] mt-1">{tracking.statusHistory.find((h: any) => h.status === "cancelled").notes}</p>
              )}
            </div>
          </div>
        ) : (
          <ol className="space-y-5">
            {STAGES.map((stage, idx) => {
              const reached = currentStageIndex >= idx;
              const isCurrent = currentStageIndex === idx;
              const history = historyByStatus.get(stage.key);
              const Icon = stage.icon;
              return (
                <li key={stage.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full grid place-items-center transition-colors"
                      style={{
                        background: reached ? "#1C3A2A" : "rgba(28,58,42,0.08)",
                        color: reached ? "#F5EDD8" : "rgba(28,58,42,0.4)",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div
                        className="w-px flex-1 mt-1"
                        style={{ background: currentStageIndex > idx ? "#1C3A2A" : "rgba(28,58,42,0.12)", minHeight: 20 }}
                      />
                    )}
                  </div>
                  <div className="pb-2 flex-1">
                    <p
                      className="font-display font-semibold"
                      style={{ color: reached ? "#1C3A2A" : "rgba(28,58,42,0.4)" }}
                    >
                      {stage.label}
                      {isCurrent && <span className="ml-2 text-xs font-bold uppercase tracking-[0.12em] text-[#C9921A]">Now</span>}
                    </p>
                    {history && (
                      <p className="text-xs text-[#6B645A] mt-0.5">
                        {new Date(history.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </p>
                    )}
                    {history?.notes && (
                      <p className="text-sm text-[#1C3A2A] mt-1">{history.notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Items */}
      <section className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
        <p className="eyebrow mb-5">In this order</p>
        <ul className="space-y-4">
          {order.items?.map((item: any) => (
            <li key={item._id} className="flex gap-4">
              <div className="w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0">
                <ProductImage src={item.image || item.product?.images?.[0]} alt={item.name} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-[#1C3A2A]">{item.name}</p>
                <p className="text-xs text-[#6B645A] mt-0.5">Qty {item.quantity}</p>
              </div>
              <p className="font-display font-semibold text-[#C9921A]">{formatPKR(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Shipping + Payment + Pricing */}
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
          <p className="eyebrow mb-4 flex items-center gap-2"><MapPin size={12} /> Delivering to</p>
          <p className="font-display font-semibold text-[#1C3A2A]">{order.shippingAddress?.name}</p>
          <p className="text-sm text-[#6B645A] mt-1">{order.shippingAddress?.street}</p>
          <p className="text-sm text-[#6B645A]">{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}</p>
          <p className="text-sm text-[#6B645A] mt-2 flex items-center gap-1.5"><Phone size={12} /> {order.shippingAddress?.phone}</p>
        </section>

        <section className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
          <p className="eyebrow mb-4 flex items-center gap-2"><CreditCard size={12} /> Payment</p>
          <p className="font-display font-semibold text-[#1C3A2A] uppercase">{order.payment?.method}</p>
          <p className="text-xs text-[#6B645A] mt-1 uppercase tracking-[0.12em]">Status: {order.payment?.status}</p>

          <div className="mt-5 pt-5 border-t border-[rgba(28,58,42,0.08)] space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B645A]">Subtotal</span>
              <span className="text-[#1C3A2A]">{formatPKR(order.pricing?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B645A]">Shipping</span>
              <span className="text-[#1C3A2A]">{formatPKR(order.pricing?.shipping || 0)}</span>
            </div>
            {(order.pricing?.discount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B645A]">Discount</span>
                <span className="text-[#2A5C3F]">-{formatPKR(order.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-[rgba(28,58,42,0.08)]">
              <span className="font-display font-semibold text-[#1C3A2A]">Total</span>
              <span className="font-display text-xl font-semibold text-[#C9921A]">{formatPKR(order.pricing?.total || 0)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

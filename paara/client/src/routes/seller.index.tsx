import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, Receipt, Eye, Loader2, ArrowUpRight } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { sellerApi } from "@/lib/api";

export const Route = createFileRoute("/seller/")({ component: Overview });

function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => { try { return (await sellerApi.getDashboard()).data.stats; } catch { return null; } },
  });

  const stats = data ? [
    { label: "Revenue (30d)", value: formatPKR(data.revenue || 0), icon: TrendingUp, accent: true },
    { label: "Orders", value: String(data.totalOrders || 0), icon: Receipt },
    { label: "Active products", value: String(data.totalProducts || 0), icon: Package },
    { label: "Pending orders", value: String(data.pendingOrders || 0), icon: Eye },
  ] : [
    { label: "Revenue (30d)", value: "—", icon: TrendingUp, accent: true },
    { label: "Orders", value: "—", icon: Receipt },
    { label: "Active products", value: "—", icon: Package },
    { label: "Pending orders", value: "—", icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1C3A2A] to-[#264D38] text-[#F5EDD8] rounded-[20px] p-6 md:p-8 relative overflow-hidden">
        <p className="urdu text-[#C9921A] text-xl mb-2">آپ کا استقبال ہے</p>
        <h1 className="display-serif text-2xl md:text-3xl text-[#F5EDD8] mb-2">Good to see your work growing.</h1>
        <p className="text-[rgba(245,237,216,0.75)] text-sm max-w-md">Your PAARA atelier dashboard — track orders, manage listings, and receive payments.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
              <s.icon size={20} className="text-[#C9921A] mb-3" />
              <div className="font-display text-3xl font-semibold text-[#1C3A2A] mb-1">{s.value}</div>
              <div className="text-xs text-[#6B645A] uppercase tracking-[0.12em]">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <QuickLink to="/seller/products" title="Manage products" desc="Add, edit or pause your listings" />
        <QuickLink to="/seller/orders" title="View orders" desc="See and update order statuses" />
        <QuickLink to="/seller/analytics" title="Analytics" desc="Track revenue and top products" />
        <QuickLink to="/seller/payouts" title="Payouts" desc="Request and track your earnings" />
      </div>
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: any; title: string; desc: string }) {
  return (
    <Link to={to} className="group bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] hover:border-[#C9921A] transition-all shadow-[var(--shadow-soft)] flex items-center justify-between">
      <div>
        <p className="font-display font-semibold text-[#1C3A2A] mb-1">{title}</p>
        <p className="text-xs text-[#6B645A]">{desc}</p>
      </div>
      <ArrowUpRight size={18} className="text-[#C9921A] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

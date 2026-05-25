import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Store, Package, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { adminApi } from "@/lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => { try { return (await adminApi.getDashboard()).data.stats; } catch { return null; } },
  });

  const kpis = data ? [
    { label: "Buyers", value: data.users?.toLocaleString() || "—", icon: Users },
    { label: "Active sellers", value: data.sellers || "—", icon: Store },
    { label: "Listings", value: data.products?.toLocaleString() || "—", icon: Package },
    { label: "GMV (30d)", value: formatPKR(data.revenue || 0), icon: TrendingUp },
  ] : [
    { label: "Buyers", value: "—", icon: Users },
    { label: "Active sellers", value: "—", icon: Store },
    { label: "Listings", value: "—", icon: Package },
    { label: "GMV (30d)", value: "—", icon: TrendingUp },
  ];

  const alerts = data ? [
    data.pendingSellers > 0 && { type: "warn", text: `${data.pendingSellers} sellers awaiting verification` },
    data.pendingProducts > 0 && { type: "warn", text: `${data.pendingProducts} products pending review` },
    { type: "ok", text: "Platform running normally" },
  ].filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-[rgba(245,237,216,0.5)]">Today</p>
        <h1 className="font-display text-3xl text-[#F5EDD8]">Platform overview</h1>
      </header>

      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[rgba(245,237,216,0.06)] rounded-[16px] p-5 border border-[rgba(201,146,26,0.12)]">
              <k.icon size={18} className="text-[#C9921A] mb-3" />
              <div className="font-display text-3xl font-semibold text-[#F5EDD8]">{k.value}</div>
              <div className="text-xs text-[rgba(245,237,216,0.55)] mt-1 uppercase tracking-[0.12em]">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a: any, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm ${a.type === "warn" ? "bg-[rgba(201,146,26,0.12)] text-[#C9921A]" : "bg-[rgba(42,92,63,0.2)] text-[#A8D5BC]"}`}>
              {a.type === "warn" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
              {a.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

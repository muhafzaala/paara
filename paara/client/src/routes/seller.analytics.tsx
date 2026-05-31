import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { sellerApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/seller/analytics")({ component: SellerAnalyticsPage });

const DAY_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const;

function SellerAnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-analytics", days],
    queryFn: async () => { try { return (await sellerApi.getAnalytics({ days })).data; } catch { return null; } },
  });

  const chartData = (data?.revenueData || []).map((d: any) => ({ date: d._id?.slice(5), revenue: d.revenue, orders: d.orders }));

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Insights</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Analytics</h1>
      </header>

      <div className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h2 className="display-serif text-xl text-[#1C3A2A]">Revenue — last {days} days</h2>
          {/* Segmented date-range control */}
          <div className="flex rounded-full border border-[rgba(28,58,42,0.15)] overflow-hidden bg-[#FFF8EC]">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDays(opt.value)}
                className="px-4 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: days === opt.value ? "#1C3A2A" : "transparent",
                  color: days === opt.value ? "#F5EDD8" : "#1C3A2A",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[#6B645A] text-sm">No data yet — start selling to see your analytics.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,58,42,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B645A" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B645A" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatPKR(v)} contentStyle={{ borderRadius: 12, border: "1px solid rgba(28,58,42,0.1)", background: "#FFF8EC" }} />
              <Line type="monotone" dataKey="revenue" stroke="#C9921A" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

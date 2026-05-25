import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { adminApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => { try { return (await adminApi.getAnalytics()).data; } catch { return null; } },
  });

  const chartData = (data?.revenueData || []).map((d: any) => ({ date: d._id?.slice(5), revenue: d.revenue, orders: d.orders }));

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-[rgba(245,237,216,0.5)]">Insights</p>
        <h1 className="font-display text-3xl text-[#F5EDD8]">Platform analytics</h1>
      </header>
      <div className="bg-[rgba(245,237,216,0.06)] rounded-[20px] p-6 border border-[rgba(201,146,26,0.12)]">
        <h2 className="text-lg font-semibold text-[#F5EDD8] mb-6">Revenue — last 30 days</h2>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
          chartData.length === 0 ? <div className="flex items-center justify-center h-40 text-[rgba(245,237,216,0.4)] text-sm">No data yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,237,216,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(245,237,216,0.5)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(245,237,216,0.5)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatPKR(v)} contentStyle={{ borderRadius: 12, border: "1px solid rgba(201,146,26,0.2)", background: "#1C3A2A", color: "#F5EDD8" }} />
                <Line type="monotone" dataKey="revenue" stroke="#C9921A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>
      {data?.topProducts?.length > 0 && (
        <div className="bg-[rgba(245,237,216,0.06)] rounded-[20px] p-6 border border-[rgba(201,146,26,0.12)]">
          <h2 className="text-lg font-semibold text-[#F5EDD8] mb-4">Top products</h2>
          <div className="space-y-3">
            {data.topProducts.map((p: any) => (
              <div key={p._id} className="flex items-center gap-3 text-sm">
                <span className="text-[rgba(245,237,216,0.55)] w-4">{data.topProducts.indexOf(p) + 1}</span>
                <div className="flex-1 text-[#F5EDD8]">{p.name}</div>
                <div className="text-[rgba(245,237,216,0.55)]">{p.city}</div>
                <div className="text-[#C9921A] font-semibold">{p.numSold} sold</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import CountUpNumber from "@/components/ui/CountUpNumber";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Package, ShoppingBag, Award, Plus, AlertCircle, ArrowRight } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { sellerApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/seller/")({
  head: () => ({ meta: [{ title: "Seller Dashboard · PAARA" }] }),
  component: SellerDashboard,
});

const PALETTE = ["#1C3A2A", "#C9921A", "#8B1A1A", "#2A5C3F", "#B5651D", "#E5A82E"];

function SellerDashboard() {
  const dashboard = useQuery({ queryKey: ["seller-dashboard"], queryFn: async () => (await sellerApi.getDashboard()).data });
  const analytics = useQuery({ queryKey: ["seller-analytics"], queryFn: async () => (await sellerApi.getAnalytics()).data });

  if (dashboard.isLoading) return <div className="min-h-screen bg-[#F5EDD8] grid place-items-center"><Loader2 className="animate-spin text-[#C9921A]" size={32} /></div>;

  const stats = dashboard.data?.stats || {};
  const recentOrders = dashboard.data?.recentOrders || [];
  const revenueData = analytics.data?.revenueData || [];
  const topProducts = analytics.data?.topProducts || [];
  const categoryBreakdown = analytics.data?.categoryBreakdown || [];

  const notVerified = stats.verificationStatus && stats.verificationStatus !== "approved";

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">{stats.shopName || "Your shop"}</h1>
            </div>
            <Link to="/seller/products" className="btn btn-primary"><Plus size={16} /> Add Product</Link>
          </header>

          {notVerified && (
            <Link to="/seller/onboarding" className="block bg-gradient-to-r from-[#C9921A] to-[#E5A82E] rounded-2xl p-5 mb-6 text-[#1C3A2A] flex items-center justify-between hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <div>
                  <p className="font-display font-semibold">Complete your verification</p>
                  <p className="text-xs">Status: {stats.verificationStatus} — finish to unlock all features</p>
                </div>
              </div>
              <ArrowRight size={20} />
            </Link>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Revenue (30d)" value={formatPKR(stats.revenue30d || 0)} icon={TrendingUp} accent />
            <StatCard label="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} />
            <StatCard label="Pending Orders" value={stats.pendingOrders || 0} icon={Package} />
            <StatCard label="Active Products" value={stats.activeProducts || 0} icon={Package} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-4">Revenue · last 30 days</p>
              {revenueData.length === 0 ? (
                <div className="h-64 grid place-items-center text-sm text-[#6B645A]">No revenue yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,58,42,0.08)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#6B645A" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6B645A" }} />
                    <Tooltip contentStyle={{ background: "#FFF8EC", border: "1px solid #C9921A", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#C9921A" strokeWidth={3} dot={{ fill: "#1C3A2A" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-4">Category Mix</p>
              {categoryBreakdown.length === 0 ? (
                <div className="h-64 grid place-items-center text-sm text-[#6B645A]">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="count" nameKey="_id" outerRadius={90} label={(e) => e._id}>
                      {categoryBreakdown.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-4">Top Products</p>
              {topProducts.length === 0 ? (
                <p className="text-sm text-[#6B645A]">No sales yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topProducts} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#6B645A" }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#1C3A2A" }} />
                    <Tooltip />
                    <Bar dataKey="numSold" fill="#C9921A" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-4">Recent Orders</p>
              <ul className="space-y-3">
                {recentOrders.slice(0, 5).map((o: any) => (
                  <li key={o._id} className="flex items-center justify-between text-sm py-2 border-b last:border-0 border-[rgba(28,58,42,0.06)]">
                    <div>
                      <p className="font-display font-semibold text-[#1C3A2A]">#{o._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[#6B645A]">{o.buyer?.name} · {o.status}</p>
                    </div>
                    <span className="text-[#C9921A] font-semibold">{formatPKR(o.pricing?.total || 0)}</span>
                  </li>
                ))}
                {recentOrders.length === 0 && <li className="text-sm text-[#6B645A]">No orders yet.</li>}
              </ul>
              <Link to="/seller/orders" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9921A] hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[rgba(28,58,42,0.08)]" style={accent ? { borderColor: "rgba(201,146,26,0.3)" } : {}}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A] font-semibold">{label}</p>
        <Icon size={16} className={accent ? "text-[#C9921A]" : "text-[#1C3A2A]"} />
      </div>
      <p className="display-serif text-2xl font-semibold" style={{ color: accent ? "#C9921A" : "#1C3A2A" }}>
        {typeof value === "number" ? <CountUpNumber value={value} /> : value}
      </p>
    </div>
  );
}

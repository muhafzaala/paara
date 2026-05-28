import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Package, ShoppingBag, TrendingUp, Award, FileSearch, Loader2, Crown } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard · PAARA" }] }),
  component: AdminDashboard,
});

const PALETTE = ["#1C3A2A", "#C9921A", "#8B1A1A", "#2A5C3F", "#B5651D"];

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-platform"],
    queryFn: async () => (await adminApi.getPlatformStats()).data,
  });

  if (isLoading) return <div className="min-h-screen bg-[#F5EDD8] grid place-items-center"><Loader2 className="animate-spin text-[#C9921A]" size={32} /></div>;

  const s = data?.stats || {};
  const ordersByStatus = data?.ordersByStatus || [];

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8">
            <p className="eyebrow">Admin</p>
            <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Platform Overview</h1>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Stat label="Total Users" value={s.totalUsers} icon={Users} />
            <Stat label="Verified Sellers" value={s.verifiedSellers} icon={Award} accent />
            <Stat label="Active Products" value={s.activeProducts} icon={Package} />
            <Stat label="Total Orders" value={s.totalOrders} icon={ShoppingBag} />
            <Stat label="GMV" value={formatPKR(s.totalRevenue || 0)} icon={TrendingUp} accent />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Link to="/admin/verifications" className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-shadow">
              <FileSearch size={24} className="text-[#C9921A] mb-3" />
              <p className="font-display font-semibold text-[#1C3A2A]">Verifications</p>
              <p className="text-xs text-[#6B645A] mt-1">Review and approve sellers</p>
            </Link>
            <Link to="/admin/products" className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-shadow">
              <Package size={24} className="text-[#C9921A] mb-3" />
              <p className="font-display font-semibold text-[#1C3A2A]">Products</p>
              <p className="text-xs text-[#6B645A] mt-1">Moderate listings</p>
            </Link>
            <Link to="/admin/audit-log" className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-shadow">
              <Users size={24} className="text-[#C9921A] mb-3" />
              <p className="font-display font-semibold text-[#1C3A2A]">Audit Log</p>
              <p className="text-xs text-[#6B645A] mt-1">Platform activity trail</p>
            </Link>
            <Link to="/admin/admins" className="bg-white rounded-2xl p-6 border border-[rgba(201,146,26,0.3)] hover:shadow-lg transition-shadow">
              <Crown size={24} className="text-[#C9921A] mb-3" />
              <p className="font-display font-semibold text-[#1C3A2A]">Admin Management</p>
              <p className="text-xs text-[#6B645A] mt-1">Requests, admins, activity (primary only)</p>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
            <p className="eyebrow mb-4">Orders by Status</p>
            {ordersByStatus.length === 0 ? (
              <p className="text-sm text-[#6B645A]">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={ordersByStatus} dataKey="count" nameKey="_id" outerRadius={90} label={(e) => `${e._id}: ${e.count}`}>
                    {ordersByStatus.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }: any) {
  return (
    <div className={`bg-white rounded-2xl p-5 border ${accent ? "border-[rgba(201,146,26,0.3)]" : "border-[rgba(28,58,42,0.08)]"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A] font-semibold">{label}</p>
        <Icon size={16} className={accent ? "text-[#C9921A]" : "text-[#1C3A2A]"} />
      </div>
      <p className={`display-serif text-2xl font-semibold ${accent ? "text-[#C9921A]" : "text-[#1C3A2A]"}`}>{value ?? 0}</p>
    </div>
  );
}

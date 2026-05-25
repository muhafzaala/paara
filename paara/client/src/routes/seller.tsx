import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, Receipt, BarChart3, Wallet, Settings, Store, Bell, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth, useHasHydrated } from "@/lib/auth-store";

export const Route = createFileRoute("/seller")({ component: SellerLayout });

const NAV = [
  { to: "/seller" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/seller/products" as const, label: "Products", icon: Package },
  { to: "/seller/orders" as const, label: "Orders", icon: Receipt },
  { to: "/seller/analytics" as const, label: "Analytics", icon: BarChart3 },
  { to: "/seller/payouts" as const, label: "Payouts", icon: Wallet },
  { to: "/seller/settings" as const, label: "Settings", icon: Settings },
];

function SellerLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hasHydrated = useHasHydrated();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "seller" && user.role !== "admin") navigate({ to: "/" });
  }, [user, navigate, hasHydrated]);

  if (!hasHydrated || !user || (user.role !== "seller" && user.role !== "admin")) return null;

  const shopName = (user as any).shopName || user.name;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-24 px-4 md:px-6 lg:px-10 pb-16">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-full bg-white shadow-sm border border-[rgba(28,58,42,0.1)]" aria-label="Open menu"><Menu size={18} /></button>
              <div className="w-11 h-11 rounded-xl bg-[#1C3A2A] grid place-items-center text-[#F5EDD8]"><Store size={18} /></div>
              <div>
                <p className="eyebrow !text-[10px]">Atelier</p>
                <p className="display-serif text-xl text-[#1C3A2A] leading-tight">{shopName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => logout()} className="inline-flex items-center gap-2 text-xs px-4 py-2.5 rounded-full bg-white border border-[rgba(28,58,42,0.1)] shadow-sm hover:bg-[#FFF8EC]">
                <LogOut size={14} /> Exit
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[240px_1fr] gap-6">
            <aside className="hidden lg:block">
              <SidebarNav pathname={loc.pathname} />
            </aside>
            {open && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#F5EDD8] p-5 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <p className="display-serif text-xl text-[#1C3A2A]">Menu</p>
                    <button onClick={() => setOpen(false)}><X size={18} /></button>
                  </div>
                  <div onClick={() => setOpen(false)}><SidebarNav pathname={loc.pathname} /></div>
                </div>
              </div>
            )}
            <main className="min-w-0"><Outlet /></main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="bg-white rounded-[20px] p-3 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] sticky top-28">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link key={item.to} to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors mb-1"
            style={{ background: active ? "#1C3A2A" : "transparent", color: active ? "#F5EDD8" : "#1C3A2A" }}>
            <item.icon size={16} /><span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

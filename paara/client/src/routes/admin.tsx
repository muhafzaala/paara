import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, Store, Users, BarChart3, Settings, LogOut, Menu, X, ShieldCheck, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, useHasHydrated } from "@/lib/auth-store";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products" as const, label: "Products", icon: Package },
  { to: "/admin/sellers" as const, label: "Sellers", icon: Store },
  { to: "/admin/users" as const, label: "Users", icon: Users },
  { to: "/admin/analytics" as const, label: "Analytics", icon: BarChart3 },
  { to: "/admin/admins" as const, label: "Admin Mgmt", icon: Crown },
  { to: "/admin/settings" as const, label: "Settings", icon: Settings },
];

function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hasHydrated = useHasHydrated();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (user.role !== "admin") { navigate({ to: "/" }); return; }
    // Enforce TOTP setup for admins who haven't configured it yet
    if (user.twoFactorRequired && !user.twoFactorEnabled && loc.pathname !== "/admin/setup-2fa") {
      navigate({ to: "/admin/setup-2fa" });
    }
  }, [user, navigate, hasHydrated, loc.pathname]);

  if (!hasHydrated || !user || user.role !== "admin") return null;
  // Block rendering admin UI until TOTP is set up
  if (user.twoFactorRequired && !user.twoFactorEnabled && loc.pathname !== "/admin/setup-2fa") return null;

  return (
    <div className="min-h-screen bg-[#0F2219]">
      <div className="pt-0 pb-16">
        <div className="bg-[#0F2219] text-[#F5EDD8] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-[rgba(201,146,26,0.2)]">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden p-2"><Menu size={18} /></button>
            <ShieldCheck size={20} className="text-[#C9921A]" />
            <span className="display-serif text-lg text-[#F5EDD8]">PAARA Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[rgba(245,237,216,0.7)] hidden sm:block">{user.name}</span>
            <button type="button" onClick={() => { logout(); navigate({ to: "/" }); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-[rgba(245,237,216,0.08)] hover:bg-[rgba(245,237,216,0.14)] transition-colors">
              <LogOut size={13} /> Exit
            </button>
          </div>
        </div>

        <div className="flex">
          <aside className="hidden lg:block w-56 shrink-0 min-h-[calc(100vh-60px)] bg-[#1C3A2A]">
            <nav className="p-3 pt-6">
              {NAV.map((item) => {
                const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
                return (
                  <Link key={item.to} to={item.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-1"
                    style={{ background: active ? "rgba(201,146,26,0.18)" : "transparent", color: active ? "#C9921A" : "rgba(245,237,216,0.75)" }}>
                    <item.icon size={16} /><span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#1C3A2A]">
                <div className="flex justify-between items-center p-4 border-b border-[rgba(201,146,26,0.2)]">
                  <span className="text-[#F5EDD8] font-semibold">Menu</span>
                  <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="text-[#F5EDD8]"><X size={18} /></button>
                </div>
                <nav className="p-3" onClick={() => setOpen(false)}>
                  {NAV.map((item) => {
                    const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
                    return (
                      <Link key={item.to} to={item.to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-1"
                        style={{ background: active ? "rgba(201,146,26,0.18)" : "transparent", color: active ? "#C9921A" : "rgba(245,237,216,0.75)" }}>
                        <item.icon size={16} /><span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0 p-6 md:p-8"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}

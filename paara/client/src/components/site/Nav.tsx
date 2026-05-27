import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/paara-logo.png";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

interface NavProps { variant?: "transparent" | "solid"; }

export function Nav({ variant = "transparent" }: NavProps) {
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const cartItems = useCart((s) => s.items);
  const navigate = useNavigate();

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const links = [
    { to: "/products", label: "Explore" },
    { to: "/regions", label: "Regions" },
    { to: "/brands", label: "Brands" },
    { to: "/heritage", label: "Heritage" },
  ];

  const onDark = !scrolled && variant === "transparent";
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
    setMobileOpen(false);
  };

  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(28, 58, 42, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.2)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,146,26,0.20)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-12 py-4">
        <Link to="/" className="flex items-center group" aria-label="PAARA">
          <img src={logo} alt="PAARA" className="h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ filter: onDark ? "drop-shadow(0 6px 24px rgba(0,0,0,0.55)) brightness(1.05)" : "drop-shadow(0 4px 12px rgba(28,58,42,0.18))" }} />
        </Link>

        <nav className="hidden lg:flex gap-10">
          {links.map((l) => {
            const active = pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="relative text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300"
                style={{ color: active ? "#C9921A" : onDark ? "rgba(245,237,216,0.92)" : "#1C3A2A" }}>
                {l.label}
                <span className="absolute left-0 right-0 -bottom-1.5 h-[2px] origin-center transition-transform duration-500"
                  style={{ background: "#C9921A", transform: active ? "scaleX(1)" : "scaleX(0)" }} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <IconBtn onDark={onDark} label="Search"><Search size={16} /></IconBtn>

          <Link to="/wishlist" className="hidden sm:block">
            <IconBtn onDark={onDark} label="Wishlist"><Heart size={16} /></IconBtn>
          </Link>

          {/* Cart with count badge */}
          <Link to="/cart" className="hidden sm:block relative">
            <IconBtn onDark={onDark} label="Cart"><ShoppingBag size={16} /></IconBtn>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C9921A] text-[#1C3A2A] text-[10px] font-bold grid place-items-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {/* Auth-aware user section */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === "admin" && (
                <Link to="/admin">
                  <IconBtn onDark={onDark} label="Admin"><ShieldCheck size={16} /></IconBtn>
                </Link>
              )}
              {user.role === "seller" && (
                <Link to="/seller">
                  <IconBtn onDark={onDark} label="Dashboard"><LayoutDashboard size={16} /></IconBtn>
                </Link>
              )}
              <Link to="/account">
                <button aria-label={user.name}
                  className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: "#C9921A", color: "#1C3A2A", border: "2px solid rgba(201,146,26,0.4)" }}>
                  {initials}
                </button>
              </Link>
              <button onClick={handleLogout} aria-label="Sign out"
                className="w-10 h-10 rounded-full grid place-items-center transition-all duration-300 hover:-translate-y-0.5"
                style={{ border: `1.5px solid ${onDark ? "rgba(245,237,216,0.3)" : "rgba(28,58,42,0.15)"}`, color: onDark ? "#F5EDD8" : "#1C3A2A", background: onDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)" }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <IconBtn onDark={onDark} label="Sign in"><User size={16} /></IconBtn>
            </Link>
          )}

          <button className="lg:hidden p-2" style={{ color: onDark ? "#F5EDD8" : "#1C3A2A" }} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1C3A2A] text-[#F5EDD8] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,146,26,0.2)]">
            <img src={logo} alt="PAARA" className="h-16 w-auto object-contain" />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2"><X size={22} /></button>
          </div>
          <nav className="flex flex-col p-8 gap-6 overflow-y-auto">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="font-display text-3xl">{l.label}</Link>
            ))}
            <div className="h-px bg-[rgba(201,146,26,0.3)] my-2" />
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="font-display text-2xl flex items-center gap-3">
              Cart {cartCount > 0 && <span className="text-[#C9921A] text-lg">({cartCount})</span>}
            </Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Wishlist</Link>
            <div className="h-px bg-[rgba(201,146,26,0.3)] my-2" />
            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="font-display text-2xl">My Account</Link>
                {user.role === "seller" && <Link to="/seller" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Seller Dashboard</Link>}
                {user.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Admin</Link>}
                <button onClick={handleLogout} className="font-display text-2xl text-left text-[rgba(245,237,216,0.7)]">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Create account</Link>
              </>
            )}
            <Link to="/sell" onClick={() => setMobileOpen(false)} className="font-display text-2xl text-[#C9921A]">Sell with PAARA</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function IconBtn({ children, onDark, label }: { children: React.ReactNode; onDark: boolean; label: string }) {
  return (
    <button aria-label={label}
      className="w-10 h-10 rounded-full grid place-items-center transition-all duration-300 hover:-translate-y-0.5"
      style={{
        border: `1.5px solid ${onDark ? "rgba(245,237,216,0.3)" : "rgba(28,58,42,0.15)"}`,
        color: onDark ? "#F5EDD8" : "#1C3A2A",
        background: onDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
      }}>
      {children}
    </button>
  );
}



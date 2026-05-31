import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ShieldCheck, Crown, Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { NotificationBell } from "./NotificationBell";
import { PaaraLogo } from "./PaaraLogo";
import { toast } from "sonner";
import { SearchTypeahead } from "./SearchTypeahead";
import { LanguageToggle } from "./LanguageToggle";
import { useLang } from "@/lib/i18n";
import VoiceSearchButton from "./VoiceSearchButton";
import CurrencySwitcher from "./CurrencySwitcher";

interface NavProps { variant?: "transparent" | "solid"; }

export function Nav({ variant = "transparent" }: NavProps) {
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navVisible, setNavVisible] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef({ mobileOpen, searchOpen, avatarOpen });
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

  // Keep ref in sync so the mousemove handler always sees current overlay state
  useEffect(() => { openRef.current = { mobileOpen, searchOpen, avatarOpen }; },
    [mobileOpen, searchOpen, avatarOpen]);

  // Auto-hide: hide after 3 s when cursor leaves the top 80 px; reveal on hover near top
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (openRef.current.mobileOpen || openRef.current.searchOpen || openRef.current.avatarOpen) {
        setNavVisible(true);
        return;
      }
      if (e.clientY < 80) {
        setNavVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      } else {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setNavVisible(false), 3000);
      }
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const { t } = useLang();
  const links = [
    { to: "/products", label: t("nav.explore") },
    { to: "/regions", label: t("nav.regions") },
    { to: "/brands", label: t("nav.brands") },
    { to: "/heritage", label: t("nav.heritage") },
    { to: "/heritage-map", label: t("nav.heritageMap") },
  ];

  const onDark = !scrolled && variant === "transparent";
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const openSearch = () => {
    setSearchOpen(true);
    setMobileOpen(false);
    setTimeout(() => searchInputRef.current?.focus(), 60);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to: "/products", search: { q } as any });
  };

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
        background: scrolled
          ? "rgba(28, 58, 42, 0.92)"
          : "linear-gradient(to bottom, rgba(15,34,25,0.55) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.2)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,146,26,0.20)" : "1px solid transparent",
        transform: navVisible ? "translateY(0)" : "translateY(-100%)",
        opacity: navVisible ? 1 : 0,
        pointerEvents: navVisible ? "auto" : "none",
      }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-12 py-4">
        <Link to="/" className="flex items-center group" aria-label="PAARA">
          <div className="transition-transform duration-500 group-hover:scale-[1.04]">
            <PaaraLogo height={72} />
          </div>
        </Link>

        <nav className="hidden lg:flex gap-10">
          {links.map((l) => {
            const active = pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300"
                style={{
                  color: active ? "#F5EDD8" : "#1C3A2A",
                  background: active ? "#1C3A2A" : "rgba(255,255,255,0.75)",
                  border: `1.5px solid ${active ? "#C9921A" : "rgba(28,58,42,0.35)"}`,
                  backdropFilter: "blur(8px)",
                }}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop type-ahead search — enhancement alongside existing full-screen search */}
          <SearchTypeahead onDark={onDark} />

          <button type="button" onClick={openSearch} aria-label="Search"
            className="w-10 h-10 rounded-full grid place-items-center transition-all duration-300 hover:-translate-y-0.5"
            style={{
              border: `1.5px solid ${onDark ? "rgba(245,237,216,0.3)" : "rgba(28,58,42,0.15)"}`,
              color: onDark ? "#F5EDD8" : "#1C3A2A",
              background: onDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
            }}>
            <Search size={16} />
          </button>

          <VoiceSearchButton onDark={onDark} />

          {/* Language toggle */}
          <div className="hidden lg:block">
            <LanguageToggle />
          </div>

          <CurrencySwitcher />

          {/* Wishlist — buyers only, with count badge */}
          {user?.role === "buyer" && (
            <Link to="/wishlist" className="hidden sm:block relative">
              <IconBtn onDark={onDark} label="Wishlist"><Heart size={16} /></IconBtn>
            </Link>
          )}

          {/* Cart — buyers only */}
          {user?.role === "buyer" && (
            <Link to="/cart" className="hidden sm:block relative">
              <IconBtn onDark={onDark} label="Cart"><ShoppingBag size={16} /></IconBtn>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C9921A] text-[#1C3A2A] text-[10px] font-bold grid place-items-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification Bell — all logged-in users */}
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
              <div className="relative">
                <button onClick={() => setAvatarOpen((o) => !o)} aria-label={user.name}
                  className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: "#C9921A", color: "#1C3A2A", border: "2px solid rgba(201,146,26,0.4)" }}>
                  {initials}
                </button>
                {avatarOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-52 bg-white rounded-2xl shadow-xl border border-[rgba(28,58,42,0.1)] overflow-hidden py-1">
                      <Link to="/account" onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1C3A2A] hover:bg-[#FFF8EC]">
                        <User size={14} /> My Account
                      </Link>
                      {user.role !== "admin" && (
                        <Link to="/account/request-admin" onClick={() => setAvatarOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1C3A2A] hover:bg-[#FFF8EC]">
                          <Crown size={14} className="text-[#C9921A]" /> Request admin access
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
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
            <PaaraLogo height={64} />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2"><X size={22} /></button>
          </div>
          <nav className="flex flex-col p-8 gap-6 overflow-y-auto">
            <button type="button" onClick={openSearch}
              className="font-display text-2xl text-left flex items-center gap-3 text-[#F5EDD8]">
              <Search size={20} /> Search
            </button>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="font-display text-3xl">{l.label}</Link>
            ))}
            {user?.role === "buyer" && (
              <>
                <div className="h-px bg-[rgba(201,146,26,0.3)] my-2" />
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="font-display text-2xl flex items-center gap-3">
                  Cart {cartCount > 0 && <span className="text-[#C9921A] text-lg">({cartCount})</span>}
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Wishlist</Link>
              </>
            )}
            <div className="h-px bg-[rgba(201,246,26,0.3)] my-2" />
            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="font-display text-2xl">My Account</Link>
                {user.role === "seller" && <Link to="/seller" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Seller Dashboard</Link>}
                {user.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="font-display text-2xl">Admin</Link>}
                {user.role !== "admin" && (
                  <Link to="/account/request-admin" onClick={() => setMobileOpen(false)} className="font-display text-2xl flex items-center gap-3">
                    <Crown size={20} className="text-[#C9921A]" /> Request admin access
                  </Link>
                )}
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
      {searchOpen && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-[80] bg-[#1C3A2A] px-6 py-4 shadow-2xl border-b border-[rgba(201,146,26,0.25)]">
            <form onSubmit={submitSearch} className="mx-auto max-w-2xl flex items-center gap-3">
              <Search size={18} className="text-[#C9921A] flex-shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, artisans, crafts…"
                className="flex-1 bg-transparent text-[#F5EDD8] placeholder-[rgba(245,237,216,0.4)] text-base outline-none"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="text-[rgba(245,237,216,0.5)] hover:text-[#F5EDD8]">
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="px-5 py-2 rounded-full text-sm font-semibold"
                style={{ background: "#C9921A", color: "#1C3A2A" }}>
                Search
              </button>
              <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="text-[rgba(245,237,216,0.5)] hover:text-[#F5EDD8] ml-1">
                <X size={20} />
              </button>
            </form>
          </div>
        </>
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



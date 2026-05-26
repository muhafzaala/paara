import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

// Session key — banner shows once per browser session, then stays hidden until next sign-in.
const SESSION_KEY = "paara_welcome_shown";

const ROLE_COPY: Record<string, { urdu: string; english: (name: string) => string }> = {
  buyer: {
    urdu: "خوش آمدید",
    english: (name) => `Welcome back, ${name}`,
  },
  seller: {
    urdu: "خوش آمدید کاریگر",
    english: (name) => `Welcome back, ${name} — your kiln awaits`,
  },
  admin: {
    urdu: "خوش آمدید منتظم",
    english: (name) => `Welcome back, ${name} — admin console ready`,
  },
};

export function WelcomeBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    // If the user has manually dismissed it this session, don't show again
    if (sessionStorage.getItem(SESSION_KEY) === user._id) return;

    // Defer slightly so the entry animation has weight, then stay visible
    const showTimer = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(showTimer);
  }, [user]);

  const handleDismiss = () => {
    setVisible(false);
    if (user) sessionStorage.setItem(SESSION_KEY, user._id);
  };

  if (!user) return null;

  const copy = ROLE_COPY[user.role] || ROLE_COPY.buyer;
  const firstName = user.name?.split(" ")[0] || "friend";

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed left-1/2 -translate-x-1/2 z-[55] transition-all duration-500 pointer-events-none"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 96px)",
        opacity: visible ? 1 : 0,
        transform: `translate(-50%, ${visible ? "0" : "-12px"})`,
      }}
    >
      <div
        className="pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-full shadow-[0_18px_44px_rgba(28,58,42,0.28)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(28,58,42,0.96) 0%, rgba(38,77,56,0.96) 100%)",
          border: "1px solid rgba(201,146,26,0.4)",
          color: "#F5EDD8",
          backdropFilter: "blur(12px) saturate(1.2)",
        }}
      >
        <Sparkles size={18} className="text-[#C9921A] flex-shrink-0" />
        <div className="flex flex-col leading-tight">
          <span
            className="text-base"
            style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
          >
            {copy.urdu}، {firstName}
          </span>
          <span className="text-xs text-[rgba(245,237,216,0.75)] uppercase tracking-[0.14em]">
            {copy.english(firstName)}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="ml-2 w-7 h-7 rounded-full grid place-items-center transition-colors"
          style={{ background: "rgba(245,237,216,0.08)", color: "rgba(245,237,216,0.7)" }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default WelcomeBanner;

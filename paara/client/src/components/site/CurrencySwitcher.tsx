import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SUPPORTED, useCurrency } from "@/lib/currency";

const META: Record<string, { flag: string; name: string }> = {
  PKR: { flag: "🇵🇰", name: "Pakistani Rupee" },
  USD: { flag: "🇺🇸", name: "US Dollar" },
  GBP: { flag: "🇬🇧", name: "British Pound" },
  AED: { flag: "🇦🇪", name: "UAE Dirham" },
  EUR: { flag: "🇪🇺", name: "Euro" },
  CAD: { flag: "🇨🇦", name: "Canadian Dollar" },
  AUD: { flag: "🇦🇺", name: "Australian Dollar" },
  SAR: { flag: "🇸🇦", name: "Saudi Riyal" },
};

export default function CurrencySwitcher() {
  const [currency, setCurrency] = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
        style={{
          background: "rgba(255,255,255,0.6)",
          border: "1.5px solid rgba(28,58,42,0.15)",
          color: "#1C3A2A",
        }}
      >
        <span>{META[currency]?.flag}</span>
        <span>{currency}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-2xl shadow-xl border border-[rgba(28,58,42,0.1)] overflow-hidden py-1">
          {SUPPORTED.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => { setCurrency(code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[#FFF8EC] transition-colors text-left"
              style={{ color: code === currency ? "#C9921A" : "#1C3A2A", fontWeight: code === currency ? 700 : 400 }}
            >
              <span>{META[code]?.flag}</span>
              <span>{code}</span>
              <span className="text-xs text-[#6B645A] ml-auto">{META[code]?.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

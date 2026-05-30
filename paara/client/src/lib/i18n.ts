import { create } from "zustand";

const LANG_KEY = "paara_lang";

type Lang = "en" | "ur";

const DICT: Record<string, Record<Lang, string>> = {
  // Nav links
  "nav.explore":         { en: "Explore",          ur: "دریافت کریں" },
  "nav.regions":         { en: "Regions",           ur: "علاقے" },
  "nav.brands":          { en: "Brands",            ur: "برانڈز" },
  "nav.heritage":        { en: "Heritage",          ur: "ورثہ" },
  "nav.signin":          { en: "Sign in",           ur: "سائن ان" },
  "nav.createAccount":   { en: "Create account",    ur: "اکاؤنٹ بنائیں" },
  "nav.heritageMap":     { en: "Heritage Map",      ur: "نقشہ" },
  // Buttons
  "btn.addToCart":       { en: "Add to cart",       ur: "ٹوکری میں ڈالیں" },
  "btn.browse":          { en: "Browse",            ur: "دیکھیں" },
  "btn.sellWithPaara":   { en: "Sell with PAARA",   ur: "PAARA کے ساتھ بیچیں" },
  "btn.explore":         { en: "Explore",           ur: "دریافت کریں" },
  "btn.exploreMap":      { en: "Explore the heritage map", ur: "نقشہ دریافت کریں" },
  // Headings
  "heading.recentlyViewed": { en: "Recently viewed", ur: "حال ہی میں دیکھے گئے" },
  "heading.exploreRegion":  { en: "Explore by Region", ur: "علاقے کے لحاظ سے دریافت کریں" },
  "heading.featured":       { en: "Pakistan's Most Celebrated", ur: "پاکستان کے مشہور دستکاری" },
  "heading.heritageMap":    { en: "Explore Pakistan's craft heritage", ur: "پاکستان کی دستکاری دریافت کریں" },
};

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: ((): Lang => {
    try {
      const v = localStorage.getItem(LANG_KEY);
      return v === "ur" ? "ur" : "en";
    } catch {
      return "en";
    }
  })(),
  setLang: (l) => {
    try { localStorage.setItem(LANG_KEY, l); } catch {}
    if (l === "ur") {
      document.body.classList.add("lang-ur");
      document.body.setAttribute("dir", "rtl");
    } else {
      document.body.classList.remove("lang-ur");
      document.body.setAttribute("dir", "ltr");
    }
    set({ lang: l });
  },
}));

export function useLang() {
  const { lang, setLang } = useLangStore();
  const t = (key: string): string => {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };
  return { lang, setLang, t };
}

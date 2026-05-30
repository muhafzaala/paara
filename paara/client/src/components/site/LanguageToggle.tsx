import { useLang } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      className="flex items-center rounded-full border overflow-hidden text-xs font-semibold select-none"
      style={{ border: "1.5px solid rgba(201,146,26,0.35)", background: "rgba(255,255,255,0.6)" }}
      role="group"
      aria-label="Language toggle"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className="px-3 py-1.5 transition-all"
        style={{
          background: lang === "en" ? "#C9921A" : "transparent",
          color: lang === "en" ? "#1C3A2A" : "#1C3A2A",
        }}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ur")}
        className="px-3 py-1.5 transition-all"
        style={{
          fontFamily: "serif",
          background: lang === "ur" ? "#C9921A" : "transparent",
          color: lang === "ur" ? "#1C3A2A" : "#1C3A2A",
        }}
        aria-pressed={lang === "ur"}
      >
        اردو
      </button>
    </div>
  );
}

export default LanguageToggle;

import { Sun, Moon, Sparkles } from "lucide-react";
import { THEMES, useTheme, type ThemeName } from "@/lib/theme";

const ICONS: Record<ThemeName, typeof Sun> = {
  cream: Sun,
  dark: Moon,
  heritage: Sparkles,
};

const LABELS: Record<ThemeName, string> = {
  cream: "Light",
  dark: "Dark",
  heritage: "Heritage",
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${LABELS[theme]} — click for ${LABELS[next]}`}
      aria-label={`Switch to ${LABELS[next]} theme`}
      className="fixed bottom-6 z-40 w-10 h-10 rounded-full grid place-items-center shadow-lg transition-all hover:-translate-y-0.5"
      style={{
        right: "5.5rem",
        background: theme === "dark" ? "#1C3A2A" : "#F5EDD8",
        color: theme === "dark" ? "#C9921A" : "#1C3A2A",
        border: "1.5px solid rgba(201,146,26,0.35)",
      }}
    >
      <Icon size={16} />
    </button>
  );
}

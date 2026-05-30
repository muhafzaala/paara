import { useState, useEffect } from "react";

export type ThemeName = "cream" | "dark" | "heritage";
export const THEMES: ThemeName[] = ["cream", "dark", "heritage"];

export function getTheme(): ThemeName {
  try { return (localStorage.getItem("paara_theme") as ThemeName) || "cream"; } catch { return "cream"; }
}

export function setTheme(name: ThemeName): void {
  try { localStorage.setItem("paara_theme", name); } catch {}
  document.documentElement.dataset.theme = name;
  window.dispatchEvent(new Event("paara:theme-change"));
}

export function useTheme(): [ThemeName, (name: ThemeName) => void] {
  const [theme, setThemeState] = useState<ThemeName>(() => getTheme());
  useEffect(() => {
    const handler = () => setThemeState(getTheme());
    window.addEventListener("paara:theme-change", handler);
    return () => window.removeEventListener("paara:theme-change", handler);
  }, []);
  return [theme, setTheme];
}

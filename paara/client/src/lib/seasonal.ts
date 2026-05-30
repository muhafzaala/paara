export type Season = "winter" | "spring" | "summer" | "monsoon" | "autumn";

export interface SeasonConfig {
  keywords: string[];
  category: string;
  en: string;
  ur: string;
}

export const SEASON_MAP: Record<Season, SeasonConfig> = {
  winter:  { keywords: ["Textile", "pashmina", "wool", "shawl"],   category: "Textile",    en: "Winter",  ur: "سرما" },
  spring:  { keywords: ["Pottery", "embroidery", "phulkari"],       category: "Pottery",    en: "Spring",  ur: "بہار" },
  summer:  { keywords: ["Cotton", "ajrak", "khussa"],               category: "Textile",    en: "Summer",  ur: "گرما" },
  monsoon: { keywords: ["Pottery", "Home Decor", "indoor"],         category: "Home Decor", en: "Monsoon", ur: "مون سون" },
  autumn:  { keywords: ["Jewelry", "lapis", "metalwork"],           category: "Jewelry",    en: "Autumn",  ur: "خزاں" },
};

export function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1; // 1-12
  if (m === 12 || m <= 2) return "winter";
  if (m <= 4)             return "spring";
  if (m <= 6)             return "summer";
  if (m <= 9)             return "monsoon";
  return "autumn";
}

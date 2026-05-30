import { useState, useEffect } from "react";

const RATES: Record<string, number> = {
  PKR: 1,
  USD: 1 / 280,
  GBP: 1 / 355,
  AED: 1 / 76,
  EUR: 1 / 305,
  CAD: 1 / 205,
  AUD: 1 / 185,
  SAR: 1 / 74.5,
};

const SYMBOLS: Record<string, string> = {
  PKR: "PKR", USD: "$", GBP: "£", AED: "د.إ",
  EUR: "€", CAD: "CA$", AUD: "A$", SAR: "﷼",
};

export const SUPPORTED = ["PKR", "USD", "GBP", "AED", "EUR", "CAD", "AUD", "SAR"];

export function getCurrency(): string {
  try { return localStorage.getItem("paara_currency") || "PKR"; } catch { return "PKR"; }
}

export function setCurrency(code: string): void {
  try { localStorage.setItem("paara_currency", code); } catch {}
  window.dispatchEvent(new Event("paara:currency-change"));
}

export function convertFromPKR(pkrAmount: number, code: string): number {
  return pkrAmount * (RATES[code] ?? 1);
}

export function formatPrice(pkrAmount: number, code: string): string {
  if (code === "PKR") return `PKR ${Math.round(pkrAmount).toLocaleString()}`;
  const converted = convertFromPKR(pkrAmount, code);
  return `${SYMBOLS[code] ?? code}${converted.toFixed(2)}`;
}

export function useCurrency(): [string, (code: string) => void] {
  const [currency, setCurrencyState] = useState<string>(() => getCurrency());
  useEffect(() => {
    const handler = () => setCurrencyState(getCurrency());
    window.addEventListener("paara:currency-change", handler);
    return () => window.removeEventListener("paara:currency-change", handler);
  }, []);
  return [currency, setCurrency];
}

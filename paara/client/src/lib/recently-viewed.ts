const KEY = "paara_recently_viewed";
const MAX = 8;

export interface RecentlyViewedProduct {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  city?: string;
}

export function addRecentlyViewed(product: RecentlyViewedProduct): void {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated = [product, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedProduct[];
  } catch {
    return [];
  }
}

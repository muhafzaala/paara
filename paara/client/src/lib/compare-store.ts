import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareProduct {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  city?: string;
  region?: string;
  category?: string;
  rating?: number;
  artisan?: string;
}

interface CompareState {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      compareItems: [],

      addToCompare: (product) => {
        const { compareItems } = get();
        if (compareItems.length >= 3 || compareItems.some((p) => p._id === product._id)) return;
        set({ compareItems: [...compareItems, product] });
      },

      removeFromCompare: (id) =>
        set((s) => ({ compareItems: s.compareItems.filter((p) => p._id !== id) })),

      clearCompare: () => set({ compareItems: [] }),

      isInCompare: (id) => get().compareItems.some((p) => p._id === id),
    }),
    { name: "paara_compare" }
  )
);

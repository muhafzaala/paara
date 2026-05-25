import { create } from "zustand";
import { persist } from "zustand/middleware";

// Normalised cart product — works with both local mock (id) and API (_id)
export type CartProduct = {
  id: string;       // always populated — either original id or _id from API
  _id?: string;
  name: string;
  artisan?: string;
  region?: string;
  city?: string;
  category?: string;
  material?: string;
  price: number;
  img?: string;
  images?: string[];
  gallery?: string[];
  story?: string;
  originStory?: string;
  details?: string;
  care?: string;
};

export type CartItem = { product: CartProduct; quantity: number };

type CartState = {
  items: CartItem[];
  add: (p: CartProduct, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
};

// Normalize any product object into a CartProduct with a reliable `id`
export const normalizeProduct = (p: any): CartProduct => ({
  ...p,
  id: p.id || p._id || "",
  img: p.img || p.images?.[0] || "",
});

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (rawProduct, qty = 1) => {
        const p = normalizeProduct(rawProduct);
        set((s) => {
          const existing = s.items.find((i) => i.product.id === p.id);
          if (existing) {
            return { items: s.items.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i) };
          }
          return { items: [...s.items, { product: p, quantity: qty }] };
        });
      },

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),

      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.product.id === id ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "paara-cart" }
  )
);

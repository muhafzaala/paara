import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { getRecentlyViewed, type RecentlyViewedProduct } from "@/lib/recently-viewed";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-6 lg:px-12 py-12">
      <div className="mx-auto max-w-[1280px]">
        <p className="eyebrow mb-3">Recently viewed</p>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {items.map((p) => (
            <Link
              key={p._id}
              to="/products/$id"
              params={{ id: p._id }}
              search={{} as any}
              className="flex-shrink-0 w-44 bg-white rounded-[16px] overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-md transition-all group"
            >
              <div className="aspect-square overflow-hidden">
                <div className="w-full h-full relative">
                  <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-display text-[#1C3A2A] line-clamp-2 leading-tight mb-1">{p.name}</p>
                {p.city && <p className="text-[10px] text-[#6B645A]">{p.city}</p>}
                <p className="text-xs font-semibold text-[#C9921A] mt-1">{formatPKR(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentlyViewed;

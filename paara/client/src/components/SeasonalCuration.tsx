import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Snowflake, Flower, Sun, CloudRain, Leaf, ArrowRight } from "lucide-react";
import { productsApi } from "@/lib/api";
import { getCurrentSeason, SEASON_MAP } from "@/lib/seasonal";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

const ICONS = { winter: Snowflake, spring: Flower, summer: Sun, monsoon: CloudRain, autumn: Leaf };

export default function SeasonalCuration() {
  const season = getCurrentSeason();
  const config = SEASON_MAP[season];
  const Icon = ICONS[season];

  const { data } = useQuery({
    queryKey: ["seasonal-products", season],
    queryFn: async () => {
      try {
        const res = await productsApi.search({ category: config.category, limit: 6, sort: "newest" });
        return res.data?.products || [];
      } catch { return []; }
    },
    staleTime: 1000 * 60 * 30,
  });

  if (!data?.length) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon size={18} className="text-[#C9921A]" />
            <p className="eyebrow !text-[#C9921A]">In Season</p>
          </div>
          <h2 className="display-serif text-3xl md:text-4xl text-[#1C3A2A]">
            Crafts for <em className="italic text-[#C9921A]">{config.en}</em>
            <span className="urdu text-xl text-[#6B645A] ml-3">{config.ur}</span>
          </h2>
        </div>
        <Link to="/products" search={{ category: config.category } as any}
          className="hidden md:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C9921A] hover:underline">
          View all <ArrowRight size={12} />
        </Link>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {data.map((p: any) => (
          <Link key={p._id} to="/products/$id" params={{ id: p._id }}
            className="snap-start shrink-0 w-52 bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-all block group">
            <div className="relative aspect-square">
              <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
            </div>
            <div className="p-3">
              <p className="font-display text-sm text-[#1C3A2A] line-clamp-1">{p.name}</p>
              <p className="text-[11px] text-[#6B645A]">{p.city}</p>
              <p className="text-sm font-semibold text-[#C9921A] mt-1">{formatPKR(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

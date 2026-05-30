import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { productsApi } from "@/lib/api";
import ProductImage from "@/components/ProductImage";

function dailyIndex(len: number): number {
  const s = new Date().toDateString();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) >>> 0;
  return h % len;
}

export default function CraftOfTheDay() {
  const { data, isLoading } = useQuery({
    queryKey: ["craft-of-the-day"],
    queryFn: async () => {
      try {
        const res = await productsApi.search({ sort: "newest", limit: 60 });
        return res.data;
      } catch { return null; }
    },
    staleTime: 1000 * 60 * 60, // 1h
  });

  const products = data?.products;
  if (isLoading || !products?.length) return null;

  const p = products[dailyIndex(products.length)];
  if (!p) return null;

  const story = p.originStory || p.description || "";
  const truncated = story.length > 280 ? story.slice(0, 280).trimEnd() + "…" : story;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="rounded-[24px] overflow-hidden bg-white border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] flex flex-col md:flex-row">
          {/* Image — 40% on desktop */}
          <div className="relative md:w-[40%] aspect-[4/3] md:aspect-auto shrink-0 bg-[#FFF8EC]">
            <ProductImage
              src={p.images?.[0]}
              alt={p.name}
              size="lg"
            />
            {/* Day badge */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1C3A2A]/90 backdrop-blur-sm">
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#C9921A]">
                Craft of the Day
              </p>
            </div>
          </div>

          {/* Text block */}
          <div className="flex flex-col justify-center p-8 md:p-10 flex-1">
            <p className="eyebrow !text-[#C9921A] mb-3">✦ Craft of the Day</p>
            <h3 className="display-serif text-2xl md:text-3xl lg:text-4xl text-[#1C3A2A] leading-tight mb-2">
              {p.name}
            </h3>
            {(p.city || p.region) && (
              <p className="text-sm text-[#6B645A] mb-4">
                {p.city || p.region}{p.category ? ` · ${p.category}` : ""}
              </p>
            )}
            {truncated && (
              <p className="text-sm text-[#3D2914] leading-relaxed mb-6 max-w-[52ch]">
                {truncated}
              </p>
            )}
            <div className="flex items-center gap-4">
              <Link to="/products/$id" params={{ id: p._id }} className="btn btn-primary">
                Discover this craft →
              </Link>
              {p.price && (
                <span className="font-display text-lg font-semibold text-[#C9921A]">
                  PKR {p.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

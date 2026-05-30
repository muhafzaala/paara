import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrency, formatPrice } from "@/lib/currency";
import ProductCardCouplet from "@/components/ProductCardCouplet";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, SlidersHorizontal, Heart, SlidersVertical } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { productsApi, wishlistApi } from "@/lib/api";
import { PRODUCTS, formatPKR } from "@/lib/products";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";
import DemoBadge from "@/components/DemoBadge";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { HoverLift, FadeIn } from "@/components/ui/Motion";
import { useCompare } from "@/lib/compare-store";

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    category: (s.category as string) || "",
    city: (s.city as string) || "",
    region: (s.region as string) || "",
    sort: (s.sort as string) || "newest",
    minPrice: (s.minPrice as string) || "",
    maxPrice: (s.maxPrice as string) || "",
  }),
  head: () => ({ meta: [{ title: "Browse Crafts · PAARA" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = useSearch({ from: "/products" });
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState(search.q);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [currency] = useCurrency();

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save to wishlist"); return; }
    try {
      if (wishlisted.has(productId)) {
        await wishlistApi.remove(productId);
        setWishlisted(prev => { const next = new Set(prev); next.delete(productId); return next; });
      } else {
        await wishlistApi.add(productId);
        setWishlisted(prev => new Set(prev).add(productId));
        toast.success("Saved to wishlist");
      }
    } catch { toast.error("Could not update wishlist"); }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products-search", search],
    queryFn: async () => {
      try { return (await productsApi.search(search)).data; } catch { return null; }
    },
  });

  // Fall back to local mock products when the API returns nothing, filtered to match active params
  const ALL_MOCKS = PRODUCTS.map((p) => ({
    _id: p.id,
    name: p.name,
    images: [p.img, ...p.gallery],
    city: p.region,
    region: p.region,
    category: p.category,
    price: p.price,
    isDemo: true,
  }));
  const useMock = !isLoading && !data?.products?.length;
  const displayProducts = useMock ? filterMocks(ALL_MOCKS, search) : (data?.products || []);
  const totalCount = useMock ? displayProducts.length : (data?.total || 0);

  const update = (patch: any) => navigate({ search: { ...search, ...patch } } as any);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Browse</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Heritage Crafts</h1>
            </div>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn btn-secondary">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </header>
          </FadeIn>

          <form onSubmit={(e) => { e.preventDefault(); update({ q }); }} className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blue pottery, ajrak, pashmina..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-[rgba(28,58,42,0.12)] text-sm focus:outline-none focus:border-[#C9921A]" />
          </form>

          <div className={`grid lg:grid-cols-[260px,1fr] gap-6 ${showFilters ? "" : "max-lg:hidden"}`}>
            <aside className="space-y-5 max-lg:bg-white max-lg:rounded-2xl max-lg:p-5">
              <FacetGroup title="Sort" current={search.sort} onChange={(v: string) => update({ sort: v })} options={[
                { v: "newest", l: "Newest" }, { v: "price_low", l: "Price: Low to High" },
                { v: "price_high", l: "Price: High to Low" }, { v: "popular", l: "Most Popular" }, { v: "rating", l: "Top Rated" },
              ]} />
              <FacetGroup title="Category" current={search.category} onChange={(v: string) => update({ category: v === search.category ? "" : v })}
                options={(data?.facets?.categories || []).map((c: any) => ({ v: c._id, l: `${c._id} (${c.count})` }))} />
              <FacetGroup title="City" current={search.city} onChange={(v: string) => update({ city: v === search.city ? "" : v })}
                options={(data?.facets?.cities || []).map((c: any) => ({ v: c._id, l: `${c._id} (${c.count})` }))} />
              <FacetGroup title="Region" current={search.region} onChange={(v: string) => update({ region: v === search.region ? "" : v })}
                options={(data?.facets?.regions || []).map((c: any) => ({ v: c._id, l: c._id }))} />
            </aside>

            <section>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#6B645A] mb-4">
                    {totalCount} product{totalCount !== 1 ? "s" : ""}
                    {useMock && <span className="ml-2 text-[#C9921A]">· Curated demo catalogue</span>}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayProducts.map((p: any) => {
                      const inCompare = isInCompare(p._id);
                      return (
                        <HoverLift key={p._id}>
                          <Link to="/products/$id" params={{ id: p._id }} search={{} as any}
                            className="group bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-all block">
                            <div className="relative aspect-square">
                              <ProductCardCouplet product={p} />
                              {p.isDemo && <DemoBadge position="top-left" />}
                              <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
                              <button
                                type="button"
                                onClick={(e) => handleWishlist(e, p._id)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center shadow-md hover:scale-110 transition-transform"
                                aria-label="Save to wishlist"
                              >
                                <Heart
                                  size={15}
                                  strokeWidth={2}
                                  fill={wishlisted.has(p._id) ? "#C9921A" : "none"}
                                  stroke={wishlisted.has(p._id) ? "#C9921A" : "#1C3A2A"}
                                />
                              </button>
                              {/* Compare toggle */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (inCompare) {
                                    removeFromCompare(p._id);
                                  } else {
                                    addToCompare({ _id: p._id, name: p.name, price: p.price, images: p.images, city: p.city, region: p.region, category: p.category });
                                  }
                                }}
                                className="absolute bottom-2 right-2 w-7 h-7 rounded-full grid place-items-center shadow-md transition-all hover:scale-110"
                                style={{ background: inCompare ? "#1C3A2A" : "rgba(255,255,255,0.9)" }}
                                aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                                title={inCompare ? "Remove from compare" : "Add to compare"}
                              >
                                <SlidersVertical size={12} style={{ color: inCompare ? "#C9921A" : "#1C3A2A" }} />
                              </button>
                            </div>
                            <div className="p-3">
                              <p className="font-display text-sm text-[#1C3A2A] line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-[#6B645A]">{p.city} · {p.region}</p>
                              <p className="text-sm font-semibold text-[#C9921A] mt-1">{formatPKR(p.price)}</p>
                              {currency !== "PKR" && p.price && (
                                <p className="text-[10px] text-[#6B645A]">{formatPrice(p.price, currency)}</p>
                              )}
                            </div>
                          </Link>
                        </HoverLift>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function filterMocks(mocks: any[], s: { q: string; city: string; region: string; category: string }) {
  return mocks.filter((p) => {
    if (s.city && !p.city.toLowerCase().includes(s.city.toLowerCase())) return false;
    if (s.region && !p.region.toLowerCase().includes(s.region.toLowerCase())) return false;
    if (s.category && p.category !== s.category) return false;
    if (s.q) {
      const ql = s.q.toLowerCase();
      if (
        !p.name.toLowerCase().includes(ql) &&
        !p.city.toLowerCase().includes(ql) &&
        !(p.region || "").toLowerCase().includes(ql) &&
        !(p.category || "").toLowerCase().includes(ql)
      ) return false;
    }
    return true;
  });
}

function FacetGroup({ title, options, current, onChange }: any) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#1C3A2A] font-bold mb-2">{title}</p>
      <ul className="space-y-1">
        {options.map((o: any) => (
          <li key={o.v}>
            <button type="button" onClick={() => onChange(o.v)}
              className={`text-xs transition-colors hover:text-[#C9921A] ${current === o.v ? "text-[#C9921A] font-bold" : "text-[#1C3A2A] font-normal"}`}>
              {o.l}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

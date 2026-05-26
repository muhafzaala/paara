import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, X, ChevronDown, Heart, Search, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PRODUCTS, REGIONS, CATEGORIES, formatPKR } from "@/lib/products";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { wishlistApi } from "@/lib/api";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>) => ({
    region: typeof search.region === "string" ? search.region : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({ meta: [{ title: "Catalogue · PAARA" }] }),
  component: ProductsPage,
});

type Sort = "newest" | "price-asc" | "price-desc" | "popular";

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRegions, setSelectedRegions] = useState<string[]>(search.region ? [search.region] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(search.category ? [search.category] : []);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  // Fetch from API; fallback to local PRODUCTS if API not available
  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedRegions, selectedCategories, maxPrice, sort, query],
    queryFn: async () => {
      try {
        const params: Record<string, string | number | undefined> = { sort, maxPrice, limit: 50 };
        if (selectedRegions.length === 1) params.city = selectedRegions[0];
        if (selectedCategories.length === 1) params.category = selectedCategories[0];
        if (query) params.search = query;
        const res = await productsApi.getAll(params);
        return res.data.products;
      } catch {
        // Fallback to local mock data
        return null;
      }
    },
    staleTime: 30000,
  });

  // If API returns data use it; otherwise fall back to local filtering
  const filtered = useMemo(() => {
    const source = data || PRODUCTS.map(p => ({
      _id: p.id, id: p.id, name: p.name, artisan: p.artisan, city: p.region, category: p.category,
      material: p.material, price: p.price, images: [p.img], originStory: p.story, seller: { name: p.artisan, shopName: p.artisan },
    }));

    return (source as any[]).filter((p) => {
      const region = p.city || p.region || "";
      if (selectedRegions.length && !selectedRegions.some(r => region.toLowerCase().includes(r.toLowerCase()))) return false;
      if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (query && !`${p.name} ${p.artisan || ""} ${region}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "popular") return (b.numSold || 0) - (a.numSold || 0);
      return 0;
    });
  }, [data, selectedRegions, selectedCategories, maxPrice, sort, query]);

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => { setSelectedRegions([]); setSelectedCategories([]); setMaxPrice(20000); setQuery(""); };

  const handleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to save to wishlist"); navigate({ to: "/login" }); return; }
    try {
      await wishlistApi.add(productId);
      setWishlistedIds(prev => new Set([...prev, productId]));
      toast.success("Added to wishlist");
    } catch { toast.error("Could not add to wishlist"); }
  };

  const activeChips = [
    ...selectedRegions.map((r) => ({ label: r, clear: () => toggle(selectedRegions, r, setSelectedRegions) })),
    ...selectedCategories.map((c) => ({ label: c, clear: () => toggle(selectedCategories, c, setSelectedCategories) })),
  ];

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <section className="pt-32 pb-10 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow mb-3">The Catalogue</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-4xl md:text-6xl max-w-[20ch] leading-[1.05]">
              Every piece, <em className="italic text-[#C9921A]">hand-checked</em> in person.
            </h1>
            <p className="text-[#3D2914] max-w-md leading-relaxed">
              {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"} from ${new Set(filtered.map((p: any) => p.artisan || p.seller?.name)).size} artisans.`}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside className="hidden lg:block">
            <FilterSidebar query={query} setQuery={setQuery}
              selectedRegions={selectedRegions} toggleRegion={(r) => toggle(selectedRegions, r, setSelectedRegions)}
              selectedCategories={selectedCategories} toggleCategory={(c) => toggle(selectedCategories, c, setSelectedCategories)}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice} clearAll={clearAll} />
          </aside>

          <main>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {activeChips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1C3A2A] text-[#F5EDD8]">
                    {c.label}<button onClick={c.clear}><X size={12} /></button>
                  </span>
                ))}
                {activeChips.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-[#C9921A] font-semibold hover:underline">Clear all</button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-[rgba(28,58,42,0.18)] bg-white">
                  <Filter size={14} /> Filters
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-[rgba(28,58,42,0.18)] bg-white focus:outline-none focus:border-[#C9921A]">
                  <option value="newest">Newest</option>
                  <option value="popular">Most popular</option>
                  <option value="price-asc">Price: low → high</option>
                  <option value="price-desc">Price: high → low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-[20px] bg-white overflow-hidden animate-pulse">
                    <div className="h-56 bg-[rgba(28,58,42,0.08)]" />
                    <div className="p-5 space-y-2">
                      <div className="h-3 w-16 rounded bg-[rgba(28,58,42,0.08)]" />
                      <div className="h-5 w-full rounded bg-[rgba(28,58,42,0.08)]" />
                      <div className="h-4 w-24 rounded bg-[rgba(28,58,42,0.08)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="display-serif text-2xl text-[#1C3A2A] mb-4">No pieces found</p>
                <button onClick={clearAll} className="btn btn-outline-forest">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                {filtered.map((p: any) => {
                  const id = p._id || p.id;
                  const img = p.images?.[0] || p.img;
                  const region = p.city || p.region;
                  const artisan = p.artisan || p.seller?.shopName || p.seller?.name;
                  const wishlisted = wishlistedIds.has(id);
                  return (
                    <Link key={id} to="/products/$id" params={{ id }} className="paara-card block group">
                      <div className="img-wrap relative">
                        <ProductImage src={img} alt={p.name} size="md" />
                        {p.isHeritageVerified && (
                          <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] bg-[#C9921A] text-[#1C3A2A]">
                            Heritage ✓
                          </span>
                        )}
                        <button onClick={(e) => handleWishlist(id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center bg-white shadow-sm transition-all hover:scale-110"
                          aria-label="Wishlist">
                          <Heart size={14} fill={wishlisted ? "#C9921A" : "none"} className={wishlisted ? "text-[#C9921A]" : "text-[#1C3A2A]"} />
                        </button>
                      </div>
                      <div className="p-5">
                        <p className="eyebrow mb-2">{region}</p>
                        <h3 className="display-serif text-lg text-[#1C3A2A] leading-tight mb-1 line-clamp-2">{p.name}</h3>
                        <p className="text-xs text-[#6B645A] mb-3">{artisan}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xl font-semibold text-[#C9921A]">{formatPKR(p.price)}</span>
                          <span className="text-xs uppercase tracking-[0.12em] font-semibold text-[#1C3A2A] group-hover:text-[#C9921A] transition-colors">View →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#F5EDD8] p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between mb-6">
              <p className="display-serif text-xl">Filters</p>
              <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            <FilterSidebar query={query} setQuery={setQuery}
              selectedRegions={selectedRegions} toggleRegion={(r) => toggle(selectedRegions, r, setSelectedRegions)}
              selectedCategories={selectedCategories} toggleCategory={(c) => toggle(selectedCategories, c, setSelectedCategories)}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice} clearAll={clearAll} />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function FilterSidebar({ query, setQuery, selectedRegions, toggleRegion, selectedCategories, toggleCategory, maxPrice, setMaxPrice, clearAll }: any) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] sticky top-28 space-y-6">
      <div>
        <label className="eyebrow block mb-3">Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B645A]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, artisan, region…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full border border-[rgba(28,58,42,0.18)] focus:outline-none focus:border-[#C9921A] bg-[#FFF8EC]" />
        </div>
      </div>
      <div>
        <label className="eyebrow block mb-3">Region</label>
        <div className="space-y-2">
          {REGIONS.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={selectedRegions.includes(r)} onChange={() => toggleRegion(r)} className="accent-[#C9921A]" />
              <span className={selectedRegions.includes(r) ? "text-[#1C3A2A] font-semibold" : "text-[#6B645A]"}>{r}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="eyebrow block mb-3">Category</label>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={selectedCategories.includes(c)} onChange={() => toggleCategory(c)} className="accent-[#C9921A]" />
              <span className={selectedCategories.includes(c) ? "text-[#1C3A2A] font-semibold" : "text-[#6B645A]"}>{c}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="eyebrow block mb-3">Max price: {formatPKR(maxPrice)}</label>
        <input type="range" min={500} max={25000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#C9921A]" />
        <div className="flex justify-between text-xs text-[#6B645A] mt-1"><span>PKR 500</span><span>PKR 25,000</span></div>
      </div>
      {(selectedRegions.length > 0 || selectedCategories.length > 0) && (
        <button onClick={clearAll} className="w-full text-sm text-[#C9921A] font-semibold py-2 rounded-full border border-[rgba(201,146,26,0.3)] hover:bg-[#FFF8EC] transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );
}

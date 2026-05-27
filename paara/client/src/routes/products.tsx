import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { productsApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";
import DemoBadge from "@/components/DemoBadge";

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
  const [q, setQ] = useState(search.q);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products-search", search],
    queryFn: async () => (await productsApi.search(search)).data,
  });

  const update = (patch: any) => navigate({ search: { ...search, ...patch } } as any);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Browse</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Heritage Crafts</h1>
            </div>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn btn-secondary">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </header>

          <form onSubmit={(e) => { e.preventDefault(); update({ q }); }} className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blue pottery, ajrak, pashmina..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-[rgba(28,58,42,0.12)] text-sm focus:outline-none focus:border-[#C9921A]" />
          </form>

          <div className={`grid lg:grid-cols-[260px,1fr] gap-6 ${showFilters ? "" : "max-lg:hidden"}`}>
            <aside className="space-y-5 max-lg:bg-white max-lg:rounded-2xl max-lg:p-5">
              <FacetGroup title="Sort" current={search.sort} onChange={(v) => update({ sort: v })} options={[
                { v: "newest", l: "Newest" }, { v: "price_low", l: "Price: Low to High" },
                { v: "price_high", l: "Price: High to Low" }, { v: "popular", l: "Most Popular" }, { v: "rating", l: "Top Rated" },
              ]} />
              <FacetGroup title="Category" current={search.category} onChange={(v) => update({ category: v === search.category ? "" : v })}
                options={(data?.facets?.categories || []).map((c: any) => ({ v: c._id, l: `${c._id} (${c.count})` }))} />
              <FacetGroup title="City" current={search.city} onChange={(v) => update({ city: v === search.city ? "" : v })}
                options={(data?.facets?.cities || []).map((c: any) => ({ v: c._id, l: `${c._id} (${c.count})` }))} />
              <FacetGroup title="Region" current={search.region} onChange={(v) => update({ region: v === search.region ? "" : v })}
                options={(data?.facets?.regions || []).map((c: any) => ({ v: c._id, l: c._id }))} />
            </aside>

            <section>
              {isLoading ? <Loader2 className="animate-spin text-[#C9921A] mx-auto" size={32} /> : (
                <>
                  <p className="text-xs text-[#6B645A] mb-4">{data?.total || 0} products</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.products?.map((p: any) => (
                      <Link key={p._id} to="/products/$id" params={{ id: p._id }}
                        className="group bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-all">
                        <div className="relative aspect-square">
                          {p.isDemo && <DemoBadge position="top-left" />}
                          <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
                        </div>
                        <div className="p-3">
                          <p className="font-display text-sm text-[#1C3A2A] line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-[#6B645A]">{p.city} · {p.region}</p>
                          <p className="text-sm font-semibold text-[#C9921A] mt-1">{formatPKR(p.price)}</p>
                        </div>
                      </Link>
                    ))}
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

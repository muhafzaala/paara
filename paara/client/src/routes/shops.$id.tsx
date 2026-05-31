import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, Award, Star, Package } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { sellerApi } from "@/lib/api";
import ProductImage from "@/components/ProductImage";
import DemoBadge from "@/components/DemoBadge";
import { formatPKR } from "@/lib/products";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { FadeIn } from "@/components/ui/Motion";
import MadeInStamp from "@/components/MadeInStamp";

export const Route = createFileRoute("/shops/$id")({
  head: () => ({ meta: [{ title: "Artisan Shop · PAARA" }] }),
  component: ShopPage,
});

function ShopPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["shop", id],
    queryFn: async () => (await sellerApi.getPublicShop(id)).data,
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="h-48 rounded-2xl bg-[#1C3A2A] animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
  if (!data?.seller) return <div className="min-h-screen bg-[#F5EDD8] grid place-items-center text-[#1C3A2A]">Shop not found</div>;

  const { seller, products, stats } = data;
  const accent = seller.accentColor || "#C9921A";

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <FadeIn>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-[#1C3A2A]">
        {seller.shopBanner && <img src={seller.shopBanner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A2A] via-[#1C3A2A]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-10">
          <div className="mx-auto max-w-[1200px]">
            <p className="eyebrow" style={{ color: accent }}>Heritage Artisan</p>
            <div className="flex items-center gap-4 mt-2">
              <h1 className="display-serif text-4xl md:text-6xl text-[#F5EDD8]">{seller.shopName}</h1>
              {seller.city && <MadeInStamp city={seller.city} size="sm" />}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#F5EDD8]/80">
              {seller.city && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {seller.city}, {seller.region}</span>}
              {seller.yearEstablished && <span className="inline-flex items-center gap-1"><Calendar size={14} /> Est. {seller.yearEstablished}</span>}
              {seller.verificationStatus === "approved" && <span className="inline-flex items-center gap-1" style={{ color: accent }}><Award size={14} /> Verified</span>}
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <div className="px-6 lg:px-12 py-12">
        <div className="mx-auto max-w-[1200px] grid lg:grid-cols-[1fr,2fr] gap-12">
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-2">Our Story</p>
              <p className="text-sm text-[#1C3A2A] leading-relaxed">{seller.shopStory || seller.shopDescription || "—"}</p>
            </div>

            {seller.craftSpecialties?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
                <p className="eyebrow mb-3">Crafts</p>
                <div className="flex flex-wrap gap-2">
                  {seller.craftSpecialties.map((c: string) => (
                    <span key={c} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF8EC] text-[#1C3A2A] border border-[rgba(28,58,42,0.1)]">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {seller.heritageBadges?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
                <p className="eyebrow mb-3">Badges</p>
                <div className="space-y-2">
                  {seller.heritageBadges.map((b: string) => (
                    <div key={b} className="flex items-center gap-2 text-sm text-[#1C3A2A]">
                      <Award size={14} className="text-[#C9921A]" />
                      <span className="capitalize">{b.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)] grid grid-cols-2 gap-4 text-center">
              <div><p className="display-serif text-2xl" style={{ color: accent }}>{stats?.totalProducts || 0}</p><p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">Products</p></div>
              <div><p className="display-serif text-2xl" style={{ color: accent }}>{stats?.totalSold || 0}</p><p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">Sold</p></div>
              <div><p className="display-serif text-2xl" style={{ color: accent }}>{stats?.avgRating || 0}<Star size={12} className="inline" style={{ fill: accent }} /></p><p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">Rating</p></div>
              <div><p className="display-serif text-2xl" style={{ color: accent }}>{stats?.totalReviews || 0}</p><p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">Reviews</p></div>
            </div>
          </aside>

          <section>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="display-serif text-3xl text-[#1C3A2A]">Collection</h2>
              <span className="text-sm text-[#6B645A]">{products?.length || 0} items</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products?.map((p: any) => (
                <Link key={p._id} to="/products/$id" params={{ id: p._id }} search={{} as any}
                  className="bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-all">
                  <div className="relative aspect-square">
                    {p.isDemo && <DemoBadge position="top-left" />}
                    <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm text-[#1C3A2A] line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-[#6B645A]">{p.city}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: accent }}>{formatPKR(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

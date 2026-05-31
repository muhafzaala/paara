import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Eye, ArrowLeft, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { heritageApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/heritage/$id")({
  head: () => ({ meta: [{ title: "Heritage Story · PAARA" }] }),
  component: StoryPage,
});

function StoryPage() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["heritage-story", id],
    queryFn: async () => {
      const res = await heritageApi.getOne(id);
      return res.data.story;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EDD8] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C9921A]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5EDD8] grid place-items-center">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-[#C9921A] mb-4 opacity-40" />
          <h2 className="display-serif text-3xl text-[#1C3A2A] mb-4">Story not found</h2>
          <Link to="/heritage" className="btn btn-primary">Back to Heritage</Link>
        </div>
      </div>
    );
  }

  const s = data;
  const allImages = [s.coverImage, ...(s.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />

      {/* Cover hero */}
      <div className="relative pt-24 min-h-[60vh] bg-[#0F2219] flex items-end overflow-hidden">
        {s.coverImage && (
          <img src={s.coverImage} alt={s.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2219] via-[rgba(15,34,25,0.4)] to-transparent" />
        <div className="relative mx-auto max-w-[900px] px-6 lg:px-12 pb-14 w-full">
          <Link to="/heritage" className="inline-flex items-center gap-2 text-[rgba(245,237,216,0.6)] text-sm mb-8 hover:text-[#C9921A] transition-colors">
            <ArrowLeft size={14} /> All Stories
          </Link>
          <div className="flex items-center gap-3 mb-5">
            {s.region && (
              <span className="px-3 py-1 rounded-full bg-[#C9921A] text-[#1C3A2A] text-xs font-bold">{s.region}</span>
            )}
            {s.craft && (
              <span className="px-3 py-1 rounded-full border border-[rgba(201,146,26,0.5)] text-[#C9921A] text-xs font-bold">{s.craft}</span>
            )}
          </div>
          <h1 className="display-serif text-4xl lg:text-6xl text-[#F5EDD8] leading-tight mb-5 max-w-[22ch]">{s.title}</h1>
          {s.excerpt && (
            <p className="text-[rgba(245,237,216,0.75)] text-lg leading-relaxed max-w-[60ch] mb-6">{s.excerpt}</p>
          )}
          <div className="flex items-center gap-5 text-sm text-[rgba(245,237,216,0.6)]">
            {(s.seller?.shopName || s.seller?.name) && (
              <span className="flex items-center gap-1.5 font-medium text-[#F5EDD8]">
                <MapPin size={13} className="text-[#C9921A]" />
                {s.seller.shopName || s.seller.name}
              </span>
            )}
            {s.views > 0 && (
              <span className="flex items-center gap-1"><Eye size={13} /> {s.views} reads</span>
            )}
            <span>{new Date(s.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[900px] px-6 lg:px-12 py-14">
        {s.body && (
          <div className="prose prose-lg max-w-none mb-14">
            {s.body.split("\n\n").filter(Boolean).map((para: string, i: number) => (
              <p key={i} className="text-[#1C3A2A] font-medium leading-[1.9] text-[1.0625rem] mb-6">{para}</p>
            ))}
          </div>
        )}

        {/* Additional image gallery */}
        {allImages.length > 1 && (
          <div className="mb-14">
            <p className="eyebrow mb-5">From the atelier</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allImages.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-[16px] overflow-hidden bg-[#1C3A2A]">
                  <img src={img} alt={`Story image ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked product */}
        {s.product && (
          <div className="mb-14 p-6 bg-white rounded-[20px] border border-[rgba(28,58,42,0.1)] flex items-center gap-5">
            {s.product.images?.[0] && (
              <img src={s.product.images[0]} alt={s.product.name}
                className="w-20 h-20 rounded-[12px] object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C9921A] mb-1">Featured piece</p>
              <p className="font-display font-semibold text-[#1C3A2A] text-lg line-clamp-1">{s.product.name}</p>
              {s.product.price && (
                <p className="text-[#C9921A] font-semibold text-sm mt-0.5">{formatPKR(s.product.price)}</p>
              )}
            </div>
            <Link to="/products/$id" params={{ id: s.product._id }} search={{} as any}
              className="btn btn-primary flex-shrink-0 flex items-center gap-2 !py-3 !px-5">
              View <ExternalLink size={14} />
            </Link>
          </div>
        )}

        {/* Artisan bio footer */}
        {s.seller && (
          <div className="pt-10 border-t border-[rgba(28,58,42,0.12)] flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#1C3A2A] grid place-items-center text-[#F5EDD8] font-bold text-lg flex-shrink-0">
              {(s.seller.shopName || s.seller.name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B645A] mb-0.5">Story by</p>
              <p className="font-display font-semibold text-[#1C3A2A] text-lg">{s.seller.shopName || s.seller.name}</p>
              {s.seller.city && <p className="text-sm text-[#6B645A]">{s.seller.city}</p>}
            </div>
          </div>
        )}

        <div className="mt-14 pt-8 border-t border-[rgba(28,58,42,0.1)]">
          <Link to="/heritage" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9921A] hover:gap-3 transition-all">
            <ArrowLeft size={14} /> More heritage stories
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

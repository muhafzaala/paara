import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Share2, Truck, Shield, RotateCcw, ChevronDown, Plus, Minus, ArrowRight, Check, Loader2, Star, MessageCircle } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { getProduct, formatPKR } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { productsApi, reviewsApi, cartApi, wishlistApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToCartLocal = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [askingQ, setAskingQ] = useState(false);

  // Fetch from API; fallback to local mock
  const { data: apiProduct, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        const res = await productsApi.getOne(id);
        return res.data.product;
      } catch { return null; }
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      try {
        const res = await reviewsApi.getForProduct(id);
        return res.data.reviews;
      } catch { return []; }
    },
  });

  // Use API data or fallback to local mock
  const mockProduct = getProduct(id);
  const p = apiProduct ? {
    _id: apiProduct._id,
    name: apiProduct.name,
    artisan: apiProduct.artisan || apiProduct.seller?.shopName || apiProduct.seller?.name,
    region: apiProduct.city || apiProduct.region,
    category: apiProduct.category,
    material: apiProduct.material,
    price: apiProduct.price,
    img: apiProduct.images?.[0],
    gallery: apiProduct.images || [],
    story: apiProduct.originStory,
    details: apiProduct.details,
    care: apiProduct.care,
    isHeritageVerified: apiProduct.isHeritageVerified,
    rating: apiProduct.rating,
    numReviews: apiProduct.numReviews,
    seller: apiProduct.seller,
    questions: apiProduct.questions || [],
    stock: apiProduct.stock,
  } : mockProduct ? {
    _id: mockProduct.id,
    name: mockProduct.name,
    artisan: mockProduct.artisan,
    region: mockProduct.region,
    category: mockProduct.category,
    material: mockProduct.material,
    price: mockProduct.price,
    img: mockProduct.img,
    gallery: mockProduct.gallery,
    story: mockProduct.story,
    details: mockProduct.details,
    care: mockProduct.care,
    isHeritageVerified: false,
    rating: 4.5,
    numReviews: 0,
    seller: null,
    questions: [],
    stock: 10,
  } : null;

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5EDD8] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#C9921A]" />
    </div>
  );

  if (!p) return (
    <div className="min-h-screen bg-[#F5EDD8] grid place-items-center">
      <div className="text-center">
        <h2 className="display-serif text-3xl text-[#1C3A2A] mb-4">Product not found</h2>
        <Link to="/products" className="btn btn-primary">Browse the catalogue</Link>
      </div>
    </div>
  );

  const galleryImages = p.gallery?.length > 0 ? p.gallery : [p.img];

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      if (user) {
        await cartApi.add(p._id, qty);
      }
      addToCartLocal({ id: p._id, name: p.name, artisan: p.artisan, region: p.region, category: p.category, material: p.material, price: p.price, img: galleryImages[0], gallery: galleryImages, story: p.story || "", details: p.details || "", care: p.care || "" } as any, qty);
      toast.success(`${p.name} added to cart`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error("Sign in to save to wishlist"); navigate({ to: "/login" }); return; }
    try {
      await wishlistApi.add(p._id);
      setWishlisted(true);
      toast.success("Saved to wishlist");
    } catch { toast.error("Could not add to wishlist"); }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to ask a question"); navigate({ to: "/login" }); return; }
    if (!question.trim()) return;
    setAskingQ(true);
    try {
      await productsApi.askQuestion(p._id, question);
      setQuestion("");
      toast.success("Question submitted! The artisan will respond soon.");
    } catch { toast.error("Could not submit question"); } finally { setAskingQ(false); }
  };

  const avgRating = reviews?.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : p.rating;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <nav className="flex items-center gap-2 text-xs text-[#6B645A] mb-8">
            <Link to="/" className="hover:text-[#C9921A]">Home</Link><span>/</span>
            <Link to="/products" className="hover:text-[#C9921A]">Catalogue</Link><span>/</span>
            <span className="text-[#1C3A2A] font-medium">{p.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-16">
            {/* Gallery */}
            <div>
              <div className="aspect-square rounded-[24px] overflow-hidden mb-4 bg-[#FFF8EC] relative">
                <ProductImage src={galleryImages[activeImg]} alt={p.name} size="lg" className="transition-opacity duration-500" />
                {p.isHeritageVerified && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9921A] text-[#1C3A2A] text-xs font-bold">
                    <Shield size={12} /> Heritage Verified
                  </div>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.slice(0, 4).map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className="aspect-square rounded-[12px] overflow-hidden border-2 transition-all"
                      style={{ borderColor: activeImg === i ? "#C9921A" : "transparent" }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <p className="eyebrow mb-3">{p.region} · {p.category}</p>
              <h1 className="display-serif text-3xl md:text-4xl lg:text-5xl text-[#1C3A2A] leading-tight mb-3">{p.name}</h1>
              {avgRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(avgRating) ? "#C9921A" : "none"} className="text-[#C9921A]" />)}
                  <span className="text-xs text-[#6B645A]">({reviews?.length || p.numReviews} reviews)</span>
                </div>
              )}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-4xl font-semibold text-[#C9921A]">{formatPKR(p.price)}</span>
              </div>

              {/* Artisan card */}
              {p.artisan && (
                <div className="flex items-center gap-4 p-4 rounded-[16px] bg-white border border-[rgba(28,58,42,0.08)] mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#1C3A2A] grid place-items-center text-[#F5EDD8] font-semibold text-sm flex-shrink-0">
                    {(p.artisan as string).split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs text-[#6B645A] uppercase tracking-[0.12em]">Made by</p>
                    <p className="font-display font-semibold text-[#1C3A2A]">{p.artisan}</p>
                    <p className="text-xs text-[#6B645A]">{p.region}</p>
                  </div>
                  {p.isHeritageVerified && (
                    <div className="ml-auto px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.12em] bg-[rgba(201,146,26,0.12)] text-[#C9921A]">Verified</div>
                  )}
                </div>
              )}

              {/* Qty + add to cart */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center rounded-full border border-[rgba(28,58,42,0.18)] bg-white overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center hover:bg-[#FFF8EC]"><Minus size={14} /></button>
                  <span className="w-10 text-center font-semibold text-[#1C3A2A]">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center hover:bg-[#FFF8EC]"><Plus size={14} /></button>
                </div>
                <button onClick={handleAddToCart} disabled={adding} className="btn btn-primary flex-1 !py-4 disabled:opacity-60">
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Add to cart</>}
                </button>
              </div>

              <div className="flex gap-3 mb-8">
                <button onClick={handleWishlist}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-[rgba(28,58,42,0.18)] bg-white text-sm font-semibold hover:bg-[#FFF8EC] transition-colors"
                  style={{ color: wishlisted ? "#C9921A" : "#1C3A2A" }}>
                  <Heart size={16} fill={wishlisted ? "#C9921A" : "none"} /> {wishlisted ? "Saved" : "Save"}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-[rgba(28,58,42,0.18)] bg-white text-sm font-semibold hover:bg-[#FFF8EC] transition-colors">
                  <Share2 size={16} /> Share
                </button>
              </div>

              {/* Details accordion */}
              <div className="space-y-3">
                {p.material && <DetailRow label="Material" value={p.material} />}
                {p.story && <DetailRow label="The story" value={p.story} />}
                {p.details && <DetailRow label="Details" value={p.details} />}
                {p.care && <DetailRow label="Care" value={p.care} />}
              </div>

              <div className="mt-6 pt-6 border-t border-[rgba(28,58,42,0.1)] grid grid-cols-3 gap-3 text-center text-xs text-[#6B645A]">
                <div className="flex flex-col items-center gap-1"><Truck size={16} className="text-[#C9921A]" />Free over PKR 10,000</div>
                <div className="flex flex-col items-center gap-1"><Shield size={16} className="text-[#C9921A]" />Authenticity guaranteed</div>
                <div className="flex flex-col items-center gap-1"><RotateCcw size={16} className="text-[#C9921A]" />7-day returns</div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <section className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Reviews</p>
                <h2 className="display-serif text-3xl text-[#1C3A2A]">What buyers say</h2>
              </div>
            </div>
            {reviews?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reviews.map((r: any) => (
                  <div key={r._id} className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)]">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? "#C9921A" : "none"} className="text-[#C9921A]" />)}
                      {r.isVerifiedPurchase && <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-[#C9921A]">Verified</span>}
                    </div>
                    {r.title && <p className="font-semibold text-[#1C3A2A] mb-1 text-sm">{r.title}</p>}
                    <p className="text-sm text-[#3D2914] leading-relaxed mb-3">{r.comment}</p>
                    <p className="text-xs text-[#6B645A]">{r.user?.name || "Anonymous"}</p>
                    {r.sellerReply?.text && (
                      <div className="mt-3 pt-3 border-t border-[rgba(28,58,42,0.08)]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9921A] mb-1">Artisan reply</p>
                        <p className="text-xs text-[#3D2914]">{r.sellerReply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B645A]">No reviews yet — be the first to share your experience.</p>
            )}
          </section>

          {/* Q&A */}
          <section className="mt-16">
            <p className="eyebrow mb-2">Questions & Answers</p>
            <h2 className="display-serif text-3xl text-[#1C3A2A] mb-6">Ask the artisan</h2>
            {p.questions?.filter((q: any) => q.answer).map((q: any, i: number) => (
              <div key={i} className="mb-4 p-5 bg-white rounded-[16px] border border-[rgba(28,58,42,0.08)]">
                <div className="flex items-start gap-2 mb-2">
                  <MessageCircle size={14} className="text-[#C9921A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold text-[#1C3A2A]">{q.question}</p>
                </div>
                <p className="text-sm text-[#3D2914] pl-5 leading-relaxed">{q.answer}</p>
              </div>
            ))}
            <form onSubmit={handleAskQuestion} className="mt-4 flex gap-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder={user ? "Ask the artisan anything…" : "Sign in to ask a question"}
                disabled={!user} className="flex-1 bg-white border border-[rgba(28,58,42,0.18)] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#C9921A] disabled:opacity-50" />
              <button type="submit" disabled={!user || askingQ || !question.trim()} className="btn btn-primary disabled:opacity-50">
                {askingQ ? <Loader2 size={14} className="animate-spin" /> : "Ask"}
              </button>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(label === "The story");
  return (
    <div className="border border-[rgba(28,58,42,0.12)] rounded-[12px] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C3A2A]">{label}</span>
        <ChevronDown size={16} className={`text-[#6B645A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-[#3D2914] leading-relaxed">{value}</div>}
    </div>
  );
}

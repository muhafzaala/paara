import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { wishlistApi, cartApi } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { formatPKR } from "@/lib/products";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addToCartLocal = useCart((s) => s.add);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["public-wishlist"],
    queryFn: async () => {
      if (!user) return null;
      try { return (await wishlistApi.get()).data.wishlist; } catch { return null; }
    },
    enabled: !!user,
  });

  const items = data?.items?.filter((i: any) => i.product) || [];

  const handleRemove = async (productId: string) => {
    try { await wishlistApi.remove(productId); refetch(); toast.success("Removed"); }
    catch { toast.error("Could not remove"); }
  };

  const handleAddToCart = async (item: any) => {
    const p = item.product;
    try {
      if (user) await cartApi.add(p._id, 1);
      addToCartLocal({ id: p._id, name: p.name, artisan: "", region: p.city || "", category: p.category, material: "", price: p.price, img: p.images?.[0] || "", gallery: [], story: "", details: "", care: "" } as any, 1);
      toast.success("Added to cart");
    } catch { toast.error("Could not add to cart"); }
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <p className="eyebrow mb-3">Saved</p>
          <h1 className="display-serif text-4xl md:text-6xl text-[#1C3A2A] mb-12 leading-tight">Your wishlist</h1>

          {!user ? (
            <div className="text-center py-20 bg-white rounded-[24px] border border-[rgba(28,58,42,0.08)]">
              <Heart size={48} className="text-[rgba(28,58,42,0.15)] mx-auto mb-6" />
              <h2 className="display-serif text-3xl text-[#1C3A2A] mb-3">Sign in to see your wishlist</h2>
              <p className="text-[#6B645A] mb-8 max-w-sm mx-auto">Your saved pieces live here — sign in to access them from any device.</p>
              <button onClick={() => navigate({ to: "/login" })} className="btn btn-primary">Sign in</button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-[20px] bg-white h-64 animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[24px] border border-[rgba(28,58,42,0.08)]">
              <Heart size={48} className="text-[rgba(28,58,42,0.15)] mx-auto mb-6" />
              <h2 className="display-serif text-3xl text-[#1C3A2A] mb-3">Nothing saved yet</h2>
              <Link to="/products" search={{} as any} className="btn btn-primary">Explore the catalogue</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map((item: any) => {
                const p = item.product;
                return (
                  <div key={p._id} className="paara-card">
                    <Link to="/products/$id" params={{ id: p._id }} search={{} as any} className="block">
                      <div className="img-wrap"><ProductImage src={p.images?.[0]} alt={p.name} size="md" /></div>
                    </Link>
                    <div className="p-5">
                      <p className="eyebrow mb-1">{p.city}</p>
                      <Link to="/products/$id" params={{ id: p._id }} search={{} as any}>
                        <h3 className="display-serif text-base text-[#1C3A2A] leading-tight mb-2 hover:text-[#C9921A]">{p.name}</h3>
                      </Link>
                      <p className="font-display text-lg text-[#C9921A] font-semibold mb-3">{formatPKR(p.price)}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAddToCart(item)} className="flex-1 btn btn-primary !py-2 text-xs flex items-center justify-center gap-1">
                          <ShoppingCart size={12} /> Add to cart
                        </button>
                        <button onClick={() => handleRemove(p._id)} className="w-9 h-9 rounded-full border border-[rgba(139,26,26,0.15)] grid place-items-center text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)]">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

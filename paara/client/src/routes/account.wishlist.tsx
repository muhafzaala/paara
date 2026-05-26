import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { wishlistApi, cartApi } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { formatPKR } from "@/lib/products";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";
import DemoBadge from "@/components/DemoBadge";

export const Route = createFileRoute("/account/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const qc = useQueryClient();
  const addToCartLocal = useCart((s) => s.add);

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => { try { return (await wishlistApi.get()).data.wishlist; } catch { return null; } },
  });

  const items = data?.items?.filter((i: any) => i.product?.isActive !== false) || [];

  const handleRemove = async (productId: string) => {
    try { await wishlistApi.remove(productId); qc.invalidateQueries({ queryKey: ["wishlist"] }); toast.success("Removed from wishlist"); }
    catch { toast.error("Could not remove item"); }
  };

  const handleAddToCart = async (item: any) => {
    try {
      await cartApi.add(item.product._id, 1);
      addToCartLocal({ id: item.product._id, name: item.product.name, artisan: "", region: "", category: "", material: "", price: item.product.price, img: item.product.images?.[0] || "", gallery: [], story: "", details: "", care: "" } as any, 1);
      toast.success("Added to cart");
    } catch { toast.error("Could not add to cart"); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Saved</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Your wishlist</h1>
      </header>

      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
            <Heart size={40} className="text-[rgba(28,58,42,0.2)] mx-auto mb-4" />
            <p className="display-serif text-xl text-[#1C3A2A] mb-2">Nothing saved yet</p>
            <Link to="/products" className="btn btn-primary">Browse the catalogue</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item: any) => {
              const p = item.product;
              if (!p) return null;
              return (
                <div key={p._id} className="bg-white rounded-[20px] overflow-hidden border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                  <Link to="/products/$id" params={{ id: p._id }} className="relative block aspect-[4/3] overflow-hidden">
                    {p.isDemo && <DemoBadge position="top-left" />}
                    <ProductImage src={p.images?.[0]} alt={p.name} size="md" className="hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-4">
                    <p className="eyebrow mb-1">{p.city}</p>
                    <Link to="/products/$id" params={{ id: p._id }}>
                      <h3 className="display-serif text-lg text-[#1C3A2A] leading-tight mb-1 hover:text-[#C9921A] transition-colors">{p.name}</h3>
                    </Link>
                    <p className="font-display text-lg font-semibold text-[#C9921A] mb-3">{formatPKR(p.price)}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddToCart(item)} className="flex-1 btn btn-primary !py-2.5 text-xs flex items-center justify-center gap-1">
                        <ShoppingCart size={12} /> Add to cart
                      </button>
                      <button onClick={() => handleRemove(p._id)} className="w-10 h-10 rounded-full border border-[rgba(139,26,26,0.2)] grid place-items-center text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

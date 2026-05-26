import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, X, ArrowRight, ShoppingBag, Tag, Loader2, Gift } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart-store";
import { formatPKR } from "@/lib/products";
import { couponsApi, cartApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart · PAARA" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promo, setPromo] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [syncingWithBackend, setSyncingWithBackend] = useState(false);

  // On mount, if logged in: sync local cart to backend
  useEffect(() => {
    if (!user || items.length === 0) return;
    const syncCart = async () => {
      setSyncingWithBackend(true);
      try {
        // Merge: add each local item to backend cart
        for (const item of items) {
          await cartApi.add(item.product.id, item.quantity).catch(() => {});
        }
      } finally {
        setSyncingWithBackend(false);
      }
    };
    syncCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shipping = subtotal > 0 ? (subtotal - couponDiscount > 10000 ? 0 : 450) : 0;
  const total = subtotal - couponDiscount + shipping;

  const handleQty = async (id: string, qty: number) => {
    setQty(id, qty);
    if (user) {
      if (qty <= 0) await cartApi.remove(id).catch(() => {});
      else await cartApi.update(id, qty).catch(() => {});
    }
  };

  const handleRemove = async (id: string) => {
    remove(id);
    if (user) await cartApi.remove(id).catch(() => {});
  };

  const handleApplyCoupon = async () => {
    if (!promo.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponsApi.validate(promo.trim().toUpperCase(), subtotal);
      const disc = res.data.discount || 0;
      setCouponDiscount(disc);
      setCouponCode(promo.trim().toUpperCase());
      toast.success(`Coupon applied — PKR ${disc.toLocaleString()} off!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setCouponDiscount(0);
      setCouponCode("");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponCode("");
    setPromo("");
    toast.info("Coupon removed");
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <main className="flex-1 grid place-items-center px-6 py-20">
        <div className="text-center max-w-sm">
          <ShoppingBag size={56} className="text-[rgba(28,58,42,0.18)] mx-auto mb-6" />
          <h1 className="display-serif text-3xl text-[#1C3A2A] mb-3">Your cart is empty</h1>
          <p className="text-[#6B645A] mb-8 leading-relaxed">Browse our catalogue of handcrafted Pakistani heritage pieces.</p>
          <Link to="/products" className="btn btn-primary">Explore the catalogue</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-4 md:px-6 lg:px-12 flex-1">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="eyebrow mb-1">Your selection</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A]">Cart{syncingWithBackend && <span className="text-base text-[#6B645A] ml-3 font-sans font-normal">syncing…</span>}</h1>
            </div>
            <button onClick={() => { clear(); if (user) cartApi.clear().catch(() => {}); }} className="text-xs text-[#8B1A1A] font-semibold hover:underline flex items-center gap-1">
              <X size={12} /> Clear cart
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-4">
              {items.map((item) => {
                const p = item.product;
                const img = p.img || p.images?.[0];
                return (
                  <div key={p.id} className="bg-white rounded-[20px] p-5 flex gap-5 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.06)]">
                    <Link to="/products/$id" params={{ id: p.id }} className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-[14px] overflow-hidden bg-[#FFF8EC]">
                      <ProductImage src={img} alt={p.name} size="sm" className="hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="eyebrow mb-1">{p.region || p.city}</p>
                          <Link to="/products/$id" params={{ id: p.id }}>
                            <h3 className="display-serif text-lg text-[#1C3A2A] leading-tight hover:text-[#C9921A] transition-colors">{p.name}</h3>
                          </Link>
                          {(p.artisan || p.material) && <p className="text-xs text-[#6B645A] mt-0.5">{[p.artisan, p.material].filter(Boolean).join(" · ")}</p>}
                        </div>
                        <button onClick={() => handleRemove(p.id)} className="text-[#6B645A] hover:text-[#8B1A1A] p-1 flex-shrink-0" aria-label="Remove">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
                        <div className="flex items-center rounded-full border border-[rgba(28,58,42,0.18)] bg-[#FFF8EC] overflow-hidden">
                          <button onClick={() => handleQty(p.id, item.quantity - 1)} className="w-9 h-9 grid place-items-center hover:bg-[rgba(28,58,42,0.06)] transition-colors"><Minus size={13} /></button>
                          <span className="w-10 text-center text-sm font-semibold text-[#1C3A2A]">{item.quantity}</span>
                          <button onClick={() => handleQty(p.id, item.quantity + 1)} className="w-9 h-9 grid place-items-center hover:bg-[rgba(28,58,42,0.06)] transition-colors"><Plus size={13} /></button>
                        </div>
                        <span className="font-display text-xl font-semibold text-[#C9921A]">{formatPKR(p.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="space-y-4">
              {/* Order summary */}
              <div className="bg-white rounded-[20px] p-6 shadow-[var(--shadow-card)] border border-[rgba(28,58,42,0.06)]">
                <h2 className="display-serif text-xl text-[#1C3A2A] mb-5">Order summary</h2>
                <dl className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between"><dt className="text-[#6B645A]">Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</dt><dd className="font-medium text-[#1C3A2A]">{formatPKR(subtotal)}</dd></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-green-700"><dt className="flex items-center gap-1"><Tag size={12} /> {couponCode}</dt><dd>−{formatPKR(couponDiscount)}</dd></div>}
                  <div className="flex justify-between"><dt className="text-[#6B645A]">Shipping</dt><dd className="font-medium">{shipping === 0 ? <span className="text-green-700 font-semibold">Free</span> : formatPKR(shipping)}</dd></div>
                </dl>
                {shipping > 0 && <p className="text-[11px] text-[#6B645A] mb-4 -mt-2">Free shipping on orders over {formatPKR(10000)}</p>}
                <div className="flex items-baseline justify-between py-4 border-t border-[rgba(28,58,42,0.1)]">
                  <span className="eyebrow !text-[#1C3A2A]">Total</span>
                  <span className="font-display text-2xl font-semibold text-[#C9921A]">{formatPKR(total)}</span>
                </div>
                <button onClick={() => navigate({ to: "/checkout" })} className="btn btn-primary w-full !py-4 mt-2">
                  Proceed to checkout <ArrowRight size={16} />
                </button>
                {!user && <p className="text-[11px] text-center text-[#6B645A] mt-3"><Link to="/login" className="underline text-[#C9921A]">Sign in</Link> to save your cart and access order history.</p>}
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.06)] shadow-[var(--shadow-soft)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C3A2A] mb-3"><Tag size={14} className="text-[#C9921A]" /> Promo code</h3>
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                    <div>
                      <p className="text-xs font-bold text-green-800">{couponCode}</p>
                      <p className="text-xs text-green-700">−{formatPKR(couponDiscount)} off</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-green-700 hover:text-red-600"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter code" className="flex-1 bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm uppercase focus:outline-none focus:border-[#C9921A]" />
                    <button onClick={handleApplyCoupon} disabled={validatingCoupon || !promo.trim()}
                      className="px-4 py-2.5 rounded-full bg-[#1C3A2A] text-[#F5EDD8] text-xs font-semibold hover:bg-[#0F2219] transition-colors disabled:opacity-50">
                      {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Gift wrap */}
              <div className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.06)] shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1C3A2A] mb-2"><Gift size={14} className="text-[#C9921A]" /> Heritage gift wrap</div>
                <p className="text-xs text-[#6B645A] mb-3">Traditional handmade wrapping with a personal note. Available at checkout.</p>
                <Link to="/checkout" className="text-xs text-[#C9921A] font-semibold hover:underline">Add at checkout →</Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

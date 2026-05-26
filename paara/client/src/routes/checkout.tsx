import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, Wallet, Smartphone, Banknote, Truck, ShieldCheck, Loader2, CreditCard } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart-store";
import { formatPKR } from "@/lib/products";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";
import { PaymentLogo, SupportedBanksRow } from "@/components/site/PaymentLogo";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout · PAARA" }] }),
  component: CheckoutPage,
});

type Step = 0 | 1 | 2;

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [shipping, setShipping] = useState({ name: "", phone: "", street: "", city: "", province: "Punjab", postalCode: "" });
  const [payment, setPayment] = useState<"jazzcash" | "easypaisa" | "card" | "bank" | "cod">("cod");
  const [orderId, setOrderId] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const shippingFee = subtotal > 10000 ? 0 : 450;
  const total = subtotal + shippingFee;

  if (items.length === 0 && step !== 2) return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <main className="flex-1 grid place-items-center px-6">
        <div className="text-center">
          <h1 className="display-serif text-4xl text-[#1C3A2A] mb-4">Your cart is empty</h1>
          <Link to="/products" className="btn btn-primary">Explore the catalogue</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const placeOrder = async () => {
    setPlacing(true);
    try {
      if (user) {
        const res = await cartApi.checkout({
          shippingAddress: { name: shipping.name, street: shipping.street, city: shipping.city, province: shipping.province, postalCode: shipping.postalCode, phone: shipping.phone },
          payment: { method: payment },
          giftWrap: undefined,
        });
        setOrderId(res.data.order._id?.slice(-8).toUpperCase() || `PAARA-${Date.now().toString(36).toUpperCase()}`);
      } else {
        setOrderId(`PAARA-${Date.now().toString(36).toUpperCase()}`);
      }
      setStep(2);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <Stepper step={step} />
          {step === 2 ? (
            <Confirmation orderId={orderId} navigate={navigate} />
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
              <div>
                {step === 0 && <ShippingForm shipping={shipping} setShipping={setShipping} onNext={() => setStep(1)} />}
                {step === 1 && <PaymentForm payment={payment} setPayment={setPayment} onBack={() => setStep(0)} onPlace={placeOrder} placing={placing} />}
              </div>
              <aside className="lg:sticky lg:top-28 self-start">
                <div className="bg-white rounded-[20px] p-6 shadow-[var(--shadow-card)] border border-[rgba(28,58,42,0.08)]">
                  <h2 className="display-serif text-xl text-[#1C3A2A] mb-4">Your order</h2>
                  <div className="space-y-3 mb-5 max-h-[260px] overflow-y-auto pr-1">
                    {items.map((i) => (
                      <div key={i.product.id} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FFF8EC] shrink-0 relative">
                          <ProductImage src={i.product.img} alt="" size="sm" />
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1C3A2A] text-[#F5EDD8] text-[10px] grid place-items-center font-medium">{i.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="display-serif text-sm text-[#1C3A2A] leading-tight truncate">{i.product.name}</p>
                          <p className="text-[11px] text-[#6B645A]">{i.product.region}</p>
                        </div>
                        <span className="text-sm font-medium text-[#1C3A2A]">{formatPKR(i.product.price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <dl className="space-y-2 text-sm pb-4 border-b border-[rgba(28,58,42,0.1)]">
                    <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(subtotal)}</dd></div>
                    <div className="flex justify-between"><dt>Shipping</dt><dd>{shippingFee === 0 ? "Free" : formatPKR(shippingFee)}</dd></div>
                  </dl>
                  <div className="flex items-baseline justify-between pt-4">
                    <span className="eyebrow !text-[#1C3A2A]">Total</span>
                    <span className="font-display text-2xl font-semibold text-[#C9921A]">{formatPKR(total)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs text-[#6B645A]">
                  <p className="flex items-center gap-2"><ShieldCheck size={12} className="text-[#C9921A]" />Verified artisans · authentic craft</p>
                  <p className="flex items-center gap-2"><Truck size={12} className="text-[#C9921A]" />Insured 3–5 day delivery in Pakistan</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Shipping", "Payment", "Confirmation"];
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold transition-all"
            style={{ background: i <= step ? "#C9921A" : "transparent", border: i <= step ? "2px solid #C9921A" : "2px solid rgba(28,58,42,0.2)", color: i <= step ? "#1C3A2A" : "#6B645A" }}>
            {i < step ? <Check size={14} /> : i + 1}
          </div>
          <span className="text-xs md:text-sm uppercase tracking-[0.16em] font-medium" style={{ color: i <= step ? "#1C3A2A" : "#6B645A" }}>{label}</span>
          {i < labels.length - 1 && <div className="w-8 md:w-16 h-px bg-[rgba(28,58,42,0.2)]" />}
        </div>
      ))}
    </div>
  );
}

function ShippingForm({ shipping, setShipping, onNext }: any) {
  const valid = shipping.name && shipping.phone && shipping.street && shipping.city && shipping.postalCode;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onNext(); }}
      className="bg-white rounded-[20px] p-6 md:p-8 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)]">
      <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Where should it go?</h2>
      <p className="text-sm text-[#6B645A] mb-6">We use this only for delivery.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {[["Full name", "name", "Aisha Khan"], ["Phone", "phone", "+92 3xx xxxxxxx"]].map(([label, key, ph]) => (
          <Field key={key} label={label} value={shipping[key]} onChange={(v: string) => setShipping({ ...shipping, [key]: v })} placeholder={ph} />
        ))}
        <div className="sm:col-span-2">
          <Field label="Address" value={shipping.street} onChange={(v: string) => setShipping({ ...shipping, street: v })} placeholder="House no., street, area" />
        </div>
        <Field label="City" value={shipping.city} onChange={(v: string) => setShipping({ ...shipping, city: v })} placeholder="Lahore" />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Province</label>
          <select value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
            {["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <Field label="Postal code" value={shipping.postalCode} onChange={(v: string) => setShipping({ ...shipping, postalCode: v })} placeholder="54000" />
      </div>
      <div className="flex items-center justify-between mt-8 gap-4 flex-wrap">
        <Link to="/cart" className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to cart</Link>
        <button type="submit" disabled={!valid} className="btn btn-primary disabled:opacity-50">Continue to payment <ArrowRight size={16} /></button>
      </div>
    </form>
  );
}

function PaymentForm({ payment, setPayment, onBack, onPlace, placing }: any) {
  const methods = [
    { id: "jazzcash", label: "JazzCash", desc: "Pay from your JazzCash wallet", icon: Smartphone, color: "#C4622D" },
    { id: "easypaisa", label: "EasyPaisa", desc: "Pay from your EasyPaisa wallet", icon: Wallet, color: "#1B4F8A" },
    { id: "card", label: "Debit / Credit Card", desc: "Visa & Mastercard accepted", icon: CreditCard, color: "#1A3A8B" },
    { id: "bank", label: "Bank Transfer", desc: "Direct transfer · 1–2 business days", icon: Banknote, color: "#2A5C3F" },
    { id: "cod", label: "Cash on Delivery", desc: "Pay in cash on delivery", icon: Truck, color: "#B5651D" },
  ];
  return (
    <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)]">
      <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">How would you like to pay?</h2>
      <p className="text-sm text-[#6B645A] mb-6">All payments are processed securely.</p>
      <div className="space-y-3">
        {methods.map((m) => (
          <button key={m.id} onClick={() => setPayment(m.id)} type="button"
            className="w-full text-left rounded-2xl p-5 flex items-start gap-4 transition-all border-2"
            style={{ borderColor: payment === m.id ? "#C9921A" : "rgba(28,58,42,0.1)", background: payment === m.id ? "#FFF8EC" : "#fff" }}>
            <PaymentLogo id={m.id} fallbackIcon={m.icon} color={m.color} alt={m.label} />
            <div className="flex-1">
              <div className="font-display font-semibold text-[#1C3A2A]">{m.label}</div>
              <div className="text-xs text-[#6B645A] mt-0.5">{m.desc}</div>
              {m.id === "card" && (
                <SupportedBanksRow ids={["visa", "mastercard"]} />
              )}
              {m.id === "bank" && (
                <SupportedBanksRow ids={["hbl", "mcb", "ubl", "allied", "visa", "mastercard"]} />
              )}
            </div>
            <span className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 mt-1" style={{ borderColor: payment === m.id ? "#C9921A" : "rgba(28,58,42,0.2)" }}>
              {payment === m.id && <span className="w-2.5 h-2.5 rounded-full bg-[#C9921A]" />}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[#6B645A] mt-6 flex items-center gap-2"><ShieldCheck size={14} className="text-[#C9921A]" /> SSL secured · PCI-compliant</p>
      <div className="flex items-center justify-between mt-8 gap-4 flex-wrap">
        <button onClick={onBack} className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
        <button onClick={onPlace} disabled={placing} className="btn btn-primary disabled:opacity-60">
          {placing ? <Loader2 size={16} className="animate-spin" /> : <>Place order <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">{label}</label>
      <input type="text" required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] focus:bg-white" />
    </div>
  );
}

function Confirmation({ orderId, navigate }: any) {
  return (
    <div className="text-center max-w-2xl mx-auto py-16">
      <div className="w-20 h-20 rounded-full bg-[#C9921A] grid place-items-center mx-auto mb-8 shadow-[0_8px_32px_rgba(201,146,26,0.4)]">
        <Check size={32} className="text-[#1C3A2A]" strokeWidth={2.5} />
      </div>
      <p className="urdu text-[#C9921A] text-2xl mb-4">شکریہ · آپ کا آرڈر مل گیا</p>
      <p className="eyebrow mb-3">Order placed</p>
      <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-4 leading-[1.1]">
        Thank you — your <em className="italic text-[#C9921A]">heritage</em> is on its way.
      </h1>
      <p className="text-[#3D2914] mb-8 leading-relaxed max-w-lg mx-auto">
        We have notified the artisan. You will receive an email once your piece is packed and dispatched.
      </p>
      <div className="bg-white rounded-[20px] p-6 md:p-8 inline-block min-w-[320px] mb-8 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.16em] text-[#6B645A] mb-1">Order ID</p>
        <p className="font-display text-2xl text-[#1C3A2A] font-semibold mb-4">{orderId}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-[#6B645A] mb-1">Expected delivery</p>
        <p className="text-sm text-[#1C3A2A]">3–5 business days · within Pakistan</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => navigate({ to: "/" })} className="btn btn-outline-forest">Back to home</button>
        <button onClick={() => navigate({ to: "/account/orders" })} className="btn btn-primary">View my orders</button>
      </div>
    </div>
  );
}

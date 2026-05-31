import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Award, TrendingUp, Users, CheckCircle, MapPin, Banknote } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "Sell with PAARA · Become a Verified Artisan" }, { name: "description", content: "Join Pakistan's most trusted marketplace for authentic handcrafted goods. Apply to become a verified PAARA artisan." }] }),
  component: SellPage,
});

const STEPS = [
  { n: "01", title: "Apply online", desc: "Fill out your shop profile, upload CNIC, and show us your craft in four quick steps." },
  { n: "02", title: "Document review", desc: "Our team reviews your identity and craft photos within 3-5 business days." },
  { n: "03", title: "Field visit", desc: "A regional PAARA verifier visits your workshop to certify authenticity." },
  { n: "04", title: "Go live", desc: "Earn the Authentic badge, list your products, and start receiving orders." },
];

const BENEFITS = [
  { Icon: ShieldCheck, title: "Authentic badge", desc: "Every approved artisan gets the PAARA Authentic badge — a mark buyers trust." },
  { Icon: TrendingUp, title: "Reach buyers across Pakistan", desc: "Showcase your craft to buyers from Karachi to Hunza and beyond." },
  { Icon: Banknote, title: "Weekly payouts", desc: "Receive payments directly to your bank, Easypaisa, or JazzCash every week." },
  { Icon: Users, title: "Seller community", desc: "Join a network of verified artisans, share knowledge and grow together." },
  { Icon: Award, title: "Heritage badges", desc: "Earn Master Artisan and Heritage Keeper recognition as you grow." },
  { Icon: MapPin, title: "Regional discovery", desc: "Buyers browse by region — your Multani Blue Pottery finds its audience." },
];

function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cta = () => {
    if (!user) { navigate({ to: "/register", search: { role: "seller" } as any }); return; }
    if (user.role === "seller") navigate({ to: "/seller/onboarding" });
    else navigate({ to: "/register", search: { role: "seller" } as any });
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #1C3A2A 0%, #2D5940 60%, #1C3A2A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #C9921A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F5EDD8 0%, transparent 40%)" }} />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-[#C9921A] text-xs font-bold uppercase tracking-[0.22em] mb-4">Sell with PAARA</p>
          <h1 className="display-serif text-5xl md:text-6xl text-[#F5EDD8] leading-[1.08] mb-6">
            Bring your craft<br />to the world
          </h1>
          <p className="text-[#BFB8A8] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            PAARA verifies every artisan in person. No factory goods, no middlemen — just authentic Pakistani craft, sold directly by the people who make it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={cta}
              type="button"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm"
              style={{ background: "#C9921A", color: "#1C3A2A" }}>
              Start your application <ArrowRight size={16} />
            </button>
            {user?.role === "seller" && (
              <Link to="/seller/verification-status"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm border border-[rgba(245,237,216,0.3)] text-[#F5EDD8] hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                Check my status
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12">
            <p className="eyebrow mb-2">Why PAARA</p>
            <h2 className="display-serif text-3xl md:text-4xl text-[#1C3A2A]">Built for Pakistan's artisans</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                <div className="w-11 h-11 rounded-full grid place-items-center mb-4"
                  style={{ background: "rgba(201,146,26,0.12)" }}>
                  <Icon size={20} className="text-[#C9921A]" />
                </div>
                <h3 className="display-serif text-lg text-[#1C3A2A] mb-2">{title}</h3>
                <p className="text-sm text-[#6B645A] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 lg:px-12" style={{ background: "#1C3A2A" }}>
        <div className="mx-auto max-w-[900px]">
          <div className="text-center mb-12">
            <p className="text-[#C9921A] text-xs font-bold uppercase tracking-[0.22em] mb-2">The process</p>
            <h2 className="display-serif text-3xl md:text-4xl text-[#F5EDD8]">Four steps to your verified shop</h2>
          </div>
          <ol className="space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.n} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full grid place-items-center font-mono text-sm font-bold"
                  style={{ background: "rgba(201,146,26,0.15)", color: "#C9921A", border: "1.5px solid rgba(201,146,26,0.3)" }}>
                  {s.n}
                </div>
                <div className="flex-1 pt-2.5">
                  <h3 className="font-display font-semibold text-[#F5EDD8] text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-[#BFB8A8] leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Requirements callout */}
      <section className="py-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[900px]">
          <div className="bg-white rounded-[24px] p-8 md:p-12 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="eyebrow mb-2">What you'll need</p>
                <h2 className="display-serif text-2xl md:text-3xl text-[#1C3A2A] mb-6">Ready to apply?</h2>
                <ul className="space-y-3">
                  {[
                    "Valid CNIC (both sides)",
                    "Photos of your workshop or studio",
                    "Photos of your finished craft pieces",
                    "Basic shop details (name, location, craft type)",
                    "Bank or mobile money account for payouts",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#1C3A2A]">
                      <CheckCircle size={16} className="text-[#C9921A] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-[#6B645A] leading-relaxed mb-6">
                  Our verification takes 3-5 business days. Once approved, you'll receive the PAARA Authentic badge and can start listing products immediately.
                </p>
                <button type="button" onClick={cta}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm"
                  style={{ background: "#1C3A2A", color: "#F5EDD8", border: "1.5px solid #C9921A" }}>
                  Apply now <ArrowRight size={16} />
                </button>
                {!user && (
                  <p className="text-xs text-[#6B645A] mt-4">
                    Already have a seller account?{" "}
                    <Link to="/login" className="text-[#C9921A] font-semibold">Sign in</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

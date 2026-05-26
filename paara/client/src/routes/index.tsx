import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight, ShieldCheck, Sparkles, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { recommendationsApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import ProductImage from "@/components/ProductImage";
import WelcomeBanner from "@/components/site/WelcomeBanner";
import DemoBadge from "@/components/DemoBadge";

import badshahiBg from "@/assets/cities/Badshahi.jpg";
import islamabadBg from "@/assets/cities/Islamabad.jpg";
import mountainsBg from "@/assets/cities/Mountains.jpg";
import multanImg from "@/assets/cities/Multan.jpg";
import lahoreImg from "@/assets/cities/Lahore.jpg";
import hunzaImg from "@/assets/cities/Hunza.jpg";
import peshawarImg from "@/assets/cities/Peshawar.jpg";
import karachiImg from "@/assets/cities/Karachi.jpg";
import skarduImg from "@/assets/cities/Skardu.jpg";
import balochImg from "@/assets/cities/Balochistan.jpg";
import gilgitImg from "@/assets/cities/Gilgit.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PAARA · A Precious Piece of Pakistan" },
      {
        name: "description",
        content:
          "PAARA is a premium heritage marketplace for verified Pakistani artisans — regional crafts, hand-finished, delivered with care.",
      },
      { property: "og:title", content: "PAARA · A Precious Piece of Pakistan" },
      {
        property: "og:description",
        content: "Heritage crafts from verified artisans across Pakistan's regions.",
      },
    ],
  }),
  component: HomePage,
});

const REGIONS = [
  { name: "Lahore", craft: "Textile & Embroidery", img: lahoreImg },
  { name: "Multan", craft: "Blue Pottery", img: multanImg },
  { name: "Hunza", craft: "Walnut Wood Carving", img: hunzaImg },
  { name: "Peshawar", craft: "Copper & Brass", img: peshawarImg },
  { name: "Karachi", craft: "Ajrak Block Print", img: karachiImg },
  { name: "Skardu", craft: "Gemstones & Jade", img: skarduImg },
];



const HERO_SLIDES = [
  { img: badshahiBg, label: "Badshahi Mosque · Lahore" },
  { img: lahoreImg, label: "Old Lahore" },
  { img: hunzaImg, label: "Hunza Valley" },
  { img: skarduImg, label: "Skardu" },
  { img: mountainsBg, label: "Karakoram" },
  { img: islamabadBg, label: "Faisal Mosque · Islamabad" },
  { img: multanImg, label: "Multan" },
];

function HomePage() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav />
      <WelcomeBanner />

      {/* HERO */}
      <section className="relative h-[100vh] min-h-[720px] overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.label}
            className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
            style={{
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? "scale(1.06)" : "scale(1)",
              transition: "opacity 1800ms ease-in-out, transform 7000ms ease-out",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,58,42,.55) 0%, rgba(28,58,42,.18) 42%, rgba(28,58,42,.72) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 28%, rgba(28,58,42,.55) 100%)",
          }}
        />

        <div className="absolute bottom-24 right-8 z-20 hidden md:flex flex-col items-end gap-2">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[rgba(245,237,216,0.85)]">
            {HERO_SLIDES[slide].label}
          </p>
          <div className="flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className="h-[3px] rounded-full transition-all duration-500"
                style={{
                  width: i === slide ? 28 : 12,
                  background: i === slide ? "#C9921A" : "rgba(245,237,216,0.45)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 lg:px-12 text-[#F5EDD8]">
          <p className="urdu rise text-2xl md:text-3xl text-[#C9921A] mb-4" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}>
            پارہ · ایک قیمتی ٹکڑا
          </p>
          <p className="eyebrow rise-1 !text-[#C9921A] mb-6">A Precious Piece of Pakistan</p>
          <h1
            className="display-serif rise-2 text-5xl md:text-7xl lg:text-[5.5rem] font-normal max-w-[18ch] leading-[1.02] -tracking-tight mb-6"
            style={{ textShadow: "0 6px 32px rgba(0,0,0,0.55)" }}
          >
            Where heritage <em className="italic text-[#C9921A]">finds</em> its hands.
          </h1>
          <p className="rise-3 max-w-2xl text-base md:text-lg text-[rgba(245,237,216,0.95)] mb-10 leading-relaxed" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            Verified artisans. Regional craft. Direct from the makers — blue pottery from Multan,
            walnut carving from Hunza, Ajrak from Sindh.
          </p>

          <form
            className="rise-3 w-full max-w-xl flex items-center gap-3 pl-6 pr-2 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(201,146,26,0.32)",
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <Search size={18} className="text-[rgba(245,237,216,0.7)] shrink-0" />
            <input
              type="text"
              placeholder="Search crafts, regions, artisans…"
              className="flex-1 bg-transparent text-[#F5EDD8] placeholder:text-[rgba(245,237,216,0.5)] outline-none py-2 text-sm"
            />
            <button type="submit" className="btn btn-primary !py-3 !px-6">Discover</button>
          </form>

          <div className="rise-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/products" className="btn btn-primary">Explore Brands <ArrowRight size={16} /></Link>
            <Link to="/sell" className="btn btn-ghost">Sell with PAARA</Link>
          </div>
        </div>

        <div className="scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-[rgba(245,237,216,0.7)]">
          Scroll · میراث دیکھیں
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="relative px-6 lg:px-12 -mt-16 z-20">
        <div className="mx-auto max-w-[1280px] glass grid grid-cols-2 md:grid-cols-4 gap-8 px-8 md:px-12 py-8 md:py-10">
          {[
            { num: "240+", label: "Verified Artisans", icon: ShieldCheck, desc: "Hand-vetted, one by one" },
            { num: "14", label: "Regions Covered", icon: MapPin, desc: "From Hunza to the coast" },
            { num: "100%", label: "Authentic Craft", icon: Sparkles, desc: "Curated by heritage editors" },
            { num: "12k+", label: "Households", icon: Users, desc: "Supported across Pakistan" },
          ].map((t) => (
            <div key={t.label} className="px-2 md:px-4 md:border-r last:md:border-r-0 border-[rgba(28,58,42,0.12)]">
              <t.icon size={20} className="text-[#C9921A] mb-3" />
              <div className="font-display text-4xl md:text-5xl text-[#1C3A2A] leading-none">{t.num}</div>
              <div className="eyebrow mt-2">{t.label}</div>
              <div className="text-xs text-[#6B645A] mt-2 leading-relaxed">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REGIONS */}
      <section className="px-6 lg:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="eyebrow mb-4">Explore by Region</p>
              <h2 className="text-4xl md:text-5xl max-w-[18ch] leading-[1.1]">
                Each region holds its own <em className="italic text-[#C9921A]">hand</em>.
              </h2>
            </div>
            <p className="text-[#3D2914] max-w-md leading-relaxed">
              Discover the heritage behind every city. Buy directly from the artisans
              who carry generations of craft in their fingertips.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {REGIONS.map((r) => (
              <Link
                key={r.name}
                to="/regions"
                className="group relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(28,58,42,0.12)]"
              >
                <img src={r.img} alt={r.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(28,58,42,0) 40%, rgba(28,58,42,0.85) 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-[#F5EDD8]">
                  <p className="eyebrow !text-[#C9921A] mb-1">{r.craft}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="display-serif text-3xl text-[#F5EDD8]">{r.name}</h3>
                    <ArrowRight
                      size={20}
                      className="text-[#C9921A] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL STORY */}
      <section className="px-6 lg:px-12 py-12">
        <div className="mx-auto max-w-[1280px] rounded-[24px] overflow-hidden grid md:grid-cols-[1.1fr_0.9fr] bg-[#1C3A2A] text-[#F5EDD8] shadow-[var(--shadow-card)] group">
          <div className="relative min-h-[320px] md:min-h-[480px] overflow-hidden">
            <img src={multanImg} alt="Multan pottery" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          </div>
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <p className="eyebrow !text-[#C9921A] mb-4">Heritage Story · 03</p>
            <p className="urdu text-[#C9921A] text-lg mb-3">ملتان کی نیلی مٹی</p>
            <h3 className="display-serif text-3xl md:text-4xl text-[#F5EDD8] leading-tight mb-5">
              The blue of Multan is a recipe, not a colour.
            </h3>
            <p className="text-[rgba(245,237,216,0.85)] leading-relaxed max-w-[44ch] mb-8">
              Three generations of Ustad Naseer's family have stirred the same cobalt
              glaze under the same furnace. We sat with him at dawn to find out what
              changes — and what refuses to.
            </p>
            <div className="flex items-center gap-4 pt-6 border-t border-[rgba(245,237,216,0.18)]">
              <div className="w-10 h-10 rounded-full grid place-items-center display-serif text-[#1C3A2A] font-semibold bg-gradient-to-br from-[#C9921A] to-[#B5651D]">
                UN
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#F5EDD8]">Ustad Naseer Ahmad</div>
                <div className="text-xs text-[rgba(245,237,216,0.65)]">Master Potter · Multan</div>
              </div>
              <Link to="/heritage" className="text-[#C9921A] text-sm font-medium hover:gap-3 inline-flex items-center gap-2 transition-all">
                Read & Shop <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-6 lg:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="eyebrow mb-4">Pakistan's Most Celebrated</p>
              <h2 className="text-4xl md:text-5xl max-w-[20ch] leading-[1.1]">
                Quiet pieces, <em className="italic text-[#C9921A]">loud</em> in their making.
              </h2>
            </div>
            <Link to="/products" className="btn btn-outline-forest self-start md:self-end">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <FeaturedProducts />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 lg:px-12 py-16">
        <div className="mx-auto max-w-[1280px] grid md:grid-cols-3 gap-6">
          {[
            {
              q: "I unwrapped my Multani vase and immediately wrote to the seller. You can feel the kiln in it.",
              a: "Saira K.",
              c: "London",
            },
            {
              q: "First time I've bought directly from an artisan. The story card inside the box made me cry, honestly.",
              a: "Daniyal H.",
              c: "Karachi",
            },
            {
              q: "PAARA is the only platform I trust to ship a hand-carved tray from Hunza without scratches.",
              a: "Maryam B.",
              c: "Dubai",
            },
          ].map((t) => (
            <figure key={t.a} className="rounded-[20px] bg-white p-8 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)]">
              <p className="display-serif italic text-xl text-[#1C3A2A] leading-snug mb-6">
                "{t.q}"
              </p>
              <figcaption className="text-sm">
                <span className="font-semibold text-[#1C3A2A]">{t.a}</span>
                <span className="text-[#6B645A]"> · {t.c}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 lg:px-12 py-24">
        <div
          className="relative mx-auto max-w-[1280px] rounded-[24px] overflow-hidden p-12 md:p-20 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(28,58,42,0.85), rgba(28,58,42,0.85)), url(${gilgitImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="urdu text-[#C9921A] text-xl mb-4">ہماری میراث، آپ کا اعتماد</p>
          <h2 className="display-serif text-4xl md:text-6xl text-[#F5EDD8] max-w-[22ch] mx-auto leading-[1.05] mb-6">
            Carry a piece of <em className="italic text-[#C9921A]">Pakistan</em> in your hands.
          </h2>
          <p className="text-[rgba(245,237,216,0.85)] max-w-xl mx-auto mb-10 leading-relaxed">
            Discover verified artisans, regional collections, and the stories behind every craft.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/products" className="btn btn-primary">Begin Exploring</Link>
            <Link to="/sell" className="btn btn-ghost">Become an Artisan</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      try {
        const res = await recommendationsApi.featured();
        return res.data.products?.slice(0, 4) || [];
      } catch { return []; }
    },
    staleTime: 1000 * 60 * 5,
  });

  const products = data || [];

  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {[0,1,2,3].map(i => (
        <div key={i} className="rounded-[20px] bg-white overflow-hidden animate-pulse">
          <div className="h-56 bg-[rgba(28,58,42,0.08)]" />
          <div className="p-5 space-y-2">
            <div className="h-3 w-12 rounded bg-[rgba(28,58,42,0.08)]" />
            <div className="h-5 w-full rounded bg-[rgba(28,58,42,0.08)]" />
            <div className="h-4 w-20 rounded bg-[rgba(28,58,42,0.08)]" />
          </div>
        </div>
      ))}
    </div>
  );

  if (products.length === 0) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {[
        { name: "Hand-Painted Blue Vase", artisan: "Master Ustad Naseer", region: "Multan", price: 14500 },
        { name: "Hunza Walnut Tea Tray", artisan: "Karim Wood Studio", region: "Hunza", price: 9800 },
        { name: "Ajrak Cotton Shawl", artisan: "Sindhi Heritage House", region: "Sindh", price: 6200 },
        { name: "Peshawar Copper Pitcher", artisan: "Bukhari Brothers", region: "Peshawar", price: 11300 },
      ].map((p) => (
        <Link key={p.name} to="/products" className="paara-card block group">
          <div className="img-wrap bg-gradient-to-br from-[#1C3A2A] to-[#264D38]" />
          <div className="p-5">
            <p className="eyebrow mb-2">{p.region}</p>
            <h3 className="display-serif text-lg text-[#1C3A2A] leading-tight mb-1 line-clamp-2">{p.name}</h3>
            <p className="text-xs text-[#6B645A] mb-3">{p.artisan}</p>
            <span className="font-display text-xl font-semibold text-[#C9921A]">{formatPKR(p.price)}</span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {products.map((p: any) => {
        const id = p._id || p.id;
        const img = p.images?.[0];
        const artisan = p.artisan || p.seller?.shopName || p.seller?.name;
        return (
          <Link key={id} to="/products/$id" params={{ id }} className="paara-card block group">
            <div className="img-wrap">
              <div className="relative w-full h-full">
                {p.isDemo && <DemoBadge position="top-left" />}
                <ProductImage src={img} alt={p.name} size="md" />
              </div>
            </div>
            <div className="p-5">
              <p className="eyebrow mb-2">{p.city || p.region}</p>
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
  );
}


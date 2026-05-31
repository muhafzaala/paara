import { useRef, useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPKR } from "@/lib/products";

interface Props {
  product: {
    name: string; city?: string; region?: string; category?: string;
    artisan?: string; material?: string; story?: string;
    price?: number; img?: string;
  };
  onClose: () => void;
  onAddToCart?: () => void;
}

// Minimal Intersection Observer hook
function useInView(ref: React.RefObject<Element>, threshold = 0.3) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function SlideReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// Simplified Pakistan silhouette path + city pin
const CITY_PINS: Record<string, { x: number; y: number }> = {
  Multan: { x: 115, y: 148 }, Lahore: { x: 138, y: 118 }, Karachi: { x: 78, y: 220 },
  Peshawar: { x: 108, y: 82 }, Quetta: { x: 70, y: 155 }, Gilgit: { x: 128, y: 42 },
  Hunza: { x: 132, y: 34 }, Hyderabad: { x: 90, y: 215 }, Wazirabad: { x: 135, y: 108 },
  Sialkot: { x: 140, y: 108 }, Islamabad: { x: 125, y: 90 }, Skardu: { x: 150, y: 50 },
  Mardan: { x: 112, y: 78 }, Bahawalpur: { x: 118, y: 162 },
};

function PakistanMap({ city }: { city?: string }) {
  const pin = city ? (CITY_PINS[city] || CITY_PINS["Islamabad"]) : CITY_PINS["Islamabad"];
  return (
    <svg viewBox="0 0 200 270" width={200} height={270} className="mx-auto">
      {/* Simplified Pakistan border polygon */}
      <path
        d="M60,30 L80,18 L105,15 L130,20 L160,30 L175,50 L178,70 L165,85 L170,105 L160,120 L158,140 L165,160 L155,180 L140,200 L120,225 L105,245 L90,255 L75,240 L60,218 L50,195 L45,170 L40,145 L35,120 L38,95 L45,70 L50,50 Z"
        fill="#1C3A2A" opacity={0.15} stroke="#1C3A2A" strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* City pin */}
      <motion.g initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 14 }}>
        <circle cx={pin.x} cy={pin.y} r={8} fill="#C9921A" opacity={0.3} />
        <circle cx={pin.x} cy={pin.y} r={5} fill="#C9921A" />
        <path d={`M${pin.x},${pin.y - 5} L${pin.x},${pin.y - 22}`} stroke="#C9921A" strokeWidth={2} />
        <ellipse cx={pin.x} cy={pin.y - 28} rx={12} ry={7} fill="#C9921A" />
        <text x={pin.x} y={pin.y - 25} textAnchor="middle" fill="#1C3A2A" fontSize={7} fontWeight="bold">
          {city?.slice(0, 8) || "Pakistan"}
        </text>
      </motion.g>
    </svg>
  );
}

export default function ArtisanStoryMode({ product, onClose, onAddToCart }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const city = product.city || product.region || "Pakistan";
  const craft = product.category || "craft";

  const slide = (content: React.ReactNode, bg = "bg-[#1C3A2A]") => (
    <div className={`snap-start shrink-0 w-full h-screen flex items-center justify-center px-8 lg:px-24 ${bg}`} style={{ minHeight: "100vh" }}>
      {content}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div key="story-mode" className="fixed inset-0 z-[90] overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

        {/* Close */}
        <button type="button" onClick={onClose} aria-label="Close story"
          className="fixed top-5 right-5 z-[91] w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white hover:bg-white/30 transition-colors">
          <X size={18} />
        </button>

        {/* Scrollable snap container */}
        <div ref={scrollRef}
          className="h-full overflow-y-scroll"
          style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}>

          {/* Slide 1 — Hero */}
          <div className="snap-start shrink-0 relative flex items-center justify-center text-center text-[#F5EDD8]"
            style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0F2219 0%, #1C3A2A 100%)" }}>
            {product.img && (
              <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none select-none" />
            )}
            <SlideReveal className="relative z-10 max-w-3xl mx-auto px-6">
              <p className="eyebrow !text-[#C9921A] mb-4">A heritage story</p>
              <h1 className="display-serif text-5xl md:text-7xl text-[#F5EDD8] leading-tight mb-4">{product.name}</h1>
              <p className="text-lg text-[rgba(245,237,216,0.7)]">An ode to {city}'s {craft}</p>
            </SlideReveal>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#C9921A] animate-bounce">
              <ChevronDown size={24} />
            </div>
          </div>

          {/* Slide 2 — Story */}
          {slide(
            <SlideReveal className="max-w-2xl text-center">
              <p className="eyebrow !text-[#C9921A] mb-6">The story begins</p>
              <p className="display-serif text-xl md:text-2xl text-[#F5EDD8] leading-relaxed mb-8">
                {product.story || `Every piece of ${craft} from ${city} carries centuries of heritage, passed down through generations of artisan families who have perfected their craft over time.`}
              </p>
              {product.img && <img src={product.img} alt="" className="w-32 h-32 rounded-2xl object-cover mx-auto opacity-60" />}
            </SlideReveal>,
            "bg-[#0F2219]"
          )}

          {/* Slide 3 — Where */}
          <div className="snap-start shrink-0 flex flex-col md:flex-row items-center justify-center gap-12 px-8 lg:px-20 py-16"
            style={{ minHeight: "100vh", background: "#1C3A2A" }}>
            <SlideReveal>
              <p className="eyebrow !text-[#C9921A] mb-4">Where it's from</p>
              <h2 className="display-serif text-6xl md:text-8xl text-[#F5EDD8] leading-none">{city}</h2>
              <p className="text-[#C9921A] text-xl mt-2">{product.region || "Pakistan"}</p>
            </SlideReveal>
            <SlideReveal>
              <PakistanMap city={city} />
            </SlideReveal>
          </div>

          {/* Slide 4 — How made */}
          {slide(
            <SlideReveal className="max-w-2xl text-center">
              <p className="eyebrow !text-[#C9921A] mb-6">How it's made</p>
              {product.material && (
                <p className="text-[rgba(245,237,216,0.55)] text-sm uppercase tracking-[0.2em] mb-4">{product.material}</p>
              )}
              <h2 className="display-serif text-4xl md:text-6xl text-[#F5EDD8] leading-tight mb-6">
                Handcrafted with<br /><em className="italic text-[#C9921A]">{craft}</em>
              </h2>
              <p className="text-[rgba(245,237,216,0.7)] leading-relaxed">
                Each piece is shaped entirely by hand — no machines, no shortcuts. The result is a living artefact that bears the unique mark of its maker.
              </p>
            </SlideReveal>,
            "bg-[#0F2219]"
          )}

          {/* Slide 5 — Artisan */}
          {slide(
            <SlideReveal className="max-w-xl text-center">
              <p className="eyebrow !text-[#C9921A] mb-6">The artisan</p>
              {/* Generic artisan silhouette */}
              <svg viewBox="0 0 80 80" width={80} height={80} className="mx-auto mb-6 opacity-60">
                <circle cx={40} cy={24} r={16} fill="#C9921A" />
                <path d="M12,80 Q12,52 40,52 Q68,52 68,80 Z" fill="#C9921A" />
              </svg>
              <h2 className="display-serif text-4xl text-[#F5EDD8] mb-4">
                {product.artisan || `A master artisan of ${city}`}
              </h2>
              <p className="text-[rgba(245,237,216,0.7)] leading-relaxed">
                Each piece is hand-crafted with generations of inherited skill — a living tradition preserved for those who seek the real.
              </p>
            </SlideReveal>,
            "bg-[#1C3A2A]"
          )}

          {/* Slide 6 — Bring home */}
          <div className="snap-start shrink-0 relative flex flex-col items-center justify-center text-center px-8"
            style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F2219 0%, #1C3A2A 60%)" }}>
            {product.img && (
              <img src={product.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
            )}
            <SlideReveal className="relative z-10">
              <p className="eyebrow !text-[#C9921A] mb-4">Bring it home</p>
              <h2 className="display-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">{product.name}</h2>
              {product.price && (
                <p className="text-2xl text-[#C9921A] font-display font-semibold mb-8">{formatPKR(product.price)}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center">
                {onAddToCart && (
                  <button type="button" onClick={() => { onAddToCart(); onClose(); }}
                    className="btn btn-primary px-8 py-4 text-base">
                    Add to cart {product.price ? `— ${formatPKR(product.price)}` : ""}
                  </button>
                )}
                <button type="button" onClick={onClose} className="btn btn-ghost py-4 px-6">
                  Close story
                </button>
              </div>
            </SlideReveal>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

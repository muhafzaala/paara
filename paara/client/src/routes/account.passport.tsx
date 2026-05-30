import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { ordersApi } from "@/lib/api";
import CountUpNumber from "@/components/ui/CountUpNumber";

export const Route = createFileRoute("/account/passport")({
  head: () => ({ meta: [{ title: "Heritage Passport · PAARA" }] }),
  component: PassportPage,
});

const REGIONS = [
  { name: "Punjab",             urdu: "پنجاب",      color: "#C9921A" },
  { name: "Sindh",              urdu: "سندھ",       color: "#1A3A8B" },
  { name: "Khyber Pakhtunkhwa", urdu: "خیبرپختونخوا", color: "#2A6F3A" },
  { name: "Balochistan",        urdu: "بلوچستان",   color: "#8B1A1A" },
  { name: "Gilgit-Baltistan",   urdu: "گلگت بلتستان", color: "#4A90A4" },
  { name: "AJK",                urdu: "آزاد کشمیر", color: "#6B2D6B" },
  { name: "Islamabad",          urdu: "اسلام آباد",  color: "#1C3A2A" },
];

function PassportStamp({ region, stamp, delay }: { region: typeof REGIONS[0]; stamp: any; delay: number }) {
  const filled = !!stamp;
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 20 }}
    >
      {filled ? (
        <div className="relative flex flex-col items-center p-4">
          {/* Stamp SVG */}
          <svg width={110} height={110} viewBox="0 0 110 110">
            {/* Outer dashed ring */}
            <circle cx={55} cy={55} r={52} stroke={region.color} strokeWidth={2.5} strokeDasharray="6 3" fill="none" />
            {/* Inner ring */}
            <circle cx={55} cy={55} r={44} stroke={region.color} strokeWidth={1.5} fill={region.color} opacity={0.92} />
            {/* Corner stars */}
            {[0, 90, 180, 270].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 55 55)`}>
                <polygon points="55,12 57,18 63,18 58,22 60,28 55,24 50,28 52,22 47,18 53,18"
                  fill="#C9921A" opacity={0.7} transform="scale(0.55) translate(45,10)" />
              </g>
            ))}
            {/* Region name */}
            <text x={55} y={48} textAnchor="middle" fill="#F5EDD8" fontSize={10} fontFamily="Georgia, serif" letterSpacing={1}>
              {region.name.toUpperCase().slice(0, 12)}
            </text>
            {/* Urdu */}
            <text x={55} y={63} textAnchor="middle" fill="#C9921A" fontSize={11} fontFamily="serif">
              {region.urdu}
            </text>
            {/* Date */}
            <text x={55} y={76} textAnchor="middle" fill="rgba(245,237,216,0.7)" fontSize={7.5}>
              {new Date(stamp.firstAt).getFullYear()}
            </text>
          </svg>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-[#6B645A]">{stamp.count} craft{stamp.count !== 1 ? "s" : ""} · {(stamp.cities || []).filter(Boolean).length} cit{(stamp.cities || []).filter(Boolean).length === 1 ? "y" : "ies"}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-4 opacity-30">
          <svg width={110} height={110} viewBox="0 0 110 110">
            <circle cx={55} cy={55} r={52} stroke="#1C3A2A" strokeWidth={2} strokeDasharray="6 3" fill="none" />
            <circle cx={55} cy={55} r={44} stroke="#1C3A2A" strokeWidth={1} fill="none" />
            <text x={55} y={50} textAnchor="middle" fill="#1C3A2A" fontSize={9} fontFamily="Georgia, serif">
              {region.name.toUpperCase().slice(0, 12)}
            </text>
            <text x={55} y={64} textAnchor="middle" fill="#6B645A" fontSize={8} fontFamily="serif">
              {region.urdu}
            </text>
          </svg>
          <p className="text-[9px] text-[#6B645A] mt-2 text-center">Not yet collected</p>
        </div>
      )}
    </motion.div>
  );
}

function PassportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["heritage-passport"],
    queryFn: async () => {
      try { return (await ordersApi.getPassport()).data; }
      catch { return { stamps: [], totalRegions: 0, totalCrafts: 0 }; }
    },
  });

  if (isLoading) return (
    <div className="grid place-items-center py-20">
      <Loader2 size={28} className="animate-spin text-[#C9921A]" />
    </div>
  );

  const stamps: any[] = data?.stamps || [];
  const stampsMap: Record<string, any> = {};
  stamps.forEach((s) => { stampsMap[s._id] = s; });
  const collected = REGIONS.filter((r) => stampsMap[r.name]).length;
  const allCollected = collected === REGIONS.length;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Your collection</p>
        <h1 className="display-serif text-3xl md:text-4xl text-[#1C3A2A] mt-1">Heritage Passport</h1>
        <p className="urdu text-[#C9921A] text-xl mt-1">پاسپورٹِ ہنر</p>
      </header>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[rgba(201,146,26,0.3)]">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A] mb-1">Regions Collected</p>
          <p className="display-serif text-3xl text-[#C9921A]">
            <CountUpNumber value={collected} /> <span className="text-lg text-[#6B645A]">/ {REGIONS.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[rgba(28,58,42,0.08)]">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A] mb-1">Total Crafts</p>
          <p className="display-serif text-3xl text-[#1C3A2A]">
            <CountUpNumber value={data?.totalCrafts || 0} />
          </p>
        </div>
      </div>

      {allCollected && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, #C9921A, #E5A82E, #C9921A)", backgroundSize: "200% 200%" }}>
          <Star size={28} className="text-[#1C3A2A] mx-auto mb-2" />
          <p className="display-serif text-2xl text-[#1C3A2A]">Heritage Explorer</p>
          <p className="text-sm text-[rgba(28,58,42,0.8)] mt-1">
            You've collected crafts from every region of Pakistan. شاباش!
          </p>
        </div>
      )}

      {/* Passport spread */}
      <div className="bg-white rounded-[24px] border-4 border-[#1C3A2A] p-6 md:p-10 relative overflow-hidden"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(28,58,42,0.03) 28px)" }}>
        {/* Decorative corner crescent */}
        <div className="absolute top-4 left-4 opacity-10">
          <svg width={40} height={40} viewBox="0 0 40 40">
            <path d="M20,5 A15,15 0 1,1 5,20 A10,10 0 1,0 20,5 Z" fill="#C9921A" />
          </svg>
        </div>
        <div className="absolute top-4 right-4 opacity-10" style={{ transform: "scaleX(-1)" }}>
          <svg width={40} height={40} viewBox="0 0 40 40">
            <path d="M20,5 A15,15 0 1,1 5,20 A10,10 0 1,0 20,5 Z" fill="#C9921A" />
          </svg>
        </div>

        <p className="text-center eyebrow !text-[#C9921A] mb-2">Pakistan</p>
        <p className="text-center display-serif text-xl text-[#1C3A2A] mb-6">Craft Regions</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 justify-items-center">
          {REGIONS.map((r, i) => (
            <PassportStamp key={r.name} region={r} stamp={stampsMap[r.name]} delay={i * 0.08} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#6B645A] mb-2">
          <span>{collected} of {REGIONS.length} regions</span>
          <span>{Math.round((collected / REGIONS.length) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#FFF8EC] overflow-hidden border border-[rgba(28,58,42,0.08)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #C9921A, #E5A82E)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(collected / REGIONS.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CulturalDancers from "./CulturalDancers";

interface Props {
  show: boolean;
  region: string | undefined;
  city?: string;
  onClose: () => void;
  durationMs?: number;
}

const REGION_LABEL: Record<string, string> = {
  "Punjab": "Celebrating Punjab heritage",
  "Sindh": "Celebrating Sindhi heritage",
  "Khyber Pakhtunkhwa": "Celebrating KPK heritage",
  "Balochistan": "Celebrating Balochi heritage",
  "Gilgit-Baltistan": "Celebrating GB heritage",
  "AJK": "Celebrating Kashmiri heritage",
  "Islamabad": "Celebrating Pakistan's heritage",
};

/* ── Optional celebratory tone via WebAudio ───────── */
function playJingle() {
  try {
    const ctx = new AudioContext();
    const notes = [261.63, 329.63, 392.0, 523.25]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.13 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.13 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.13);
      osc.stop(ctx.currentTime + i * 0.13 + 0.4);
    });
  } catch {
    // AudioContext unavailable — silent graceful no-op
  }
}

/* ── Countdown ring ───────────────────────────────── */
function CountdownRing({ totalMs, onDone }: { totalMs: number; onDone: () => void }) {
  const total = Math.round(totalMs / 1000);
  const [secs, setSecs] = useState(total);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * (secs / total);

  useEffect(() => {
    if (secs <= 0) { onDone(); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, onDone]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(245,237,216,0.2)" strokeWidth={3} />
        <circle cx={28} cy={28} r={r} fill="none" stroke="#C9921A" strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          style={{ transition: "stroke-dasharray 0.9s linear" }} />
        <text x={28} y={33} textAnchor="middle" fontSize={13} fontWeight={700} fill="#F5EDD8">{secs}</text>
      </svg>
    </div>
  );
}

/* ── Floating particles ───────────────────────────── */
const PARTICLE_COUNT = 22;
function Particles() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 2.5,
    dur: 3.5 + Math.random() * 2.5,
    color: i % 3 === 0 ? "#C9921A" : i % 3 === 1 ? "#F5EDD8" : "#e8b144",
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: -10, width: p.size, height: p.size, background: p.color }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -(typeof window !== "undefined" ? window.innerHeight : 800) - 100, opacity: 0 }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────── */
export default function RegionalCelebration({
  show, region, city, onClose, durationMs = 10000,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRegion = region ?? "Islamabad";

  useEffect(() => {
    if (!show) return;
    playJingle();
    timerRef.current = setTimeout(onClose, durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, durationMs, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="celebration-overlay"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(15,34,25,0.93) 0%, rgba(28,58,42,0.97) 55%, rgba(10,26,18,0.95) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Particles />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close celebration"
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full grid place-items-center"
            style={{ background: "rgba(245,237,216,0.12)", color: "#F5EDD8", border: "1px solid rgba(245,237,216,0.2)" }}
          >
            <X size={18} />
          </button>

          {/* Countdown — bottom right */}
          <div className="absolute bottom-8 right-8 z-10">
            <CountdownRing totalMs={durationMs} onDone={onClose} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 max-w-2xl w-full">
            {/* شکریہ */}
            <motion.p
              className="urdu text-center leading-none"
              style={{ fontSize: "clamp(52px, 10vw, 96px)", color: "#C9921A",
                filter: "drop-shadow(0 4px 24px rgba(201,146,26,0.55))" }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
            >
              شکریہ
            </motion.p>

            {/* Subtitle */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
            >
              <p style={{ color: "#F5EDD8", fontSize: 17, fontWeight: 600, letterSpacing: "0.02em" }}>
                Order placed — your craft is on its way
              </p>
              {(city || activeRegion) && (
                <p style={{ color: "rgba(245,237,216,0.6)", fontSize: 13, marginTop: 4 }}>
                  {REGION_LABEL[activeRegion] ?? `Celebrating ${activeRegion} heritage`}
                  {city ? ` · ${city}` : ""}
                </p>
              )}
            </motion.div>

            {/* Dancers */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            >
              <CulturalDancers region={activeRegion} />
            </motion.div>

            {/* Decorative divider */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span style={{ width: 60, height: 1, background: "rgba(201,146,26,0.4)", display: "block" }} />
              <span style={{ color: "#C9921A", fontSize: 16 }}>✦</span>
              <span style={{ width: 60, height: 1, background: "rgba(201,146,26,0.4)", display: "block" }} />
            </motion.div>

            <motion.p
              style={{ color: "rgba(245,237,216,0.45)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Handcrafted in Pakistan · Delivered with pride
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

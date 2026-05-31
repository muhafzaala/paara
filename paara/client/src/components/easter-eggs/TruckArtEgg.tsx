import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEQ = ["P", "A", "A", "R", "A"];
const WIN = 2500;

export default function TruckArtEgg() {
  const [show, setShow] = useState(false);
  const buf = useRef<{ k: string; t: number }[]>([]);
  const playing = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;
      const k = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(k)) return;

      const now = Date.now();
      buf.current = buf.current.filter((x) => now - x.t < WIN);
      buf.current.push({ k, t: now });
      if (buf.current.length > SEQ.length) buf.current = buf.current.slice(-SEQ.length);

      if (
        buf.current.length === SEQ.length &&
        buf.current.every((x, i) => x.k === SEQ[i])
      ) {
        buf.current = [];
        if (playing.current) return;
        playing.current = true;
        setShow(true);
        honk();
        setTimeout(() => { setShow(false); playing.current = false; }, 10500);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const W = typeof window !== "undefined" ? window.innerWidth : 1400;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="truck-egg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[9998]"
          style={{ height: 200 }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-8"
              initial={{ x: -180 }}
              animate={{ x: W + 120, opacity: [0, 1, 1, 0], y: [0, -12, -6, 0] }}
              transition={{ duration: 10, delay: 0.5 + i * 0.35, ease: "linear", times: [0, 0.08, 0.92, 1] }}
            >
              <Floral color={i % 2 ? "#C9921A" : "#B91C1C"} size={18 + (i % 3) * 5} />
            </motion.div>
          ))}

          <motion.div
            className="absolute bottom-2"
            initial={{ x: -300 }}
            animate={{ x: W + 60 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            <Truck />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function honk() {
  try {
    const AC = (window as any).AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const beep = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.04);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    beep(330, 0, 0.25);
    beep(262, 0.32, 0.38);
    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch { /* noop */ }
}

function Truck() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      {/* cargo box */}
      <rect x="10" y="30" width="170" height="96" rx="5" fill="#F5EDD8" stroke="#1C3A2A" strokeWidth="3" />
      {/* gold bands */}
      <rect x="18" y="38" width="154" height="12" fill="#C9921A" />
      <rect x="18" y="50" width="154" height="2" fill="#1C3A2A" />
      <rect x="18" y="108" width="154" height="12" fill="#C9921A" />
      {/* flower medallions */}
      <g transform="translate(40,78)"><FlowerSm color="#B91C1C" /></g>
      <g transform="translate(95,78)"><FlowerSm color="#1A3A8B" /></g>
      <g transform="translate(150,78)"><FlowerSm color="#B91C1C" /></g>
      {/* chain fringe */}
      <g stroke="#F5EDD8" strokeWidth="1.5">
        {[25,40,55,70,85,100,115,130,145,160].map((x) => (
          <line key={x} x1={x} y1="38" x2={x+5} y2="50" />
        ))}
      </g>
      {/* cab */}
      <path d="M180,30 L180,126 L248,126 L248,72 L238,48 L205,48 L205,30 Z" fill="#1C3A2A" />
      {/* windshield */}
      <rect x="210" y="58" width="24" height="20" rx="2" fill="#FFF8EC" stroke="#C9921A" strokeWidth="1.5" />
      {/* gold accent */}
      <rect x="210" y="82" width="24" height="5" fill="#C9921A" />
      {/* bumper */}
      <rect x="186" y="122" width="64" height="5" fill="#C9921A" />
      {/* crown */}
      <rect x="10" y="22" width="170" height="10" fill="#B91C1C" />
      <path d="M10,22 L95,6 L180,22 Z" fill="#C9921A" stroke="#1C3A2A" strokeWidth="1.5" />
      <circle cx="95" cy="8" r="4" fill="#1A3A8B" />
      {/* fringe dots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={20 + i * 13} cy="28" r="2" fill="#F5EDD8" />
      ))}
      {/* rear wheel */}
      <motion.g style={{ transformOrigin: "50px 140px" }} animate={{ rotate: 360 }} transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}>
        <circle cx="50" cy="140" r="17" fill="#1C3A2A" />
        <circle cx="50" cy="140" r="6" fill="#C9921A" />
        <line x1="50" y1="125" x2="50" y2="155" stroke="#C9921A" strokeWidth="2" />
        <line x1="35" y1="140" x2="65" y2="140" stroke="#C9921A" strokeWidth="2" />
      </motion.g>
      {/* front wheel */}
      <motion.g style={{ transformOrigin: "218px 140px" }} animate={{ rotate: 360 }} transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}>
        <circle cx="218" cy="140" r="17" fill="#1C3A2A" />
        <circle cx="218" cy="140" r="6" fill="#C9921A" />
        <line x1="218" y1="125" x2="218" y2="155" stroke="#C9921A" strokeWidth="2" />
        <line x1="203" y1="140" x2="233" y2="140" stroke="#C9921A" strokeWidth="2" />
      </motion.g>
      {/* exhaust from rear */}
      <motion.g animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
        <circle cx="14" cy="40" r="6" fill="#6B645A" opacity="0.5" />
        <circle cx="7" cy="34" r="4" fill="#6B645A" opacity="0.35" />
      </motion.g>
    </svg>
  );
}

function FlowerSm({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="3" fill={color} />
      <circle cx="5" cy="12" r="3" fill={color} />
      <circle cx="19" cy="12" r="3" fill={color} />
      <circle cx="12" cy="19" r="3" fill={color} />
      <circle cx="12" cy="12" r="4" fill="#C9921A" />
    </svg>
  );
}

function Floral({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="3" fill={color} opacity="0.85" />
      <circle cx="5" cy="12" r="3" fill={color} opacity="0.85" />
      <circle cx="19" cy="12" r="3" fill={color} opacity="0.85" />
      <circle cx="12" cy="19" r="3" fill={color} opacity="0.85" />
      <circle cx="12" cy="12" r="3" fill="#C9921A" />
    </svg>
  );
}

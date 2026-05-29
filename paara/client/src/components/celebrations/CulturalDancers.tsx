import { motion } from "framer-motion";

interface Props { region: string; }

/* ── shared spring ─────────────────────────────────── */
const loop = (duration: number, delay = 0) => ({
  repeat: Infinity, ease: "easeInOut" as const, duration, delay,
});

/* ══════════════════════════════════════════════════════
   PUNJAB — Bhangra
   ══════════════════════════════════════════════════════ */
function PunjabDancers() {
  const dancers = [
    { cx: 130, delay: 0 },
    { cx: 300, delay: 0.22 },
    { cx: 470, delay: 0.44 },
  ];
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* sarson flowers drifting */}
      {[80, 200, 340, 430, 540].map((x, i) => (
        <motion.circle key={i} cx={x} cy={30} r={5} fill="#C9921A" opacity={0.6}
          animate={{ cy: [20, 260], opacity: [0.7, 0] }}
          transition={{ ...loop(2.8, i * 0.55), ease: "linear" }} />
      ))}

      {dancers.map(({ cx, delay }) => (
        <motion.g key={cx}
          animate={{ y: [0, -14, 0] }}
          transition={loop(0.6, delay)}>
          {/* Turban */}
          <ellipse cx={cx} cy={62} rx={26} ry={13} fill="#C9921A" />
          <ellipse cx={cx} cy={56} rx={18} ry={8} fill="#e8b144" />
          {/* Head */}
          <circle cx={cx} cy={82} r={20} fill="#C4894A" />
          {/* Moustache */}
          <path d={`M${cx-10},89 Q${cx},93 ${cx+10},89`} stroke="#5C2E00" strokeWidth={2} fill="none" />
          {/* Kurta body */}
          <path d={`M${cx-20},102 L${cx-22},175 L${cx+22},175 L${cx+20},102 Z`} fill="#F5EDD8" />
          {/* Dhoti */}
          <path d={`M${cx-22},158 Q${cx-30},210 ${cx-18},255 L${cx},245 L${cx+18},255 Q${cx+30},210 ${cx+22},158 Z`} fill="#B5651D" />
          {/* Left arm raised high */}
          <path d={`M${cx-18},115 L${cx-58},68`} stroke="#C4894A" strokeWidth={9} strokeLinecap="round" />
          <circle cx={cx-58} cy={68} r={6} fill="#C4894A" />
          {/* Right arm raised high */}
          <path d={`M${cx+18},115 L${cx+58},68`} stroke="#C4894A" strokeWidth={9} strokeLinecap="round" />
          <circle cx={cx+58} cy={68} r={6} fill="#C4894A" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SINDH — Jhumar
   ══════════════════════════════════════════════════════ */
function SindhDancers() {
  const dancers = [{ cx: 130 }, { cx: 300 }, { cx: 470 }];
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Shisha mirror glints */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle key={i} cx={100 + i * 105} cy={170} r={4} fill="white"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ ...loop(1.2, i * 0.24) }} />
      ))}

      {dancers.map(({ cx }, idx) => (
        <motion.g key={cx}
          style={{ originX: `${cx}px`, originY: "160px" }}
          animate={{ rotate: [-6, 6, -6] }}
          transition={loop(1.6, idx * 0.3)}>
          {/* Dupatta / shawl — Ajrak pattern */}
          <path d={`M${cx-55},95 Q${cx},70 ${cx+55},95 L${cx+48},200 Q${cx},220 ${cx-48},200 Z`}
            fill="#1A3A8B" opacity={0.85} />
          {/* Ajrak blocks */}
          <rect x={cx-35} y={110} width={12} height={12} fill="#8B1A1A" opacity={0.8} />
          <rect x={cx-18} y={125} width={12} height={12} fill="#8B1A1A" opacity={0.8} />
          <rect x={cx+6} y={110} width={12} height={12} fill="#8B1A1A" opacity={0.8} />
          <rect x={cx+23} y={125} width={12} height={12} fill="#8B1A1A" opacity={0.8} />
          {/* Head */}
          <circle cx={cx} cy={76} r={19} fill="#C4894A" />
          {/* Head covering */}
          <ellipse cx={cx} cy={65} rx={22} ry={10} fill="#1A3A8B" />
          {/* Arms extended sideways */}
          <path d={`M${cx-48},130 L${cx-20},118`} stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
          <path d={`M${cx+20},118 L${cx+48},130`} stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
          {/* Long skirt */}
          <path d={`M${cx-28},185 Q${cx-40},240 ${cx-30},260 L${cx+30},260 Q${cx+40},240 ${cx+28},185 Z`}
            fill="#8B1A1A" opacity={0.7} />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   KHYBER PAKHTUNKHWA — Khattak
   ══════════════════════════════════════════════════════ */
function KPKDancers() {
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Mountain silhouette */}
      <path d="M0,260 L120,120 L220,200 L340,80 L460,180 L600,100 L600,280 Z" fill="#1C3A2A" opacity={0.25} />

      {/* Dancer 1 — left */}
      <motion.g style={{ originX: "185px", originY: "180px" }}
        animate={{ rotate: [-4, 4, -4] }} transition={loop(0.9, 0)}>
        <circle cx={185} cy={95} r={20} fill="#C4894A" />
        <path d="M175,115 L170,200 L200,200 L195,115 Z" fill="#F5EDD8" />
        {/* Perahan (long tunic) */}
        <path d="M168,150 Q160,220 165,260 L205,260 Q210,220 202,150 Z" fill="#F5EDD8" opacity={0.9} />
        {/* Sabre left — spinning */}
        <motion.g style={{ originX: "155px", originY: "80px" }}
          animate={{ rotate: [0, 360] }} transition={{ ...loop(1.8, 0), ease: "linear" }}>
          <path d="M155,80 L155,30 M145,80 L165,80" stroke="#C9921A" strokeWidth={4} strokeLinecap="round" />
          <path d="M155,30 L152,18 L155,14 L158,18 Z" fill="#C9921A" />
        </motion.g>
        {/* Sabre right — counter spinning */}
        <motion.g style={{ originX: "215px", originY: "80px" }}
          animate={{ rotate: [0, -360] }} transition={{ ...loop(1.8, 0), ease: "linear" }}>
          <path d="M215,80 L215,30 M205,80 L225,80" stroke="#C9921A" strokeWidth={4} strokeLinecap="round" />
          <path d="M215,30 L212,18 L215,14 L218,18 Z" fill="#C9921A" />
        </motion.g>
      </motion.g>

      {/* Dancer 2 — right */}
      <motion.g style={{ originX: "415px", originY: "180px" }}
        animate={{ rotate: [4, -4, 4] }} transition={loop(0.9, 0.45)}>
        <circle cx={415} cy={95} r={20} fill="#C4894A" />
        <path d="M398,150 Q390,220 395,260 L435,260 Q440,220 432,150 Z" fill="#F5EDD8" opacity={0.9} />
        <motion.g style={{ originX: "385px", originY: "80px" }}
          animate={{ rotate: [0, -360] }} transition={{ ...loop(1.8, 0.45), ease: "linear" }}>
          <path d="M385,80 L385,30 M375,80 L395,80" stroke="#C9921A" strokeWidth={4} strokeLinecap="round" />
          <path d="M385,30 L382,18 L385,14 L388,18 Z" fill="#C9921A" />
        </motion.g>
        <motion.g style={{ originX: "445px", originY: "80px" }}
          animate={{ rotate: [0, 360] }} transition={{ ...loop(1.8, 0.45), ease: "linear" }}>
          <path d="M445,80 L445,30 M435,80 L455,80" stroke="#C9921A" strokeWidth={4} strokeLinecap="round" />
          <path d="M445,30 L442,18 L445,14 L448,18 Z" fill="#C9921A" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   BALOCHISTAN — Chap / Lewa
   ══════════════════════════════════════════════════════ */
function BalochiDancers() {
  const xs = [90, 210, 330, 450, 530];
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Desert dunes */}
      <path d="M0,255 Q100,215 200,240 Q300,210 400,240 Q500,215 600,240 L600,280 L0,280 Z" fill="#B5651D" opacity={0.35} />

      <motion.g
        animate={{ x: [-8, 8, -8] }}
        transition={loop(1.2, 0)}>
        {xs.map((cx, i) => (
          <g key={i}>
            {/* Baloch cap */}
            <ellipse cx={cx} cy={90} rx={18} ry={8} fill="#F5EDD8" />
            <path d={`M${cx-18},90 Q${cx},70 ${cx+18},90`} fill="#C9921A" />
            {/* Head */}
            <circle cx={cx} cy={105} r={17} fill="#C4894A" />
            {/* Body */}
            <path d={`M${cx-15},122 L${cx-18},210 L${cx+18},210 L${cx+15},122 Z`} fill="#F5EDD8" />
            {/* Embroidery panel */}
            <rect x={cx-10} y={130} width={20} height={30} fill="#8B1A1A" opacity={0.5} rx={2} />
            {/* Legs */}
            <path d={`M${cx-8},205 L${cx-10},255 M${cx+8},205 L${cx+10},255`}
              stroke="#1C3A2A" strokeWidth={7} strokeLinecap="round" />
            {/* Arms linking to neighbours */}
            {i < xs.length - 1 && (
              <path d={`M${cx+15},145 L${xs[i+1]-15},145`}
                stroke="#C4894A" strokeWidth={7} strokeLinecap="round" />
            )}
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   GILGIT-BALTISTAN — Nokala / Warrior dance
   ══════════════════════════════════════════════════════ */
function GBDancers() {
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Karakoram peaks */}
      <path d="M0,260 L80,130 L140,190 L220,90 L300,160 L380,70 L460,150 L540,100 L600,140 L600,280 Z"
        fill="#6B8BA4" opacity={0.3} />
      <path d="M220,90 L300,160 L380,70" fill="none" stroke="white" strokeWidth={1} opacity={0.4} />

      {/* Snowflakes */}
      {[60, 150, 300, 440, 550].map((x, i) => (
        <motion.text key={i} x={x} y={50} fontSize={14} fill="white" opacity={0.6} textAnchor="middle"
          animate={{ y: [30, 270], opacity: [0.7, 0] }}
          transition={{ ...loop(3.5, i * 0.7), ease: "linear" }}>❄</motion.text>
      ))}

      {/* Dancer pair — rotating slowly around center */}
      <motion.g style={{ originX: "300px", originY: "175px" }}
        animate={{ rotate: [0, 360] }}
        transition={{ ...loop(5, 0), ease: "linear" }}>
        {/* Dancer L */}
        <g transform="translate(-120,0)">
          {/* Pakol cap */}
          <ellipse cx={300} cy={100} rx={22} ry={10} fill="#8B4A1A" />
          <circle cx={300} cy={118} r={19} fill="#C4894A" />
          {/* Long woolen coat */}
          <path d="M282,137 Q276,195 278,255 L322,255 Q324,195 318,137 Z" fill="#4A3728" />
          {/* Embroidery hem */}
          <path d="M278,245 L322,245" stroke="#C9921A" strokeWidth={3} />
          {/* Arms up */}
          <path d="M284,152 L254,120 M316,152 L346,120" stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
          <circle cx={254} cy={120} r={6} fill="#C4894A" />
          <circle cx={346} cy={120} r={6} fill="#C4894A" />
        </g>
        {/* Dancer R */}
        <g transform="translate(120,0)">
          <ellipse cx={300} cy={100} rx={22} ry={10} fill="#8B4A1A" />
          <circle cx={300} cy={118} r={19} fill="#C4894A" />
          <path d="M282,137 Q276,195 278,255 L322,255 Q324,195 318,137 Z" fill="#4A3728" />
          <path d="M278,245 L322,245" stroke="#C9921A" strokeWidth={3} />
          <path d="M284,152 L254,120 M316,152 L346,120" stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
          <circle cx={254} cy={120} r={6} fill="#C4894A" />
          <circle cx={346} cy={120} r={6} fill="#C4894A" />
        </g>
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   AJK / KASHMIR — Rouf
   ══════════════════════════════════════════════════════ */
function AJKDancers() {
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Paisley motif on floor */}
      <ellipse cx={300} cy={265} rx={260} ry={12} fill="#C9921A" opacity={0.15} />

      {/* Snowflakes */}
      {[50, 160, 300, 440, 560].map((x, i) => (
        <motion.circle key={i} cx={x} cy={30} r={3} fill="white" opacity={0.7}
          animate={{ cy: [10, 270], opacity: [0.8, 0] }}
          transition={{ ...loop(4, i * 0.8), ease: "linear" }} />
      ))}

      {[{ cx: 185, delay: 0 }, { cx: 415, delay: 0.3 }].map(({ cx, delay }) => (
        <motion.g key={cx}
          style={{ originX: `${cx}px`, originY: "170px" }}
          animate={{ rotate: [-7, 7, -7] }}
          transition={loop(1.8, delay)}>
          {/* Pheran (long robe) */}
          <path d={`M${cx-32},118 Q${cx-42},195 ${cx-36},260 L${cx+36},260 Q${cx+42},195 ${cx+32},118 Z`}
            fill="#6B2D6B" opacity={0.85} />
          {/* Pheran pattern */}
          {[0, 1, 2].map((row) => (
            <ellipse key={row} cx={cx} cy={150 + row * 30} rx={18} ry={6} fill="#C9921A" opacity={0.3} />
          ))}
          {/* Head */}
          <circle cx={cx} cy={94} r={20} fill="#C4894A" />
          {/* Kashmiri cap */}
          <path d={`M${cx-20},88 Q${cx},68 ${cx+20},88`} fill="#8B1A4A" />
          <ellipse cx={cx} cy={88} rx={20} ry={7} fill="#8B1A4A" />
          {/* Arms gently extended */}
          <path d={`M${cx-28},130 L${cx-58},148`} stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
          <path d={`M${cx+28},130 L${cx+58},148`} stroke="#C4894A" strokeWidth={8} strokeLinecap="round" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   FALLBACK / ISLAMABAD — generic celebration
   ══════════════════════════════════════════════════════ */
function FallbackDancers() {
  const dancers = [{ cx: 150, delay: 0 }, { cx: 300, delay: 0.2 }, { cx: 450, delay: 0.4 }];
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 280 }}>
      {/* Gold confetti */}
      {[70, 160, 250, 360, 460, 540].map((x, i) => (
        <motion.rect key={i} x={x} y={20} width={8} height={8} rx={2} fill="#C9921A" opacity={0.7}
          animate={{ y: [0, 260], rotate: [0, 360], opacity: [0.8, 0] }}
          transition={{ ...loop(2.5, i * 0.42), ease: "linear" }} />
      ))}
      {dancers.map(({ cx, delay }) => (
        <motion.g key={cx}
          animate={{ y: [0, -14, 0] }}
          transition={loop(0.7, delay)}>
          <circle cx={cx} cy={100} r={22} fill="#C4894A" />
          <path d={`M${cx-20},122 Q${cx-24},185 ${cx-18},255 L${cx+18},255 Q${cx+24},185 ${cx+20},122 Z`}
            fill="#1C3A2A" />
          {/* Belt */}
          <rect x={cx-20} y={160} width={40} height={8} rx={4} fill="#C9921A" />
          {/* Left arm up */}
          <path d={`M${cx-17},135 L${cx-52},95`} stroke="#C4894A" strokeWidth={9} strokeLinecap="round" />
          <circle cx={cx-52} cy={95} r={7} fill="#C4894A" />
          {/* Right arm up */}
          <path d={`M${cx+17},135 L${cx+52},95`} stroke="#C4894A" strokeWidth={9} strokeLinecap="round" />
          <circle cx={cx+52} cy={95} r={7} fill="#C4894A" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════════════ */
export default function CulturalDancers({ region }: Props) {
  switch (region) {
    case "Punjab":               return <PunjabDancers />;
    case "Sindh":                return <SindhDancers />;
    case "Khyber Pakhtunkhwa":  return <KPKDancers />;
    case "Balochistan":          return <BalochiDancers />;
    case "Gilgit-Baltistan":    return <GBDancers />;
    case "AJK":                  return <AJKDancers />;
    default:                     return <FallbackDancers />;
  }
}

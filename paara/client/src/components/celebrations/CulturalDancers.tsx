import { motion } from "framer-motion";

interface Props { region: string; }

const loop = (duration: number, delay = 0) => ({
  repeat: Infinity, ease: "easeInOut" as const, duration, delay,
});

/* ══════════════════════════════════════════════════════
   PUNJAB — Bhangra (ref: jumping man with stick, orange turban)
   ══════════════════════════════════════════════════════ */
function PunjabDancers() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      {/* sarson pollen drifting */}
      {[60, 180, 320, 450, 540].map((x, i) => (
        <motion.circle key={i} cx={x} cy={20} r={4} fill="#C9921A" opacity={0.5}
          animate={{ cy: [0, 300], opacity: [0.6, 0] }}
          transition={{ ...loop(3, i * 0.6), ease: "linear" }} />
      ))}

      {/* ── single large jumping dancer centred ── */}
      <motion.g
        animate={{ y: [0, -18, 0] }}
        transition={loop(0.65, 0)}
        style={{ transformOrigin: "300px 220px" }}>

        {/* Stick (horizontal above head) */}
        <rect x={190} y={68} width={220} height={10} rx={5} fill="#5C3D1A" />
        {/* Left hand gripping stick */}
        <circle cx={200} cy={73} r={10} fill="#C4894A" />
        {/* Right hand gripping stick */}
        <circle cx={400} cy={73} r={10} fill="#C4894A" />

        {/* Turban — orange with green stripe */}
        <ellipse cx={300} cy={98} rx={44} ry={20} fill="#E07B1A" />
        <ellipse cx={300} cy={92} rx={36} ry={14} fill="#E07B1A" />
        <rect x={264} y={88} width={72} height={8} rx={4} fill="#2E7D32" />
        {/* Turban knot right */}
        <ellipse cx={340} cy={96} rx={14} ry={10} fill="#C9921A" />

        {/* Face */}
        <circle cx={300} cy={126} r={28} fill="#C4894A" />
        {/* Big smile */}
        <path d="M284,136 Q300,150 316,136" stroke="#5C2E00" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx={291} cy={122} r={4} fill="#2C1810" />
        <circle cx={309} cy={122} r={4} fill="#2C1810" />
        <circle cx={292} cy={121} r={1.5} fill="white" />
        <circle cx={310} cy={121} r={1.5} fill="white" />
        {/* Moustache */}
        <path d="M288,132 Q300,137 312,132" stroke="#3E1F00" strokeWidth={2} fill="none" />

        {/* Left arm up to stick */}
        <path d="M274,152 L200,80" stroke="#C4894A" strokeWidth={14} strokeLinecap="round" />
        {/* Right arm up to stick */}
        <path d="M326,152 L400,80" stroke="#C4894A" strokeWidth={14} strokeLinecap="round" />

        {/* Kurta (yellow-orange) */}
        <path d="M268,154 Q260,195 258,230 L342,230 Q340,195 332,154 Z" fill="#F5A623" />
        {/* Kurta collar */}
        <path d="M288,154 L300,170 L312,154" fill="#E07B1A" />
        {/* Belt / cummerbund */}
        <rect x={262} y={220} width={76} height={12} rx={6} fill="#8B1A1A" />

        {/* Dhoti (orange-brown, wide flowing) */}
        <path d="M258,230 Q240,262 248,290 L300,278 L352,290 Q360,262 342,230 Z" fill="#B5651D" />
        {/* Dhoti drape folds */}
        <path d="M270,245 Q280,265 275,285" stroke="#8B4A00" strokeWidth={2} fill="none" opacity={0.5} />
        <path d="M330,245 Q320,265 325,285" stroke="#8B4A00" strokeWidth={2} fill="none" opacity={0.5} />

        {/* Left leg — bent/jumping */}
        <path d="M272,285 Q255,292 250,298" stroke="#B5651D" strokeWidth={14} strokeLinecap="round" />
        {/* Right leg — bent back */}
        <path d="M328,285 Q345,292 352,298" stroke="#B5651D" strokeWidth={14} strokeLinecap="round" />
        {/* Feet (shoes/khussas) */}
        <ellipse cx={248} cy={298} rx={16} ry={7} fill="#3E1F00" />
        <ellipse cx={354} cy={298} rx={16} ry={7} fill="#3E1F00" />
      </motion.g>

      {/* Side dancers smaller */}
      {[{ cx: 100, delay: 0.22, scale: 0.58 }, { cx: 500, delay: 0.44, scale: 0.58 }].map(({ cx, delay, scale }) => (
        <motion.g key={cx}
          animate={{ y: [0, -12, 0] }}
          transition={loop(0.65, delay)}
          style={{ transformOrigin: `${cx}px 240px` }}>
          <g transform={`translate(${cx - 300 * scale}, ${300 - 300 * scale}) scale(${scale})`}>
            <rect x={232} y={76} width={136} height={8} rx={4} fill="#5C3D1A" />
            <circle cx={240} cy={80} r={8} fill="#C4894A" />
            <circle cx={368} cy={80} r={8} fill="#C4894A" />
            <ellipse cx={300} cy={104} rx={36} ry={16} fill="#E07B1A" />
            <rect x={270} y={98} width={60} height={6} rx={3} fill="#2E7D32" />
            <circle cx={300} cy={128} r={22} fill="#C4894A" />
            <path d="M289,137 Q300,147 311,137" stroke="#5C2E00" strokeWidth={2} fill="none" />
            <path d="M277,158 L240,88 M323,158 L360,88" stroke="#C4894A" strokeWidth={11} strokeLinecap="round" />
            <path d="M272,158 Q264,195 262,225 L338,225 Q336,195 328,158 Z" fill="#F5A623" />
            <rect x={264} y={218} width={72} height={10} rx={5} fill="#8B1A1A" />
            <path d="M262,225 Q246,255 252,285 L300,275 L348,285 Q354,255 338,225 Z" fill="#B5651D" />
          </g>
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   KPK — Khattak (ref: spinning man, white dress, red vest, red cap)
   ══════════════════════════════════════════════════════ */
function KPKDancers() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      {/* Mountain silhouette */}
      <path d="M0,270 L100,140 L200,210 L330,90 L460,190 L600,120 L600,300 L0,300 Z" fill="#1C3A2A" opacity={0.18} />

      {/* ── main spinning dancer ── */}
      <motion.g style={{ transformOrigin: "300px 185px" }}
        animate={{ rotate: [0, 360] }}
        transition={{ ...loop(2.2, 0), ease: "linear" }}>

        {/* Red topi cap */}
        <ellipse cx={300} cy={68} rx={28} ry={12} fill="#8B1A1A" />
        <path d="M272,72 Q300,50 328,72" fill="#8B1A1A" />

        {/* Face */}
        <circle cx={300} cy={92} r={26} fill="#C4894A" />
        {/* Beard stubble */}
        <path d="M276,104 Q300,118 324,104" fill="#6B3A1F" opacity={0.6} />
        <circle cx={291} cy={87} r={3.5} fill="#2C1810" />
        <circle cx={309} cy={87} r={3.5} fill="#2C1810" />
        <path d="M288,99 Q300,107 312,99" stroke="#5C2E00" strokeWidth={2} fill="none" />

        {/* White perahan (long shirt — flared for spin) */}
        <path d="M274,118 Q240,160 220,260 Q260,248 300,252 Q340,248 380,260 Q360,160 326,118 Z" fill="white" />
        {/* Perahan hem detail */}
        <path d="M222,254 Q300,266 378,254" stroke="#DDDDDD" strokeWidth={2} fill="none" />

        {/* Red embroidered vest over shirt */}
        <path d="M278,118 Q270,148 272,175 L328,175 Q330,148 322,118 Z" fill="#8B1A1A" />
        {/* Vest embroidery lines */}
        <path d="M282,125 L282,170 M290,122 L290,172 M300,121 L300,173 M310,122 L310,172 M318,125 L318,170"
          stroke="#C9921A" strokeWidth={1.5} opacity={0.7} />
        {/* Vest lapels */}
        <path d="M278,118 L295,135 L300,118" fill="#6B0000" />
        <path d="M322,118 L305,135 L300,118" fill="#6B0000" />

        {/* Arms outstretched (spinning) */}
        <path d="M276,135 L200,108" stroke="#C4894A" strokeWidth={12} strokeLinecap="round" />
        <path d="M324,135 L400,108" stroke="#C4894A" strokeWidth={12} strokeLinecap="round" />
        <circle cx={196} cy={107} r={9} fill="#C4894A" />
        <circle cx={404} cy={107} r={9} fill="#C4894A" />

        {/* Flared skirt/shalwar at bottom */}
        <path d="M232,248 Q248,270 252,295 L348,295 Q352,270 368,248 Z" fill="white" opacity={0.9} />
      </motion.g>

      {/* second dancer right — counter spin, smaller */}
      <motion.g style={{ transformOrigin: "460px 200px" }}
        animate={{ rotate: [360, 0] }}
        transition={{ ...loop(2.5, 0.6), ease: "linear" }}>
        <g transform="translate(460,200) scale(0.65) translate(-300,-185)">
          <ellipse cx={300} cy={68} rx={28} ry={12} fill="#8B1A1A" />
          <path d="M272,72 Q300,50 328,72" fill="#8B1A1A" />
          <circle cx={300} cy={92} r={26} fill="#C4894A" />
          <path d="M274,118 Q240,160 220,260 Q260,248 300,252 Q340,248 380,260 Q360,160 326,118 Z" fill="white" />
          <path d="M278,118 Q270,148 272,175 L328,175 Q330,148 322,118 Z" fill="#8B1A1A" />
          <path d="M276,135 L200,108 M324,135 L400,108" stroke="#C4894A" strokeWidth={12} strokeLinecap="round" />
        </g>
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SINDH — Jhumar (ref: 3 men, Sindhi topi, ajrak scarf, shalwar kameez)
   ══════════════════════════════════════════════════════ */
function SindhDancers() {
  const figures = [
    { cx: 115, kameezColor: "#F5EDD8", delay: 0 },
    { cx: 300, kameezColor: "#2C3E6B", delay: 0.25 },
    { cx: 485, kameezColor: "#B8D4E0", delay: 0.5 },
  ];
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      {/* Shisha mirror glints */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle key={i} cx={80 + i * 112} cy={160} r={3} fill="white" opacity={0.9}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ ...loop(1.1, i * 0.22) }} />
      ))}

      {figures.map(({ cx, kameezColor, delay }) => (
        <motion.g key={cx}
          style={{ transformOrigin: `${cx}px 200px` }}
          animate={{ rotate: [-4, 4, -4] }}
          transition={loop(1.8, delay)}>

          {/* Sindhi topi (round red cap) */}
          <ellipse cx={cx} cy={56} rx={26} ry={11} fill="#8B1A1A" />
          <path d={`M${cx-26},60 Q${cx},38 ${cx+26},60`} fill="#8B1A1A" />
          {/* Cap embroidery band */}
          <ellipse cx={cx} cy={60} rx={26} ry={5} fill="#C9921A" opacity={0.7} />

          {/* Face */}
          <circle cx={cx} cy={82} r={24} fill="#C4894A" />
          {/* Beard */}
          <path d={`M${cx-18},92 Q${cx},106 ${cx+18},92`} fill="#3E1F00" opacity={0.75} />
          {/* Eyes */}
          <circle cx={cx-8} cy={77} r={3} fill="#1C0A00" />
          <circle cx={cx+8} cy={77} r={3} fill="#1C0A00" />

          {/* Kameez (long shirt) */}
          <path d={`M${cx-26},106 Q${cx-30},170 ${cx-26},250 L${cx+26},250 Q${cx+30},170 ${cx+26},106 Z`}
            fill={kameezColor} />
          {/* Kameez collar */}
          <path d={`M${cx-10},106 L${cx},118 L${cx+10},106`} fill={kameezColor === "#F5EDD8" ? "#E0D4B8" : kameezColor === "#2C3E6B" ? "#1A2844" : "#90B8CC"} />

          {/* Ajrak scarf (red with blue, draped diagonally) */}
          <path d={`M${cx-26},108 L${cx+26},108 L${cx+30},155 L${cx-30},155 Z`}
            fill="#8B1A1A" opacity={0.9} />
          {/* Ajrak pattern circles */}
          {[-12, 0, 12].map((dx, pi) => (
            <circle key={pi} cx={cx + dx} cy={128 + (pi % 2) * 12} r={5} fill="none"
              stroke="#1A3A8B" strokeWidth={1.5} opacity={0.8} />
          ))}
          {[-12, 0, 12].map((dx, pi) => (
            <circle key={pi + 10} cx={cx + dx} cy={128 + (pi % 2) * 12} r={2} fill="#F5EDD8" opacity={0.6} />
          ))}
          {/* Ajrak bottom edge (navy panel) */}
          <rect x={cx - 30} y={148} width={60} height={10} rx={2}
            fill="#1A3A8B" opacity={0.8} />

          {/* Shalwar (wide trousers) */}
          <path d={`M${cx-26},245 Q${cx-32},268 ${cx-24},295 L${cx-6},295 L${cx},280 L${cx+6},295 L${cx+24},295 Q${cx+32},268 ${cx+26},245 Z`}
            fill={kameezColor} opacity={0.9} />

          {/* Sandals */}
          <rect x={cx - 22} y={292} width={18} height={6} rx={3} fill="#3E1F00" />
          <rect x={cx + 4} y={292} width={18} height={6} rx={3} fill="#3E1F00" />
          {/* Sandal straps */}
          <path d={`M${cx-18},292 L${cx-14},286`} stroke="#5C3010" strokeWidth={1.5} />
          <path d={`M${cx+8},292 L${cx+12},286`} stroke="#5C3010" strokeWidth={1.5} />

          {/* Arms at sides with gentle sway */}
          <path d={`M${cx-24},118 L${cx-36},195`} stroke="#C4894A" strokeWidth={11} strokeLinecap="round" />
          <path d={`M${cx+24},118 L${cx+36},195`} stroke="#C4894A" strokeWidth={11} strokeLinecap="round" />
          <circle cx={cx - 36} cy={196} r={8} fill="#C4894A" />
          <circle cx={cx + 36} cy={196} r={8} fill="#C4894A" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   BALOCHISTAN — Chap / Lewa (linked row, embroidered caps)
   ══════════════════════════════════════════════════════ */
function BalochiDancers() {
  const xs = [90, 210, 330, 450, 530];
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      {/* Desert dunes */}
      <path d="M0,270 Q150,240 300,260 Q450,240 600,265 L600,300 L0,300 Z" fill="#B5651D" opacity={0.3} />
      <motion.g animate={{ x: [-8, 8, -8] }} transition={loop(1.2, 0)}>
        {xs.map((cx, i) => (
          <g key={i}>
            <ellipse cx={cx} cy={64} rx={20} ry={9} fill="#F5EDD8" />
            <path d={`M${cx-20},66 Q${cx},44 ${cx+20},66`} fill="#C9921A" />
            <ellipse cx={cx} cy={64} rx={20} ry={5} fill="rgba(201,146,26,0.5)" />
            <circle cx={cx} cy={86} r={19} fill="#C4894A" />
            <path d={`M${cx-14},96 Q${cx},108 ${cx+14},96`} fill="#3E1F00" opacity={0.6} />
            <path d={`M${cx-18},105 Q${cx-22},175 ${cx-18},250 L${cx+18},250 Q${cx+22},175 ${cx+18},105 Z`}
              fill="#F5EDD8" />
            <rect x={cx - 12} y={128} width={24} height={32} rx={2} fill="#8B1A1A" opacity={0.55} />
            <path d={`M${cx-18},245 Q${cx-22},270 ${cx-14},295 L${cx-2},295 L${cx+2},295 L${cx+14},295 Q${cx+22},270 ${cx+18},245 Z`}
              fill="#F5EDD8" opacity={0.9} />
            <rect x={cx - 14} y={292} width={11} height={5} rx={2} fill="#3E1F00" />
            <rect x={cx + 3} y={292} width={11} height={5} rx={2} fill="#3E1F00" />
            {i < xs.length - 1 && (
              <path d={`M${cx + 18},138 L${xs[i + 1] - 18},138`}
                stroke="#C4894A" strokeWidth={9} strokeLinecap="round" />
            )}
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   GILGIT-BALTISTAN
   ══════════════════════════════════════════════════════ */
function GBDancers() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      <path d="M0,270 L80,140 L150,200 L240,95 L320,170 L400,75 L470,155 L550,105 L600,145 L600,300 Z"
        fill="#6B8BA4" opacity={0.28} />
      {[60, 165, 300, 445, 550].map((x, i) => (
        <motion.text key={i} x={x} y={40} fontSize={13} fill="white" opacity={0.55} textAnchor="middle"
          animate={{ y: [20, 280], opacity: [0.6, 0] }}
          transition={{ ...loop(4, i * 0.75), ease: "linear" }}>❄</motion.text>
      ))}
      <motion.g style={{ transformOrigin: "300px 185px" }}
        animate={{ rotate: [0, 360] }} transition={{ ...loop(5, 0), ease: "linear" }}>
        {[{ dx: -120 }, { dx: 120 }].map(({ dx }, i) => (
          <g key={i} transform={`translate(${dx},0)`}>
            <ellipse cx={300} cy={76} rx={24} ry={11} fill="#6B3A1F" />
            <circle cx={300} cy={98} r={22} fill="#C4894A" />
            <path d={`M274,120 Q268,188 272,255 L328,255 Q332,188 326,120 Z`} fill="#3A2A1A" />
            <path d="M272,245 L328,245" stroke="#C9921A" strokeWidth={2.5} />
            <path d="M278,240 L278,250 M286,238 L286,252 M300,237 L300,253 M314,238 L314,252 M322,240 L322,250"
              stroke="#C9921A" strokeWidth={1.2} opacity={0.7} />
            <path d={`M278,132 L240,105 M322,132 L360,105`} stroke="#C4894A" strokeWidth={10} strokeLinecap="round" />
            <circle cx={238} cy={104} r={8} fill="#C4894A" />
            <circle cx={362} cy={104} r={8} fill="#C4894A" />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   AJK / KASHMIR
   ══════════════════════════════════════════════════════ */
function AJKDancers() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      <ellipse cx={300} cy={285} rx={270} ry={14} fill="#C9921A" opacity={0.13} />
      {[55, 165, 300, 435, 555].map((x, i) => (
        <motion.circle key={i} cx={x} cy={20} r={3} fill="white" opacity={0.65}
          animate={{ cy: [5, 285], opacity: [0.75, 0] }}
          transition={{ ...loop(4.2, i * 0.85), ease: "linear" }} />
      ))}
      {[{ cx: 175, delay: 0 }, { cx: 425, delay: 0.35 }].map(({ cx, delay }) => (
        <motion.g key={cx} style={{ transformOrigin: `${cx}px 175px` }}
          animate={{ rotate: [-7, 7, -7] }} transition={loop(1.8, delay)}>
          <path d={`M${cx-20},86 Q${cx},64 ${cx+20},86`} fill="#8B1A4A" />
          <ellipse cx={cx} cy={88} rx={22} ry={8} fill="#8B1A4A" />
          <circle cx={cx} cy={108} r={22} fill="#C4894A" />
          <path d={`M${cx-33},130 Q${cx-44},195 ${cx-38},268 L${cx+38},268 Q${cx+44},195 ${cx+33},130 Z`}
            fill="#6B2D6B" opacity={0.88} />
          {[0, 1, 2].map((r) => (
            <ellipse key={r} cx={cx} cy={158 + r * 28} rx={20} ry={5} fill="#C9921A" opacity={0.28} />
          ))}
          <path d={`M${cx-30},142 L${cx-62},158 M${cx+30},142 L${cx+62},158`}
            stroke="#C4894A" strokeWidth={10} strokeLinecap="round" />
          <circle cx={cx - 63} cy={159} r={7} fill="#C4894A" />
          <circle cx={cx + 63} cy={159} r={7} fill="#C4894A" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   FALLBACK / ISLAMABAD
   ══════════════════════════════════════════════════════ */
function FallbackDancers() {
  return (
    <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" width="100%" height={300}>
      {[70, 165, 250, 360, 460, 545].map((x, i) => (
        <motion.rect key={i} x={x} y={10} width={8} height={8} rx={2} fill="#C9921A" opacity={0.7}
          animate={{ y: [0, 280], rotate: [0, 360], opacity: [0.8, 0] }}
          transition={{ ...loop(2.5, i * 0.42), ease: "linear" }} />
      ))}
      {[{ cx: 150, delay: 0 }, { cx: 300, delay: 0.2 }, { cx: 450, delay: 0.4 }].map(({ cx, delay }) => (
        <motion.g key={cx} animate={{ y: [0, -14, 0] }} transition={loop(0.7, delay)}>
          <ellipse cx={cx} cy={76} rx={26} ry={12} fill="#C9921A" />
          <circle cx={cx} cy={98} r={22} fill="#C4894A" />
          <path d={`M${cx-20},120 Q${cx-24},185 ${cx-18},260 L${cx+18},260 Q${cx+24},185 ${cx+20},120 Z`}
            fill="#1C3A2A" />
          <rect x={cx - 20} y={168} width={40} height={8} rx={4} fill="#C9921A" />
          <path d={`M${cx-17},135 L${cx-54},95 M${cx+17},135 L${cx+54},95`}
            stroke="#C4894A" strokeWidth={10} strokeLinecap="round" />
          <circle cx={cx - 54} cy={95} r={7} fill="#C4894A" />
          <circle cx={cx + 54} cy={95} r={7} fill="#C4894A" />
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
    case "Punjab":              return <PunjabDancers />;
    case "Sindh":               return <SindhDancers />;
    case "Khyber Pakhtunkhwa": return <KPKDancers />;
    case "Balochistan":         return <BalochiDancers />;
    case "Gilgit-Baltistan":   return <GBDancers />;
    case "AJK":                 return <AJKDancers />;
    default:                    return <FallbackDancers />;
  }
}

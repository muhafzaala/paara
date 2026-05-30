interface Props {
  label?: string;
  className?: string;
}

function Flourish() {
  return (
    <svg width={180} height={32} viewBox="0 0 180 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main bold sweeping curve */}
      <path
        d="M 2,18 C 24,18 36,6 58,11 C 80,16 94,26 118,21 C 142,16 158,9 178,16"
        stroke="#1C3A2A" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Secondary accent curve */}
      <path
        d="M 2,22 C 18,22 28,14 46,17"
        stroke="#C9921A" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Gold teardrop at inner tip */}
      <ellipse cx={168} cy={16} rx={6} ry={3.5} fill="#C9921A" transform="rotate(-10 168 16)" />
      <circle cx={175} cy={14} r={2.5} fill="#C9921A" />
    </svg>
  );
}

function Medallion() {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 8-pointed star — two overlapping squares */}
      <rect x={8} y={8} width={20} height={20} rx={1.5} fill="#1C3A2A" opacity="0.35" transform="rotate(0 18 18)" />
      <rect x={8} y={8} width={20} height={20} rx={1.5} fill="#1C3A2A" opacity="0.35" transform="rotate(45 18 18)" />
      {/* Inner ring */}
      <circle cx={18} cy={18} r={7} fill="none" stroke="#C9921A" strokeWidth="1.5" />
      {/* Gold centre */}
      <circle cx={18} cy={18} r={3.5} fill="#C9921A" />
    </svg>
  );
}

export default function CalligraphyDivider({ label, className }: Props) {
  return (
    <div className={`flex items-center justify-center gap-5 py-6 px-6 ${className ?? ""}`}>
      <Flourish />

      {label ? (
        <span className="display-serif shrink-0 px-3 cd-label">{label}</span>
      ) : (
        <div className="shrink-0"><Medallion /></div>
      )}

      <div className="cd-flourish-mirror">
        <Flourish />
      </div>
    </div>
  );
}

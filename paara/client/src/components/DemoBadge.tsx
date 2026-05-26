interface DemoBadgeProps {
  /** Position the badge absolutely inside its parent. Parent must have position: relative. */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
  /** Smaller variant for tight contexts (cart row, order detail) */
  size?: "sm" | "md";
}

const POSITIONS: Record<string, string> = {
  "top-left":     "absolute top-2 left-2",
  "top-right":    "absolute top-2 right-2",
  "bottom-left":  "absolute bottom-2 left-2",
  "bottom-right": "absolute bottom-2 right-2",
  "inline":       "inline-flex",
};

export function DemoBadge({ position = "top-left", size = "md" }: DemoBadgeProps) {
  const sizing = size === "sm"
    ? "px-1.5 py-0.5 text-[8px]"
    : "px-2 py-1 text-[9px]";
  return (
    <span
      className={`${POSITIONS[position]} ${sizing} z-[5] rounded-full font-bold uppercase tracking-[0.16em] pointer-events-none shadow-sm`}
      style={{
        background: "linear-gradient(135deg, #C9921A 0%, #E5A82E 100%)",
        color: "#1C3A2A",
        border: "1px solid rgba(28,58,42,0.15)",
        letterSpacing: "0.16em",
      }}
      aria-label="Demo product"
    >
      Demo
    </span>
  );
}

export default DemoBadge;

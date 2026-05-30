import logo from "@/assets/paara-logo.png";

// Polygon approximation of the Mughal arch shape — clips away white corners
const ARCH_CLIP =
  "polygon(3% 100%, 3% 42%, 5% 34%, 9% 26%, 15% 19%, 23% 12%, 33% 7%, 42% 4%, 50% 3%, 58% 4%, 67% 7%, 77% 12%, 85% 19%, 91% 26%, 95% 34%, 97% 42%, 97% 100%)";

interface PaaraLogoProps {
  height?: number;
  className?: string;
  shadow?: boolean;
}

export function PaaraLogo({ height = 64, className = "", shadow = true }: PaaraLogoProps) {
  const width = Math.round(height * 0.85);
  return (
    <img
      src={logo}
      alt="PAARA"
      width={width}
      height={height}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: "contain",
        objectPosition: "center top",
        clipPath: ARCH_CLIP,
        filter: shadow ? "drop-shadow(0 4px 14px rgba(201,146,26,0.4))" : undefined,
        display: "block",
        flexShrink: 0,
      }}
      className={className}
    />
  );
}

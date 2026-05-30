import { motion } from "framer-motion";

interface Props {
  city: string;
  size?: "sm" | "md";
  className?: string;
}

export default function MadeInStamp({ city, size = "md", className }: Props) {
  if (!city) return null;
  const dim = size === "sm" ? 44 : 68;
  const cityUpper = city.toUpperCase();
  // Scale city font down for longer names
  const cityFontSize = cityUpper.length > 9 ? 5.5 : cityUpper.length > 6 ? 7 : 9;

  return (
    <motion.div
      className={`inline-flex shrink-0 ${className ?? ""}`}
      initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: -6, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.2 }}
      style={{ width: dim, height: dim }}
      aria-label={`Made in ${city}`}
    >
      <svg viewBox="0 0 68 68" width={dim} height={dim} xmlns="http://www.w3.org/2000/svg">
        {/* Outer dashed ring — gold */}
        <circle cx="34" cy="34" r="32" stroke="#C9921A" strokeWidth="1.8" strokeDasharray="4 2.5" fill="none" />
        {/* Inner solid disc — heritage green */}
        <circle cx="34" cy="34" r="26" fill="#1C3A2A" />
        {/* Inner ring border */}
        <circle cx="34" cy="34" r="26" stroke="#C9921A" strokeWidth="1.2" fill="none" opacity="0.6" />
        {/* "MADE IN" tiny caps */}
        <text
          x="34" y="28"
          textAnchor="middle"
          fill="#F5EDD8"
          fontSize="6"
          fontFamily="Georgia, serif"
          letterSpacing="2"
          opacity="0.75"
        >
          MADE IN
        </text>
        {/* Decorative line above city */}
        <line x1="18" y1="31" x2="50" y2="31" stroke="#C9921A" strokeWidth="0.8" opacity="0.5" />
        {/* City name */}
        <text
          x="34" y="42"
          textAnchor="middle"
          fill="#C9921A"
          fontSize={cityFontSize}
          fontFamily="Georgia, serif"
          fontWeight="bold"
          letterSpacing="1"
        >
          {cityUpper}
        </text>
        {/* Decorative dots */}
        <circle cx="21" cy="34" r="1.2" fill="#C9921A" opacity="0.5" />
        <circle cx="47" cy="34" r="1.2" fill="#C9921A" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

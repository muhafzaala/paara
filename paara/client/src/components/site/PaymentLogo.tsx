import { type LucideIcon } from "lucide-react";
import { useState } from "react";

interface PaymentLogoProps {
  /** Logo identifier — must match file name in /public/payment-logos/ */
  id: string;
  /** Fallback Lucide icon to render if the logo image fails to load */
  fallbackIcon: LucideIcon;
  /** Brand color used for the fallback icon background */
  color: string;
  /** Display label for accessibility */
  alt: string;
  /** Size of the logo container in px (defaults to 48) */
  size?: number;
}

/**
 * Renders a payment method's brand logo from /public/payment-logos/{id}.png.
 * Gracefully falls back to a Lucide icon with brand color if the image is missing.
 *
 * To add real logos: drop {id}.png files (transparent background recommended) into
 * paara/client/public/payment-logos/. They'll auto-load on next render.
 */
export function PaymentLogo({ id, fallbackIcon: Icon, color, alt, size = 48 }: PaymentLogoProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className="rounded-xl grid place-items-center shrink-0"
        style={{ width: size, height: size, background: `${color}15`, color }}
      >
        <Icon size={Math.round(size * 0.42)} />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden shrink-0 bg-white border border-[rgba(28,58,42,0.06)] grid place-items-center"
      style={{ width: size, height: size }}
    >
      <img
        src={`/payment-logos/${id}.png`}
        alt={alt}
        className="w-full h-full object-contain p-1.5"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

interface SupportedBanksRowProps {
  /** Logo identifiers — match file names in /public/payment-logos/ */
  ids: string[];
}

/**
 * Small row of supported bank / card-network logos shown under bank transfer option.
 * Each logo gracefully hides itself if its file is missing.
 */
export function SupportedBanksRow({ ids }: SupportedBanksRowProps) {
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B645A] font-semibold">
        Supports
      </span>
      {ids.map((id) => (
        <SmallBankLogo key={id} id={id} />
      ))}
    </div>
  );
}

function SmallBankLogo({ id }: { id: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <div className="h-6 w-12 rounded bg-white border border-[rgba(28,58,42,0.06)] grid place-items-center overflow-hidden">
      <img
        src={`/payment-logos/${id}.png`}
        alt={id}
        className="max-h-5 max-w-10 object-contain"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

export default PaymentLogo;

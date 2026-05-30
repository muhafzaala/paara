import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

export default function CountUpNumber({
  value,
  durationMs = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: Props) {
  const animated = useCountUp(value, durationMs, decimals);
  const display = format ? format(animated) : `${prefix}${animated}${suffix}`;
  return <span className={className}>{display}</span>;
}

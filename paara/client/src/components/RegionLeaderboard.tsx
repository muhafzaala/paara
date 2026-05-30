import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/lib/api";
import { motion } from "framer-motion";

const RANK_STYLE = [
  { color: "#C9921A", label: "#1" },  // gold
  { color: "#9E9E9E", label: "#2" },  // silver
  { color: "#B5651D", label: "#3" },  // bronze
  { color: "#6B645A", label: "#4" },
  { color: "#6B645A", label: "#5" },
  { color: "#6B645A", label: "#6" },
];

function formatPKR(n: number) {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}K`;
  return `PKR ${n}`;
}

export default function RegionLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["region-leaderboard"],
    queryFn: async () => {
      try { return (await leaderboardApi.getRegions()).data; }
      catch { return null; }
    },
    staleTime: 1000 * 60 * 10,
  });

  const rows: any[] = data?.leaderboard || [];
  const maxUnits = rows[0]?.units || 1;

  if (isLoading) return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
      <div className="h-48 rounded-2xl bg-white animate-pulse" />
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
      <div className="bg-white rounded-[24px] border border-[rgba(28,58,42,0.08)] p-8 md:p-10">
        <header className="mb-8">
          <p className="eyebrow mb-2">By Region</p>
          <h2 className="display-serif text-3xl md:text-4xl text-[#1C3A2A]">
            Pakistan's Top-Loved <em className="italic text-[#C9921A]">Regions</em>
          </h2>
        </header>

        {rows.length === 0 ? (
          <p className="text-[#6B645A] text-sm py-8 text-center">
            No sales data yet — the marketplace is just getting started.
          </p>
        ) : (
          <ul className="space-y-5">
            {rows.map((row, i) => {
              const style = RANK_STYLE[i] ?? RANK_STYLE[5];
              const pct = Math.round((row.units / maxUnits) * 100);
              return (
                <motion.li
                  key={row._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="flex items-center gap-5"
                >
                  {/* Rank */}
                  <span
                    className="font-display text-xl font-bold w-8 shrink-0 text-right"
                    style={{ color: style.color }}
                  >
                    {style.label}
                  </span>

                  {/* Bar + label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="display-serif text-base font-semibold text-[#1C3A2A] truncate">
                        {row._id}
                      </span>
                      <span className="text-xs text-[#6B645A] shrink-0 ml-3">
                        {row.units} sold · {formatPKR(row.revenue)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5EDD8] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? "#C9921A" : "#1C3A2A" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.07 + 0.2, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

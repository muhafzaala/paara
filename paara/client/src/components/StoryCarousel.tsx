import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { storiesApi } from "@/lib/api";

export default function StoryCarousel() {
  const { data, isLoading } = useQuery({
    queryKey: ["approved-stories"],
    queryFn: async () => {
      try { return (await storiesApi.listApproved()).data.stories; }
      catch { return []; }
    },
    staleTime: 1000 * 60 * 5,
  });

  const stories: any[] = data || [];
  if (isLoading || !stories.length) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
      <header className="mb-8">
        <p className="eyebrow mb-2">Community</p>
        <h2 className="display-serif text-3xl md:text-4xl text-[#1C3A2A]">
          Voices of our <em className="italic text-[#C9921A]">community</em>
        </h2>
      </header>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x scrollbar-hide">
        {stories.map((s: any, i: number) => (
          <motion.div
            key={s._id}
            className="snap-start shrink-0 w-72 bg-white rounded-[20px] overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45, ease: "easeOut" }}
          >
            {/* Image */}
            <div className="aspect-[4/3] bg-[#FFF8EC] overflow-hidden">
              <img
                src={s.imageUrl}
                alt={s.title || "Buyer story"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Text */}
            <div className="p-5 flex flex-col flex-1">
              {s.title && (
                <p className="font-display font-semibold text-[#1C3A2A] text-sm mb-2 line-clamp-1">{s.title}</p>
              )}
              <p className="text-sm text-[#3D2914] leading-relaxed flex-1 line-clamp-4">
                "{s.note.length > 140 ? s.note.slice(0, 140).trimEnd() + "…" : s.note}"
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(28,58,42,0.06)]">
                <div>
                  <p className="text-xs font-semibold text-[#1C3A2A]">{s.buyer?.name?.split(" ")[0] || "A buyer"}</p>
                  {s.product && (
                    <p className="text-[10px] text-[#6B645A] mt-0.5">{s.product.name}</p>
                  )}
                </div>
                <p className="text-[10px] text-[#6B645A]">
                  {new Date(s.createdAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

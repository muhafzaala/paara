import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Eye, MapPin, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { heritageApi } from "@/lib/api";

export const Route = createFileRoute("/heritage")({
  head: () => ({
    meta: [
      { title: "Heritage Stories · PAARA" },
      { name: "description", content: "Long-form stories from Pakistan's artisans — the people, places and processes behind every craft." },
    ],
  }),
  component: HeritagePage,
});

const REGIONS = ["All", "Lahore", "Multan", "Hunza", "Peshawar", "Karachi", "Skardu", "Balochistan"];
const CRAFTS = ["All", "Pottery", "Woodwork", "Textiles", "Jewellery", "Embroidery", "Leather", "Metalwork", "Other"];

function HeritagePage() {
  const [region, setRegion] = useState("All");
  const [craft, setCraft] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["heritage", region, craft],
    queryFn: async () => {
      const params: any = {};
      if (region !== "All") params.region = region;
      if (craft !== "All") params.craft = craft;
      const res = await heritageApi.list(params);
      return res.data;
    },
  });

  const stories: any[] = data?.stories || [];
  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />

      {/* Hero banner */}
      <div className="pt-24 bg-[#0F2219] text-[#F5EDD8]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-16 lg:py-24">
          <p className="eyebrow !text-[#C9921A] mb-4">Heritage Stories</p>
          <h1 className="display-serif text-5xl lg:text-7xl leading-tight max-w-[20ch] mb-4">
            The <em className="italic text-[#C9921A]">people</em> behind every piece.
          </h1>
          <p className="text-[rgba(245,237,216,0.7)] max-w-lg leading-relaxed">
            Long-form stories from Pakistan's artisans — the traditions, struggles and quiet brilliance that give each craft its soul.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-10">
          <FilterGroup label="Region" options={REGIONS} active={region} onChange={setRegion} />
          <FilterGroup label="Craft" options={CRAFTS} active={craft} onChange={setCraft} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#C9921A]" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={48} className="mx-auto text-[#C9921A] mb-4 opacity-50" />
            <h2 className="display-serif text-2xl text-[#1C3A2A] mb-2">No stories yet</h2>
            <p className="text-[#6B645A]">Artisans are writing their first stories — check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured story — large card */}
            {featured && (
              <Link to="/heritage/$id" params={{ id: featured._id }} className="group block mb-10">
                <div className="grid md:grid-cols-[1.4fr_1fr] rounded-[28px] overflow-hidden bg-white border border-[rgba(28,58,42,0.08)] hover:shadow-xl transition-shadow duration-500">
                  <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                    {featured.coverImage ? (
                      <img src={featured.coverImage} alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full min-h-[320px] bg-[#1C3A2A] grid place-items-center">
                        <BookOpen size={48} className="text-[#C9921A] opacity-40" />
                      </div>
                    )}
                    {featured.region && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#C9921A] text-[#1C3A2A] text-xs font-bold">
                        {featured.region}
                      </span>
                    )}
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <p className="eyebrow mb-3">{featured.craft || "Heritage"}</p>
                    <h2 className="display-serif text-3xl lg:text-4xl text-[#1C3A2A] leading-tight mb-4">{featured.title}</h2>
                    {featured.excerpt && (
                      <p className="text-[#3D2914] leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#6B645A] mt-auto">
                      {featured.seller?.shopName || featured.seller?.name ? (
                        <span className="font-medium text-[#1C3A2A]">
                          By {featured.seller.shopName || featured.seller.name}
                        </span>
                      ) : null}
                      {featured.views > 0 && (
                        <span className="flex items-center gap-1"><Eye size={12} /> {featured.views} reads</span>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C9921A] group-hover:gap-3 transition-all">
                      Read the story →
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Story grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((story: any) => (
                  <StoryCard key={story._id} story={story} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function StoryCard({ story }: { story: any }) {
  return (
    <Link to="/heritage/$id" params={{ id: story._id }}
      className="group block bg-white rounded-[20px] overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-lg transition-all duration-400">
      <div className="relative aspect-[16/9] overflow-hidden">
        {story.coverImage ? (
          <img src={story.coverImage} alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-[#1C3A2A] grid place-items-center">
            <BookOpen size={32} className="text-[#C9921A] opacity-30" />
          </div>
        )}
        {story.region && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C9921A] text-[#1C3A2A] text-[10px] font-bold">
            {story.region}
          </span>
        )}
      </div>
      <div className="p-5">
        {story.craft && <p className="eyebrow !text-[10px] mb-2">{story.craft}</p>}
        <h3 className="display-serif text-xl text-[#1C3A2A] leading-snug mb-2 line-clamp-2">{story.title}</h3>
        {story.excerpt && (
          <p className="text-sm text-[#6B645A] leading-relaxed line-clamp-2 mb-4">{story.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-[#6B645A]">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {story.seller?.shopName || story.seller?.name || "Artisan"}
          </span>
          {story.views > 0 && (
            <span className="flex items-center gap-1"><Eye size={11} /> {story.views}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FilterGroup({ label, options, active, onChange }: { label: string; options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B645A] mr-1">{label}:</span>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            active === o
              ? "bg-[#1C3A2A] text-[#F5EDD8] border-[#C9921A]"
              : "bg-white text-[#1C3A2A] border-[rgba(28,58,42,0.2)]"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

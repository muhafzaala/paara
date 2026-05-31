import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { citiesApi } from "@/lib/api";
import lahoreImg from "@/assets/cities/Lahore.jpg";
import multanImg from "@/assets/cities/Multan.jpg";
import hunzaImg from "@/assets/cities/Hunza.jpg";
import peshawarImg from "@/assets/cities/Peshawar.jpg";
import karachiImg from "@/assets/cities/Karachi.jpg";
import skarduImg from "@/assets/cities/Skardu.jpg";
import gilgitImg from "@/assets/cities/Gilgit.jpg";
import balochImg from "@/assets/cities/Balochistan.jpg";
import islamabadImg from "@/assets/cities/Islamabad.jpg";
import faisalabadImg from "@/assets/cities/Faisalabad.jpg";
import mardanImg from "@/assets/cities/Mardan.jpg";

export const Route = createFileRoute("/regions")({
  head: () => ({ meta: [{ title: "Regions · PAARA" }] }),
  component: RegionsPage,
});

const CITY_IMAGES: Record<string, string> = {
  Lahore: lahoreImg, Multan: multanImg, Hunza: hunzaImg, Peshawar: peshawarImg,
  Karachi: karachiImg, Skardu: skarduImg, Gilgit: gilgitImg, Balochistan: balochImg,
  Islamabad: islamabadImg, Faisalabad: faisalabadImg, Mardan: mardanImg,
};

/**
 * Pakistan SVG map — viewBox "0 0 500 555"
 * Province paths are carefully traced from geographic data.
 * Colors match the standard Pakistan political map palette.
 *
 * Coordinate scale (approximate):
 *   x = (lon - 60.5) × 28.24 + 10    [60.5°E → x≈10,  77.5°E → x≈490]
 *   y = (37.5 - lat) × 37.76 + 10    [37.5°N → y≈10,  23.5°N → y≈540]
 */
const PROVINCES = [
  {
    id: "gilgit-baltistan",
    name: "Gilgit-Baltistan",
    shortName: "GB",
    // Runs along the northern top of Pakistan — wide east-west band
    path: "M 310,57 L 295,68 L 276,55 L 268,38 L 286,20 L 325,10 L 375,10 L 422,18 L 462,36 L 470,68 L 452,92 L 428,108 L 400,115 L 372,112 L 348,106 L 326,100 Z",
    labelX: 372, labelY: 66,
    fill: "#8B5CF6",
    fillHover: "#7C3AED",
    stroke: "#5B21B6",
    pillClass: "bg-[#8B5CF6]",
    crafts: ["Walnut Woodwork", "Silver Jewellery", "Gemstones", "Woollen Textiles"],
    filterValue: "Gilgit",
  },
  {
    id: "ajk",
    name: "Azad Jammu & Kashmir",
    shortName: "AJK",
    // Narrow strip east of GB, bordering India's LoC
    path: "M 372,112 L 400,115 L 428,108 L 442,128 L 434,158 L 418,172 L 402,162 L 388,146 L 374,130 Z",
    labelX: 418, labelY: 138,
    fill: "#EC4899",
    fillHover: "#DB2777",
    stroke: "#9D174D",
    pillClass: "bg-[#EC4899]",
    crafts: ["Pashmina Shawls", "Chain-stitch Embroidery", "Kani Weaving"],
    filterValue: "Kashmir",
  },
  {
    id: "kpk",
    name: "Khyber Pakhtunkhwa",
    shortName: "KPK",
    // Northwest province — includes the northern Chitral finger pointing up
    path: "M 268,38 L 310,57 L 326,100 L 308,112 L 292,128 L 292,162 L 272,186 L 246,196 L 218,192 L 194,176 L 174,156 L 178,136 L 196,118 L 220,100 L 254,74 Z",
    labelX: 234, labelY: 150,
    fill: "#F97316",
    fillHover: "#EA580C",
    stroke: "#C2410C",
    pillClass: "bg-[#F97316]",
    crafts: ["Copperwork", "Stone Carving", "Pottery", "Leather Goods"],
    filterValue: "Peshawar",
  },
  {
    id: "fata",
    name: "Tribal Districts (Ex-FATA)",
    shortName: "Tribal",
    // Thin band between KPK and Balochistan, now merged into KPK
    path: "M 178,156 L 194,176 L 218,192 L 246,196 L 260,188 L 244,210 L 228,228 L 210,218 L 195,202 L 176,178 Z",
    labelX: 215, labelY: 200,
    fill: "#FB923C",
    fillHover: "#F97316",
    stroke: "#C2410C",
    pillClass: "bg-[#FB923C]",
    crafts: ["Traditional Weaving", "Folk Art", "Copper Craft"],
    filterValue: "Peshawar",
  },
  {
    id: "punjab",
    name: "Punjab",
    shortName: "Punjab",
    // Large central-eastern province — the heartland
    path: "M 292,128 L 308,112 L 326,100 L 348,106 L 372,112 L 374,130 L 388,146 L 402,162 L 418,172 L 426,196 L 430,242 L 420,286 L 400,320 L 372,344 L 342,358 L 312,362 L 282,352 L 258,324 L 246,292 L 246,258 L 252,222 L 260,188 L 244,210 L 260,188 L 268,178 Z",
    labelX: 348, labelY: 248,
    fill: "#84CC16",
    fillHover: "#65A30D",
    stroke: "#3F6212",
    pillClass: "bg-[#84CC16]",
    crafts: ["Phulkari Embroidery", "Khussa Shoes", "Mosaic Tiles", "Khaddar Textiles"],
    filterValue: "Lahore",
  },
  {
    id: "balochistan",
    name: "Balochistan",
    shortName: "Balochistan",
    // Vast southwestern province — Pakistan's largest
    path: "M 20,240 L 174,182 L 194,200 L 218,214 L 244,228 L 246,262 L 238,298 L 220,338 L 202,378 L 183,416 L 163,446 L 136,462 L 100,464 L 66,452 L 38,432 L 18,406 L 10,370 L 10,310 L 14,270 L 18,252 Z",
    labelX: 108, labelY: 340,
    fill: "#F59E0B",
    fillHover: "#D97706",
    stroke: "#92400E",
    pillClass: "bg-[#F59E0B]",
    crafts: ["Mirror Embroidery", "Wool Carpets", "Kilims", "Balochi Weaving"],
    filterValue: "Balochistan",
  },
  {
    id: "sindh",
    name: "Sindh",
    shortName: "Sindh",
    // Southeastern province — the Indus delta
    path: "M 246,296 L 282,352 L 312,362 L 342,372 L 360,408 L 352,450 L 330,472 L 302,484 L 274,482 L 250,466 L 232,444 L 226,420 L 222,394 L 228,370 L 242,352 Z",
    labelX: 286, labelY: 422,
    fill: "#7C3AED",
    fillHover: "#6D28D9",
    stroke: "#4C1D95",
    pillClass: "bg-[#7C3AED]",
    crafts: ["Ajrak Block-Printing", "Ralli Quilts", "Lacquerwork", "Sindhi Pottery"],
    filterValue: "Karachi",
  },
];

// Islamabad Capital Territory — shown as a small star/circle
const ICT = { x: 364, y: 155, name: "Islamabad (ICT)", crafts: ["Marble Inlay", "Contemporary Crafts"], filterValue: "Islamabad" };

// City pin markers (name, coordinates, crafts, filter)
const CITY_PINS = [
  { name: "Peshawar",   x: 237, y: 145, crafts: ["Copperwork", "Stone Carving"],        filterValue: "Peshawar" },
  { name: "Islamabad",  x: 364, y: 155, crafts: ["Marble Inlay", "Contemporary"],        filterValue: "Islamabad" },
  { name: "Lahore",     x: 400, y: 238, crafts: ["Phulkari", "Tiles", "Khussa"],         filterValue: "Lahore" },
  { name: "Faisalabad", x: 360, y: 252, crafts: ["Khaddar Textiles", "Handloom"],        filterValue: "Faisalabad" },
  { name: "Multan",     x: 316, y: 302, crafts: ["Blue Pottery", "Camel-skin Lamp"],     filterValue: "Multan" },
  { name: "Quetta",     x: 193, y: 300, crafts: ["Mirror Embroidery", "Gemstones"],      filterValue: "Balochistan" },
  { name: "Karachi",    x: 183, y: 472, crafts: ["Ajrak", "Ralli", "Leather"],           filterValue: "Karachi" },
  { name: "Hyderabad",  x: 222, y: 450, crafts: ["Lacquerware", "Folk Jewellery"],       filterValue: "Karachi" },
  { name: "Gilgit",     x: 400, y: 78,  crafts: ["Walnut Craft", "Silver Arts"],         filterValue: "Gilgit" },
  { name: "Hunza",      x: 382, y: 58,  crafts: ["Woodwork", "Gemstones"],               filterValue: "Hunza" },
  { name: "Skardu",     x: 440, y: 90,  crafts: ["Jade Carving", "Stone Work"],          filterValue: "Skardu" },
  { name: "Mardan",     x: 264, y: 140, crafts: ["Leather Journals", "Pottery"],         filterValue: "Mardan" },
];

function RegionsPage() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => { try { return (await citiesApi.getAll()).data.cities; } catch { return []; } },
    staleTime: 1000 * 60 * 10,
  });

  const cities: any[] = data || [];

  const activeProvince = PROVINCES.find((p) => p.id === hoveredId);
  const activePin = CITY_PINS.find((p) => p.name === hoveredPin);
  const tooltip = activePin
    ? { name: activePin.name, crafts: activePin.crafts, filter: activePin.filterValue }
    : activeProvince
    ? { name: activeProvince.name, crafts: activeProvince.crafts, filter: activeProvince.filterValue }
    : null;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">

          {/* Page header */}
          <p className="eyebrow mb-4">By region</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h1 className="display-serif text-5xl md:text-7xl text-[#1C3A2A] leading-[0.95]">
              Every city<br />tells a <em className="italic text-[#C9921A]">story.</em>
            </h1>
            <p className="text-[#3D2914] max-w-md leading-relaxed text-sm">
              From the kilns of Multan to the walnut forests of Hunza — each region of Pakistan carries its own vocabulary of craft. Explore by origin.
            </p>
          </div>

          {/* ── Interactive Pakistan Map ── */}
          <div className="mb-16 bg-[#0F2219] rounded-[28px] overflow-hidden">
            <div className="p-6 md:p-10">
              <p className="eyebrow !text-[#C9921A] mb-1">Interactive Map</p>
              <h2 className="display-serif text-2xl text-[#F5EDD8] mb-8">Pakistan's craft regions</h2>

              <div className="flex flex-col lg:flex-row gap-10 items-start">

                {/* SVG Map */}
                <div className="w-full lg:w-[420px] flex-shrink-0">
                  <svg
                    viewBox="0 0 500 555"
                    className="w-full select-none drop-shadow-2xl"
                    aria-label="Interactive map of Pakistan"
                  >
                    {/* ── Province fills ── */}
                    {PROVINCES.map((prov) => {
                      const isHovered = hoveredId === prov.id;
                      return (
                        <g key={prov.id}>
                          <path
                            d={prov.path}
                            fill={isHovered ? prov.fillHover : prov.fill}
                            stroke={prov.stroke}
                            strokeWidth={isHovered ? 2.5 : 1.5}
                            strokeLinejoin="round"
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => { setHoveredId(prov.id); setHoveredPin(null); }}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => navigate({ to: "/products", search: { region: prov.filterValue } as any })}
                          />
                          {/* Province name label */}
                          <text
                            x={prov.labelX}
                            y={prov.labelY}
                            textAnchor="middle"
                            fontSize={prov.id === "fata" ? "6" : prov.id === "ajk" ? "5.5" : "8"}
                            fontWeight="700"
                            fontFamily="var(--font-display, serif)"
                            fill={isHovered ? "#FFFBEB" : "rgba(255,255,255,0.92)"}
                            className="pointer-events-none select-none transition-colors duration-200"
                          >
                            {prov.shortName}
                          </text>
                        </g>
                      );
                    })}

                    {/* ── Islamabad ICT dot ── */}
                    <circle
                      cx={ICT.x} cy={ICT.y} r={5}
                      fill={hoveredPin === ICT.name ? "#FBBF24" : "#22C55E"}
                      stroke="#14532D" strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => { setHoveredPin(ICT.name); setHoveredId(null); }}
                      onMouseLeave={() => setHoveredPin(null)}
                      onClick={() => navigate({ to: "/products", search: { region: ICT.filterValue } as any })}
                    />
                    <text x={ICT.x + 7} y={ICT.y + 4} fontSize="5.5" fontWeight="700"
                      fill="rgba(255,255,255,0.85)" className="pointer-events-none select-none"
                      fontFamily="var(--font-body, sans-serif)">ICT</text>

                    {/* ── City pin markers ── */}
                    {CITY_PINS.map((pin) => {
                      const active = hoveredPin === pin.name;
                      return (
                        <g
                          key={pin.name}
                          className="cursor-pointer"
                          onMouseEnter={() => { setHoveredPin(pin.name); setHoveredId(null); }}
                          onMouseLeave={() => setHoveredPin(null)}
                          onClick={() => navigate({ to: "/products", search: { region: pin.filterValue } as any })}
                        >
                          {/* Outer ring when hovered */}
                          {active && (
                            <circle cx={pin.x} cy={pin.y} r={9}
                              fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.6" className="pointer-events-none" />
                          )}
                          {/* Pin body */}
                          <circle
                            cx={pin.x} cy={pin.y}
                            r={active ? 5.5 : 3.5}
                            fill={active ? "#FBBF24" : "#C9921A"}
                            stroke="#0F2219" strokeWidth="1"
                            className="transition-all duration-150"
                          />
                          <circle cx={pin.x} cy={pin.y} r={active ? 2.5 : 1.5}
                            fill="#0F2219" className="pointer-events-none transition-all duration-150" />
                          {/* City label */}
                          <text
                            x={pin.x + 7} y={pin.y + 4}
                            fontSize="6" fontWeight="600"
                            fontFamily="var(--font-body, sans-serif)"
                            fill={active ? "#FBBF24" : "rgba(245,237,216,0.8)"}
                            className="pointer-events-none select-none transition-colors duration-150"
                          >
                            {pin.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* ── Active province glow border ── */}
                    {hoveredId && (() => {
                      const p = PROVINCES.find((pr) => pr.id === hoveredId);
                      if (!p) return null;
                      return (
                        <path d={p.path} fill="none" stroke="#FBBF24"
                          strokeWidth="2.5" strokeLinejoin="round"
                          className="pointer-events-none" opacity="0.8" />
                      );
                    })()}

                    {/* ── Province legend strips at the bottom ── */}
                    {PROVINCES.filter((p) => p.id !== "fata").map((p, i) => (
                      <g key={`legend-${p.id}`}>
                        <rect x={10 + i * 70} y={536} width={12} height={10} rx="2" fill={p.fill} />
                        <text x={25 + i * 70} y={545} fontSize="5.5" fill="rgba(245,237,216,0.7)"
                          fontFamily="var(--font-body, sans-serif)" className="select-none">
                          {p.shortName}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* ── Info panel ── */}
                <div className="flex-1 min-w-0">
                  {tooltip ? (
                    <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(201,146,26,0.35)] rounded-2xl p-7 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9921A] mb-2">
                        {activePin ? "City / District" : "Province"}
                      </p>
                      <h3 className="display-serif text-3xl text-[#F5EDD8] leading-tight mb-5">{tooltip.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[rgba(245,237,216,0.5)] mb-3">Heritage crafts</p>
                      <ul className="space-y-2.5 mb-7">
                        {tooltip.crafts.map((c) => (
                          <li key={c} className="flex items-center gap-3 text-sm text-[#F5EDD8] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9921A] flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/products", search: { region: tooltip.filter } as any })}
                        className="btn btn-primary !py-3 !px-6 text-sm"
                      >
                        Browse {activePin ? tooltip.name : tooltip.name.split(" ")[0]} crafts →
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[rgba(201,146,26,0.18)] rounded-2xl p-7 h-full flex flex-col justify-between">
                      <div>
                        <p className="text-[rgba(245,237,216,0.5)] text-sm leading-relaxed mb-6">
                          Hover over any province or city marker to discover its craft traditions.
                          Click to browse products from that region.
                        </p>
                        {/* Province quick-access pills */}
                        <div className="flex flex-wrap gap-2">
                          {PROVINCES.filter((p) => p.id !== "fata").map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseEnter={() => setHoveredId(p.id)}
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={() => navigate({ to: "/products", search: { region: p.filterValue } as any })}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[rgba(201,146,26,0.25)] text-[rgba(245,237,216,0.8)] hover:border-[#C9921A] hover:text-[#F5EDD8] transition-all"
                            >
                              <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${p.pillClass}`} />
                              {p.shortName}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="urdu text-[#C9921A] text-lg mt-6">ہر خطے کی اپنی کہانی</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── City photo grid (existing) ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[20px] overflow-hidden h-56 animate-pulse bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {cities.map((city: any) => {
                const img = CITY_IMAGES[city.name];
                return (
                  <button
                    type="button"
                    key={city.name}
                    onClick={() => navigate({ to: "/products", search: { region: city.name } as any })}
                    className="group relative rounded-[20px] overflow-hidden h-60 text-left focus:outline-none focus:ring-2 focus:ring-[#C9921A] focus:ring-offset-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(1,17,5,0.85)] via-[rgba(1,17,5,0.3)] to-transparent z-10" />
                    {img ? (
                      <img src={img} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1C3A2A] to-[#264D38]" />
                    )}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
                      <h3 className="display-serif text-xl text-white leading-tight mb-1">{city.name}</h3>
                      <p className="text-xs text-[rgba(245,237,216,0.7)]">{city.region || city.province}</p>
                      {city.craftSpecialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {city.craftSpecialties.slice(0, 2).map((s: string) => (
                            <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,146,26,0.3)] text-[#F5EDD8] uppercase tracking-[0.1em]">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 z-10 border-2 border-transparent group-hover:border-[rgba(201,146,26,0.5)] rounded-[20px] transition-all duration-300" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

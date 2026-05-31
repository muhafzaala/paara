import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Package, ArrowRight, Search } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands & Ateliers · PAARA" },
      { name: "description", content: "Directory of verified Pakistani craft houses — their stories, regions and signature work." },
    ],
  }),
  component: BrandsPage,
});

// logoClass and headerClass are full Tailwind strings so the JIT scanner picks them up
const BRANDS = [
  {
    id: "multani-pottery-house",
    name: "Multani Pottery House",
    initials: "MP",
    logoClass: "bg-[#4A7C8E]",
    headerClass: "bg-[#4A7C8E]/10",
    region: "Multan",
    province: "Punjab",
    crafts: ["Blue Pottery", "Camel Skin Lamp"],
    description: "Four generations of potters preserving Multan's iconic cobalt-glaze tradition. Every piece is hand-thrown, fired in wood-kilns and painted with century-old floral motifs.",
    founded: "1952",
    products: 48,
  },
  {
    id: "hunza-heritage-crafts",
    name: "Hunza Heritage Crafts",
    initials: "HH",
    logoClass: "bg-[#6B4C2A]",
    headerClass: "bg-[#6B4C2A]/10",
    region: "Hunza",
    province: "Gilgit-Baltistan",
    crafts: ["Walnut Woodwork", "Gemstones"],
    description: "Carving Hunza's prized walnut timber into heirloom trays, bowls and furniture using hand tools that have been in the same family since the Mir's court.",
    founded: "1978",
    products: 34,
  },
  {
    id: "phulkari-palace",
    name: "Phulkari Palace",
    initials: "PP",
    logoClass: "bg-[#C9921A]",
    headerClass: "bg-[#C9921A]/10",
    region: "Lahore",
    province: "Punjab",
    crafts: ["Phulkari", "Embroidery", "Runners"],
    description: "Reviving the endangered silk-on-khaddar Phulkari needlework of Punjab's villages. Each runner or dupatta takes 3–6 weeks to complete by hand.",
    founded: "2001",
    products: 62,
  },
  {
    id: "peshawar-coppersmith-guild",
    name: "Peshawar Coppersmith Guild",
    initials: "PC",
    logoClass: "bg-[#7C4D1A]",
    headerClass: "bg-[#7C4D1A]/10",
    region: "Peshawar",
    province: "KPK",
    crafts: ["Copperwork", "Brass", "Metalwork"],
    description: "Master coppersmiths of the Qissa Khawani Bazaar, hammering pitchers, samovars and decorative plates from raw copper sheet with traditional repousse technique.",
    founded: "1940",
    products: 29,
  },
  {
    id: "balochi-thread-arts",
    name: "Balochi Thread Arts",
    initials: "BT",
    logoClass: "bg-[#8B1A1A]",
    headerClass: "bg-[#8B1A1A]/10",
    region: "Quetta",
    province: "Balochistan",
    crafts: ["Mirror Embroidery", "Weaving"],
    description: "A women's cooperative from Quetta stitching the vivid mirror-work embroidery of Balochistan — intricate geometric patterns in ruby reds, turquoise and gold.",
    founded: "2008",
    products: 41,
  },
  {
    id: "skardu-jade-works",
    name: "Skardu Jade Works",
    initials: "SJ",
    logoClass: "bg-[#2D6B4A]",
    headerClass: "bg-[#2D6B4A]/10",
    region: "Skardu",
    province: "Gilgit-Baltistan",
    crafts: ["Jade Carving", "Gemstones", "Bowls"],
    description: "Skilled lapidaries cutting and polishing jade, onyx and serpentine mined from Karakoram ridges into bowls, paperweights and jewellery.",
    founded: "1995",
    products: 22,
  },
  {
    id: "ajrak-house-sindh",
    name: "Ajrak House Sindh",
    initials: "AH",
    logoClass: "bg-[#1A3A8B]",
    headerClass: "bg-[#1A3A8B]/10",
    region: "Karachi",
    province: "Sindh",
    crafts: ["Ajrak", "Block Printing", "Textiles"],
    description: "A Sindhi textile atelier reviving the ancient double-resist Ajrak block-printing process — indigo and madder dyes on fine cotton, printed with hand-carved wooden blocks.",
    founded: "1988",
    products: 55,
  },
  {
    id: "chiniot-wood-masters",
    name: "Chiniot Wood Masters",
    initials: "CW",
    logoClass: "bg-[#5C3D1A]",
    headerClass: "bg-[#5C3D1A]/10",
    region: "Chiniot",
    province: "Punjab",
    crafts: ["Sheesham Furniture", "Woodwork", "Inlay"],
    description: "Chiniot has been Pakistan's furniture capital for 300 years. These master carpenters craft sheesham sideboards and chairs with hand-chiselled floral inlay.",
    founded: "1960",
    products: 18,
  },
  {
    id: "islamabad-marble-studio",
    name: "Islamabad Marble Studio",
    initials: "IM",
    logoClass: "bg-[#4A4A6B]",
    headerClass: "bg-[#4A4A6B]/10",
    region: "Islamabad",
    province: "ICT",
    crafts: ["Marble Inlay", "Pietra Dura", "Coasters"],
    description: "Contemporary craft studio blending Mughal-era pietra dura stone inlay with modern silhouettes — marble coasters, serving platters and decorative wall art.",
    founded: "2012",
    products: 31,
  },
  {
    id: "gilgit-silver-arts",
    name: "Gilgit Silver Arts",
    initials: "GS",
    logoClass: "bg-[#5A5A5A]",
    headerClass: "bg-[#5A5A5A]/10",
    region: "Gilgit",
    province: "Gilgit-Baltistan",
    crafts: ["Silver Jewellery", "Pendants", "Rings"],
    description: "Silversmiths drawing on Dardic and Silk Road jewellery traditions to craft pendants, earrings and arm-cuffs set with lapis, turquoise and carnelian.",
    founded: "1970",
    products: 77,
  },
  {
    id: "lahore-tile-craft",
    name: "Lahore Tile & Craft",
    initials: "LT",
    logoClass: "bg-[#1C3A2A]",
    headerClass: "bg-[#1C3A2A]/10",
    region: "Lahore",
    province: "Punjab",
    crafts: ["Mosaic Tiles", "Calligraphy", "Wall Art"],
    description: "Handmade encaustic and glazed tiles inspired by Lahore's Mughal monuments. Used in heritage restoration projects and sold for residential interiors.",
    founded: "1999",
    products: 43,
  },
  {
    id: "mardan-leather-works",
    name: "Mardan Leather Works",
    initials: "ML",
    logoClass: "bg-[#8B4A1A]",
    headerClass: "bg-[#8B4A1A]/10",
    region: "Mardan",
    province: "KPK",
    crafts: ["Leather Journals", "Bags", "Wallets"],
    description: "Tanning and hand-stitching vegetable-dyed leather journals, saddlebags and wallets in the old city workshops of Mardan, a craft heritage going back centuries.",
    founded: "1965",
    products: 38,
  },
  {
    id: "thatta-heritage-pottery",
    name: "Thatta Heritage Pottery",
    initials: "TH",
    logoClass: "bg-[#7C5A2A]",
    headerClass: "bg-[#7C5A2A]/10",
    region: "Thatta",
    province: "Sindh",
    crafts: ["Sindhi Pottery", "Glazed Tiles", "Vessels"],
    description: "Reviving the terracotta and glazed pottery styles of historic Thatta — porous water coolers, decorative vases and geometric tile panels in earth tones.",
    founded: "1982",
    products: 24,
  },
  {
    id: "swat-valley-artisans",
    name: "Swat Valley Artisans",
    initials: "SV",
    logoClass: "bg-[#3A6B3A]",
    headerClass: "bg-[#3A6B3A]/10",
    region: "Swat",
    province: "KPK",
    crafts: ["Stone Carving", "Walnut Woodwork"],
    description: "Stone carvers and walnut woodworkers from the Swat Valley, producing relief-carved panels depicting local wildlife and Gandharan-era geometric motifs.",
    founded: "2005",
    products: 20,
  },
  {
    id: "hyderabad-lacquer-house",
    name: "Hyderabad Lacquer House",
    initials: "HL",
    logoClass: "bg-[#8B3A5A]",
    headerClass: "bg-[#8B3A5A]/10",
    region: "Hyderabad",
    province: "Sindh",
    crafts: ["Lacquerware", "Painted Furniture", "Boxes"],
    description: "Sindhi lacquer craftspeople applying coloured resin rings on a lathe to create vividly patterned rolling pins, jewellery boxes and bangles.",
    founded: "1955",
    products: 35,
  },
  {
    id: "kashmir-pashmina-guild",
    name: "Kashmir Pashmina Guild",
    initials: "KP",
    logoClass: "bg-[#6B2D6B]",
    headerClass: "bg-[#6B2D6B]/10",
    region: "Muzaffarabad",
    province: "Azad Kashmir",
    crafts: ["Pashmina", "Woollen Shawls", "Kani"],
    description: "Weavers and embroiderers from AJK spinning Changthang pashmina into fine shawls, stoles and blankets with traditional Kani tapestry and chain-stitch embroidery.",
    founded: "1975",
    products: 29,
  },
  {
    id: "faisalabad-khaddar-house",
    name: "Faisalabad Khaddar House",
    initials: "FK",
    logoClass: "bg-[#4A6B1A]",
    headerClass: "bg-[#4A6B1A]/10",
    region: "Faisalabad",
    province: "Punjab",
    crafts: ["Khaddar", "Handloom", "Stoles"],
    description: "Keeping handloom weaving alive in Pakistan's textile city — rough-spun khaddar stoles, shawls and yardage in natural cotton and linen.",
    founded: "1930",
    products: 52,
  },
  {
    id: "ralli-craft-collective",
    name: "Ralli Craft Collective",
    initials: "RC",
    logoClass: "bg-[#8B1A4A]",
    headerClass: "bg-[#8B1A4A]/10",
    region: "Sukkur",
    province: "Sindh",
    crafts: ["Ralli Quilts", "Patchwork", "Cushions"],
    description: "A rural women's collective from interior Sindh stitching intricate Ralli patchwork quilts — each a composition of hundreds of hand-cut cotton squares in bold geometry.",
    founded: "2010",
    products: 19,
  },
  {
    id: "balochistan-carpet-looms",
    name: "Balochistan Carpet Looms",
    initials: "BC",
    logoClass: "bg-[#6B1A1A]",
    headerClass: "bg-[#6B1A1A]/10",
    region: "Turbat",
    province: "Balochistan",
    crafts: ["Wool Carpets", "Kilims", "Prayer Rugs"],
    description: "Hand-knotted wool carpets and flat-woven kilims from Makran — deep reds, burnt oranges and ivory in tribal geometric compositions.",
    founded: "1948",
    products: 14,
  },
  {
    id: "gb-minerals-studio",
    name: "GB Minerals Studio",
    initials: "GM",
    logoClass: "bg-[#1A5A6B]",
    headerClass: "bg-[#1A5A6B]/10",
    region: "Gilgit",
    province: "Gilgit-Baltistan",
    crafts: ["Rough Minerals", "Specimen Display", "Gems"],
    description: "Collectors and lapidaries sourcing and cutting aquamarine, tourmaline, topaz and ruby specimens from high-altitude Karakoram mines.",
    founded: "2003",
    products: 66,
  },
  {
    id: "lahori-khussa-house",
    name: "Lahori Khussa House",
    initials: "LK",
    logoClass: "bg-[#B8860B]",
    headerClass: "bg-[#B8860B]/10",
    region: "Lahore",
    province: "Punjab",
    crafts: ["Khussa Shoes", "Leather", "Embroidery"],
    description: "Cobblers and embroiderers crafting the famous curled-toe Khussa shoes of Lahore — in silk thread, mirror-work and zardozi on vegetable-tanned leather.",
    founded: "1920",
    products: 88,
  },
  {
    id: "sindh-block-atelier",
    name: "Sindh Block Atelier",
    initials: "SB",
    logoClass: "bg-[#1A6B4A]",
    headerClass: "bg-[#1A6B4A]/10",
    region: "Bhit Shah",
    province: "Sindh",
    crafts: ["Block Printing", "Natural Dyes", "Fabric"],
    description: "Village artisans near Shah Abdul Latif's shrine printing with hand-carved teak blocks, using indigo, madder and turmeric extracted from plants.",
    founded: "1990",
    products: 37,
  },
];

const ALL_REGIONS = ["All", "Punjab", "Sindh", "KPK", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir", "ICT"];
const ALL_CRAFTS = ["All", "Pottery", "Woodwork", "Textiles", "Embroidery", "Metalwork", "Jewellery", "Leather", "Lacquerwork", "Gemstones", "Carpets"];

function BrandsPage() {
  const [regionFilter, setRegionFilter] = useState("All");
  const [craftFilter, setCraftFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = BRANDS.filter((b) => {
    const matchRegion = regionFilter === "All" || b.province === regionFilter;
    const matchCraft = craftFilter === "All" || b.crafts.some((c) => c.toLowerCase().includes(craftFilter.toLowerCase()));
    const matchSearch = !search.trim() || b.name.toLowerCase().includes(search.toLowerCase()) || b.region.toLowerCase().includes(search.toLowerCase());
    return matchRegion && matchCraft && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />

      <div className="bg-[#0F2219] text-[#F5EDD8] pt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <p className="eyebrow !text-[#C9921A] mb-4">Verified Houses</p>
          <h1 className="display-serif text-5xl lg:text-7xl leading-tight mb-5">
            Brands &amp; <em className="italic text-[#C9921A]">ateliers.</em>
          </h1>
          <p className="text-[rgba(245,237,216,0.7)] max-w-xl leading-relaxed mb-8">
            {BRANDS.length} verified craft houses from Karachi to Hunza — each carrying a distinct tradition, a named artisan, and a story worth knowing.
          </p>
          <p className="urdu text-[#C9921A] text-xl">گھر اور برانڈز</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-10">
        <div className="flex flex-col gap-4 mb-10">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands or cities…"
              className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-full pl-10 pr-5 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B645A] self-center mr-1">Province:</span>
            {ALL_REGIONS.map((r) => (
              <button key={r} type="button" onClick={() => setRegionFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  regionFilter === r ? "bg-[#1C3A2A] text-[#F5EDD8] border-[#C9921A]" : "bg-white text-[#1C3A2A] border-[rgba(28,58,42,0.2)]"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B645A] self-center mr-1">Craft:</span>
            {ALL_CRAFTS.map((c) => (
              <button key={c} type="button" onClick={() => setCraftFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  craftFilter === c ? "bg-[#C9921A] text-[#1C3A2A] border-[#C9921A]" : "bg-white text-[#1C3A2A] border-[rgba(28,58,42,0.2)]"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#6B645A] mb-6">{filtered.length} brand{filtered.length !== 1 ? "s" : ""} found</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="display-serif text-2xl text-[#1C3A2A] mb-2">No brands found</p>
            <p className="text-sm text-[#6B645A]">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function BrandCard({ brand }: { brand: typeof BRANDS[0] }) {
  return (
    <div className="bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)] overflow-hidden hover:shadow-xl transition-all duration-400 group flex flex-col">
      <div className={`relative h-28 flex items-center justify-center ${brand.headerClass}`}>
        <div className={`w-16 h-16 rounded-2xl grid place-items-center text-white font-display font-bold text-xl shadow-lg ${brand.logoClass}`}>
          {brand.initials}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/80 text-[#1C3A2A] font-medium">
          <Package size={9} /> {brand.products}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[#1C3A2A] text-base leading-snug mb-1">{brand.name}</h3>
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} className="text-[#C9921A]" />
          <span className="text-xs text-[#6B645A]">{brand.region}, {brand.province}</span>
          <span className="ml-auto text-[10px] text-[#6B645A]">Est. {brand.founded}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {brand.crafts.map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8EC] text-[#C9921A] font-semibold border border-[rgba(201,146,26,0.2)]">
              {c}
            </span>
          ))}
        </div>

        <p className="text-xs text-[#6B645A] leading-relaxed line-clamp-3 flex-1 mb-4">{brand.description}</p>

        <Link to="/products" search={{ q: brand.region } as any}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-[rgba(28,58,42,0.18)] text-xs font-semibold text-[#1C3A2A] hover:bg-[#FFF8EC] hover:border-[#C9921A] transition-all group-hover:border-[#C9921A]">
          Explore products <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

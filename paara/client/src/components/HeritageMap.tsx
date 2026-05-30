import { Link } from "@tanstack/react-router";

// x/y: % of image. flipX/flipY: tooltip direction based on position near edges.
// Lat 23.5–37.1°N, Lng 60.8–77.8°E → x=(lng-60.8)/17*100, y=(37.1-lat)/13.6*100
const CITIES = [
  { city: "Multan",       x: 62.8, y: 50.8, craft: "Blue Pottery & Sufi Tiles",  emoji: "🏺", flipX: false, flipY: false },
  { city: "Lahore",       x: 79.8, y: 41.0, craft: "Textile & Khussa Shoes",     emoji: "👟", flipX: true,  flipY: false },
  { city: "Karachi",      x: 36.5, y: 90.0, craft: "Sindhi Crafts & Trade",      emoji: "🎨", flipX: false, flipY: true  },
  { city: "Peshawar",     x: 63.1, y: 22.7, craft: "Copper & Brass Work",        emoji: "🔶", flipX: false, flipY: false },
  { city: "Quetta",       x: 36.3, y: 50.9, craft: "Balochi Embroidery",         emoji: "✨", flipX: false, flipY: false },
  { city: "Gilgit",       x: 79.5, y:  8.7, craft: "Silver & Lapis Jewellery",   emoji: "💎", flipX: true,  flipY: false },
  { city: "Hunza",        x: 81.5, y:  5.8, craft: "Walnut Wood Carving",        emoji: "🪵", flipX: true,  flipY: false },
  { city: "Hyderabad",    x: 44.6, y: 86.1, craft: "Ajrak Block Print",          emoji: "🧣", flipX: false, flipY: true  },
  { city: "Wazirabad",    x: 78.4, y: 34.2, craft: "Damascus Steel Cutlery",     emoji: "🔪", flipX: true,  flipY: false },
  { city: "Chiniot",      x: 71.6, y: 39.6, craft: "Sheesham Furniture",         emoji: "🪑", flipX: true,  flipY: false },
  { city: "Bahawalpur",   x: 64.0, y: 56.7, craft: "Camel Skin Crafts",          emoji: "🐪", flipX: false, flipY: false },
  { city: "Swat",         x: 68.0, y: 17.1, craft: "Emerald & Gemstones",        emoji: "🟢", flipX: false, flipY: false },
  { city: "Sialkot",      x: 80.8, y: 33.9, craft: "Leather & Sports Goods",     emoji: "⚽", flipX: true,  flipY: false },
  { city: "Muzaffarabad", x: 74.5, y: 20.1, craft: "Pashmina & Shawls",          emoji: "🧤", flipX: true,  flipY: false },
  { city: "Mardan",       x: 66.2, y: 21.3, craft: "Terracotta Pottery",         emoji: "🏛️", flipX: false, flipY: false },
  { city: "Khushab",      x: 68.0, y: 35.3, craft: "Salt Lamps",                 emoji: "🪔", flipX: false, flipY: false },
];

// Positions injected as CSS classes — no inline style props needed
const POSITION_CSS = CITIES.map(
  ({ city, x, y }) =>
    `.hm-pin-${city.toLowerCase().replace(/[^a-z]/g, "")}{left:${x}%;top:${y}%}`
).join("");

export function HeritageMap() {
  return (
    <div className="hm-wrap">
      <style>{POSITION_CSS}</style>

      <img
        src="/pakistan-map.jpg"
        alt="Pakistan craft regions"
        className="hm-image"
        draggable={false}
      />

      {CITIES.map(({ city, craft, emoji, flipX, flipY }) => {
        const pinClass = `hm-pin-${city.toLowerCase().replace(/[^a-z]/g, "")}`;
        const tooltipClass = [
          "hm-tooltip",
          flipX ? "flip-x" : "",
          flipY ? "flip-y" : "",
        ].filter(Boolean).join(" ");

        return (
          <div key={city} className={`hm-marker ${pinClass}`}>
            <span className="hm-ping" />
            <div className="hm-dot" />
            {/* Tooltip always in DOM — CSS :hover on parent shows/hides it */}
            <div className={tooltipClass}>
              <div className="hm-tooltip-head">
                <span>{emoji}</span>
                <span className="hm-tooltip-city">{city}</span>
              </div>
              <div className="hm-tooltip-body">
                <p className="hm-tooltip-craft">{craft}</p>
                <Link
                  to="/products"
                  search={{ city } as any}
                  className="hm-tooltip-link"
                >
                  View crafts →
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="hm-legend">
        <span className="hm-legend-dot" />
        <span className="hm-legend-label">Hover a city to explore</span>
      </div>
    </div>
  );
}

export default HeritageMap;

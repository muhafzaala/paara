import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

interface Props { city: string; region?: string; }

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Multan:        { lat: 30.196, lng: 71.478 },
  Hunza:         { lat: 36.317, lng: 74.649 },
  Hyderabad:     { lat: 25.396, lng: 68.377 },
  Peshawar:      { lat: 34.015, lng: 71.524 },
  Sialkot:       { lat: 32.492, lng: 74.531 },
  Wazirabad:     { lat: 32.443, lng: 74.120 },
  Chiniot:       { lat: 31.720, lng: 72.978 },
  Bahawalpur:    { lat: 29.395, lng: 71.683 },
  Quetta:        { lat: 30.178, lng: 66.975 },
  Lahore:        { lat: 31.520, lng: 74.358 },
  Karachi:       { lat: 24.860, lng: 67.001 },
  Mingora:       { lat: 34.773, lng: 72.360 },
  Gilgit:        { lat: 35.920, lng: 74.308 },
  Khushab:       { lat: 32.296, lng: 72.353 },
  Mardan:        { lat: 34.198, lng: 72.045 },
  Muzaffarabad:  { lat: 34.370, lng: 73.471 },
};

export default function MiniOriginMap({ city, region }: Props) {
  const coords = CITY_COORDS[city];

  if (!coords) {
    return (
      <div className="rounded-2xl border border-[rgba(28,58,42,0.1)] bg-[#FFF8EC] h-[180px] grid place-items-center text-center px-6">
        <div>
          <MapPin size={24} className="text-[#6B645A] mx-auto mb-2" />
          <p className="text-sm text-[#6B645A]">Origin coordinates unavailable</p>
          {city && <p className="text-xs text-[#6B645A] mt-1">{city}{region ? `, ${region}` : ""}</p>}
        </div>
      </div>
    );
  }

  const { lat, lng } = coords;
  const pad = 0.45;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.1)]">
      <iframe
        src={src}
        width="100%"
        height={180}
        loading="lazy"
        title={`Map of ${city}`}
        style={{ border: 0, display: "block" }}
      />
      <div className="bg-white px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-[#6B645A] flex items-center gap-1.5">
          <MapPin size={11} className="text-[#C9921A]" />
          {city}{region ? `, ${region}` : ""}
        </span>
        <Link
          to="/heritage-map"
          className="text-xs font-semibold text-[#C9921A] hover:underline"
        >
          View on full map →
        </Link>
      </div>
    </div>
  );
}

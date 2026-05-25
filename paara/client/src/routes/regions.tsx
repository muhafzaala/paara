import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

function RegionsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => { try { return (await citiesApi.getAll()).data.cities; } catch { return []; } },
    staleTime: 1000 * 60 * 10,
  });

  const cities: any[] = data || [];

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow mb-4">By region</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <h1 className="display-serif text-5xl md:text-7xl text-[#1C3A2A] leading-[0.95]">
              Every city<br />tells a <em className="italic text-[#C9921A]">story.</em>
            </h1>
            <p className="text-[#3D2914] max-w-md leading-relaxed text-sm">
              From the kilns of Multan to the walnut forests of Hunza — each region of Pakistan carries its own vocabulary of craft. Explore by origin.
            </p>
          </div>

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
                  <button key={city.name} onClick={() => navigate({ to: "/products", search: { region: city.name } })}
                    className="group relative rounded-[20px] overflow-hidden h-60 text-left focus:outline-none focus:ring-2 focus:ring-[#C9921A] focus:ring-offset-2">
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

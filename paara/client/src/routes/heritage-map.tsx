import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { FadeIn } from "@/components/ui/Motion";

const HeritageMap = lazy(() => import("@/components/HeritageMap").then((m) => ({ default: m.HeritageMap })));

export const Route = createFileRoute("/heritage-map")({
  head: () => ({ meta: [{ title: "Heritage Map · PAARA" }] }),
  component: HeritageMapPage,
});

function HeritageMapPage() {
  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <header className="mb-10 text-center">
              <p className="eyebrow mb-3">Craft Geography</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-4">
                Explore Pakistan's craft heritage
              </h1>
              <p className="text-[#6B645A] max-w-xl mx-auto leading-relaxed">
                Discover centuries-old craft traditions mapped across Pakistan's regions.
                Click a city to explore its unique artisanal heritage.
              </p>
            </header>
          </FadeIn>
          <Suspense fallback={<div className="h-[480px] rounded-[20px] bg-[#F5EDD8] animate-pulse" />}>
            <HeritageMap />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}

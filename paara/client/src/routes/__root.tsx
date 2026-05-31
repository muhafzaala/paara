import { QueryClient } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { CraftAssistant } from "@/components/site/CraftAssistant";
import { CompareBar } from "@/components/CompareBar";
import { SurpriseMe } from "@/components/SurpriseMe";
import RegionalWelcome from "@/components/celebrations/RegionalWelcome";
import TruckArtEgg from "@/components/easter-eggs/TruckArtEgg";
import PageTransition from "@/components/ui/PageTransition";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5EDD8] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[#1C3A2A]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#1C3A2A]">Page not found</h2>
        <p className="mt-2 text-sm text-[#6B645A]">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-[#1C3A2A] px-6 py-3 text-sm font-medium text-[#F5EDD8] transition-colors hover:bg-[#0F2219]">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5EDD8] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-[#1C3A2A]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#6B645A]">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-full bg-[#1C3A2A] px-6 py-3 text-sm font-medium text-[#F5EDD8] transition-colors hover:bg-[#0F2219]">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-[rgba(28,58,42,0.2)] bg-white px-6 py-3 text-sm font-medium text-[#1C3A2A] transition-colors hover:bg-[#FFF8EC]">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function RootLayout() {
  return (
    <>
      <PageTransition><Outlet /></PageTransition>
      <CraftAssistant />
      <CompareBar />
      <SurpriseMe />
      <RegionalWelcome />
      <TruckArtEgg />
    </>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

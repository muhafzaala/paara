import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "Become a verified artisan · PAARA" }, { name: "description", content: "Application, verification and onboarding for makers across Pakistan." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Sell with PAARA"
      title="Become a verified artisan"
      urdu="بیچنے والے بنیں"
      description="Application, verification and onboarding for makers across Pakistan."
    />
  ),
});

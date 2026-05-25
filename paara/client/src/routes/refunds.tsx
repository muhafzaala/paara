import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/refunds")({
  head: () => ({ meta: [{ title: "Returns & refunds · PAARA" }, { name: "description", content: "Our policy honors both the buyer's trust and the artisan's labour." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Legal"
      title="Returns & refunds"
      urdu=""
      description="Our policy honors both the buyer's trust and the artisan's labour."
    />
  ),
});

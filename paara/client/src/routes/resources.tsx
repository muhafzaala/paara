import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources for sellers · PAARA" }, { name: "description", content: "Guides on photography, story-writing, pricing and shipping for craft." }] }),
  component: () => (
    <ComingSoon
      eyebrow="For Artisans"
      title="Resources for sellers"
      urdu=""
      description="Guides on photography, story-writing, pricing and shipping for craft."
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/brands")({
  head: () => ({ meta: [{ title: "Brands & ateliers · PAARA" }, { name: "description", content: "Directory of verified craft houses, with their stories, regions and signature work." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Verified Houses"
      title="Brands & ateliers"
      urdu="گھر اور برانڈز"
      description="Directory of verified craft houses, with their stories, regions and signature work."
    />
  ),
});

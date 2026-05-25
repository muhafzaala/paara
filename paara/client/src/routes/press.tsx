import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/press")({
  head: () => ({ meta: [{ title: "Press & media · PAARA" }, { name: "description", content: "For interviews, photography and brand assets, reach out to press@paara.pk." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Press"
      title="Press & media"
      urdu=""
      description="For interviews, photography and brand assets, reach out to press@paara.pk."
    />
  ),
});

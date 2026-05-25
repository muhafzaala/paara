import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Why PAARA exists · PAARA" }, { name: "description", content: "The story of why we built a marketplace that treats craft as heritage, not inventory." }] }),
  component: () => (
    <ComingSoon
      eyebrow="About PAARA"
      title="Why PAARA exists"
      urdu="ہمارے بارے میں"
      description="The story of why we built a marketplace that treats craft as heritage, not inventory."
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Work at PAARA · PAARA" }, { name: "description", content: "We hire slowly and carefully. Roles will be listed here as they open." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Careers"
      title="Work at PAARA"
      urdu=""
      description="We hire slowly and carefully. Roles will be listed here as they open."
    />
  ),
});

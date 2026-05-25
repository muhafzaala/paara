import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of service · PAARA" }, { name: "description", content: "The plain-language version is being prepared." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Legal"
      title="Terms of service"
      urdu=""
      description="The plain-language version is being prepared."
    />
  ),
});

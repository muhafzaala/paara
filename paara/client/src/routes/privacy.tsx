import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy policy · PAARA" }, { name: "description", content: "We are drafting a privacy policy that respects both buyers and artisans." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Legal"
      title="Privacy policy"
      urdu=""
      description="We are drafting a privacy policy that respects both buyers and artisans."
    />
  ),
});

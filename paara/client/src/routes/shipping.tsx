import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping & delivery · PAARA" }, { name: "description", content: "Carrier coverage across Pakistan and select international corridors." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Legal"
      title="Shipping & delivery"
      urdu=""
      description="Carrier coverage across Pakistan and select international corridors."
    />
  ),
});

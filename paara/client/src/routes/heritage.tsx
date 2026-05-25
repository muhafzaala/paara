import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/heritage")({
  head: () => ({ meta: [{ title: "Long-form heritage stories · PAARA" }, { name: "description", content: "Editorial features on the people, places and processes that shape Pakistani craft." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Heritage"
      title="Long-form heritage stories"
      urdu="میراث"
      description="Editorial features on the people, places and processes that shape Pakistani craft."
    />
  ),
});

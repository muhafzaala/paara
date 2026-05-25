import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Talk to us · PAARA" }, { name: "description", content: "Reach us by email, voice or in person at our Lahore atelier." }] }),
  component: () => (
    <ComingSoon
      eyebrow="Contact"
      title="Talk to us"
      urdu="رابطہ"
      description="Reach us by email, voice or in person at our Lahore atelier."
    />
  ),
});

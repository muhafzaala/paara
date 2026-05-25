import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/settings")({ component: () => (
  <div className="space-y-4">
    <header><p className="eyebrow text-[rgba(245,237,216,0.5)]">Configuration</p><h1 className="font-display text-3xl text-[#F5EDD8]">Settings</h1></header>
    <div className="bg-[rgba(245,237,216,0.06)] rounded-[20px] p-8 border border-[rgba(201,146,26,0.12)] text-center text-[rgba(245,237,216,0.5)]">Platform settings coming soon.</div>
  </div>
) });

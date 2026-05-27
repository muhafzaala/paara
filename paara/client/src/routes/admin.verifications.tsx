import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, MapPin, FileSearch, Award, ChevronRight } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verifications")({
  head: () => ({ meta: [{ title: "Verifications · Admin" }] }),
  component: VerificationsPage,
});

const STATUSES = [
  { key: "applied", label: "Applied" },
  { key: "documents_under_review", label: "Docs Review" },
  { key: "field_visit_scheduled", label: "Field Visit" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const NEXT_STAGE: Record<string, string> = {
  applied: "documents_under_review",
  documents_under_review: "field_visit_scheduled",
  field_visit_scheduled: "approved",
};

const BADGES = ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"];

function VerificationsPage() {
  const [filter, setFilter] = useState("applied");
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-seller-profiles", filter],
    queryFn: async () => (await adminApi.listSellerProfiles({ verificationStatus: filter, limit: 50 })).data.sellers,
  });

  const advance = useMutation({
    mutationFn: ({ id, stage, notes }: any) => adminApi.advanceSellerVerification(id, stage, notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-seller-profiles"] }); toast.success("Updated"); setSelected(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const badgeMut = useMutation({
    mutationFn: ({ id, badge, action }: any) => adminApi.awardBadge(id, badge, action),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-seller-profiles"] }); toast.success("Badge updated"); },
  });

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8">
            <p className="eyebrow">Admin</p>
            <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Seller Verifications</h1>
          </header>

          <div className="flex flex-wrap gap-2 mb-6">
            {STATUSES.map(s => (
              <button key={s.key} onClick={() => setFilter(s.key)}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all"
                style={{
                  background: filter === s.key ? "#1C3A2A" : "#FFF8EC",
                  color: filter === s.key ? "#F5EDD8" : "#1C3A2A",
                  border: `1.5px solid ${filter === s.key ? "#C9921A" : "rgba(28,58,42,0.12)"}`,
                }}>{s.label}</button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-[#C9921A]" size={32} /></div>
          ) : !data?.length ? (
            <div className="bg-white rounded-2xl p-12 text-center text-sm text-[#6B645A]">No sellers in this stage.</div>
          ) : (
            <div className="grid lg:grid-cols-[1fr,1.4fr] gap-6">
              <ul className="space-y-2">
                {data.map((p: any) => (
                  <li key={p._id}>
                    <button onClick={() => setSelected(p)} className="w-full text-left bg-white rounded-xl p-4 hover:shadow-md transition-all border"
                      style={{ borderColor: selected?._id === p._id ? "#C9921A" : "rgba(28,58,42,0.08)" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-semibold text-[#1C3A2A]">{p.shopName || "(unnamed)"}</p>
                          <p className="text-xs text-[#6B645A] mt-0.5">{p.user?.email} · {p.city || "—"}</p>
                        </div>
                        <ChevronRight size={16} className="text-[#6B645A]" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {selected && (
                <aside className="bg-white rounded-2xl p-6 sticky top-28 self-start border border-[rgba(28,58,42,0.08)]">
                  <h2 className="display-serif text-2xl text-[#1C3A2A]">{selected.shopName || "Unnamed shop"}</h2>
                  <p className="text-xs text-[#6B645A] mt-1">{selected.user?.email}</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-[#6B645A]">City</dt><dd className="text-[#1C3A2A]">{selected.city || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B645A]">Region</dt><dd className="text-[#1C3A2A]">{selected.region || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B645A]">Crafts</dt><dd className="text-[#1C3A2A]">{selected.craftSpecialties?.join(", ") || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#6B645A]">Status</dt><dd className="text-[#C9921A] font-semibold">{selected.verificationStatus}</dd></div>
                  </dl>

                  {selected.shopDescription && (
                    <div className="mt-4 p-3 rounded-lg bg-[#FFF8EC] text-sm text-[#1C3A2A]">{selected.shopDescription}</div>
                  )}

                  {(selected.documents?.cnicFront || selected.documents?.cnicBack) && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">CNIC</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selected.documents.cnicFront && <img src={selected.documents.cnicFront} alt="CNIC front" className="rounded-lg" />}
                        {selected.documents.cnicBack && <img src={selected.documents.cnicBack} alt="CNIC back" className="rounded-lg" />}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    {NEXT_STAGE[selected.verificationStatus] && (
                      <button onClick={() => advance.mutate({ id: selected._id, stage: NEXT_STAGE[selected.verificationStatus], notes: "Advanced by admin" })}
                        disabled={advance.isPending} className="btn btn-primary w-full">
                        Advance to {NEXT_STAGE[selected.verificationStatus].replace(/_/g, " ")} <ChevronRight size={16} />
                      </button>
                    )}
                    {selected.verificationStatus !== "approved" && selected.verificationStatus !== "rejected" && (
                      <button onClick={() => {
                        const reason = prompt("Reason for rejection?");
                        if (reason) advance.mutate({ id: selected._id, stage: "rejected", notes: reason });
                      }} className="w-full text-sm py-2 rounded-full border border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-colors">
                        Reject
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Heritage Badges</p>
                    <div className="flex flex-wrap gap-2">
                      {BADGES.map(b => {
                        const has = selected.heritageBadges?.includes(b);
                        return (
                          <button key={b} onClick={() => badgeMut.mutate({ id: selected._id, badge: b, action: has ? "remove" : "add" })}
                            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
                            style={{
                              background: has ? "#C9921A" : "rgba(201,146,26,0.1)",
                              color: has ? "#1C3A2A" : "#C9921A",
                              border: "1px solid rgba(201,146,26,0.3)",
                            }}>{b.replace(/_/g, " ")}</button>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

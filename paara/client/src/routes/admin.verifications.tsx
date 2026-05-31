import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronRight, MessageSquare, X, CheckCircle, ExternalLink } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verifications")({
  head: () => ({ meta: [{ title: "Verifications · Admin" }] }),
  component: VerificationsPage,
});

const STATUSES = [
  { key: "applied",                label: "Applied" },
  { key: "documents_under_review", label: "Docs Review" },
  { key: "field_visit_scheduled",  label: "Field Visit" },
  { key: "approved",               label: "Approved" },
  { key: "rejected",               label: "Rejected" },
  { key: "reapply_requested",      label: "Info Requested" },
];

const NEXT_STAGE: Record<string, { stage: string; label: string }> = {
  applied:                { stage: "documents_under_review", label: "Move to Docs Review" },
  documents_under_review: { stage: "field_visit_scheduled",  label: "Schedule Field Visit" },
  field_visit_scheduled:  { stage: "approved",               label: "Approve" },
};

const BADGES = ["authentic", "master_artisan", "heritage_keeper", "top_rated", "community_favorite"];

type ActionMode = "none" | "reject" | "request_info";

function VerificationsPage() {
  const [filter, setFilter] = useState("applied");
  const [selected, setSelected] = useState<any>(null);
  const [actionMode, setActionMode] = useState<ActionMode>("none");
  const [actionNotes, setActionNotes] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-seller-profiles", filter],
    queryFn: async () => (await adminApi.listSellerProfiles({ verificationStatus: filter, limit: 50 })).data.sellers,
  });

  const advance = useMutation({
    mutationFn: ({ id, stage, notes }: any) => adminApi.advanceSellerVerification(id, stage, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-seller-profiles"] });
      toast.success("Status updated");
      setSelected(null);
      setActionMode("none");
      setActionNotes("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const requestInfo = useMutation({
    mutationFn: ({ id, notes }: any) => adminApi.requestMoreInfo(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-seller-profiles"] });
      toast.success("Feedback sent to seller");
      setSelected(null);
      setActionMode("none");
      setActionNotes("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const badgeMut = useMutation({
    mutationFn: ({ id, badge, action }: any) => adminApi.awardBadge(id, badge, action),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-seller-profiles"] }); toast.success("Badge updated"); },
  });

  const isPending = advance.isPending || requestInfo.isPending;

  const handleSelect = (p: any) => {
    setSelected(p);
    setActionMode("none");
    setActionNotes("");
  };

  const handleReject = () => {
    if (!actionNotes.trim()) { toast.error("Please enter a rejection reason"); return; }
    advance.mutate({ id: selected._id, stage: "rejected", notes: actionNotes.trim() });
  };

  const handleRequestInfo = () => {
    if (!actionNotes.trim()) { toast.error("Please enter feedback for the seller"); return; }
    requestInfo.mutate({ id: selected._id, notes: actionNotes.trim() });
  };

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
              <button key={s.key} type="button" onClick={() => { setFilter(s.key); setSelected(null); }}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all"
                style={{
                  background: filter === s.key ? "#1C3A2A" : "#FFF8EC",
                  color: filter === s.key ? "#F5EDD8" : "#1C3A2A",
                  border: `1.5px solid ${filter === s.key ? "#C9921A" : "rgba(28,58,42,0.12)"}`,
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="animate-spin text-[#C9921A]" size={32} />
            </div>
          ) : !data?.length ? (
            <div className="bg-white rounded-2xl p-12 text-center text-sm text-[#6B645A]">
              No sellers in this stage.
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr,1.6fr] gap-6 items-start">
              {/* List */}
              <ul className="space-y-2">
                {data.map((p: any) => (
                  <li key={p._id}>
                    <button type="button" onClick={() => handleSelect(p)}
                      className="w-full text-left bg-white rounded-xl p-4 hover:shadow-md transition-all border"
                      style={{ borderColor: selected?._id === p._id ? "#C9921A" : "rgba(28,58,42,0.08)" }}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-[#1C3A2A] truncate">{p.shopName || "(unnamed)"}</p>
                          <p className="text-xs text-[#6B645A] mt-0.5 truncate">{p.user?.name} · {p.user?.email}</p>
                          <p className="text-xs text-[#6B645A]">{p.city || "—"}{p.region ? ` · ${p.region}` : ""}</p>
                        </div>
                        <ChevronRight size={16} className="text-[#6B645A] flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Detail panel */}
              {selected && (
                <aside className="bg-white rounded-2xl border border-[rgba(28,58,42,0.08)] sticky top-28 self-start overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-[rgba(28,58,42,0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="display-serif text-2xl text-[#1C3A2A]">{selected.shopName || "Unnamed shop"}</h2>
                        <p className="text-xs text-[#6B645A] mt-1">{selected.user?.name} · {selected.user?.email}</p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full"
                        style={{ background: "rgba(201,146,26,0.1)", color: "#C9921A", border: "1px solid rgba(201,146,26,0.25)" }}>
                        {selected.verificationStatus?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Core info */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {[
                        ["City", selected.city],
                        ["Region", selected.region],
                        ["Phone", selected.phone],
                        ["Address", selected.address],
                        ["CNIC #", selected.cnicNumber],
                        ["Est.", selected.yearEstablished],
                      ].map(([label, value]) => value ? (
                        <div key={label} className="col-span-1">
                          <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B645A]">{label}</dt>
                          <dd className="text-[#1C3A2A] text-sm mt-0.5 break-all">{value}</dd>
                        </div>
                      ) : null)}
                      {selected.craftSpecialties?.length > 0 && (
                        <div className="col-span-2">
                          <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B645A]">Crafts</dt>
                          <dd className="text-[#1C3A2A] text-sm mt-0.5">{selected.craftSpecialties.join(", ")}</dd>
                        </div>
                      )}
                    </dl>

                    {/* Shop description */}
                    {selected.shopDescription && (
                      <div className="p-3 rounded-lg bg-[#FFF8EC] text-sm text-[#1C3A2A] leading-relaxed">
                        {selected.shopDescription}
                      </div>
                    )}

                    {/* Social links */}
                    {(selected.socialLinks?.instagram || selected.socialLinks?.facebook || selected.socialLinks?.tiktok || selected.socialLinks?.website) && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">Social / Web</p>
                        <div className="flex flex-wrap gap-2">
                          {(["instagram", "facebook", "tiktok", "website"] as const).map(k => {
                            const v = selected.socialLinks?.[k];
                            if (!v) return null;
                            return (
                              <a key={k} href={v.startsWith("http") ? v : `https://${v}`} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase bg-[#FFF8EC] text-[#1C3A2A] border border-[rgba(28,58,42,0.12)] hover:border-[#C9921A] transition-colors">
                                {k} <ExternalLink size={10} />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CNIC photos */}
                    {(selected.documents?.cnicFront || selected.documents?.cnicBack) && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">CNIC documents</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.documents.cnicFront && (
                            <a href={selected.documents.cnicFront} target="_blank" rel="noreferrer">
                              <img src={selected.documents.cnicFront} alt="CNIC front" className="rounded-lg w-full object-cover hover:opacity-90 transition-opacity" />
                            </a>
                          )}
                          {selected.documents.cnicBack && (
                            <a href={selected.documents.cnicBack} target="_blank" rel="noreferrer">
                              <img src={selected.documents.cnicBack} alt="CNIC back" className="rounded-lg w-full object-cover hover:opacity-90 transition-opacity" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Workshop photos */}
                    {selected.documents?.workshopPhotos?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">
                          Workshop photos ({selected.documents.workshopPhotos.length})
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {selected.documents.workshopPhotos.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`Workshop ${i + 1}`} className="aspect-square rounded-lg object-cover w-full hover:opacity-90 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Craft photos */}
                    {selected.documents?.craftPhotos?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">
                          Craft photos ({selected.documents.craftPhotos.length})
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {selected.documents.craftPhotos.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`Craft ${i + 1}`} className="aspect-square rounded-lg object-cover w-full hover:opacity-90 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payout details */}
                    {(selected.bank?.bankName || selected.mobilePay?.easypaisa || selected.mobilePay?.jazzcash) && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">Payout info</p>
                        <div className="text-xs text-[#6B645A] space-y-1">
                          {selected.bank?.bankName && <p>Bank: {selected.bank.bankName} — {selected.bank.accountNumber || "—"}</p>}
                          {selected.mobilePay?.easypaisa && <p>Easypaisa: {selected.mobilePay.easypaisa}</p>}
                          {selected.mobilePay?.jazzcash && <p>JazzCash: {selected.mobilePay.jazzcash}</p>}
                        </div>
                      </div>
                    )}

                    {/* Previous admin notes */}
                    {selected.adminNotes && (
                      <div className="p-3 rounded-lg bg-[#FFF3CD] border border-[rgba(201,146,26,0.3)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C9921A] mb-1">Previous admin note</p>
                        <p className="text-xs text-[#3D2914]">{selected.adminNotes}</p>
                      </div>
                    )}

                    {/* ── Action buttons ── */}
                    <div className="space-y-2 pt-2 border-t border-[rgba(28,58,42,0.08)]">
                      {/* Advance */}
                      {NEXT_STAGE[selected.verificationStatus] && actionMode === "none" && (
                        <button type="button"
                          onClick={() => advance.mutate({ id: selected._id, stage: NEXT_STAGE[selected.verificationStatus].stage, notes: "" })}
                          disabled={isPending}
                          className="btn btn-primary w-full flex items-center justify-center gap-2">
                          {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          {NEXT_STAGE[selected.verificationStatus].label}
                        </button>
                      )}

                      {/* Request more info */}
                      {selected.verificationStatus !== "approved" && selected.verificationStatus !== "rejected" && selected.verificationStatus !== "reapply_requested" && actionMode === "none" && (
                        <button type="button" onClick={() => setActionMode("request_info")}
                          className="w-full text-sm py-2.5 rounded-full border border-[rgba(201,146,26,0.4)] text-[#C9921A] hover:bg-[rgba(201,146,26,0.08)] transition-colors flex items-center justify-center gap-2">
                          <MessageSquare size={14} /> Request more info
                        </button>
                      )}

                      {/* Reject */}
                      {selected.verificationStatus !== "approved" && selected.verificationStatus !== "rejected" && actionMode === "none" && (
                        <button type="button" onClick={() => setActionMode("reject")}
                          className="w-full text-sm py-2.5 rounded-full border border-[rgba(139,26,26,0.3)] text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)] transition-colors flex items-center justify-center gap-2">
                          <X size={14} /> Reject application
                        </button>
                      )}

                      {/* Request info form */}
                      {actionMode === "request_info" && (
                        <div className="space-y-3 p-4 rounded-2xl bg-[#FFF8EC] border border-[rgba(201,146,26,0.2)]">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#C9921A]">Feedback for seller</p>
                          <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Explain what the seller needs to update or provide…"
                            rows={3} className="w-full bg-white border border-[rgba(28,58,42,0.14)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleRequestInfo} disabled={isPending || !actionNotes.trim()}
                              className="flex-1 btn btn-primary disabled:opacity-50 flex items-center justify-center gap-2 text-sm py-2">
                              {isPending ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
                              Send feedback
                            </button>
                            <button type="button" onClick={() => { setActionMode("none"); setActionNotes(""); }}
                              className="px-4 py-2 rounded-full text-sm text-[#6B645A] border border-[rgba(28,58,42,0.14)] hover:bg-[rgba(28,58,42,0.05)]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reject form */}
                      {actionMode === "reject" && (
                        <div className="space-y-3 p-4 rounded-2xl bg-[rgba(139,26,26,0.04)] border border-[rgba(139,26,26,0.15)]">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B1A1A]">Rejection reason</p>
                          <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Explain why the application is being rejected…"
                            rows={3} className="w-full bg-white border border-[rgba(139,26,26,0.2)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B1A1A] resize-none" />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleReject} disabled={isPending || !actionNotes.trim()}
                              className="flex-1 text-sm py-2.5 rounded-full bg-[#8B1A1A] text-white hover:bg-[#6d1414] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              {isPending ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                              Confirm rejection
                            </button>
                            <button type="button" onClick={() => { setActionMode("none"); setActionNotes(""); }}
                              className="px-4 py-2 rounded-full text-sm text-[#6B645A] border border-[rgba(28,58,42,0.14)] hover:bg-[rgba(28,58,42,0.05)]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Heritage badges */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3A2A] mb-2">Heritage badges</p>
                      <div className="flex flex-wrap gap-2">
                        {BADGES.map(b => {
                          const has = selected.heritageBadges?.includes(b);
                          return (
                            <button key={b} type="button"
                              onClick={() => badgeMut.mutate({ id: selected._id, badge: b, action: has ? "remove" : "add" })}
                              className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
                              style={{
                                background: has ? "#C9921A" : "rgba(201,146,26,0.1)",
                                color: has ? "#1C3A2A" : "#C9921A",
                                border: "1px solid rgba(201,146,26,0.3)",
                              }}>
                              {b.replace(/_/g, " ")}
                            </button>
                          );
                        })}
                      </div>
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

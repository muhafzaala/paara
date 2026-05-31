import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { storiesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/stories")({
  head: () => ({ meta: [{ title: "Story Moderation · PAARA Admin" }] }),
  component: AdminStoriesPage,
});

const TABS = ["pending", "approved", "rejected"] as const;
type Tab = typeof TABS[number];

const TAB_LABEL: Record<Tab, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function AdminStoriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin") navigate({ to: "/" });
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stories", tab],
    queryFn: async () => {
      try { return (await storiesApi.listForModeration(tab)).data.stories; } catch { return []; }
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      storiesApi.review(id, action, reason),
    onSuccess: (_, vars) => {
      toast.success(vars.action === "approve" ? "Story approved and published!" : "Story rejected.");
      qc.invalidateQueries({ queryKey: ["admin-stories"] });
      qc.invalidateQueries({ queryKey: ["approved-stories"] });
      setRejectId(null);
      setRejectReason("");
    },
    onError: () => toast.error("Action failed"),
  });

  const stories: any[] = data || [];

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-8">
            <p className="eyebrow">Admin</p>
            <h1 className="display-serif text-4xl text-[#1C3A2A]">Story Moderation</h1>
          </header>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {TABS.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all border"
                style={{
                  background: tab === t ? "#1C3A2A" : "white",
                  color: tab === t ? "#F5EDD8" : "#1C3A2A",
                  borderColor: tab === t ? "#1C3A2A" : "rgba(28,58,42,0.15)",
                }}>
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C9921A]" /></div>
          ) : !stories.length ? (
            <div className="text-center py-20 text-[#6B645A]">No {tab} stories.</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {stories.map((s: any) => (
                <div key={s._id} className="bg-white rounded-[20px] overflow-hidden border border-[rgba(28,58,42,0.08)] flex flex-col">
                  {/* Image */}
                  <div className="aspect-video bg-[#FFF8EC] overflow-hidden">
                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {s.title && <p className="font-display font-semibold text-[#1C3A2A]">{s.title}</p>}
                    <p className="text-sm text-[#3D2914] leading-relaxed line-clamp-4">{s.note}</p>
                    <div className="text-xs text-[#6B645A] space-y-0.5">
                      <p>By: <span className="font-semibold text-[#1C3A2A]">{s.buyer?.name}</span> ({s.buyer?.email})</p>
                      {s.product && <p>Product: {s.product.name}</p>}
                      <p>{new Date(s.createdAt).toLocaleString()}</p>
                      {s.rejectionReason && <p className="text-[#8B1A1A]">Reason: {s.rejectionReason}</p>}
                    </div>

                    {/* Actions (only for pending) */}
                    {tab === "pending" && (
                      rejectId === s._id ? (
                        <div className="space-y-2 mt-auto">
                          <textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            className="w-full text-sm border border-[rgba(28,58,42,0.14)] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#C9921A]" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => reviewMutation.mutate({ id: s._id, action: "reject", reason: rejectReason })}
                              disabled={reviewMutation.isPending}
                              className="flex-1 py-2 rounded-full bg-[#8B1A1A] text-white text-sm font-semibold disabled:opacity-50">
                              Confirm reject
                            </button>
                            <button type="button" onClick={() => { setRejectId(null); setRejectReason(""); }}
                              className="px-4 py-2 rounded-full border border-[rgba(28,58,42,0.2)] text-sm font-semibold text-[#1C3A2A] hover:bg-[#FFF8EC]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-auto">
                          <button type="button" onClick={() => reviewMutation.mutate({ id: s._id, action: "approve" })}
                            disabled={reviewMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#1C3A2A] text-[#F5EDD8] text-sm font-semibold disabled:opacity-50">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button type="button" onClick={() => { setRejectId(s._id); setRejectReason(""); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-[rgba(139,26,26,0.4)] text-[#8B1A1A] text-sm font-semibold hover:bg-[#FEE2E2]">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )
                    )}

                    {tab !== "pending" && (
                      <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: tab === "approved" ? "#2A6F3A" : "#8B1A1A" }}>
                        {tab === "approved" ? <CheckCircle size={13} /> : <Clock size={13} />}
                        {TAB_LABEL[tab]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

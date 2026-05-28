import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Crown, ShieldCheck, ShieldOff, UserX, Search, Check, X, Activity } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminMgmtApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({ meta: [{ title: "Admin Management" }] }),
  component: AdminMgmtPage,
});

function AdminMgmtPage() {
  const { user } = useAuth() as any;
  const qc = useQueryClient();
  const [tab, setTab] = useState<"admins" | "requests" | "activity">("requests");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const requests = useQuery({
    queryKey: ["adm-requests"],
    queryFn: async () => (await adminMgmtApi.listRequests("pending")).data.requests,
    enabled: user?.isPrimaryAdmin,
  });
  const admins = useQuery({
    queryKey: ["adm-list", q, statusFilter],
    queryFn: async () => (await adminMgmtApi.listAdmins({ q, status: statusFilter })).data.admins,
    enabled: user?.isPrimaryAdmin,
  });
  const activity = useQuery({
    queryKey: ["adm-activity"],
    queryFn: async () => (await adminMgmtApi.adminActivity()).data.logs,
    enabled: user?.isPrimaryAdmin && tab === "activity",
  });

  const review = useMutation({
    mutationFn: ({ id, action, notes }: any) => adminMgmtApi.reviewRequest(id, action, notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adm-requests"] }); qc.invalidateQueries({ queryKey: ["adm-list"] }); toast.success("Done"); },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: any) => adminMgmtApi.updateAdminStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adm-list"] }); toast.success("Updated"); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminMgmtApi.removeAdmin(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adm-list"] }); toast.success("Removed"); },
  });

  if (!user?.isPrimaryAdmin) {
    return (
      <div className="min-h-screen bg-[#F5EDD8] grid place-items-center">
        <div className="text-center">
          <ShieldOff size={40} className="text-[#8B1A1A] mx-auto mb-3" />
          <p className="display-serif text-2xl text-[#1C3A2A]">Primary admin only</p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.data?.length || 0;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow inline-flex items-center gap-2"><Crown size={12} className="text-[#C9921A]" /> Primary Admin</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Admin Management</h1>
            </div>
          </header>

          <div className="flex gap-2 mb-6 border-b border-[rgba(28,58,42,0.08)]">
            {[
              { k: "requests", l: `Requests${pendingCount ? ` (${pendingCount})` : ""}` },
              { k: "admins", l: "Admins" },
              { k: "activity", l: "Activity" },
            ].map((t) => (
              <button type="button" key={t.k} onClick={() => setTab(t.k as any)}
                className="px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
                style={{ color: tab === t.k ? "#C9921A" : "#6B645A", borderBottom: tab === t.k ? "2px solid #C9921A" : "2px solid transparent" }}>
                {t.l}
              </button>
            ))}
          </div>

          {tab === "requests" && (
            <div className="space-y-3">
              {requests.isLoading ? <Loader2 className="animate-spin text-[#C9921A] mx-auto" /> :
               !requests.data?.length ? <p className="text-sm text-[#6B645A] text-center py-8">No pending requests.</p> :
               requests.data.map((r: any) => (
                <div key={r._id} className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)]">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-display font-semibold text-[#1C3A2A]">{r.user?.name}</p>
                      <p className="text-xs text-[#6B645A]">{r.user?.email} · current role: {r.user?.role}</p>
                      <p className="text-sm text-[#1C3A2A] mt-3 italic">"{r.reason}"</p>
                      <p className="text-[11px] text-[#6B645A] mt-2">Submitted {new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => review.mutate({ id: r._id, action: "approve" })}
                        className="px-4 py-2 rounded-full bg-[#1C3A2A] text-[#F5EDD8] text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-1 hover:opacity-90">
                        <Check size={14} /> Approve
                      </button>
                      <button type="button" onClick={() => {
                        const notes = prompt("Reason for rejection?");
                        if (notes !== null) review.mutate({ id: r._id, action: "reject", notes });
                      }} className="px-4 py-2 rounded-full border border-[#8B1A1A] text-[#8B1A1A] text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-1 hover:bg-[#8B1A1A] hover:text-white">
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "admins" && (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[rgba(28,58,42,0.12)] text-sm focus:outline-none focus:border-[#C9921A]" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-full bg-white border border-[rgba(28,58,42,0.12)] text-sm focus:outline-none focus:border-[#C9921A]">
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-[rgba(28,58,42,0.08)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#FFF8EC] text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">
                    <tr>
                      <th className="px-4 py-3 text-left">Admin</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Approved By</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.isLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center"><Loader2 className="animate-spin text-[#C9921A] mx-auto" /></td></tr>
                    ) : admins.data?.map((a: any) => (
                      <tr key={a._id} className="border-t border-[rgba(28,58,42,0.06)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {a.isPrimaryAdmin && <Crown size={14} className="text-[#C9921A]" />}
                            <div>
                              <p className="text-[#1C3A2A] font-semibold">{a.name}</p>
                              <p className="text-[11px] text-[#6B645A]">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.12em]"
                            style={{
                              background: a.adminStatus === "active" ? "rgba(28,58,42,0.1)" : "rgba(139,26,26,0.1)",
                              color: a.adminStatus === "active" ? "#1C3A2A" : "#8B1A1A",
                            }}>
                            {a.adminStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6B645A]">{a.adminApprovedBy?.name || (a.isPrimaryAdmin ? "—" : "system")}</td>
                        <td className="px-4 py-3 text-[#6B645A]">{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          {!a.isPrimaryAdmin && (
                            <div className="inline-flex gap-2">
                              {a.adminStatus === "active" ? (
                                <button type="button" onClick={() => setStatus.mutate({ id: a._id, status: "suspended" })}
                                  className="text-[#6B645A] hover:text-[#8B1A1A]" title="Suspend"><ShieldOff size={16} /></button>
                              ) : (
                                <button type="button" onClick={() => setStatus.mutate({ id: a._id, status: "active" })}
                                  className="text-[#6B645A] hover:text-[#1C3A2A]" title="Reactivate"><ShieldCheck size={16} /></button>
                              )}
                              <button type="button" onClick={() => { if (confirm(`Remove admin ${a.email}?`)) remove.mutate(a._id); }}
                                className="text-[#6B645A] hover:text-[#8B1A1A]" title="Remove"><UserX size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "activity" && (
            <div className="bg-white rounded-2xl border border-[rgba(28,58,42,0.08)] overflow-hidden">
              <header className="p-4 border-b border-[rgba(28,58,42,0.06)] flex items-center gap-2">
                <Activity size={16} className="text-[#C9921A]" />
                <p className="font-display font-semibold text-[#1C3A2A]">Admin activity (last 200)</p>
              </header>
              <table className="w-full text-sm">
                <thead className="bg-[#FFF8EC] text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">
                  <tr>
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">Admin</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.isLoading ? (
                    <tr><td colSpan={4} className="p-6 text-center"><Loader2 className="animate-spin text-[#C9921A] mx-auto" /></td></tr>
                  ) : activity.data?.map((l: any) => (
                    <tr key={l._id} className="border-t border-[rgba(28,58,42,0.06)]">
                      <td className="px-4 py-3 text-[#6B645A]">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#1C3A2A]">
                        <span className="inline-flex items-center gap-1">
                          {l.actor?.isPrimaryAdmin && <Crown size={12} className="text-[#C9921A]" />}
                          {l.actor?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                      <td className="px-4 py-3 text-[#6B645A]">{l.targetType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

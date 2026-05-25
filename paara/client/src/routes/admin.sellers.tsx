import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers")({ component: AdminSellers });

function AdminSellers() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sellers", filter],
    queryFn: async () => { try { return (await adminApi.getSellers({ verificationStatus: filter === "all" ? undefined : filter })).data.sellers; } catch { return []; } },
  });

  const verify = async (id: string, status: string) => {
    setActing(id);
    try { await adminApi.verifySeller(id, status); qc.invalidateQueries({ queryKey: ["admin-sellers"] }); toast.success(`Seller ${status}`); }
    catch { toast.error("Could not update seller"); } finally { setActing(null); }
  };

  const BADGE_STYLES: Record<string, string> = { approved: "text-green-400", pending: "text-amber-400", rejected: "text-red-400", none: "text-gray-400" };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-[rgba(245,237,216,0.5)]">Verification</p>
        <h1 className="font-display text-3xl text-[#F5EDD8]">Sellers</h1>
      </header>
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
            style={{ background: filter === s ? "#C9921A" : "rgba(245,237,216,0.08)", color: filter === s ? "#1C3A2A" : "rgba(245,237,216,0.7)", border: "1px solid rgba(201,146,26,0.2)" }}>
            {s}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        (data || []).length === 0 ? (
          <div className="text-center py-12 text-[rgba(245,237,216,0.5)]">No sellers in this category.</div>
        ) : (
          <div className="space-y-3">
            {(data || []).map((s: any) => (
              <div key={s._id} className="bg-[rgba(245,237,216,0.06)] rounded-[16px] p-4 flex items-center gap-4 border border-[rgba(201,146,26,0.1)]">
                <div className="w-10 h-10 rounded-full bg-[#1C3A2A] grid place-items-center text-[#F5EDD8] text-sm font-semibold flex-shrink-0">
                  {s.name?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F5EDD8]">{s.shopName || s.name}</p>
                  <p className="text-xs text-[rgba(245,237,216,0.55)]">{s.email} · {s.city || "—"}</p>
                  <span className={`text-xs font-bold ${BADGE_STYLES[s.verificationStatus] || "text-gray-400"}`}>{s.verificationStatus}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {acting === s._id ? <Loader2 size={16} className="animate-spin text-[#C9921A]" /> : (
                    <>
                      <button onClick={() => verify(s._id, "approved")} className="p-2 rounded-full hover:bg-[rgba(42,92,63,0.3)] text-green-400" title="Approve"><CheckCircle2 size={18} /></button>
                      <button onClick={() => verify(s._id, "rejected")} className="p-2 rounded-full hover:bg-[rgba(139,26,26,0.3)] text-red-400" title="Reject"><XCircle size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

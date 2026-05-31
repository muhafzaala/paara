import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Trash2, Loader2, Package } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", filter],
    queryFn: async () => { try { return (await adminApi.getProducts({ status: filter === "all" ? undefined : filter })).data.products; } catch { return []; } },
  });

  const moderate = async (id: string, action: string) => {
    setActing(id);
    try { await adminApi.moderateProduct(id, action); qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success(`Product ${action}d`); }
    catch { toast.error("Could not update product"); } finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-[rgba(245,237,216,0.5)]">Moderation</p>
        <h1 className="font-display text-3xl text-[#F5EDD8]">Products</h1>
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
          <div className="text-center py-12 text-[rgba(245,237,216,0.5)]">No products in this category.</div>
        ) : (
          <div className="space-y-3">
            {(data || []).map((p: any) => (
              <div key={p._id} className="bg-[rgba(245,237,216,0.06)] rounded-[16px] p-4 flex items-center gap-4 border border-[rgba(201,146,26,0.1)]">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"><ProductImage src={p.images?.[0]} alt="" size="sm" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F5EDD8] truncate">{p.name}</p>
                  <p className="text-xs text-[rgba(245,237,216,0.55)]">{p.city} · {p.category} · {p.seller?.name}</p>
                  <p className="text-sm text-[#C9921A] font-semibold">{formatPKR(p.price)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {acting === p._id ? <Loader2 size={16} className="animate-spin text-[#C9921A]" /> : (
                    p.status === "approved" ? (
                      <>
                        <button type="button" onClick={() => moderate(p._id, "reject")} className="p-2 rounded-full hover:bg-[rgba(139,26,26,0.3)] text-red-400" title="Reject"><XCircle size={18} /></button>
                        <button type="button" onClick={() => moderate(p._id, "remove")} className="p-2 rounded-full hover:bg-[rgba(139,26,26,0.3)] text-red-300" title="Remove"><Trash2 size={18} /></button>
                      </>
                    ) : p.status === "rejected" ? (
                      <>
                        <button type="button" onClick={() => moderate(p._id, "approve")} className="p-2 rounded-full hover:bg-[rgba(42,92,63,0.3)] text-green-400" title="Re-approve"><CheckCircle2 size={18} /></button>
                        <button type="button" onClick={() => moderate(p._id, "remove")} className="p-2 rounded-full hover:bg-[rgba(139,26,26,0.3)] text-red-300" title="Remove"><Trash2 size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => moderate(p._id, "approve")} className="p-2 rounded-full hover:bg-[rgba(42,92,63,0.3)] text-green-400" title="Approve"><CheckCircle2 size={18} /></button>
                        <button type="button" onClick={() => moderate(p._id, "reject")} className="p-2 rounded-full hover:bg-[rgba(139,26,26,0.3)] text-red-400" title="Reject"><XCircle size={18} /></button>
                      </>
                    )
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

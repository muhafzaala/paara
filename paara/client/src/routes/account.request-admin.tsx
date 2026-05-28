import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Loader2, Clock, Check, X } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminMgmtApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/request-admin")({
  head: () => ({ meta: [{ title: "Request Admin Access" }] }),
  component: RequestAdminPage,
});

function RequestAdminPage() {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["my-admin-req"], queryFn: async () => (await adminMgmtApi.myRequest()).data.request });
  const submit = useMutation({
    mutationFn: () => adminMgmtApi.submitRequest(reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-admin-req"] }); toast.success("Request submitted"); setReason(""); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  if (isLoading) return <div className="min-h-screen bg-[#F5EDD8] grid place-items-center"><Loader2 className="animate-spin text-[#C9921A]" /></div>;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[700px]">
          <header className="mb-8">
            <ShieldCheck size={28} className="text-[#C9921A] mb-2" />
            <h1 className="display-serif text-4xl text-[#1C3A2A]">Request admin access</h1>
            <p className="text-sm text-[#6B645A] mt-2">Submit a reason. Only the primary admin can approve.</p>
          </header>

          {data?.status === "pending" && (
            <div className="bg-white rounded-2xl p-6 border border-[rgba(201,146,26,0.3)] flex items-start gap-3">
              <Clock className="text-[#C9921A]" />
              <div>
                <p className="font-display font-semibold text-[#1C3A2A]">Pending review</p>
                <p className="text-sm text-[#6B645A] mt-1">Submitted {new Date(data.createdAt).toLocaleDateString()}.</p>
                <p className="text-xs text-[#6B645A] mt-3 italic">"{data.reason}"</p>
              </div>
            </div>
          )}
          {data?.status === "approved" && (
            <div className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.16)] flex items-start gap-3">
              <Check className="text-[#1C3A2A]" />
              <p className="text-sm text-[#1C3A2A]">Approved. Sign out and back in to access the admin area.</p>
            </div>
          )}
          {data?.status === "rejected" && (
            <div className="bg-white rounded-2xl p-6 border border-[rgba(139,26,26,0.2)]">
              <div className="flex items-start gap-3">
                <X className="text-[#8B1A1A]" />
                <div className="flex-1">
                  <p className="font-display font-semibold text-[#1C3A2A]">Rejected</p>
                  {data.reviewNotes && <p className="text-sm text-[#6B645A] mt-1">{data.reviewNotes}</p>}
                </div>
              </div>
              <p className="text-xs text-[#6B645A] mt-4">You can submit a new request below.</p>
            </div>
          )}

          {(!data || data.status === "rejected") && (
            <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="bg-white rounded-2xl p-6 border border-[rgba(28,58,42,0.08)] mt-6 space-y-4">
              <label className="block">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Why do you need admin access?</p>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={6} minLength={30} required
                  placeholder="Explain your role, responsibilities, and what you intend to manage. Minimum 30 characters."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
                <p className="text-[11px] text-[#6B645A] mt-1">{reason.length} characters</p>
              </label>
              <button type="submit" disabled={submit.isPending || reason.length < 30} className="btn btn-primary w-full disabled:opacity-50">
                {submit.isPending ? <Loader2 size={16} className="animate-spin" /> : "Submit request"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { adminApi } from "@/lib/api";

export const Route = createFileRoute("/admin/audit-log")({
  head: () => ({ meta: [{ title: "Audit Log · Admin" }] }),
  component: AuditLogPage,
});

function AuditLogPage() {
  const [actorRole, setActorRole] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", actorRole],
    queryFn: async () => (await adminApi.getAuditLog({ actorRole, limit: 100 })).data.logs,
  });

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-6">
            <p className="eyebrow">Admin</p>
            <h1 className="display-serif text-4xl text-[#1C3A2A] mt-2">Audit Log</h1>
          </header>

          <div className="flex gap-2 mb-6">
            {["", "admin", "seller", "buyer"].map(r => (
              <button key={r || "all"} onClick={() => setActorRole(r)}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em]"
                style={{
                  background: actorRole === r ? "#1C3A2A" : "#FFF8EC",
                  color: actorRole === r ? "#F5EDD8" : "#1C3A2A",
                  border: `1.5px solid ${actorRole === r ? "#C9921A" : "rgba(28,58,42,0.12)"}`,
                }}>{r || "All"}</button>
            ))}
          </div>

          {isLoading ? <Loader2 className="animate-spin text-[#C9921A] mx-auto" size={32} /> : (
            <div className="bg-white rounded-2xl border border-[rgba(28,58,42,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FFF8EC] text-[10px] uppercase tracking-[0.14em] text-[#6B645A]">
                  <tr>
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">Actor</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((log: any) => (
                    <tr key={log._id} className="border-t border-[rgba(28,58,42,0.06)]">
                      <td className="px-4 py-3 text-[#6B645A]">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#1C3A2A]">{log.actor?.name || "—"}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-[#FFF8EC] text-[10px] uppercase">{log.actorRole}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-[#1C3A2A]">{log.action}</td>
                      <td className="px-4 py-3 text-[#6B645A]">{log.targetType}/{log.targetId?.toString().slice(-6)}</td>
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

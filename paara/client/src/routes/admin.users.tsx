import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { adminApi } from "@/lib/api";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role],
    queryFn: async () => {
      try { return (await adminApi.getUsers({ search: search || undefined, role: role || undefined })).data.users; }
      catch { return []; }
    },
    staleTime: 10000,
  });

  const ROLE_COLORS: Record<string,string> = { admin: "text-red-400", seller: "text-amber-400", buyer: "text-green-400" };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-[rgba(245,237,216,0.5)]">Management</p>
        <h1 className="font-display text-3xl text-[#F5EDD8]">Users</h1>
      </header>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(245,237,216,0.4)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full border border-[rgba(201,146,26,0.2)] bg-[rgba(245,237,216,0.06)] text-[#F5EDD8] placeholder:text-[rgba(245,237,216,0.35)] focus:outline-none focus:border-[#C9921A]" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-full border border-[rgba(201,146,26,0.2)] bg-[rgba(245,237,216,0.06)] text-[rgba(245,237,216,0.8)] focus:outline-none focus:border-[#C9921A]">
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        (data || []).length === 0 ? <div className="text-center py-8 text-[rgba(245,237,216,0.5)]">No users found.</div> : (
          <div className="space-y-2">
            {(data || []).map((u: any) => (
              <div key={u._id} className="bg-[rgba(245,237,216,0.06)] rounded-[12px] p-4 flex items-center gap-3 border border-[rgba(201,146,26,0.08)]">
                <div className="w-9 h-9 rounded-full bg-[#1C3A2A] grid place-items-center text-[#F5EDD8] text-xs font-bold flex-shrink-0">
                  {u.name?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5EDD8] truncate">{u.name}</p>
                  <p className="text-xs text-[rgba(245,237,216,0.5)] truncate">{u.email}</p>
                </div>
                <span className={`text-[11px] font-bold uppercase ${ROLE_COLORS[u.role] || "text-gray-400"}`}>{u.role}</span>
                <span className={`text-[11px] font-semibold ${u.isActive ? "text-green-400" : "text-red-400"}`}>{u.isActive ? "Active" : "Inactive"}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { notificationsApi } from "@/lib/api";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await notificationsApi.list()).data,
    refetchInterval: 60000,
  });
  const markRead = useMutation({
    mutationFn: () => notificationsApi.markRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.unread || 0;
  const items = data?.notifications || [];

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open && unread > 0) markRead.mutate(); }}
        className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-[#FFF8EC] transition-colors">
        <Bell size={18} className="text-[#1C3A2A]" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#8B1A1A] text-white text-[10px] font-bold grid place-items-center">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[rgba(28,58,42,0.08)] overflow-hidden z-50">
          <header className="p-4 border-b border-[rgba(28,58,42,0.06)] flex items-center justify-between">
            <p className="font-display font-semibold text-[#1C3A2A]">Notifications</p>
            <span className="text-xs text-[#6B645A]">{unread} unread</span>
          </header>
          <ul className="max-h-96 overflow-y-auto">
            {isLoading ? <li className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-[#C9921A]" size={20} /></li> :
              items.length === 0 ? <li className="p-6 text-center text-sm text-[#6B645A]">No notifications</li> :
              items.map((n: any) => (
                <li key={n._id}>
                  <Link to={n.link || "#"} onClick={() => setOpen(false)}
                    className="block p-4 hover:bg-[#FFF8EC] border-b last:border-0 border-[rgba(28,58,42,0.04)]">
                    <p className="text-sm font-semibold text-[#1C3A2A]">{n.title}</p>
                    <p className="text-xs text-[#6B645A] mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-[#6B645A] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </Link>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
}

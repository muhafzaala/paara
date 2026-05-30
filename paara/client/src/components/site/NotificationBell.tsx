import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { notificationsApi } from "@/lib/api";

const TYPE_STYLE: Record<string, { label: string; cls: string }> = {
  order_placed:              { label: "Order",      cls: "nb-badge-green"  },
  order_status:              { label: "Order",      cls: "nb-badge-blue"   },
  review_received:           { label: "Review",     cls: "nb-badge-yellow" },
  verification_update:       { label: "Verify",     cls: "nb-badge-purple" },
  payout_sent:               { label: "Payout",     cls: "nb-badge-green"  },
  system:                    { label: "System",     cls: "nb-badge-gray"   },
  new_user_registered:       { label: "New User",   cls: "nb-badge-green"  },
  new_product_submitted:     { label: "Product",    cls: "nb-badge-blue"   },
  product_approved:          { label: "Approved",   cls: "nb-badge-green"  },
  product_rejected:          { label: "Rejected",   cls: "nb-badge-red"    },
  product_resubmit_requested:{ label: "Suspended",  cls: "nb-badge-yellow" },
  admin_request_submitted:   { label: "Admin Req",  cls: "nb-badge-purple" },
  admin_request_reviewed:    { label: "Reviewed",   cls: "nb-badge-blue"   },
};

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
              items.map((n: any) => {
                const badge = TYPE_STYLE[n.type];
                return (
                  <li key={n._id}>
                    <Link to={n.link || "#"} onClick={() => setOpen(false)}
                      className="block p-4 hover:bg-[#FFF8EC] border-b last:border-0 border-[rgba(28,58,42,0.04)]">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[#1C3A2A] flex-1">{n.title}</p>
                        {badge && (
                          <span className={`nb-badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B645A]">{n.message}</p>
                      <p className="text-[10px] text-[#6B645A] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </Link>
                  </li>
                );
              })
            }
          </ul>
        </div>
      )}
    </div>
  );
}

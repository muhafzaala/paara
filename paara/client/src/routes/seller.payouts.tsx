import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Loader2 } from "lucide-react";
import { sellerApi } from "@/lib/api";
import { toast } from "sonner";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/seller/payouts")({ component: SellerPayoutsPage });

function SellerPayoutsPage() {
  const [amount, setAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  const { data } = useQuery({
    queryKey: ["seller-payouts"],
    queryFn: async () => { try { return (await sellerApi.getPayouts()).data; } catch { return { payouts: [], balance: 0 }; } },
  });

  const handleRequest = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setRequesting(true);
    try { await sellerApi.requestPayout({ amount: Number(amount) }); toast.success("Payout request submitted. 3–5 business days."); setAmount(""); }
    catch { toast.error("Could not submit payout request"); } finally { setRequesting(false); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Earnings</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Payouts</h1>
      </header>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-[#1C3A2A] to-[#264D38] text-[#F5EDD8] rounded-[20px] p-6">
          <Wallet size={24} className="text-[#C9921A] mb-3" />
          <p className="text-sm text-[rgba(245,237,216,0.7)] mb-1">Available balance</p>
          <p className="font-display text-4xl font-semibold text-[#F5EDD8]">{formatPKR(data?.balance || 0)}</p>
        </div>
        <div className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-[#1C3A2A] mb-4">Request a payout</p>
          <input type="number" placeholder="Amount in PKR" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm mb-3 focus:outline-none focus:border-[#C9921A]" />
          <button onClick={handleRequest} disabled={requesting || !amount} className="btn btn-primary w-full disabled:opacity-60">
            {requesting ? <Loader2 size={14} className="animate-spin" /> : "Request payout"}
          </button>
          <p className="text-xs text-[#6B645A] mt-3 text-center">Processed within 3–5 business days via bank transfer.</p>
        </div>
      </div>

      {(data?.payouts || []).length === 0 && (
        <div className="text-center py-8 text-[#6B645A] text-sm">No payout history yet.</div>
      )}
    </div>
  );
}

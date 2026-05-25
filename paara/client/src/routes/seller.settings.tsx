import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { sellerApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/settings")({ component: SellerSettingsPage });

function SellerSettingsPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ shopName: "", shopDescription: "", city: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ shopName: (user as any).shopName || "", shopDescription: (user as any).shopDescription || "", city: user.city || "", phone: (user as any).phone || "" });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await sellerApi.updateSettings(form);
      setUser(res.data.user);
      toast.success("Settings saved");
    } catch { toast.error("Could not save settings"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Configuration</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Shop settings</h1>
      </header>
      <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 md:p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] space-y-5 max-w-lg">
        {[["Shop / Atelier name", "shopName", "Karim Wood Studio"], ["City / Region", "city", "Hunza"], ["Phone number", "phone", "+92 3xx xxxxxxx"]].map(([label, key, ph]) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">{label}</label>
            <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph}
              className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Shop description</label>
          <textarea value={form.shopDescription} onChange={(e) => setForm({ ...form, shopDescription: e.target.value })} rows={4} placeholder="Tell buyers about your craft and heritage…"
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save settings
        </button>
      </form>
    </div>
  );
}

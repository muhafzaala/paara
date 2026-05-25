import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { userApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({ component: ProfilePage });

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: (user as any).phone || "", city: user.city || "" });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile(form);
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch { toast.error("Could not update profile"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Your profile</h1>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 md:p-8 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-5 max-w-lg">
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Email" value={user?.email || ""} onChange={() => {}} disabled hint="Email cannot be changed" />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+92 3xx xxxxxxx" />
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Lahore, Karachi…" />

        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Account type</p>
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{ background: user?.role === "admin" ? "rgba(28,58,42,0.12)" : user?.role === "seller" ? "rgba(201,146,26,0.12)" : "rgba(28,58,42,0.08)", color: "#1C3A2A" }}>
            {user?.role}
          </span>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60 flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, disabled, hint, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder={placeholder}
        className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] disabled:opacity-50 disabled:cursor-not-allowed" />
      {hint && <p className="text-[11px] text-[#6B645A] mt-1">{hint}</p>}
    </div>
  );
}

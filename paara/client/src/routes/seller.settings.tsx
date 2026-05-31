import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Shield, QrCode, Check } from "lucide-react";
import { sellerApi, authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/settings")({ component: SellerSettingsPage });

const CITIES = ["Lahore", "Multan", "Hunza", "Peshawar", "Karachi", "Skardu", "Gilgit", "Balochistan", "Islamabad", "Faisalabad", "Mardan"];

function SellerSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ACCENT_SWATCHES = [
    { color: "#C9921A", label: "Warm Gold" },
    { color: "#1C3A2A", label: "Heritage Green" },
    { color: "#8B1A1A", label: "Crimson" },
    { color: "#2A5C3F", label: "Emerald" },
    { color: "#B5651D", label: "Terracotta" },
    { color: "#1A3A8B", label: "Indigo" },
  ];
  const [form, setForm] = useState({ shopName: "", shopDescription: "", shopStory: "", city: "", region: "", yearEstablished: "", isVisible: true, accentColor: "#C9921A" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-profile"],
    queryFn: async () => (await sellerApi.getMyProfile()).data.profile,
  });

  useEffect(() => {
    if (data) setForm({
      shopName: data.shopName || "",
      shopDescription: data.shopDescription || "",
      shopStory: data.shopStory || "",
      city: data.city || "",
      region: data.region || "",
      yearEstablished: data.yearEstablished ? String(data.yearEstablished) : "",
      isVisible: data.isVisible !== false,
      accentColor: data.accentColor || "#C9921A",
    });
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sellerApi.updateMyProfile({
        ...form,
        yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
        accentColor: form.accentColor,
      });
      qc.invalidateQueries({ queryKey: ["seller-profile"] });
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Configuration</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Shop settings</h1>
      </header>
      <SellerTwoFactorSection user={user} />
      <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 md:p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] space-y-5 max-w-lg">
        <F label="Shop / Atelier name" value={form.shopName} onChange={(v: string) => setForm(p => ({ ...p, shopName: v }))} placeholder="Karim Wood Studio" />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">City</label>
          <select aria-label="City" value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
            <option value="">Select city…</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <F label="Region / Province" value={form.region} onChange={(v: string) => setForm(p => ({ ...p, region: v }))} placeholder="Punjab, KPK, Sindh…" />
        <F label="Year established" value={form.yearEstablished} onChange={(v: string) => setForm(p => ({ ...p, yearEstablished: v }))} type="number" placeholder="e.g. 1987" />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Shop description</label>
          <textarea value={form.shopDescription} onChange={(e) => setForm(p => ({ ...p, shopDescription: e.target.value }))} rows={3}
            placeholder="Tell buyers about your craft and heritage…"
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Our story</label>
          <textarea value={form.shopStory} onChange={(e) => setForm(p => ({ ...p, shopStory: e.target.value }))} rows={4}
            placeholder="The longer heritage story shown on your public shop page…"
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm(p => ({ ...p, isVisible: e.target.checked }))}
            className="w-4 h-4 rounded accent-[#C9921A]" />
          <span className="text-sm text-[#1C3A2A]">Show my shop publicly</span>
        </label>

        {/* Accent colour picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-3">Storefront accent colour</label>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_SWATCHES.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(p => ({ ...p, accentColor: color }))}
                className="w-9 h-9 rounded-full border-4 transition-all hover:scale-110"
                style={{
                  background: color,
                  borderColor: form.accentColor === color ? "#1C3A2A" : "transparent",
                  boxShadow: form.accentColor === color ? "0 0 0 2px #1C3A2A" : "none",
                }}
                aria-label={label}
                title={label}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#6B645A] mt-2">Selected: {form.accentColor}</p>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save settings
        </button>
      </form>
    </div>
  );
}

function SellerTwoFactorSection({ user }: { user: any }) {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "done">("idle");
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const is2FAEnabled = user?.twoFactorEnabled;

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await authApi.setup2FA();
      setSetupData(res.data);
      setStep("setup");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not initiate 2FA setup");
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      await authApi.verify2FA(token);
      toast.success("Two-factor authentication enabled!");
      setStep("done");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally { setLoading(false); }
  };

  const handleDisable = async () => {
    if (!disablePassword) { toast.error("Enter your password to disable 2FA"); return; }
    setLoading(true);
    try {
      await authApi.disable2FA(disablePassword);
      toast.success("2FA disabled");
      setStep("idle");
      setDisablePassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not disable 2FA");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] max-w-lg">
      <div className="flex items-center gap-3 mb-5">
        <Shield size={18} className="text-[#C9921A]" />
        <h2 className="display-serif text-xl text-[#1C3A2A]">Two-factor authentication</h2>
        {(is2FAEnabled || step === "done") && <span className="ml-auto text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Active</span>}
      </div>

      {step === "idle" && !is2FAEnabled && (
        <>
          <p className="text-sm text-[#6B645A] mb-4 leading-relaxed">Protect your seller account with an authenticator app (Google Authenticator, Authy).</p>
          <button type="button" onClick={handleSetup} disabled={loading} className="btn btn-primary disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><QrCode size={14} /> Enable 2FA</>}
          </button>
        </>
      )}

      {step === "setup" && setupData && (
        <div className="space-y-4">
          <p className="text-sm text-[#3D2914]">Scan this QR code with your authenticator app:</p>
          <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48 border border-[rgba(28,58,42,0.1)] rounded-[12px]" />
          <p className="text-xs text-[#6B645A]">Manual key: <code className="bg-[#FFF8EC] px-2 py-1 rounded text-[#1C3A2A] font-mono text-xs">{setupData.secret}</code></p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Enter 6-digit code</label>
            <div className="flex gap-3">
              <input value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" maxLength={6} inputMode="numeric"
                className="flex-1 bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm text-center tracking-[0.3em] focus:outline-none focus:border-[#C9921A]" />
              <button type="button" onClick={handleVerify} disabled={loading || token.length !== 6} className="btn btn-primary disabled:opacity-60">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {(step === "done" || is2FAEnabled) && (
        <div className="space-y-4">
          <p className="text-sm text-[#6B645A]">Your account is protected with 2FA via authenticator app.</p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Password to disable</label>
            <div className="flex gap-3">
              <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Your password"
                className="flex-1 bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
              <button type="button" onClick={handleDisable} disabled={loading}
                className="text-xs px-4 py-2.5 rounded-full border border-[rgba(139,26,26,0.2)] text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)] transition-colors disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
    </div>
  );
}

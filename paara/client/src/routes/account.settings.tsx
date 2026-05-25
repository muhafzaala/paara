import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Key, Eye, EyeOff, Loader2, Check, QrCode } from "lucide-react";
import { authApi, userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/account/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Security</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">Settings</h1>
      </header>
      <ChangePasswordSection />
      <TwoFactorSection user={user} />
    </div>
  );
}

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await userApi.changePassword(form.currentPassword, form.newPassword);
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not update password");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] max-w-lg">
      <div className="flex items-center gap-3 mb-5">
        <Key size={18} className="text-[#C9921A]" />
        <h2 className="display-serif text-xl text-[#1C3A2A]">Change password</h2>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        {[["Current password", "currentPassword"], ["New password", "newPassword"], ["Confirm new password", "confirm"]].map(([label, key]) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">{label}</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#C9921A]" />
              {key === "currentPassword" && (
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B645A]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60 flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Update password"}
        </button>
      </form>
    </div>
  );
}

function TwoFactorSection({ user }: { user: any }) {
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
    if (!token || token.length !== 6) { toast.error("Enter the 6-digit code from your authenticator app"); return; }
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
          <p className="text-sm text-[#6B645A] mb-4 leading-relaxed">Add an extra layer of security using an authenticator app (Google Authenticator, Authy).</p>
          <button onClick={handleSetup} disabled={loading} className="btn btn-primary disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><QrCode size={14} /> Enable 2FA</>}
          </button>
        </>
      )}

      {step === "setup" && setupData && (
        <div className="space-y-4">
          <p className="text-sm text-[#3D2914]">Scan this QR code with your authenticator app:</p>
          <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48 border border-[rgba(28,58,42,0.1)] rounded-[12px]" />
          <p className="text-xs text-[#6B645A]">Or enter this key manually: <code className="bg-[#FFF8EC] px-2 py-1 rounded text-[#1C3A2A] font-mono text-xs">{setupData.secret}</code></p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Enter 6-digit code</label>
            <div className="flex gap-3">
              <input value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" maxLength={6}
                className="flex-1 bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm text-center tracking-[0.3em] focus:outline-none focus:border-[#C9921A]" />
              <button onClick={handleVerify} disabled={loading || token.length !== 6} className="btn btn-primary disabled:opacity-60">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {(step === "done" || is2FAEnabled) && (
        <div className="space-y-4">
          <p className="text-sm text-[#6B645A]">Your account is protected with 2FA.</p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-2">Password to disable</label>
            <div className="flex gap-3">
              <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Your password" className="flex-1 bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
              <button onClick={handleDisable} disabled={loading} className="text-xs px-4 py-2.5 rounded-full border border-[rgba(139,26,26,0.2)] text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)] transition-colors disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

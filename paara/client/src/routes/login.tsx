import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, Lock, ShieldCheck, Smartphone, ArrowRight, RotateCcw } from "lucide-react";
import badshahiImg from "@/assets/cities/Badshahi.jpg";
import { PaaraLogo } from "@/components/site/PaaraLogo";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · PAARA" }] }),
  component: LoginPage,
});

type Stage = "creds" | "otp" | "totp";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken, setChallenge } = useAuth() as any;
  const [stage, setStage] = useState<Stage>("creds");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setLocalChallenge] = useState("");
  const [busy, setBusy] = useState(false);

  const submitCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authApi.login(email, password);
      const { twoFactor, stage: twoFAStage, challengeToken } = r.data;

      if (twoFactor) {
        setLocalChallenge(challengeToken);
        setChallenge?.(challengeToken);
        setStage(twoFAStage === "totp" ? "totp" : "otp");
        toast.success(twoFAStage === "totp" ? "Enter your authenticator code" : "Check your terminal for the OTP code");
      } else {
        setToken(r.data.token);
        setUser(r.data.user);
        toast.success("Welcome back");
        sessionStorage.setItem("paara_just_signed_in", "1");
        const role = r.data.user?.role;
        if (role === "admin") navigate({ to: "/admin" });
        else if (role === "seller") navigate({ to: "/seller" });
        else navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const submitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authApi.verifyAdmin2FA(challenge, code);
      setToken(r.data.token);
      setUser(r.data.user);
      setChallenge?.(null);
      toast.success("Verified");
      if (r.data.mustSetupTOTP) {
        navigate({ to: "/admin/setup-2fa" });
      } else {
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const submitTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authApi.verifyAdminTOTP(challenge, code);
      setToken(r.data.token);
      setUser(r.data.user);
      setChallenge?.(null);
      toast.success("Verified");
      const role = r.data.user?.role;
      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "seller") navigate({ to: "/seller" });
      else navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid authenticator code");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await authApi.resendOTP(challenge, "admin_2fa");
      toast.success("New code sent to terminal");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not resend");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1fr_1.05fr] bg-[#F5EDD8]">
      {/* ── Left column: form ─────────────────────────────────────────── */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-12 lg:py-20 order-2 md:order-1">
        <Link to="/" className="md:hidden flex items-center gap-3 mb-10">
          <PaaraLogo height={48} />
          <span className="font-display text-xl tracking-[0.32em] text-[#1C3A2A]">PAARA</span>
        </Link>

        <div className="m-auto w-full max-w-md">
          {stage === "creds" && (
            <>
              <p className="eyebrow mb-3">Welcome back</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Sign in</h1>
              <p className="text-[#3D2914] mb-8 leading-relaxed">
                New here?{" "}
                <Link to="/register" className="text-[#C9921A] font-medium underline-offset-4 hover:underline">Create an account</Link>.
              </p>

              <form className="space-y-4" onSubmit={submitCreds}>
                <Field label="Email" icon={<Mail size={16} />}>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="paara-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Password" icon={<Lock size={16} />}>
                  <input
                    type="password"
                    required
                    placeholder="Your password"
                    className="paara-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <button type="submit" disabled={busy} className="btn btn-primary w-full !py-4 mt-2 disabled:opacity-60">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {stage === "otp" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#1C3A2A] grid place-items-center mb-6">
                <ShieldCheck size={26} className="text-[#C9921A]" />
              </div>
              <p className="eyebrow mb-3">Two-step verification</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Check your terminal</h1>
              <p className="text-[#3D2914] mb-2 leading-relaxed">Enter the 6-digit code printed in your server terminal.</p>
              <p className="text-xs text-[#C9921A] mb-8">After verifying you'll be prompted to set up an authenticator app.</p>

              <form className="space-y-5" onSubmit={submitOTP}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Verification code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    className="paara-input !pl-5 text-center text-2xl tracking-[0.4em] font-mono"
                    placeholder="123456"
                  />
                </div>
                <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary w-full !py-4 disabled:opacity-60">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <>Verify &amp; continue <ArrowRight size={16} /></>}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStage("creds"); setCode(""); }} className="text-[#6B645A] hover:text-[#1C3A2A] transition-colors">
                    ← Back
                  </button>
                  <button type="button" onClick={resend} className="inline-flex items-center gap-1.5 text-[#C9921A] hover:underline">
                    <RotateCcw size={13} /> Resend code
                  </button>
                </div>
              </form>
            </>
          )}

          {stage === "totp" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#1C3A2A] grid place-items-center mb-6">
                <Smartphone size={26} className="text-[#C9921A]" />
              </div>
              <p className="eyebrow mb-3">Authenticator</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Enter your code</h1>
              <p className="text-[#3D2914] mb-8 leading-relaxed">Open your authenticator app and enter the 6-digit code for PAARA.</p>

              <form className="space-y-5" onSubmit={submitTOTP}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Authenticator code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    className="paara-input !pl-5 text-center text-2xl tracking-[0.4em] font-mono"
                    placeholder="123456"
                  />
                </div>
                <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary w-full !py-4 disabled:opacity-60">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <>Verify &amp; continue <ArrowRight size={16} /></>}
                </button>
                <div className="text-sm">
                  <button type="button" onClick={() => { setStage("creds"); setCode(""); }} className="text-[#6B645A] hover:text-[#1C3A2A] transition-colors">
                    ← Back
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Right column: dark hero ────────────────────────────────────── */}
      <div className="relative hidden md:block overflow-hidden order-1 md:order-2 bg-[#01411C]">
        <img src={badshahiImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,65,28,0.35)] via-transparent to-[rgba(1,65,28,0.85)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-[#F5EDD8]">
          <Link to="/" className="ml-auto"><PaaraLogo height={120} /></Link>
          <div>
            <p className="eyebrow !text-[#C9921A] mb-4">Return to PAARA</p>
            <h2 className="display-serif text-4xl lg:text-5xl leading-tight max-w-[18ch] mb-4">Where <em className="italic text-[#C9921A]">heritage</em> finds its rightful place.</h2>
            <p className="urdu text-[#C9921A] text-lg">خوش آمدید</p>
          </div>
        </div>
      </div>

      <style>{`.paara-input { width:100%; background:#FFF8EC; border:1px solid rgba(28,58,42,0.14); border-radius:999px; padding:14px 18px 14px 44px; font-family:var(--font-body); font-size:0.9375rem; color:#1C3A2A; transition:all 250ms; } .paara-input:focus { outline:none; border-color:#C9921A; background:#fff; box-shadow:0 0 0 4px rgba(201,146,26,0.16); } .paara-input::placeholder { color:#9C9285; }`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">{label}</label>
      <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]">{icon}</span>{children}</div>
    </div>
  );
}

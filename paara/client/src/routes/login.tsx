import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · PAARA" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken, setChallenge } = useAuth() as any;
  const [stage, setStage] = useState<"creds" | "2fa">("creds");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setLocalChallenge] = useState("");
  const [busy, setBusy] = useState(false);

  const submitCreds = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await authApi.login(email, password);
      if (r.data.twoFactor) {
        setLocalChallenge(r.data.challengeToken);
        setChallenge?.(r.data.challengeToken);
        setStage("2fa");
        toast.success("Check your console / inbox for the OTP code");
      } else {
        setToken(r.data.token); setUser(r.data.user);
        toast.success("Welcome back");
        const role = r.data.user?.role;
        if (role === "seller") navigate({ to: "/seller" });
        else navigate({ to: "/" });
      }
    } catch (err: any) { toast.error(err.response?.data?.message || "Login failed"); }
    finally { setBusy(false); }
  };

  const submit2FA = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await authApi.verifyAdmin2FA(challenge, code);
      setToken(r.data.token); setUser(r.data.user); setChallenge?.(null);
      toast.success("Verified");
      navigate({ to: "/admin" });
    } catch (err: any) { toast.error(err.response?.data?.message || "Invalid code"); }
    finally { setBusy(false); }
  };

  const resend = async () => {
    try { await authApi.resendOTP(challenge, "admin_2fa"); toast.success("New code sent"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Could not resend"); }
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 grid place-items-center">
        <div className="w-full max-w-md bg-white rounded-[24px] p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
          {stage === "creds" ? (
            <>
              <h1 className="display-serif text-3xl text-[#1C3A2A] mb-2">Welcome back</h1>
              <p className="text-sm text-[#6B645A] mb-6">Sign in to continue</p>
              <form onSubmit={submitCreds} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] text-sm focus:outline-none focus:border-[#C9921A]" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] text-sm focus:outline-none focus:border-[#C9921A]" />
                </div>
                <button type="submit" disabled={busy} className="btn btn-primary w-full">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
                </button>
              </form>
              <p className="text-xs text-[#6B645A] mt-6 text-center">
                No account? <Link to="/register" className="text-[#C9921A] font-semibold">Create one</Link>
              </p>
            </>
          ) : (
            <>
              <ShieldCheck size={32} className="text-[#C9921A] mb-3" />
              <h1 className="display-serif text-3xl text-[#1C3A2A] mb-2">Two-step verification</h1>
              <p className="text-sm text-[#6B645A] mb-6">Enter the 6-digit code we just sent.</p>
              <form onSubmit={submit2FA} className="space-y-4">
                <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 rounded-2xl bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] focus:outline-none focus:border-[#C9921A]"
                  placeholder="••••••" autoFocus inputMode="numeric" pattern="[0-9]{6}" />
                <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary w-full disabled:opacity-50">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                </button>
              </form>
              <div className="flex items-center justify-between mt-4 text-xs">
                <button type="button" onClick={() => setStage("creds")} className="text-[#6B645A] hover:text-[#1C3A2A]">← Back</button>
                <button type="button" onClick={resend} className="text-[#C9921A] font-semibold">Resend code</button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, User as UserIcon, ArrowRight, Store, ShoppingBag, Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import hunzaImg from "@/assets/cities/Hunza.jpg";
import { PaaraLogo } from "@/components/site/PaaraLogo";
import { PakistanFlag } from "@/components/site/PakistanFlag";
import { useAuth } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · PAARA" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "", shopName: "", city: "" });
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const { register, verifyEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register({ ...form, role });
      setPendingEmail(result.email);
      setStep("otp");
      setResendCooldown(60);
      // Dev convenience: show OTP in toast if backend returns it
      if (result.otp) {
        toast.info(`Dev OTP: ${result.otp}`, { duration: 30000 });
      } else {
        toast.success("OTP sent to your email.");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(pendingEmail, otp.trim());
      toast.success("Email verified! Welcome to PAARA.");
      const { user } = useAuth.getState();
      if (user?.role === "seller") navigate({ to: "/seller" });
      else navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { data } = await authApi.resendEmailOtp(pendingEmail);
      setResendCooldown(60);
      if (data.otp) {
        toast.info(`Dev OTP: ${data.otp}`, { duration: 30000 });
      } else {
        toast.success("New OTP sent to your email.");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not resend OTP");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1fr_1.05fr] bg-[#F5EDD8]">
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-12 lg:py-20 order-2 md:order-1">
        <Link to="/" className="md:hidden flex items-center gap-3 mb-10">
          <PaaraLogo height={48} />
          <span className="font-display text-xl tracking-[0.32em] text-[#1C3A2A]">PAARA</span>
        </Link>

        <div className="m-auto w-full max-w-md">
          {step === "form" ? (
            <>
              <p className="eyebrow mb-3">Join PAARA</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Create account</h1>
              <p className="text-[#3D2914] mb-8 leading-relaxed">
                Already with us?{" "}
                <Link to="/login" className="text-[#C9921A] font-medium underline-offset-4 hover:underline">Sign in</Link>.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-7">
                {[
                  { id: "buyer" as const, label: "I'm Discovering", desc: "Buy heritage crafts", icon: ShoppingBag },
                  { id: "seller" as const, label: "I'm Crafting", desc: "Sell as an artisan", icon: Store },
                ].map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className="text-left rounded-2xl p-4 border-2 transition-all duration-300"
                    style={{ borderColor: role === r.id ? "#C9921A" : "rgba(28,58,42,0.14)", background: role === r.id ? "#FFF8EC" : "#fff", boxShadow: role === r.id ? "0 8px 24px rgba(201,146,26,0.18)" : "none" }}>
                    <r.icon size={20} className="text-[#C9921A] mb-2" />
                    <div className="font-display font-semibold text-[#1C3A2A]">{r.label}</div>
                    <div className="text-xs text-[#6B645A] mt-1">{r.desc}</div>
                  </button>
                ))}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <Field label="Full name" icon={<UserIcon size={16} />}>
                  <input type="text" placeholder="Your name" className="paara-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="Email" icon={<Mail size={16} />}>
                  <input type="email" placeholder="you@example.com" className="paara-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </Field>
                <Field label="Password" icon={<Lock size={16} />}>
                  <input type="password" placeholder="At least 8 characters" className="paara-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                </Field>
                {role === "seller" && (
                  <>
                    <Field label="Brand / Atelier name" icon={<Store size={16} />}>
                      <input type="text" placeholder="e.g. Karim Wood Studio" className="paara-input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
                    </Field>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Region of craft</label>
                      <select title="Region of craft" className="paara-input !pl-4" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                        {["Lahore", "Multan", "Hunza", "Peshawar", "Karachi / Sindh", "Skardu / Gilgit-Baltistan", "Balochistan", "Other"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <label className="flex items-start gap-3 text-sm text-[#3D2914] cursor-pointer pt-2">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded accent-[#C9921A]" required />
                  <span className="leading-relaxed">I agree to PAARA's <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</span>
                </label>
                <button type="submit" disabled={isLoading} className="btn btn-primary w-full !py-4 mt-2 disabled:opacity-60">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#1C3A2A] grid place-items-center mb-6">
                <ShieldCheck size={26} className="text-[#C9921A]" />
              </div>
              <p className="eyebrow mb-3">Verify email</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Check your inbox</h1>
              <p className="text-[#3D2914] mb-8 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-[#1C3A2A]">{pendingEmail}</span>. Enter it below to activate your account.
              </p>

              <form className="space-y-5" onSubmit={handleVerify}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Verification code</label>
                  <input
                    ref={otpRef}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    className="paara-input !pl-5 text-center text-2xl tracking-[0.4em] font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                </div>

                <button type="submit" disabled={isLoading || otp.length !== 6} className="btn btn-primary w-full !py-4 disabled:opacity-60">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Verify & continue <ArrowRight size={16} /></>}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep("form"); setOtp(""); }} className="text-[#6B645A] hover:text-[#1C3A2A] transition-colors">
                    ← Back to form
                  </button>
                  <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 text-[#C9921A] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                    <RotateCcw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="relative hidden md:block overflow-hidden order-1 md:order-2 bg-[#01411C]">
        <img src={hunzaImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 hero-zoom" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PakistanFlag />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,65,28,0.35)] via-transparent to-[rgba(1,65,28,0.85)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-[#F5EDD8]">
          <Link to="/" className="ml-auto"><PaaraLogo height={120} /></Link>
          <div>
            <p className="eyebrow !text-[#C9921A] mb-4">A Quiet Welcome</p>
            <h2 className="display-serif text-4xl lg:text-5xl leading-tight max-w-[18ch] mb-4">Join a circle of <em className="italic text-[#C9921A]">makers</em> and admirers.</h2>
            <p className="urdu text-[#C9921A] text-lg">ہمارے ساتھ شامل ہوں</p>
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

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import lahoreImg from "@/assets/cities/Lahore.jpg";
import logo from "@/assets/paara-logo.png";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · PAARA" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Welcome back!");
      const { user } = useAuth.getState();
      if (user?.role === "admin") navigate({ to: "/admin" });
      else if (user?.role === "seller") navigate({ to: "/seller" });
      else navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1.05fr_1fr] bg-[#F5EDD8]">
      {/* Visual panel */}
      <div className="relative hidden md:block overflow-hidden bg-[#01411C]">
        <img src={lahoreImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 hero-zoom" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="paara-flag"><div className="paara-flag-inner"><div className="paara-flag-white" /><div className="paara-flag-green"><svg viewBox="0 0 200 200" className="paara-crescent" aria-hidden><circle cx="100" cy="100" r="56" fill="#fff" /><circle cx="118" cy="92" r="48" fill="#01411C" /><polygon fill="#fff" points="138,96 146,118 124,104 102,118 110,96 92,82 116,82 124,60 132,82 156,82" /></svg></div></div></div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (<span key={i} className="paara-particle" style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.4) % 6}s`, animationDuration: `${6 + (i % 5)}s` }} />))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,65,28,0.35)] via-transparent to-[rgba(1,65,28,0.85)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-[#F5EDD8]">
          <Link to="/" aria-label="PAARA home"><img src={logo} alt="PAARA" className="h-28 w-auto object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)]" /></Link>
          <div>
            <p className="eyebrow !text-[#C9921A] mb-4">Welcome Back</p>
            <h2 className="display-serif text-4xl lg:text-5xl leading-tight max-w-[16ch] mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]">The kiln has been <em className="italic text-[#C9921A]">waiting</em> for you.</h2>
            <p className="urdu text-[#C9921A] text-lg">واپس آپ کا خیر مقدم ہے</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-12 lg:py-20">
        <Link to="/" className="md:hidden flex items-center gap-3 mb-10">
          <img src={logo} alt="PAARA" className="w-10 h-10 rounded-lg" />
          <span className="font-display text-xl tracking-[0.32em] text-[#1C3A2A]">PAARA</span>
        </Link>
        <div className="m-auto w-full max-w-md">
          <p className="eyebrow mb-3">Sign In</p>
          <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Your account</h1>
          <p className="text-[#3D2914] mb-10 leading-relaxed">
            New here?{" "}
            <Link to="/register" className="text-[#C9921A] font-medium underline-offset-4 hover:underline">Create an account</Link>.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Email" icon={<Mail size={16} />}>
              <input type="email" placeholder="you@example.com" className="paara-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password" icon={<Lock size={16} />}>
              <input type={showPw ? "text" : "password"} placeholder="••••••••" className="paara-input pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B645A] hover:text-[#1C3A2A]" aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-[#3D2914] cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-[#C9921A]" /> Remember me</label>
              <Link to="/forgot-password" className="text-[#C9921A] hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full !py-4 disabled:opacity-60">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>

      <style>{`.paara-input { width:100%; background:#FFF8EC; border:1px solid rgba(28,58,42,0.14); border-radius:999px; padding:14px 18px 14px 44px; font-family:var(--font-body); font-size:0.9375rem; color:#1C3A2A; transition:all 250ms var(--ease-elegant); } .paara-input:focus { outline:none; border-color:#C9921A; background:#fff; box-shadow:0 0 0 4px rgba(201,146,26,0.16); } .paara-input::placeholder { color:#9C9285; }`}</style>
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

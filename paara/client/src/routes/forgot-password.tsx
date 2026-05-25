import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, Loader2, Check } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recover your account · PAARA" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
      toast.success("Reset instructions sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#C9921A] grid place-items-center mx-auto mb-6">
                <Check size={28} className="text-[#1C3A2A]" strokeWidth={2.5} />
              </div>
              <p className="eyebrow mb-3">Email sent</p>
              <h1 className="display-serif text-4xl text-[#1C3A2A] mb-3">Check your inbox</h1>
              <p className="text-[#3D2914] leading-relaxed mb-8">
                We've sent a password reset link to <strong>{email}</strong>. The link expires in 10 minutes.
              </p>
              <p className="text-sm text-[#6B645A]">
                Didn't receive it?{" "}
                <button onClick={() => setSent(false)} className="text-[#C9921A] font-semibold hover:underline">
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <p className="eyebrow mb-3">Password reset</p>
              <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-3 leading-tight">Recover your account</h1>
              <p className="text-[#3D2914] mb-8 leading-relaxed">
                Enter your email and we'll send a secure reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B645A]" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[rgba(28,58,42,0.14)] rounded-full pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#C9921A] focus:ring-2 focus:ring-[rgba(201,146,26,0.16)]" />
                  </div>
                </div>
                <button type="submit" disabled={loading || !email.trim()} className="btn btn-primary w-full !py-4 disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send reset link <ArrowRight size={16} /></>}
                </button>
              </form>
              <p className="text-center text-sm text-[#6B645A] mt-6">
                Remember it?{" "}
                <Link to="/login" className="text-[#C9921A] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

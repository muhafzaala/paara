import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Check, QrCode } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/setup-2fa")({
  head: () => ({ meta: [{ title: "Set up authenticator · PAARA Admin" }] }),
  component: AdminSetup2FA,
});

function AdminSetup2FA() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState("");
  const [loadingQR, setLoadingQR] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  // If TOTP already enabled, go straight to dashboard
  useEffect(() => {
    if (user?.twoFactorEnabled) {
      navigate({ to: "/admin" });
    }
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.setup2FA();
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Could not generate QR code");
      } finally {
        setLoadingQR(false);
      }
    })();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setVerifying(true);
    try {
      await authApi.verify2FA(code);
      // Update stored user to reflect twoFactorEnabled = true
      if (user) setUser({ ...user, twoFactorEnabled: true });
      setDone(true);
      toast.success("Authenticator app connected!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code — try again");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2219] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#1C3A2A] rounded-[24px] p-8 border border-[rgba(201,146,26,0.25)] shadow-2xl">

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(201,146,26,0.15)] grid place-items-center mx-auto mb-4">
              <Check size={28} className="text-[#C9921A]" />
            </div>
            <h1 className="display-serif text-2xl text-[#F5EDD8] mb-2">All set!</h1>
            <p className="text-sm text-[rgba(245,237,216,0.7)] mb-6">
              Your authenticator app is connected. Future logins will use your app instead of the terminal OTP.
            </p>
            <button type="button" onClick={() => navigate({ to: "/admin" })}
              className="btn btn-primary w-full">
              Go to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-[#C9921A]" />
              <div>
                <h1 className="display-serif text-xl text-[#F5EDD8]">Set up authenticator app</h1>
                <p className="text-xs text-[rgba(245,237,216,0.55)] mt-0.5">Required for admin access</p>
              </div>
            </div>

            <ol className="text-sm text-[rgba(245,237,216,0.8)] space-y-2 mb-6 list-decimal list-inside">
              <li>Install <strong className="text-[#C9921A]">Google Authenticator</strong> or <strong className="text-[#C9921A]">Authy</strong> on your phone</li>
              <li>Tap <strong>+</strong> → <strong>Scan a QR code</strong></li>
              <li>Scan the code below</li>
              <li>Enter the 6-digit code shown in the app</li>
            </ol>

            {loadingQR ? (
              <div className="flex justify-center py-8">
                <Loader2 size={28} className="animate-spin text-[#C9921A]" />
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-[16px]">
                    <img src={qrCode} alt="TOTP QR Code" className="w-44 h-44" />
                  </div>
                </div>
                <details className="mb-5">
                  <summary className="text-xs text-[rgba(245,237,216,0.5)] cursor-pointer hover:text-[rgba(245,237,216,0.8)] flex items-center gap-1">
                    <QrCode size={12} /> Can't scan? Enter key manually
                  </summary>
                  <p className="mt-2 text-xs font-mono bg-[rgba(0,0,0,0.3)] rounded-xl px-3 py-2 text-[#C9921A] break-all">{secret}</p>
                </details>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(245,237,216,0.7)] mb-2">
                      6-digit code from your app
                    </label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6} autoFocus inputMode="numeric" pattern="[0-9]{6}"
                      placeholder="000000"
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 rounded-2xl bg-[rgba(0,0,0,0.25)] border border-[rgba(201,146,26,0.3)] text-[#F5EDD8] focus:outline-none focus:border-[#C9921A]"
                    />
                  </div>
                  <button type="submit" disabled={verifying || code.length !== 6}
                    className="btn btn-primary w-full disabled:opacity-50">
                    {verifying ? <Loader2 size={16} className="animate-spin" /> : "Activate 2FA"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

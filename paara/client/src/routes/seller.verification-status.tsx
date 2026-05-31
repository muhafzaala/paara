import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, FileSearch, MapPin, Award, X, Loader2, ArrowLeft, RefreshCw, MessageSquare } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { sellerApi } from "@/lib/api";

export const Route = createFileRoute("/seller/verification-status")({
  head: () => ({ meta: [{ title: "Verification Status · PAARA" }] }),
  component: StatusPage,
});

const STAGES = [
  { key: "applied",                label: "Application received",     icon: Check,      desc: "We have your basic info." },
  { key: "documents_under_review", label: "Documents under review",   icon: FileSearch, desc: "Our team is checking your identity and craft photos." },
  { key: "field_visit_scheduled",  label: "Field visit scheduled",    icon: MapPin,     desc: "One of our regional verifiers will visit your workshop." },
  { key: "approved",               label: "Approved — welcome",       icon: Award,      desc: "Your shop is live and verified." },
];

const STATUS_TO_INDEX: Record<string, number> = {
  "none": -1, "applied": 0, "documents_under_review": 1,
  "field_visit_scheduled": 2, "approved": 3, "rejected": -2, "reapply_requested": -3,
};

function StatusPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-seller-profile"],
    queryFn: async () => (await sellerApi.getMyProfile()).data.profile,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EDD8] grid place-items-center">
        <Loader2 size={32} className="animate-spin text-[#C9921A]" />
      </div>
    );
  }

  const profile = data;
  const status = profile?.verificationStatus;
  const currentIndex = STATUS_TO_INDEX[status] ?? -1;
  const isRejected = status === "rejected";
  const isReapplyRequested = status === "reapply_requested";
  const isUnapplied = status === "none" || !status;
  const isInProgress = !isUnapplied && !isRejected && !isReapplyRequested;

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[900px]">
          <Link to="/seller" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B645A] hover:text-[#1C3A2A] mb-6">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>

          <header className="text-center mb-10">
            <p className="eyebrow">Verification</p>
            <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mt-2">
              Your application journey
            </h1>
          </header>

          {isUnapplied && (
            <div className="bg-white rounded-[24px] p-10 text-center border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
              <Clock size={40} className="mx-auto text-[#C9921A] mb-4" />
              <h2 className="display-serif text-2xl text-[#1C3A2A] mb-2">You haven't started yet</h2>
              <p className="text-sm text-[#6B645A] mb-6">Complete your onboarding to apply for verification.</p>
              <Link to="/seller/onboarding" className="btn btn-primary inline-flex">Start onboarding</Link>
            </div>
          )}

          {isRejected && (
            <div className="bg-white rounded-[24px] p-10 text-center border border-[rgba(139,26,26,0.16)] shadow-[var(--shadow-soft)]">
              <X size={40} className="mx-auto text-[#8B1A1A] mb-4" />
              <h2 className="display-serif text-2xl text-[#1C3A2A] mb-2">Application not approved</h2>
              {(profile.rejectionReason || profile.adminNotes) && (
                <div className="max-w-sm mx-auto mb-6 bg-[#FFF3CD] border border-[rgba(139,26,26,0.15)] rounded-2xl p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B1A1A] mb-1">Reason</p>
                  <p className="text-sm text-[#3D2914]">{profile.rejectionReason || profile.adminNotes}</p>
                </div>
              )}
              <p className="text-xs text-[#6B645A] mb-6">If you believe this was a mistake, you may contact PAARA support.</p>
              <Link to="/seller/onboarding" className="btn btn-primary inline-flex items-center gap-2">
                <RefreshCw size={14} /> Update and resubmit
              </Link>
            </div>
          )}

          {isReapplyRequested && (
            <div className="bg-white rounded-[24px] p-10 text-center border border-[rgba(201,146,26,0.3)] shadow-[var(--shadow-soft)]">
              <MessageSquare size={40} className="mx-auto text-[#C9921A] mb-4" />
              <h2 className="display-serif text-2xl text-[#1C3A2A] mb-2">Admin requested updates</h2>
              <p className="text-sm text-[#6B645A] mb-4">Our team reviewed your application and has some feedback. Please update your information and resubmit.</p>
              {profile.adminNotes && (
                <div className="max-w-md mx-auto mb-6 bg-[#FFF8EC] border border-[rgba(201,146,26,0.3)] rounded-2xl p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#C9921A] mb-2">Feedback from admin</p>
                  <p className="text-sm text-[#3D2914] leading-relaxed">{profile.adminNotes}</p>
                </div>
              )}
              <Link to="/seller/onboarding" className="btn btn-primary inline-flex items-center gap-2">
                <RefreshCw size={14} /> Update my application
              </Link>
            </div>
          )}

          {isInProgress && (
            <ol className="bg-white rounded-[24px] p-6 md:p-10 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] space-y-5">
              {STAGES.map((stage, i) => {
                const reached = currentIndex >= i;
                const isCurrent = currentIndex === i;
                const Icon = stage.icon;
                return (
                  <li key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full grid place-items-center transition-colors"
                        style={{
                          background: reached ? "#1C3A2A" : "rgba(28,58,42,0.06)",
                          color: reached ? "#F5EDD8" : "rgba(28,58,42,0.4)",
                        }}>
                        <Icon size={18} />
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className="w-px flex-1 mt-2" style={{ background: currentIndex > i ? "#1C3A2A" : "rgba(28,58,42,0.12)", minHeight: 28 }} />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <p className="font-display font-semibold text-base" style={{ color: reached ? "#1C3A2A" : "rgba(28,58,42,0.4)" }}>
                        {stage.label}
                        {isCurrent && <span className="ml-2 text-xs font-bold uppercase tracking-[0.12em] text-[#C9921A]">Now</span>}
                      </p>
                      <p className="text-sm text-[#6B645A] mt-1">{stage.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {profile?.heritageBadges?.length > 0 && (
            <div className="mt-10 bg-white rounded-[24px] p-6 border border-[rgba(28,58,42,0.08)]">
              <p className="eyebrow mb-3">Heritage Badges</p>
              <div className="flex flex-wrap gap-2">
                {profile.heritageBadges.map((b: string) => (
                  <span key={b} className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.14em]"
                    style={{ background: "rgba(201,146,26,0.12)", color: "#C9921A", border: "1px solid rgba(201,146,26,0.3)" }}>
                    {b.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

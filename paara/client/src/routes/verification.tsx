import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Clock, FileText, MapPin, User, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { verificationApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [{ title: "Seller Verification · PAARA" }] }),
  component: VerificationPage,
});

const STAGES = [
  { key: "applied",                label: "Applied",         icon: FileText,  desc: "Application received" },
  { key: "document_review",        label: "Document Review", icon: FileText,  desc: "Our team is reviewing your documents" },
  { key: "field_visit_scheduled",  label: "Field Visit",     icon: MapPin,    desc: "A PAARA representative will visit your workshop" },
  { key: "approved",               label: "Approved",        icon: ShieldCheck, desc: "You are a verified PAARA artisan" },
];

const CITIES = ["Lahore", "Multan", "Hunza", "Peshawar", "Karachi", "Skardu", "Gilgit", "Balochistan", "Islamabad", "Faisalabad", "Mardan", "Quetta", "Other"];
const CRAFTS = ["Textile & Embroidery", "Pottery & Ceramics", "Wood Carving", "Metal Work", "Leather", "Jewelry", "Block Print", "Weaving", "Stone Carving", "Other"];

function VerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ businessName: "", businessType: "artisan", craftSpecialization: [] as string[], city: "", region: "", cnicNumber: "", workshopAddress: "", yearsOfExperience: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: statusData, refetch } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => { try { return (await verificationApi.getMyStatus()).data; } catch { return null; } },
    enabled: !!user && user.role === "seller",
  });

  const verification = statusData?.verification;
  const verificationStatus = user?.verificationStatus;

  // If user is not logged in or not a seller
  if (!user) return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <main className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <div>
          <p className="eyebrow mb-3">For Artisans</p>
          <h1 className="display-serif text-4xl text-[#1C3A2A] mb-4">Become a verified PAARA seller</h1>
          <p className="text-[#6B645A] max-w-md mx-auto mb-8 leading-relaxed">Join our community of verified Pakistani artisans. Sign up as a seller to start the verification process.</p>
          <Link to="/register" className="btn btn-primary">Create seller account</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const toggleCraft = (craft: string) => {
    setForm(f => ({
      ...f,
      craftSpecialization: f.craftSpecialization.includes(craft)
        ? f.craftSpecialization.filter(c => c !== craft)
        : [...f.craftSpecialization, craft],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await verificationApi.apply({ ...form, yearsOfExperience: Number(form.yearsOfExperience) });
      toast.success("Application submitted! We'll review within 3–5 business days.");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const stageIndex = STAGES.findIndex(s => s.key === verification?.stage);
  const isApproved = verificationStatus === "approved";
  const hasPending = ["pending", "under_review", "field_visit"].includes(verificationStatus || "");

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[860px]">
          <p className="eyebrow mb-3">For Artisans</p>
          <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mb-4 leading-tight">Seller Verification</h1>
          <p className="text-[#3D2914] max-w-xl leading-relaxed mb-12">PAARA verifies every artisan in person. This process takes 3–7 business days and ensures buyers receive authentic Pakistani craft.</p>

          {/* Status tracker — shown if application exists */}
          {(hasPending || isApproved || verification?.stage === "rejected") && (
            <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] mb-8">
              <h2 className="display-serif text-2xl text-[#1C3A2A] mb-6">Your application status</h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {STAGES.map((stage, i) => {
                  const done = stageIndex > i || isApproved;
                  const active = stageIndex === i && !isApproved;
                  return (
                    <div key={stage.key} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full grid place-items-center border-2 transition-all"
                          style={{ background: done || active ? (isApproved ? "#C9921A" : "#1C3A2A") : "white", borderColor: done || active ? (isApproved ? "#C9921A" : "#1C3A2A") : "rgba(28,58,42,0.2)", color: done || active ? "white" : "#6B645A" }}>
                          {done ? <Check size={16} strokeWidth={2.5} /> : <stage.icon size={16} />}
                        </div>
                        <p className="text-[10px] font-semibold mt-1 text-center max-w-[70px] leading-tight" style={{ color: active ? "#1C3A2A" : done ? "#C9921A" : "#6B645A" }}>{stage.label}</p>
                      </div>
                      {i < STAGES.length - 1 && <div className="w-8 h-0.5 flex-shrink-0 mt-[-16px]" style={{ background: stageIndex > i ? "#C9921A" : "rgba(28,58,42,0.15)" }} />}
                    </div>
                  );
                })}
              </div>
              {verification?.stage === "rejected" && (
                <div className="mt-6 p-4 rounded-[12px] bg-[rgba(139,26,26,0.06)] border border-[rgba(139,26,26,0.12)]">
                  <p className="text-sm font-semibold text-[#8B1A1A] mb-1">Application not approved</p>
                  <p className="text-xs text-[#8B1A1A]">{verification.rejectionReason || "Does not meet current verification requirements."}</p>
                  <button onClick={() => setForm(f => ({...f}))} className="mt-3 text-xs text-[#C9921A] font-semibold hover:underline">Submit a new application →</button>
                </div>
              )}
              {isApproved && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-[12px] bg-[rgba(201,146,26,0.1)] border border-[rgba(201,146,26,0.2)]">
                  <ShieldCheck size={24} className="text-[#C9921A]" />
                  <div>
                    <p className="font-semibold text-[#1C3A2A]">Verified PAARA Artisan</p>
                    <p className="text-xs text-[#6B645A]">Your products are now live on the marketplace.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application form — shown if not yet applied or rejected */}
          {!hasPending && !isApproved && (
            <form onSubmit={handleSubmit} className="bg-white rounded-[24px] p-6 md:p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] space-y-6">
              <h2 className="display-serif text-2xl text-[#1C3A2A]">Apply for verification</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Business / Atelier name *" value={form.businessName} onChange={(v: string) => setForm({...form, businessName: v})} placeholder="e.g. Karim Wood Studio" />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">Business type</label>
                  <select value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value})} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]">
                    <option value="artisan">Individual Artisan</option>
                    <option value="workshop">Family Workshop</option>
                    <option value="cooperative">Cooperative</option>
                    <option value="studio">Studio / Brand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">City / Region *</label>
                  <select value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="CNIC number" value={form.cnicNumber} onChange={(v: string) => setForm({...form, cnicNumber: v})} placeholder="42101-XXXXXXX-X" />
                <Field label="Years of experience" value={form.yearsOfExperience} onChange={(v: string) => setForm({...form, yearsOfExperience: v})} type="number" placeholder="5" />
                <div className="sm:col-span-2">
                  <Field label="Workshop / Studio address *" value={form.workshopAddress} onChange={(v: string) => setForm({...form, workshopAddress: v})} placeholder="Street, area, city" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-3">Craft specializations *</label>
                <div className="flex flex-wrap gap-2">
                  {CRAFTS.map(craft => (
                    <button key={craft} type="button" onClick={() => toggleCraft(craft)}
                      className="text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all"
                      style={{ borderColor: form.craftSpecialization.includes(craft) ? "#C9921A" : "rgba(28,58,42,0.18)", background: form.craftSpecialization.includes(craft) ? "#FFF8EC" : "white", color: form.craftSpecialization.includes(craft) ? "#C9921A" : "#3D2914" }}>
                      {craft}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[12px] bg-[rgba(28,58,42,0.04)] text-xs text-[#6B645A] leading-relaxed">
                By submitting, you agree that a PAARA representative may visit your workshop to verify your craft. We protect all submitted information in accordance with our privacy policy.
              </div>

              <button type="submit" disabled={submitting || !form.businessName || !form.city || form.craftSpecialization.length === 0}
                className="btn btn-primary disabled:opacity-60 flex items-center gap-2">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <><ShieldCheck size={14} /> Submit application</>}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
    </div>
  );
}

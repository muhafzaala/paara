import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Check, Loader2, Upload, ShieldCheck, Building2, Camera, CreditCard, Sparkles, User } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { sellerApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/onboarding")({
  head: () => ({ meta: [{ title: "Become a PAARA Artisan · Onboarding" }] }),
  component: OnboardingPage,
});

const STEPS = [
  { id: 0, label: "Personal",  icon: User,       urdu: "ذاتی" },
  { id: 1, label: "Shop",      icon: Building2,  urdu: "دکان" },
  { id: 2, label: "Identity",  icon: ShieldCheck, urdu: "شناخت" },
  { id: 3, label: "Craft",     icon: Camera,     urdu: "ہنر" },
  { id: 4, label: "Payouts",   icon: CreditCard, urdu: "ادائیگی" },
];

const CRAFT_OPTIONS = [
  "Blue Pottery", "Pashmina", "Ajrak", "Khussa", "Truck Art",
  "Phulkari Embroidery", "Walnut Wood Carving", "Lapis Jewelry",
  "Sindhi Embroidery", "Balochi Mirror Work", "Copper & Brass",
  "Damascus Steel Cutlery", "Leather Goods", "Handloom Textiles",
  "Sohan Halwa & Mithai", "Sports Goods (Hand-Stitched)",
];

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"];

function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [personal, setPersonal] = useState({ phone: "", cnicNumber: "", address: "" });
  const [shop, setShop] = useState({
    shopName: "", shopDescription: "", shopStory: "",
    city: "", region: "Punjab", yearEstablished: "",
    craftSpecialties: [] as string[],
    languagesSpoken: ["Urdu"] as string[],
    socialLinks: { instagram: "", facebook: "", tiktok: "", website: "" },
  });
  const [docs, setDocs] = useState({
    cnicFront: "", cnicBack: "",
    workshopPhotos: [] as string[],
    craftPhotos: [] as string[],
  });
  const [bank, setBank] = useState({
    accountHolderName: "", accountNumber: "", bankName: "", iban: "",
  });
  const [mobilePay, setMobilePay] = useState({ easypaisa: "", jazzcash: "" });

  // Redirect non-sellers
  useEffect(() => {
    if (user && user.role !== "seller") {
      toast.error("This page is for sellers only.");
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["my-seller-profile"],
    queryFn: async () => (await sellerApi.getMyProfile()).data.profile,
    enabled: !!user && user.role === "seller",
  });

  useEffect(() => {
    if (!profileData) return;
    setPersonal({
      phone: profileData.phone || "",
      cnicNumber: profileData.cnicNumber || "",
      address: profileData.address || "",
    });
    setShop({
      shopName: profileData.shopName || "",
      shopDescription: profileData.shopDescription || "",
      shopStory: profileData.shopStory || "",
      city: profileData.city || "",
      region: profileData.region || "Punjab",
      yearEstablished: profileData.yearEstablished?.toString() || "",
      craftSpecialties: profileData.craftSpecialties || [],
      languagesSpoken: profileData.languagesSpoken?.length ? profileData.languagesSpoken : ["Urdu"],
      socialLinks: {
        instagram: profileData.socialLinks?.instagram || "",
        facebook: profileData.socialLinks?.facebook || "",
        tiktok: profileData.socialLinks?.tiktok || "",
        website: profileData.socialLinks?.website || "",
      },
    });
    setDocs({
      cnicFront: profileData.documents?.cnicFront || "",
      cnicBack: profileData.documents?.cnicBack || "",
      workshopPhotos: profileData.documents?.workshopPhotos || [],
      craftPhotos: profileData.documents?.craftPhotos || [],
    });
    setBank({
      accountHolderName: profileData.bank?.accountHolderName || "",
      accountNumber: profileData.bank?.accountNumber || "",
      bankName: profileData.bank?.bankName || "",
      iban: profileData.bank?.iban || "",
    });
    setMobilePay({
      easypaisa: profileData.mobilePay?.easypaisa || "",
      jazzcash: profileData.mobilePay?.jazzcash || "",
    });

    // Allow editing when status is reapply_requested; redirect otherwise if already submitted
    const status = profileData.verificationStatus;
    if (status && status !== "none" && status !== "reapply_requested") {
      navigate({ to: "/seller/verification-status" });
    }
  }, [profileData, navigate]);

  const saveMutation = useMutation({
    mutationFn: (data: object) => sellerApi.updateMyProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-seller-profile"] }),
  });

  const saveAndAdvance = async (data: object) => {
    try {
      await saveMutation.mutateAsync(data);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not save. Please try again.");
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await saveMutation.mutateAsync({ bank, mobilePay });
      const res = await sellerApi.submitApplication();
      toast.success(res.data.message || "Application submitted.");
      navigate({ to: "/seller/verification-status" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not submit. Check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EDD8] grid place-items-center">
        <Loader2 size={32} className="animate-spin text-[#C9921A]" />
      </div>
    );
  }

  const isReapply = profileData?.verificationStatus === "reapply_requested";

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1000px]">
          <header className="text-center mb-10">
            <p className="eyebrow inline-flex items-center gap-2">
              <Sparkles size={12} className="text-[#C9921A]" />
              {isReapply ? "Update your application" : "Become a PAARA Artisan"}
            </p>
            <h1 className="display-serif text-4xl md:text-5xl text-[#1C3A2A] mt-2">
              {isReapply ? "Address admin feedback" : "Tell us about your craft"}
            </h1>
            {isReapply && profileData?.adminNotes && (
              <div className="mt-4 max-w-xl mx-auto bg-[#FFF3CD] border border-[rgba(201,146,26,0.3)] rounded-2xl p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C9921A] mb-1">Admin feedback</p>
                <p className="text-sm text-[#3D2914]">{profileData.adminNotes}</p>
              </div>
            )}
            {!isReapply && (
              <p className="text-sm md:text-base text-[#6B645A] mt-3 max-w-xl mx-auto">
                Five steps. We verify every artisan personally — that's what makes PAARA different.
              </p>
            )}
          </header>

          <Stepper step={step} />

          <div className="mt-10">
            {step === 0 && (
              <PersonalStep personal={personal} setPersonal={setPersonal} userName={user?.name}
                onNext={() => saveAndAdvance({ phone: personal.phone, cnicNumber: personal.cnicNumber, address: personal.address })} />
            )}
            {step === 1 && (
              <ShopStep shop={shop} setShop={setShop}
                onBack={() => setStep(0)}
                onNext={() => saveAndAdvance({
                  shopName: shop.shopName, shopDescription: shop.shopDescription, shopStory: shop.shopStory,
                  city: shop.city, region: shop.region,
                  yearEstablished: shop.yearEstablished ? Number(shop.yearEstablished) : undefined,
                  craftSpecialties: shop.craftSpecialties, languagesSpoken: shop.languagesSpoken,
                  socialLinks: shop.socialLinks,
                })} />
            )}
            {step === 2 && (
              <IdentityStep docs={docs} setDocs={setDocs}
                onBack={() => setStep(1)}
                onNext={() => saveAndAdvance({ documents: { cnicFront: docs.cnicFront, cnicBack: docs.cnicBack } })} />
            )}
            {step === 3 && (
              <CraftStep docs={docs} setDocs={setDocs}
                onBack={() => setStep(2)}
                onNext={() => saveAndAdvance({ documents: { workshopPhotos: docs.workshopPhotos, craftPhotos: docs.craftPhotos } })} />
            )}
            {step === 4 && (
              <PayoutsStep bank={bank} setBank={setBank} mobilePay={mobilePay} setMobilePay={setMobilePay}
                onBack={() => setStep(3)}
                onSubmit={submitApplication}
                submitting={submitting}
                isReapply={isReapply} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const reached = i <= step;
        const current = i === step;
        return (
          <div key={s.id} className="flex items-center gap-1 md:gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full grid place-items-center transition-all"
                style={{
                  background: reached ? "#1C3A2A" : "transparent",
                  border: reached ? "2px solid #C9921A" : "2px solid rgba(28,58,42,0.18)",
                  color: reached ? "#F5EDD8" : "rgba(28,58,42,0.4)",
                  boxShadow: current ? "0 8px 24px rgba(201,146,26,0.32)" : "none",
                }}>
                {i < step ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className="text-[9px] uppercase tracking-[0.14em] font-bold hidden sm:block" style={{ color: reached ? "#1C3A2A" : "#6B645A" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-6 md:w-12 h-px mb-4" style={{ background: i < step ? "#1C3A2A" : "rgba(28,58,42,0.18)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", textarea = false, rows = 3, optional = false }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">
        {label} {optional && <span className="text-[#6B645A] normal-case tracking-normal">(optional)</span>}
      </label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
      )}
    </div>
  );
}

function MultiSelectChips({ options, value, onChange, label }: any) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v: string) => v !== opt) : [...value, opt]);
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const selected = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: selected ? "#1C3A2A" : "#FFF8EC",
                color: selected ? "#F5EDD8" : "#1C3A2A",
                border: `1.5px solid ${selected ? "#C9921A" : "rgba(28,58,42,0.14)"}`,
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 0: Personal Info ────────────────────────────────────────────────────
function PersonalStep({ personal, setPersonal, userName, onNext }: any) {
  const valid = personal.phone.trim() && personal.cnicNumber.trim();
  return (
    <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-6">
      <div>
        <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Your personal details</h2>
        <p className="text-sm text-[#6B645A]">Used only for verification — never shown publicly.</p>
      </div>

      {userName && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Full name</label>
          <div className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.08)] rounded-full px-4 py-3 text-sm text-[#6B645A]">
            {userName}
          </div>
          <p className="text-[10px] text-[#6B645A] mt-1 ml-2">From your account — change in account settings if needed.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone number" value={personal.phone} onChange={(v: string) => setPersonal({ ...personal, phone: v })}
          placeholder="+92 300 0000000" type="tel" />
        <Field label="CNIC number" value={personal.cnicNumber} onChange={(v: string) => setPersonal({ ...personal, cnicNumber: v })}
          placeholder="XXXXX-XXXXXXX-X" />
      </div>

      <Field label="Full address" value={personal.address} onChange={(v: string) => setPersonal({ ...personal, address: v })}
        placeholder="Street, area, city, province" textarea rows={2} optional />

      <div className="bg-[#FFF8EC] rounded-2xl p-4 border border-[rgba(201,146,26,0.2)] flex items-start gap-3">
        <ShieldCheck size={16} className="text-[#C9921A] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B645A]">
          Your CNIC number and address are stored securely and used only for artisan verification. They are never displayed to buyers.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button type="button" onClick={onNext} disabled={!valid} className="btn btn-primary disabled:opacity-50">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 1: Shop ─────────────────────────────────────────────────────────────
function ShopStep({ shop, setShop, onBack, onNext }: any) {
  const valid = shop.shopName.trim() && shop.shopDescription.trim() && shop.city.trim();
  const sl = shop.socialLinks;
  return (
    <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-6">
      <div>
        <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Your shop's identity</h2>
        <p className="text-sm text-[#6B645A]">What buyers will see on your shop page.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Shop name" value={shop.shopName}
          onChange={(v: string) => setShop({ ...shop, shopName: v })} placeholder="e.g. Multani Blue Pottery House" />
        <Field label="Year established" value={shop.yearEstablished}
          onChange={(v: string) => setShop({ ...shop, yearEstablished: v })} placeholder="e.g. 1985" type="number" optional />
      </div>

      <Field label="Short description" value={shop.shopDescription}
        onChange={(v: string) => setShop({ ...shop, shopDescription: v })}
        placeholder="One or two lines about your craft (visible on cards)" textarea rows={2} />

      <Field label="Your story" value={shop.shopStory}
        onChange={(v: string) => setShop({ ...shop, shopStory: v })}
        placeholder="Your craft's heritage, your journey, what makes your work special" textarea rows={5} optional />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City" value={shop.city}
          onChange={(v: string) => setShop({ ...shop, city: v })} placeholder="Multan" />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Region</label>
          <select aria-label="Region / Province" value={shop.region} onChange={(e) => setShop({ ...shop, region: e.target.value })}
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <MultiSelectChips options={CRAFT_OPTIONS} value={shop.craftSpecialties}
        onChange={(v: string[]) => setShop({ ...shop, craftSpecialties: v })}
        label="Craft specialties (select all that apply)" />

      {/* Social links — optional */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A]">
          Social media <span className="text-[#6B645A] normal-case tracking-normal">(optional — helps buyers discover you)</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: "instagram", placeholder: "instagram.com/yourshop" },
            { key: "facebook",  placeholder: "facebook.com/yourshop" },
            { key: "tiktok",    placeholder: "tiktok.com/@yourshop" },
            { key: "website",   placeholder: "yourshop.com" },
          ].map(({ key, placeholder }) => (
            <div key={key} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-[#C9921A]">
                {key}
              </span>
              <input value={(sl as any)[key]} onChange={(e) => setShop({ ...shop, socialLinks: { ...sl, [key]: e.target.value } })}
                placeholder={placeholder}
                className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full pl-24 pr-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext} disabled={!valid} className="btn btn-primary disabled:opacity-50">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Identity ─────────────────────────────────────────────────────────
function UploadTile({ label, value, onChange, hint }: any) {
  const [busy, setBusy] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("document", file);   // must match multer field name on server
      const res = await uploadApi.document(fd);
      onChange(res.data.url || res.data.imageUrl || res.data.documentUrl);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="block cursor-pointer">
      <div className="border-2 border-dashed border-[rgba(28,58,42,0.18)] rounded-2xl p-6 text-center hover:border-[#C9921A] transition-colors bg-[#FFF8EC]"
        style={{ minHeight: 180 }}>
        {value ? (
          <img src={value} alt={label} className="max-h-32 mx-auto rounded-lg object-contain" />
        ) : (
          <>
            <Upload size={24} className="mx-auto text-[#C9921A] mb-2" />
            <p className="text-sm font-semibold text-[#1C3A2A]">{label}</p>
            {hint && <p className="text-[11px] text-[#6B645A] mt-1">{hint}</p>}
          </>
        )}
        {busy && <Loader2 size={20} className="animate-spin mx-auto mt-3 text-[#C9921A]" />}
        <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
      </div>
    </label>
  );
}

function IdentityStep({ docs, setDocs, onBack, onNext }: any) {
  const valid = docs.cnicFront && docs.cnicBack;
  return (
    <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-6">
      <div>
        <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Identity verification</h2>
        <p className="text-sm text-[#6B645A]">Upload both sides of your CNIC. Used only for verification, never shared publicly.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <UploadTile label="CNIC — Front" value={docs.cnicFront}
          onChange={(v: string) => setDocs({ ...docs, cnicFront: v })} hint="Clear photo or scan" />
        <UploadTile label="CNIC — Back" value={docs.cnicBack}
          onChange={(v: string) => setDocs({ ...docs, cnicBack: v })} hint="Clear photo or scan" />
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext} disabled={!valid} className="btn btn-primary disabled:opacity-50">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Craft photos ─────────────────────────────────────────────────────
function PhotoList({ label, photos, onChange, hint, max = 5 }: any) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= max) { toast.error(`Maximum ${max} photos.`); return; }
    try {
      const fd = new FormData();
      fd.append("document", file);   // must match multer field name on server
      const res = await uploadApi.document(fd);
      const url = res.data.url || res.data.imageUrl || res.data.documentUrl;
      if (url) onChange([...photos, url]);
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">
        {label} <span className="text-[#6B645A] normal-case tracking-normal">({photos.length}/{max})</span>
      </label>
      {hint && <p className="text-[11px] text-[#6B645A] mb-3">{hint}</p>}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {photos.map((p: string, i: number) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#FFF8EC]">
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(photos.filter((_: string, idx: number) => idx !== i))}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-[#8B1A1A] text-xs grid place-items-center">×</button>
          </div>
        ))}
        {photos.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-[rgba(28,58,42,0.18)] grid place-items-center cursor-pointer hover:border-[#C9921A] bg-[#FFF8EC]"
            aria-label={`Upload ${label}`}>
            <Upload size={20} className="text-[#C9921A]" />
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" aria-label={`Upload ${label}`} />
          </label>
        )}
      </div>
    </div>
  );
}

function CraftStep({ docs, setDocs, onBack, onNext }: any) {
  const valid = docs.workshopPhotos.length >= 1 && docs.craftPhotos.length >= 1;
  return (
    <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-6">
      <div>
        <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Show us your craft</h2>
        <p className="text-sm text-[#6B645A]">Help our verification team understand your work. These appear on your shop page after approval.</p>
      </div>

      <PhotoList label="Workshop / Studio photos" photos={docs.workshopPhotos}
        onChange={(v: string[]) => setDocs({ ...docs, workshopPhotos: v })}
        hint="Where you work — your tools, kiln, loom, bench, etc." />

      <PhotoList label="Finished craft photos" photos={docs.craftPhotos}
        onChange={(v: string[]) => setDocs({ ...docs, craftPhotos: v })}
        hint="Showcase finished pieces. These help buyers trust your craftsmanship." />

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext} disabled={!valid} className="btn btn-primary disabled:opacity-50">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Payouts ──────────────────────────────────────────────────────────
function PayoutsStep({ bank, setBank, mobilePay, setMobilePay, onBack, onSubmit, submitting, isReapply }: any) {
  const hasBankDetails = bank.accountHolderName.trim() && bank.accountNumber.trim() && bank.bankName.trim();
  const hasMobileDetails = mobilePay.easypaisa.trim() || mobilePay.jazzcash.trim();
  const valid = hasBankDetails || hasMobileDetails;

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[var(--shadow-soft)] border border-[rgba(28,58,42,0.08)] space-y-6">
      <div>
        <h2 className="display-serif text-2xl text-[#1C3A2A] mb-1">Where to send your payouts</h2>
        <p className="text-sm text-[#6B645A]">Add at least one payout method. You can update these later.</p>
      </div>

      {/* Bank section */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A]">Bank account</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Account holder name" value={bank.accountHolderName}
            onChange={(v: string) => setBank({ ...bank, accountHolderName: v })} placeholder="As on bank record" optional />
          <Field label="Bank name" value={bank.bankName}
            onChange={(v: string) => setBank({ ...bank, bankName: v })} placeholder="HBL / MCB / UBL / Meezan…" optional />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Account number" value={bank.accountNumber}
            onChange={(v: string) => setBank({ ...bank, accountNumber: v })} placeholder="" optional />
          <Field label="IBAN" value={bank.iban}
            onChange={(v: string) => setBank({ ...bank, iban: v })} placeholder="PKxx xxxx xxxx xxxx xxxx xxxx" optional />
        </div>
      </div>

      {/* Mobile money section */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A]">
          Mobile money <span className="text-[#6B645A] normal-case tracking-normal">(Easypaisa / JazzCash)</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Easypaisa number" value={mobilePay.easypaisa}
            onChange={(v: string) => setMobilePay({ ...mobilePay, easypaisa: v })} placeholder="+92 300 0000000" type="tel" optional />
          <Field label="JazzCash number" value={mobilePay.jazzcash}
            onChange={(v: string) => setMobilePay({ ...mobilePay, jazzcash: v })} placeholder="+92 300 0000000" type="tel" optional />
        </div>
      </div>

      <div className="bg-[#FFF8EC] rounded-2xl p-4 border border-[rgba(201,146,26,0.2)] flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#C9921A] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B645A]">
          {isReapply
            ? "Resubmitting will reset your application to 'Applied'. Our team will review it again within 3-5 business days."
            : "Submitting moves your application to Documents Under Review. Our team will reach out within 3-5 business days."}
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} disabled={submitting}
          className="text-sm text-[#1C3A2A] hover:text-[#C9921A] inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onSubmit} disabled={!valid || submitting} className="btn btn-primary disabled:opacity-50">
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            : isReapply
              ? <>Resubmit application <Check size={16} /></>
              : <>Submit application <Check size={16} /></>}
        </button>
      </div>
    </div>
  );
}

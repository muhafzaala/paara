import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { storiesApi, uploadApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/stories")({
  head: () => ({ meta: [{ title: "My Stories · PAARA" }] }),
  component: MyStoriesPage,
});

const STATUS_STYLE: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  pending:  { label: "Under review", color: "#C9921A",  Icon: Clock },
  approved: { label: "Published",    color: "#2A6F3A",  Icon: CheckCircle },
  rejected: { label: "Not approved", color: "#8B1A1A",  Icon: XCircle },
};

function MyStoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", note: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-stories"],
    queryFn: async () => {
      try { return (await storiesApi.listMine()).data.stories; } catch { return []; }
    },
  });

  const submit = useMutation({
    mutationFn: () => storiesApi.submit({ title: form.title, note: form.note, imageUrl: form.imageUrl }),
    onSuccess: () => {
      toast.success("Story submitted for review!");
      setForm({ title: "", note: "", imageUrl: "" });
      setPreviewUrl("");
      qc.invalidateQueries({ queryKey: ["my-stories"] });
    },
    onError: () => toast.error("Could not submit story"),
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadApi.reviewPhoto(fd);
      const url = res.data?.url || res.data?.secure_url || res.data?.imageUrl || "";
      setForm((f) => ({ ...f, imageUrl: url }));
      setPreviewUrl(URL.createObjectURL(file));
    } catch { toast.error("Image upload failed"); }
    finally { setUploading(false); }
  };

  const canSubmit = form.note.trim().length >= 10 && form.imageUrl && !submit.isPending;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Community</p>
        <h1 className="display-serif text-3xl text-[#1C3A2A]">My stories</h1>
        <p className="text-sm text-[#6B645A] mt-1">Share your craft experience — approved stories appear on the PAARA homepage.</p>
      </header>

      {/* Submit form */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)] space-y-5 max-w-xl">
        <p className="eyebrow">Share a new story</p>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Photo *</label>
          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#FFF8EC] mb-2">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setPreviewUrl(""); setForm((f) => ({ ...f, imageUrl: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white grid place-items-center text-sm hover:bg-black/70">×</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[rgba(28,58,42,0.2)] rounded-xl p-8 cursor-pointer hover:border-[#C9921A] transition-colors">
              {uploading ? <Loader2 size={22} className="animate-spin text-[#C9921A]" /> : <Upload size={22} className="text-[#6B645A]" />}
              <span className="text-sm text-[#6B645A]">{uploading ? "Uploading…" : "Click to upload a photo"}</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Title (optional)</label>
          <input type="text" maxLength={80} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="A beautiful piece from Multan…"
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Your story * ({form.note.length}/500)</label>
          <textarea maxLength={500} rows={4} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Tell us about your experience with this craft…"
            className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
        </div>

        <button type="button" disabled={!canSubmit} onClick={() => submit.mutate()}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
          {submit.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Submit story
        </button>
      </div>

      {/* My stories list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div>
      ) : (
        <div className="space-y-4">
          <p className="eyebrow">Submitted ({data?.length || 0})</p>
          {!data?.length && <p className="text-sm text-[#6B645A]">No stories yet — share your first one above!</p>}
          {data?.map((s: any) => {
            const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.pending;
            return (
              <div key={s._id} className="bg-white rounded-2xl p-5 border border-[rgba(28,58,42,0.08)] flex gap-4 items-start">
                {s.imageUrl && (
                  <img src={s.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {s.title && <p className="font-display font-semibold text-[#1C3A2A] text-sm mb-0.5">{s.title}</p>}
                  <p className="text-sm text-[#3D2914] line-clamp-2">{s.note}</p>
                  {s.rejectionReason && (
                    <p className="text-xs text-[#8B1A1A] mt-1">Reason: {s.rejectionReason}</p>
                  )}
                  <p className="text-[10px] text-[#6B645A] mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold" style={{ color: st.color }}>
                  <st.Icon size={13} /> {st.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Trash2, Loader2, BookOpen, Eye, EyeOff, X, ImagePlus } from "lucide-react";
import { heritageApi, productsApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/heritage")({ component: SellerHeritagePage });

const REGIONS = ["Lahore", "Multan", "Hunza", "Peshawar", "Karachi / Sindh", "Skardu / Gilgit-Baltistan", "Balochistan", "Other"];
const CRAFTS = ["Pottery", "Woodwork", "Textiles", "Jewellery", "Embroidery", "Leather", "Metalwork", "Calligraphy", "Other"];

const EMPTY: any = {
  title: "", excerpt: "", body: "", coverImage: "",
  images: ["", "", ""],
  region: "Lahore", craft: "Pottery",
  product: "", isPublished: false,
};

function SellerHeritagePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ["seller-heritage"],
    queryFn: async () => {
      const res = await heritageApi.getMine();
      return res.data.stories as any[];
    },
  });

  const { data: myProducts } = useQuery({
    queryKey: ["seller-products-for-heritage"],
    queryFn: async () => {
      const res = await productsApi.getSellerProducts();
      return res.data.products as any[];
    },
  });

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const setImg = (i: number, v: string) =>
    setForm((p: any) => { const imgs = [...p.images]; imgs[i] = v; return { ...p, images: imgs }; });

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, images: ["", "", ""] }); setShowForm(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      excerpt: s.excerpt || "",
      body: s.body || "",
      coverImage: s.coverImage || "",
      images: [...(s.images || []), "", "", ""].slice(0, 3),
      region: s.region || "Lahore",
      craft: s.craft || "Pottery",
      product: s.product?._id || s.product || "",
      isPublished: s.isPublished || false,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.filter((u: string) => u.trim()),
        product: form.product || null,
      };
      if (editing) {
        await heritageApi.update(editing._id, payload);
        toast.success("Story updated");
      } else {
        await heritageApi.create(payload);
        toast.success("Story created");
      }
      qc.invalidateQueries({ queryKey: ["seller-heritage"] });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save story");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await heritageApi.remove(id);
      toast.success("Story deleted");
      qc.invalidateQueries({ queryKey: ["seller-heritage"] });
    } catch { toast.error("Could not delete story"); } finally { setDeleting(null); }
  };

  const handleTogglePublish = async (s: any) => {
    try {
      await heritageApi.update(s._id, { isPublished: !s.isPublished });
      toast.success(s.isPublished ? "Story unpublished" : "Story published");
      qc.invalidateQueries({ queryKey: ["seller-heritage"] });
    } catch { toast.error("Could not update story"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Heritage Stories</p>
          <h2 className="display-serif text-2xl text-[#1C3A2A]">Your craft narratives</h2>
        </div>
        <button type="button" onClick={openNew}
          className="btn btn-primary flex items-center gap-2 !py-2.5 !px-5">
          <Plus size={16} /> New story
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C9921A]" /></div>
      ) : !stories?.length ? (
        <div className="text-center py-20 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
          <BookOpen size={40} className="mx-auto text-[#C9921A] mb-4 opacity-40" />
          <p className="display-serif text-xl text-[#1C3A2A] mb-2">No stories yet</p>
          <p className="text-sm text-[#6B645A] mb-5">Share the story behind your craft — traditions, techniques, and the people who carry them.</p>
          <button type="button" onClick={openNew} className="btn btn-primary"><Plus size={14} /> Write your first story</button>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((s) => (
            <div key={s._id}
              className="bg-white rounded-[16px] border border-[rgba(28,58,42,0.08)] p-5 flex gap-4 items-start">
              {/* Cover thumb */}
              <div className="w-20 h-20 rounded-[10px] overflow-hidden flex-shrink-0 bg-[#F5EDD8]">
                {s.coverImage ? (
                  <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <BookOpen size={20} className="text-[#C9921A] opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-[#1C3A2A] line-clamp-1">{s.title}</h3>
                    {s.excerpt && <p className="text-xs text-[#6B645A] mt-0.5 line-clamp-2">{s.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#6B645A]">
                      {s.region && <span className="px-2 py-0.5 rounded-full bg-[#FFF8EC] text-[#C9921A] font-semibold">{s.region}</span>}
                      {s.craft && <span>{s.craft}</span>}
                      {s.views > 0 && <span className="flex items-center gap-1"><Eye size={10} /> {s.views} reads</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.isPublished ? "bg-green-50 text-green-700" : "bg-[#FFF8EC] text-[#C9921A]"}`}>
                      {s.isPublished ? "Published" : "Draft"}
                    </span>
                    <button type="button" onClick={() => handleTogglePublish(s)}
                      className="w-8 h-8 rounded-full bg-[#F5EDD8] grid place-items-center hover:bg-[#FFF8EC] transition-colors"
                      title={s.isPublished ? "Unpublish" : "Publish"}>
                      {s.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button type="button" onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-full bg-[#F5EDD8] grid place-items-center hover:bg-[#FFF8EC] transition-colors">
                      <Edit3 size={13} />
                    </button>
                    <button type="button" onClick={() => handleDelete(s._id)} disabled={deleting === s._id}
                      className="w-8 h-8 rounded-full bg-[#F5EDD8] grid place-items-center hover:bg-red-50 hover:text-red-500 transition-colors">
                      {deleting === s._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-[#F5EDD8] rounded-[24px] w-full max-w-2xl p-6 md:p-8 my-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="display-serif text-2xl text-[#1C3A2A]">{editing ? "Edit story" : "New heritage story"}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white grid place-items-center hover:bg-[#FFF8EC]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => f("title", e.target.value)}
                  placeholder="e.g. The last blue-glaze potter of Multan"
                  className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]"
                  required />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Short excerpt</label>
                <input value={form.excerpt} onChange={(e) => f("excerpt", e.target.value)}
                  placeholder="One or two sentences shown on the listing page"
                  className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">
                  <ImagePlus size={12} className="inline mr-1" />Cover image URL
                </label>
                <input value={form.coverImage} onChange={(e) => f("coverImage", e.target.value)}
                  placeholder="https://…/cover.jpg"
                  className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]" />
                {form.coverImage && (
                  <img src={form.coverImage} alt="Cover preview"
                    className="mt-2 w-full h-40 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>

              {/* Extra images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Gallery image URLs (up to 3)</label>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <input key={i} value={form.images[i] || ""} onChange={(e) => setImg(i, e.target.value)}
                      placeholder={`https://…/photo-${i + 1}.jpg`}
                      className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
                  ))}
                </div>
                {form.images.some((u: string) => u.trim()) && (
                  <div className="flex gap-2 mt-2">
                    {form.images.filter((u: string) => u.trim()).map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.style.display = "none")} />
                    ))}
                  </div>
                )}
              </div>

              {/* Region + Craft */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Region</label>
                  <select value={form.region} onChange={(e) => f("region", e.target.value)}
                    title="Region"
                    className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Craft</label>
                  <select value={form.craft} onChange={(e) => f("craft", e.target.value)}
                    title="Craft"
                    className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
                    {CRAFTS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Link to product */}
              {myProducts && myProducts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Link to one of your products (optional)</label>
                  <select value={form.product} onChange={(e) => f("product", e.target.value)}
                    title="Linked product"
                    className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A]">
                    <option value="">— No linked product —</option>
                    {myProducts.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1.5">Story body</label>
                <textarea value={form.body} onChange={(e) => f("body", e.target.value)}
                  rows={10}
                  placeholder={"Write your full story here.\n\nUse blank lines to separate paragraphs. Share the history of your craft, what it means to you, the techniques passed down through generations…"}
                  className="w-full bg-white border border-[rgba(28,58,42,0.18)] rounded-xl px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:border-[#C9921A]" />
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.isPublished ? "bg-[#1C3A2A]" : "bg-[rgba(28,58,42,0.2)]"} relative`}
                  onClick={() => f("isPublished", !form.isPublished)}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium text-[#1C3A2A]">
                  {form.isPublished ? "Publish immediately" : "Save as draft"}
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-full border border-[rgba(28,58,42,0.18)] text-sm font-semibold text-[#1C3A2A] hover:bg-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn btn-primary !py-3 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editing ? "Save changes" : "Create story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

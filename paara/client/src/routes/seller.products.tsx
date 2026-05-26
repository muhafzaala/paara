import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Trash2, Loader2, Package } from "lucide-react";
import { formatPKR, CATEGORIES } from "@/lib/products";
import { productsApi } from "@/lib/api";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

export const Route = createFileRoute("/seller/products")({ component: SellerProductsPage });

const CITIES = ["Lahore", "Multan", "Hunza", "Peshawar", "Karachi", "Skardu", "Gilgit", "Balochistan", "Islamabad", "Faisalabad", "Mardan"];
const EMPTY_FORM = { name: "", description: "", price: "", originalPrice: "", category: "Pottery", city: "Lahore", artisan: "", material: "", stock: "10", originStory: "", care: "", details: "" };

function SellerProductsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => { try { return (await productsApi.getSellerProducts()).data.products; } catch { return []; } },
  });

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined };
      if (editing) await productsApi.update(editing._id, payload as any);
      else await productsApi.create(payload as any);
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(editing ? "Product updated" : "Product created (pending review)");
      setShowForm(false); setEditing(null); setForm({ ...EMPTY_FORM });
    } catch (err: any) { toast.error(err.response?.data?.message || "Could not save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await productsApi.delete(id); qc.invalidateQueries({ queryKey: ["seller-products"] }); toast.success("Product deleted"); }
    catch { toast.error("Could not delete"); }
  };

  const STATUS_STYLE: Record<string, string> = { approved: "bg-green-50 text-green-700", pending: "bg-amber-50 text-amber-700", rejected: "bg-red-50 text-red-700", suspended: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><p className="eyebrow">Catalogue</p><h1 className="display-serif text-3xl text-[#1C3A2A]">Your products</h1></div>
        <button onClick={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={14} /> Add product
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
          <h3 className="display-serif text-2xl text-[#1C3A2A] mb-6">{editing ? "Edit product" : "New product"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Product name *" value={form.name} onChange={(v) => f("name", v)} />
            <F label="Artisan name" value={form.artisan} onChange={(v) => f("artisan", v)} placeholder="Display name shown to buyers" />
            <F label="Price (PKR) *" value={form.price} onChange={(v) => f("price", v)} type="number" />
            <F label="Original price (PKR)" value={form.originalPrice} onChange={(v) => f("originalPrice", v)} type="number" placeholder="Optional — for discount display" />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">Category *</label>
              <select value={form.category} onChange={(e) => f("category", e.target.value)} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">City / Region *</label>
              <select value={form.city} onChange={(e) => f("city", e.target.value)} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <F label="Material" value={form.material} onChange={(v) => f("material", v)} placeholder="e.g. Glazed earthenware, Solid walnut" />
            <F label="Stock quantity" value={form.stock} onChange={(v) => f("stock", v)} type="number" />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => f("description", e.target.value)} rows={3} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">Origin story</label>
              <textarea value={form.originStory} onChange={(e) => f("originStory", e.target.value)} rows={3} placeholder="The heritage story behind this piece…" className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#C9921A] resize-none" />
            </div>
            <F label="Care instructions" value={form.care} onChange={(v) => f("care", v)} placeholder="How to care for this item" />
            <F label="Dimensions / Details" value={form.details} onChange={(v) => f("details", v)} placeholder="Size, weight, etc." />
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">{saving ? <Loader2 size={14} className="animate-spin" /> : "Save product"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-outline-forest">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        (data || []).length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
            <Package size={40} className="text-[rgba(28,58,42,0.2)] mx-auto mb-4" />
            <p className="display-serif text-xl text-[#1C3A2A] mb-2">No products yet</p>
            <p className="text-sm text-[#6B645A]">Add your first product to start selling on PAARA.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(data || []).map((p: any) => (
              <div key={p._id} className="bg-white rounded-[20px] overflow-hidden border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                <div className="h-40 bg-[#FFF8EC] overflow-hidden">
                  <ProductImage src={p.images?.[0]} alt={p.name} size="sm" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="display-serif text-base text-[#1C3A2A] leading-tight">{p.name}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[p.status] || ""}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-[#6B645A] mb-2">{p.city} · {p.category}</p>
                  <p className="font-display text-lg text-[#C9921A] font-semibold mb-3">{formatPKR(p.price)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(p); setForm({ name: p.name, description: p.description || "", price: String(p.price), originalPrice: String(p.originalPrice || ""), category: p.category, city: p.city, artisan: p.artisan || "", material: p.material || "", stock: String(p.stock), originStory: p.originStory || "", care: p.care || "", details: p.details || "" }); setShowForm(true); }}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-full border border-[rgba(28,58,42,0.14)] hover:border-[#C9921A] transition-colors">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="w-9 h-9 rounded-full border border-[rgba(139,26,26,0.2)] grid place-items-center text-[#8B1A1A] hover:bg-[rgba(139,26,26,0.06)]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

function F({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
    </div>
  );
}

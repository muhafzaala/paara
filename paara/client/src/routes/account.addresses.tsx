import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Loader2, MapPin } from "lucide-react";
import { userApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/addresses")({ component: AddressesPage });

function AddressesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ label: "Home", street: "", city: "", postalCode: "", phone: "", isDefault: false });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => { try { return (await userApi.getAddresses()).data.addresses; } catch { return []; } },
  });

  const reset = () => { setForm({ label: "Home", street: "", city: "", postalCode: "", phone: "", isDefault: false }); setEditing(null); setShowForm(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await userApi.updateAddress(editing._id, form); toast.success("Address updated"); }
      else { await userApi.addAddress(form); toast.success("Address added"); }
      qc.invalidateQueries({ queryKey: ["addresses"] }); reset();
    } catch { toast.error("Could not save address"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await userApi.deleteAddress(id); qc.invalidateQueries({ queryKey: ["addresses"] }); toast.success("Address removed"); }
    catch { toast.error("Could not remove address"); }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><p className="eyebrow">Delivery</p><h1 className="display-serif text-3xl text-[#1C3A2A]">Addresses</h1></div>
        <button onClick={() => { reset(); setShowForm(true); }} className="btn btn-primary flex items-center gap-2"><Plus size={14} /> Add address</button>
      </header>

      {isLoading ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#C9921A]" /></div> :
        (data || []).length === 0 && !showForm ? (
          <div className="text-center py-12 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
            <MapPin size={36} className="text-[rgba(28,58,42,0.2)] mx-auto mb-3" />
            <p className="display-serif text-xl text-[#1C3A2A] mb-1">No addresses yet</p>
            <p className="text-sm text-[#6B645A]">Add a delivery address for faster checkout.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {(data || []).map((addr: any) => (
              <div key={addr._id} className="bg-white rounded-[20px] p-5 border border-[rgba(28,58,42,0.08)] relative">
                {addr.isDefault && <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(201,146,26,0.12)] text-[#C9921A]">Default</span>}
                <p className="font-semibold text-[#1C3A2A] mb-1">{addr.label}</p>
                <p className="text-sm text-[#3D2914]">{addr.street}</p>
                <p className="text-sm text-[#3D2914]">{addr.city}{addr.postalCode ? ` · ${addr.postalCode}` : ""}</p>
                {addr.phone && <p className="text-sm text-[#6B645A] mt-1">{addr.phone}</p>}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setEditing(addr); setForm({ label: addr.label, street: addr.street, city: addr.city, postalCode: addr.postalCode || "", phone: addr.phone || "", isDefault: addr.isDefault }); setShowForm(true); }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1C3A2A] hover:text-[#C9921A]"><Edit3 size={12} /> Edit</button>
                  <button onClick={() => handleDelete(addr._id)} className="flex items-center gap-1 text-xs font-semibold text-[#8B1A1A] hover:opacity-80"><Trash2 size={12} /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 border border-[rgba(28,58,42,0.08)] space-y-4 max-w-md">
          <h3 className="display-serif text-xl text-[#1C3A2A]">{editing ? "Edit address" : "New address"}</h3>
          {[["Label", "label", "Home, Work…"], ["Street", "street", "House no., street, area"], ["City", "city", "Lahore"], ["Postal code", "postalCode", "54000"], ["Phone", "phone", "+92 3xx xxxxxxx"]].map(([label, key, placeholder]) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#1C3A2A] mb-1">{label}</label>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                className="w-full bg-[#FFF8EC] border border-[rgba(28,58,42,0.14)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9921A]" />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-[#C9921A]" />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">{saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}</button>
            <button type="button" onClick={reset} className="btn btn-outline-forest">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

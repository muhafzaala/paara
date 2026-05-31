import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, ArrowRight, X } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useCompare } from "@/lib/compare-store";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";
import { FadeIn } from "@/components/ui/Motion";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare Products · PAARA" }] }),
  component: ComparePage,
});

const FIELDS: { key: string; label: string }[] = [
  { key: "name",     label: "Product" },
  { key: "price",    label: "Price" },
  { key: "city",     label: "City" },
  { key: "region",   label: "Region" },
  { key: "category", label: "Category" },
  { key: "rating",   label: "Rating" },
  { key: "artisan",  label: "Artisan" },
];

function ComparePage() {
  const navigate = useNavigate();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="eyebrow mb-2">Side-by-Side</p>
                <h1 className="display-serif text-4xl text-[#1C3A2A] flex items-center gap-3">
                  <SlidersHorizontal size={28} className="text-[#C9921A]" />
                  Compare Products
                </h1>
              </div>
              {compareItems.length > 0 && (
                <button onClick={clearCompare} className="text-xs text-[#8B1A1A] font-semibold hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </header>
          </FadeIn>

          {compareItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)]">
              <SlidersHorizontal size={40} className="text-[rgba(28,58,42,0.2)] mx-auto mb-4" />
              <p className="display-serif text-xl text-[#1C3A2A] mb-2">No products to compare</p>
              <p className="text-sm text-[#6B645A] mb-6">Add products from the catalogue using the compare button</p>
              <Link to="/products" search={{} as any} className="btn btn-primary">Browse catalogue</Link>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] border border-[rgba(28,58,42,0.08)] shadow-md overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-[#6B645A] w-28">Field</th>
                    {compareItems.map((p) => (
                      <th key={p._id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-[#FFF8EC]">
                            <ProductImage src={p.images?.[0]} alt={p.name} size="md" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(p._id)}
                            className="text-[10px] text-[#8B1A1A] font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <X size={10} /> Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map(({ key, label }) => (
                    <tr key={key} className="border-t border-[rgba(28,58,42,0.06)]">
                      <td className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6B645A] bg-[#FFF8EC]">{label}</td>
                      {compareItems.map((p) => (
                        <td key={p._id} className="p-4 text-center text-sm text-[#1C3A2A]">
                          {key === "price"
                            ? <span className="font-semibold text-[#C9921A]">{formatPKR((p as any)[key] || 0)}</span>
                            : key === "rating"
                            ? <span>{(p as any)[key] ? `${(p as any)[key]} ★` : "—"}</span>
                            : <span>{(p as any)[key] || "—"}</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Actions row */}
                  <tr className="border-t border-[rgba(28,58,42,0.06)]">
                    <td className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6B645A] bg-[#FFF8EC]">Actions</td>
                    {compareItems.map((p) => (
                      <td key={p._id} className="p-4 text-center">
                        <Link to="/products/$id" params={{ id: p._id }} search={{} as any} className="btn btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-1">
                          View <ArrowRight size={12} />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {compareItems.length > 0 && compareItems.length < 3 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B645A] mb-3">You can compare up to 3 products</p>
              <Link to="/products" search={{} as any} className="btn btn-secondary inline-flex items-center gap-2">
                Add more <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

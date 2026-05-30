import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Loader2 } from "lucide-react";
import { productsApi } from "@/lib/api";
import { formatPKR } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  city?: string;
}

interface SearchTypeaheadProps {
  onDark?: boolean;
}

export function SearchTypeahead({ onDark = false }: SearchTypeaheadProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await productsApi.search({ q: q.trim(), limit: 6 });
      const products = res.data?.products || [];
      setResults(products.slice(0, 6));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    navigate({ to: "/products/$id", params: { id }, search: {} as any });
  };

  const handleViewAll = () => {
    if (!query.trim()) return;
    setOpen(false);
    const q = query.trim();
    setQuery("");
    navigate({ to: "/products", search: { q } as any });
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: onDark ? "rgba(245,237,216,0.6)" : "rgba(28,58,42,0.5)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search crafts…"
          className="pl-8 pr-3 py-2 rounded-full text-xs focus:outline-none focus:border-[#C9921A] transition-all w-48 focus:w-64"
          style={{
            background: onDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
            border: `1.5px solid ${onDark ? "rgba(245,237,216,0.2)" : "rgba(28,58,42,0.15)"}`,
            color: onDark ? "#F5EDD8" : "#1C3A2A",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleViewAll()}
        />
        {loading && <Loader2 size={12} className="absolute right-3 animate-spin text-[#C9921A]" />}
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[rgba(28,58,42,0.1)] z-[100] overflow-hidden">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-sm text-[#6B645A]">
              No results for "{query}"
            </div>
          ) : (
            <>
              {results.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => handleSelect(r._id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF8EC] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FFF8EC] flex-shrink-0">
                    <ProductImage src={r.images?.[0]} alt={r.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C3A2A] truncate">{r.name}</p>
                    <p className="text-xs text-[#6B645A]">{r.city}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#C9921A] flex-shrink-0">{formatPKR(r.price)}</span>
                </button>
              ))}
              {query.trim() && (
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="w-full px-4 py-3 text-xs font-semibold text-[#C9921A] hover:bg-[#FFF8EC] transition-colors text-left border-t border-[rgba(28,58,42,0.08)]"
                >
                  View all results for "{query.trim()}" →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchTypeahead;

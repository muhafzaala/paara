import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useCompare } from "@/lib/compare-store";
import ProductImage from "@/components/ProductImage";

export function CompareBar() {
  const navigate = useNavigate();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  return (
    <AnimatePresence>
      {compareItems.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[80] px-4 pb-4 pointer-events-none"
        >
          <div
            className="mx-auto max-w-3xl pointer-events-auto rounded-2xl shadow-2xl border border-[rgba(28,58,42,0.15)] flex items-center gap-4 px-5 py-4"
            style={{ background: "#1C3A2A" }}
          >
            <SlidersHorizontal size={18} className="text-[#C9921A] flex-shrink-0" />
            <div className="flex gap-3 flex-1 overflow-x-auto">
              {compareItems.map((p) => (
                <div key={p._id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FFF8EC]">
                    <ProductImage src={p.images?.[0]} alt={p.name} size="sm" />
                  </div>
                  <span className="text-xs font-medium text-[#F5EDD8] max-w-[80px] truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCompare(p._id)}
                    className="text-[rgba(245,237,216,0.5)] hover:text-[#F5EDD8] transition-colors"
                    aria-label="Remove from compare"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate({ to: "/compare" })}
                disabled={compareItems.length < 2}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-40"
                style={{ background: "#C9921A", color: "#1C3A2A" }}
              >
                Compare ({compareItems.length})
              </button>
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-2 rounded-full text-xs font-medium text-[rgba(245,237,216,0.7)] hover:text-[#F5EDD8] transition-colors border border-[rgba(245,237,216,0.2)]"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CompareBar;

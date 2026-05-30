import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatPKR } from "@/lib/products";
import { useState } from "react";

interface Props {
  product: { _id: string; name: string; price: number; images?: string[]; isDemo?: boolean };
  onAdd: () => void;
  visible: boolean;
}

export default function StickyBuyBar({ product, onAdd, visible }: Props) {
  const [flash, setFlash] = useState(false);
  if (!product?._id) return null;
  const thumb = product.images?.[0];

  const handleAdd = () => {
    onAdd();
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-buy-bar"
          className="sbb-root"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          {/* gold top accent line */}
          <div className="sbb-accent" />

          <div className="sbb-inner">
            {/* Thumbnail */}
            <div className="sbb-thumb">
              <ProductImage src={thumb} alt={product.name} size="sm" />
            </div>

            {/* Name + price */}
            <div className="sbb-info">
              <p className="sbb-name">{product.name}</p>
              <p className="sbb-price">{formatPKR(product.price)}</p>
            </div>

            {/* CTA */}
            <button type="button" onClick={handleAdd} className={`sbb-btn ${flash ? "sbb-btn--flash" : ""}`}>
              {flash
                ? <><Check size={15} className="shrink-0" /> Added!</>
                : <><ShoppingBag size={15} className="shrink-0" /> Add to cart</>
              }
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage";

interface ProductImageZoomProps {
  images: string[];
  alt: string;
}

export function ProductImageZoom({ images, alt }: ProductImageZoomProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = images && images.length > 0 ? images : [];

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % safeImages.length);
  }, [safeImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square rounded-[24px] overflow-hidden bg-[#FFF8EC]">
        <ProductImage src={undefined} alt={alt} size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div
        className="aspect-square rounded-[24px] overflow-hidden mb-4 bg-[#FFF8EC] relative cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
      >
        <div className="w-full h-full overflow-hidden">
          <img
            src={safeImages[activeIndex]}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="eager"
          />
        </div>
        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Click to zoom
        </div>
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {safeImages.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="aspect-square rounded-[12px] overflow-hidden border-2 transition-all"
              style={{ borderColor: activeIndex === i ? "#C9921A" : "transparent" }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={safeImages[activeIndex]}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {safeImages.length > 1 && (
              <div className="absolute bottom-4 flex gap-1.5">
                {safeImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === activeIndex ? 24 : 8, background: i === activeIndex ? "#C9921A" : "rgba(255,255,255,0.5)" }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductImageZoom;

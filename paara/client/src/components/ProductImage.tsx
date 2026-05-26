import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  /**
   * Visual size hint for the placeholder icon. Defaults to "md".
   * - sm: small cart row thumbnails, order row thumbnails
   * - md: product cards, wishlist tiles
   * - lg: product detail hero image
   */
  size?: "sm" | "md" | "lg";
}

const ICON_SIZE: Record<NonNullable<ProductImageProps["size"]>, number> = {
  sm: 16,
  md: 28,
  lg: 56,
};

export function ProductImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  size = "md",
}: ProductImageProps) {
  // Treat empty string, undefined, and null as "no image"
  const hasImage = typeof src === "string" && src.trim().length > 0;

  if (hasImage) {
    return (
      <img
        src={src as string}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  // Branded placeholder: cream background with heritage-green icon,
  // tagged with the Urdu wordmark feel via gentle gradient and centered glyph.
  return (
    <div
      className={`w-full h-full grid place-items-center ${className}`}
      style={{
        background:
          "linear-gradient(135deg, #FFF8EC 0%, #F5EDD8 100%)",
        color: "rgba(28, 58, 42, 0.32)",
      }}
      aria-label={alt || "No image available"}
      role="img"
    >
      <Package size={ICON_SIZE[size]} strokeWidth={1.5} />
    </div>
  );
}

export default ProductImage;

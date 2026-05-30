import { getCouplet } from "@/data/productCouplets";

interface Props {
  product: { _id: string; category?: string };
  className?: string;
}

export default function ProductCardCouplet({ product, className }: Props) {
  const couplet = getCouplet(product.category || "", product._id);

  return (
    <div
      className={`absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 ${className ?? ""}`}
      style={{
        background: "linear-gradient(to top, rgba(15,34,25,0.88) 0%, rgba(15,34,25,0.35) 55%, transparent 100%)",
      }}
    >
      <p
        className="urdu text-right leading-loose w-full"
        style={{ color: "#C9921A", fontSize: "12px", whiteSpace: "pre-line", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
      >
        {couplet}
      </p>
    </div>
  );
}

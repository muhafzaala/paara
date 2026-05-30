import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

interface WishlistHeartProps {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
}

export function WishlistHeart({ productId, initialWishlisted = false, className = "" }: WishlistHeartProps) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [animating, setAnimating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save to wishlist"); return; }
    setAnimating(true);
    try {
      if (wishlisted) {
        await wishlistApi.remove(productId);
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistApi.add(productId);
        setWishlisted(true);
        toast.success("Saved to wishlist");
      }
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      animate={animating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center shadow-md hover:scale-110 transition-transform ${className}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart
        size={15}
        strokeWidth={2}
        fill={wishlisted ? "#C9921A" : "none"}
        stroke={wishlisted ? "#C9921A" : "#1C3A2A"}
      />
    </motion.button>
  );
}

export default WishlistHeart;

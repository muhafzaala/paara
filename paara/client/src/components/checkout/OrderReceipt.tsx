import { motion } from "framer-motion";
import { formatPKR } from "@/lib/products";
import QRTrackingCode from "@/components/QRTrackingCode";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Props {
  orderId: string;
  items: ReceiptItem[];
  shipping: { name: string; city: string; province?: string; phone?: string; street?: string; postalCode?: string };
  payment: { method: string };
  pricing: { subtotal: number; shipping: number; total: number };
  placedAt?: Date;
  onContinueShopping?: () => void;
  onTrackOrder?: () => void;
}

function Barcode({ orderId }: { orderId: string }) {
  const bars = Array.from({ length: 42 }, (_, i) => ({
    w: [1, 2, 3, 1, 2, 1, 3, 2, 1, 2][i % 10],
    h: 28 + ((i * 7 + 3) % 14),
  }));
  return (
    <div className="flex flex-col items-center gap-1 mt-2">
      <div className="flex items-end gap-[2px]">
        {bars.map((b, i) => (
          <div key={i} style={{ width: b.w, height: b.h, background: "#1C3A2A", opacity: 0.75 }} />
        ))}
      </div>
      <p className="font-mono text-[9px] tracking-[0.3em] text-[#6B645A]">{orderId}</p>
    </div>
  );
}

function DashedSep() {
  return <div className="border-t border-dashed border-[rgba(28,58,42,0.2)] my-3" />;
}

export default function OrderReceipt({
  orderId, items, shipping, payment, pricing, placedAt,
  onContinueShopping, onTrackOrder,
}: Props) {
  const date = placedAt ?? new Date();
  const dateStr = date.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Receipt paper */}
      <motion.div
        className="w-full max-w-[480px] mx-auto"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
      >
        {/* Perforated top edge */}
        <div className="h-4 w-full"
          style={{
            background: "radial-gradient(circle at 8px 8px, #F5EDD8 8px, white 8px)",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
          }}
        />

        {/* Receipt body */}
        <div className="bg-white px-7 py-5"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(28,58,42,0.025) 24px)",
            fontFamily: "ui-monospace, 'Courier New', monospace",
          }}
        >
          {/* Header */}
          <div className="text-center mb-3">
            <p className="display-serif text-3xl text-[#1C3A2A] tracking-tight">PAARA</p>
            <p className="urdu text-[#6B645A] text-sm">پارہ</p>
            <p className="text-[9px] uppercase tracking-[0.22em] text-[#6B645A] mt-1">
              حرفِ ہنر — Heritage Crafts Marketplace
            </p>
          </div>

          <DashedSep />

          {/* Order info */}
          <div className="text-center mb-2">
            <p className="text-xs font-bold tracking-[0.18em] text-[#1C3A2A]">ORDER #{orderId}</p>
            <p className="text-[10px] text-[#6B645A] mt-0.5">{dateStr}</p>
          </div>

          <DashedSep />

          {/* Items */}
          <div className="space-y-1.5 mb-1">
            {items.map((item, i) => (
              <motion.div key={i} className="flex gap-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.03, duration: 0.25 }}>
                <span className="text-[11px] text-[#1C3A2A] shrink-0">{item.quantity}×</span>
                <span className="text-[11px] text-[#1C3A2A] flex-1 leading-snug">{item.name}</span>
                <span className="flex-1 border-b border-dotted border-[rgba(28,58,42,0.25)] self-end mb-[3px] mx-1 min-w-[16px]" />
                <span className="text-[11px] text-[#1C3A2A] shrink-0 font-semibold">{formatPKR(item.price * item.quantity)}</span>
              </motion.div>
            ))}
          </div>

          <DashedSep />

          {/* Totals */}
          <div className="space-y-1 mb-1">
            <div className="flex justify-between text-[11px] text-[#6B645A]">
              <span>Subtotal</span><span>{formatPKR(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[#6B645A]">
              <span>Shipping</span>
              <span>{pricing.shipping === 0 ? "FREE" : formatPKR(pricing.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1C3A2A] pt-1">
              <span className="tracking-[0.12em] uppercase">Total</span>
              <span className="text-[#C9921A]">{formatPKR(pricing.total)}</span>
            </div>
          </div>

          <DashedSep />

          {/* Payment */}
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B645A] text-center mb-2">
            Paid via {payment.method.toUpperCase()}
          </p>

          <DashedSep />

          {/* Shipping address */}
          <div className="mb-1">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#6B645A] mb-1">Ship to:</p>
            <div className="text-[11px] text-[#1C3A2A] leading-snug space-y-0.5">
              <p className="font-semibold">{shipping.name}</p>
              {shipping.street && <p>{shipping.street}</p>}
              <p>{shipping.city}{shipping.province ? `, ${shipping.province}` : ""}{shipping.postalCode ? ` ${shipping.postalCode}` : ""}</p>
              {shipping.phone && <p className="text-[#6B645A]">{shipping.phone}</p>}
            </div>
          </div>

          <DashedSep />

          {/* QR tracking code */}
          <QRTrackingCode orderId={orderId} />

          {/* Decorative barcode */}
          <Barcode orderId={orderId} />

          {/* Footer note */}
          <p className="text-[9px] text-center text-[#6B645A] tracking-wider mt-3 uppercase">
            Thank you · شکریہ · Handcrafted in Pakistan
          </p>
        </div>

        {/* Perforated bottom edge */}
        <div className="h-4 w-full"
          style={{
            background: "radial-gradient(circle at 8px 0px, #F5EDD8 8px, white 8px)",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </motion.div>

      {/* CTAs — outside the receipt paper */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onTrackOrder && (
          <button type="button" onClick={onTrackOrder} className="btn btn-primary">
            Track order
          </button>
        )}
        {onContinueShopping && (
          <button type="button" onClick={onContinueShopping} className="btn btn-secondary">
            Continue shopping
          </button>
        )}
      </div>
    </div>
  );
}

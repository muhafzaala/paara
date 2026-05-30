import { useState } from "react";

interface Props { orderId: string; }

export default function QRTrackingCode({ orderId }: Props) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const url = `${window.location.origin}/account/orders/${orderId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}&bgcolor=FFF8EC&color=1C3A2A`;

  return (
    <div className="flex flex-col items-center gap-1.5 my-3">
      <img
        src={qrSrc}
        alt="Scan to track order on mobile"
        width={100}
        height={100}
        className="rounded-lg"
        onError={() => setHidden(true)}
      />
      <p className="text-[9px] text-[#6B645A] tracking-wide text-center">
        Scan with your phone to track on the go
      </p>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Download, RotateCcw, ZoomIn, ZoomOut, Upload, Info } from "lucide-react";

interface Props { productImgUrl: string; productName: string; onClose: () => void; }

interface Overlay { x: number; y: number; scale: number; rotation: number; }

const INIT: Overlay = { x: 60, y: 60, scale: 1, rotation: 0 };

export default function PlaceInHome({ productImgUrl, productName, onClose }: Props) {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(INIT);
  const [blend, setBlend] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saveError, setSaveError] = useState("");
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const roomImgRef = useRef<HTMLImageElement>(null);
  const productImgRef = useRef<HTMLImageElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setRoomUrl(URL.createObjectURL(f));
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: overlay.x, oy: overlay.y };
    setDragging(true);
  }, [overlay]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      setOverlay((o) => ({
        ...o,
        x: dragStart.current!.ox + (e.clientX - dragStart.current!.mx),
        y: dragStart.current!.oy + (e.clientY - dragStart.current!.my),
      }));
    };
    const onUp = () => { dragStart.current = null; setDragging(false); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const handleSave = async () => {
    setSaveError("");
    const room = roomImgRef.current;
    const prod = productImgRef.current;
    if (!room) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = room.naturalWidth || room.offsetWidth;
      canvas.height = room.naturalHeight || room.offsetHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(room, 0, 0, canvas.width, canvas.height);
      if (prod) {
        const scaleX = canvas.width / (room.offsetWidth || 1);
        const scaleY = canvas.height / (room.offsetHeight || 1);
        const pw = prod.offsetWidth * overlay.scale * scaleX;
        const ph = prod.offsetHeight * overlay.scale * scaleY;
        const cx2 = overlay.x * scaleX + pw / 2;
        const cy2 = overlay.y * scaleY + ph / 2;
        ctx.save();
        ctx.translate(cx2, cy2);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        try { ctx.drawImage(prod, -pw / 2, -ph / 2, pw, ph); } catch { /* CORS */ }
        ctx.restore();
      }
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "paara-room-preview.png"; a.click();
        URL.revokeObjectURL(url);
      });
    } catch {
      setSaveError("Could not export — try a screenshot instead.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
        style={{ width: "min(92vw, 900px)", maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(28,58,42,0.08)]">
          <div>
            <p className="font-display font-semibold text-[#1C3A2A]">Imagine in your home</p>
            <p className="text-xs text-[#6B645A]">{productName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#FFF8EC]">
            <X size={18} className="text-[#1C3A2A]" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Canvas area */}
          <div className="flex-1 bg-[#F5EDD8] relative overflow-hidden min-h-[260px]">
            {!roomUrl ? (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#FFF8EC] transition-colors">
                <Upload size={32} className="text-[#C9921A]" />
                <p className="font-display font-semibold text-[#1C3A2A]">Upload a room photo</p>
                <p className="text-xs text-[#6B645A]">JPG, PNG, WEBP</p>
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            ) : (
              <div className="relative w-full h-full">
                <img ref={roomImgRef} src={roomUrl} alt="Your room" className="w-full h-full object-contain select-none" draggable={false} />
                <img
                  ref={productImgRef}
                  src={productImgUrl}
                  alt={productName}
                  crossOrigin="anonymous"
                  draggable={false}
                  onMouseDown={onMouseDown}
                  className="absolute select-none"
                  style={{
                    left: overlay.x, top: overlay.y,
                    width: 160 * overlay.scale,
                    transform: `rotate(${overlay.rotation}deg)`,
                    cursor: dragging ? "grabbing" : "grab",
                    mixBlendMode: blend ? "multiply" : "normal",
                    transformOrigin: "center center",
                    userSelect: "none",
                  }}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="lg:w-64 p-5 border-t lg:border-t-0 lg:border-l border-[rgba(28,58,42,0.08)] flex flex-col gap-5 overflow-y-auto">
            {roomUrl && (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Scale</p>
                  <div className="flex items-center gap-2">
                    <ZoomOut size={14} className="text-[#6B645A] shrink-0" />
                    <input type="range" min={0.3} max={3} step={0.05} value={overlay.scale}
                      onChange={(e) => setOverlay((o) => ({ ...o, scale: Number(e.target.value) }))}
                      className="flex-1 accent-[#C9921A]" />
                    <ZoomIn size={14} className="text-[#6B645A] shrink-0" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C3A2A] mb-2">Rotation</p>
                  <input type="range" min={-180} max={180} step={1} value={overlay.rotation}
                    onChange={(e) => setOverlay((o) => ({ ...o, rotation: Number(e.target.value) }))}
                    className="w-full accent-[#C9921A]" />
                  <p className="text-[10px] text-[#6B645A] mt-1">{overlay.rotation}°</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={blend} onChange={(e) => setBlend(e.target.checked)} className="accent-[#C9921A]" />
                  <span className="text-sm text-[#1C3A2A]">Blend mode</span>
                  <span title="Applies mix-blend-mode: multiply — a visual trick that blends the product with light surfaces. Not true background removal." className="cursor-help">
                    <Info size={13} className="text-[#6B645A]" />
                  </span>
                </label>

                <div className="space-y-2 mt-auto">
                  <button type="button" onClick={() => setOverlay(INIT)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[rgba(28,58,42,0.18)] text-sm font-semibold text-[#1C3A2A] hover:bg-[#FFF8EC]">
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button type="button" onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1C3A2A] text-[#F5EDD8] text-sm font-semibold hover:bg-[#0F2219]">
                    <Download size={14} /> Save image
                  </button>
                  {saveError && <p className="text-[10px] text-[#8B1A1A] text-center">{saveError}</p>}
                </div>
              </>
            )}

            {!roomUrl && (
              <div className="text-center py-8 text-sm text-[#6B645A]">
                <p>Upload a photo of your room to place the craft in it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

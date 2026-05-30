import { useEffect, useRef } from "react";

// Canvas size (3:2 ratio matches Pakistan flag proportions)
const W = 540;
const H = 360;
// Grid resolution — more columns = smoother curves
const GX = 46;
const GY = 30;

export function PakistanFlag() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    let t = 0;
    let animId = 0;

    // ── Core wave function ────────────────────────────────────────────────
    // Maps UV coords [0,1]×[0,1] → screen pixel coords with cloth deformation.
    // Uses a TRAVELING wave (phase = u*k − ω*t) so waves continuously move
    // from pole → free edge, never reversing — exactly like the reference.
    const wpt = (u: number, v: number): [number, number] => {
      const uc = Math.max(0, Math.min(1, u));
      const vc = Math.max(0, Math.min(1, v));

      // Amplitude envelope: zero at pole, maximum at free edge (quadratic)
      const amp = Math.pow(uc, 1.45) * 52;

      // Traveling wave: k=12 → ~1.9 crests visible; ω drives speed
      const ph = uc * 12.0 - t * 3.3;

      // Primary wave + one harmonic that varies across rows (organic cloth feel)
      const xOff =
        Math.sin(ph) * 0.82 * amp +
        Math.sin(ph * 1.6 + vc * Math.PI * 1.4) * 0.18 * amp;

      // Subtle vertical flutter (small, just breaks mechanical look)
      const yOff = Math.sin(ph + 0.75) * amp * 0.07 * uc;

      return [uc * W + xOff, vc * H + yOff];
    };

    // ── Symbol helpers ────────────────────────────────────────────────────
    // Both use wpt() so crescent & star deform with the same wave.

    const circlePath = (cu: number, cv: number, ru: number, rv: number, segs = 60) => {
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const [x, y] = wpt(cu + Math.cos(a) * ru, cv + Math.sin(a) * rv);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const starPath = (
      cu: number, cv: number,
      orU: number, orV: number,
      irU: number, irV: number,
      rot: number,
    ) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a  = rot + (i * Math.PI) / 5;
        const ru = i % 2 === 0 ? orU : irU;
        const rv = i % 2 === 0 ? orV : irV;
        const [x, y] = wpt(cu + Math.cos(a) * ru, cv + Math.sin(a) * rv);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // ── Draw ──────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (let gy = 0; gy < GY - 1; gy++) {
        for (let gx = 0; gx < GX - 1; gx++) {
          const u0 = gx / (GX - 1);
          const u1 = (gx + 1) / (GX - 1);
          const v0 = gy / (GY - 1);
          const v1 = (gy + 1) / (GY - 1);

          const [x00, y00] = wpt(u0, v0);
          const [x10, y10] = wpt(u1, v0);
          const [x01, y01] = wpt(u0, v1);
          const [x11, y11] = wpt(u1, v1);

          const isWhite = (u0 + u1) * 0.5 < 0.25;

          // Signed cross product of quad edges → surface normal z-component.
          // Positive = quad faces viewer (bright); negative = faces away (dark shadow).
          // Range 0.50–1.00 gives deep visible folds matching the reference.
          const ax = x10 - x00, ay = y10 - y00;
          const bx = x01 - x00, by = y01 - y00;
          const cross = ax * by - ay * bx;
          const area  = Math.hypot(ax, ay) * Math.hypot(bx, by) + 0.001;
          const lum   = Math.max(0.50, Math.min(1.0, 0.76 + (cross / area) * 0.24));

          const color = isWhite
            ? `rgb(${Math.round(255*lum)},${Math.round(255*lum)},${Math.round(255*lum)})`
            : `rgb(${Math.round(2*lum)},${Math.round(65*lum)},${Math.round(28*lum)})`;

          // Two triangles per quad; stroke seals sub-pixel gaps
          const tri = (
            ax: number, ay: number,
            bx: number, by: number,
            cx: number, cy: number,
          ) => {
            ctx.beginPath();
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fillStyle   = color; ctx.fill();
            ctx.strokeStyle = color; ctx.lineWidth = 0.8; ctx.stroke();
          };
          tri(x00, y00, x10, y10, x01, y01);
          tri(x10, y10, x11, y11, x01, y01);
        }
      }

      // ── Crescent ─────────────────────────────────────────────────────────
      // All UV radii derived from official flag spec (outer ≈ 18% flag height).
      // ru = pixel_radius / W,  rv = pixel_radius / H  → renders as a true circle.
      ctx.fillStyle = "#ffffff";
      circlePath(0.625, 0.500, 0.118, 0.176);   // outer white circle
      ctx.fill();

      ctx.fillStyle = "#01411C";
      circlePath(0.653, 0.474, 0.100, 0.149);   // inner green circle (carves crescent)
      ctx.fill();

      // ── Star ──────────────────────────────────────────────────────────────
      ctx.fillStyle = "#ffffff";
      starPath(0.677, 0.474, 0.068, 0.101, 0.026, 0.039, -Math.PI * 0.52);
      ctx.fill();
    };

    // ── Animation loop ────────────────────────────────────────────────────
    const loop = () => {
      t += 0.016;   // ~60fps time step; one full wave cycle ≈ 1.9 s
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-hidden
      className="pakistan-flag-canvas"
    />
  );
}

import { useEffect, useRef } from "react";

/**
 * Renders a white, rounded-corner canvas preview of a note.
 * - Draws title + first lines from content_md (markdown is treated as plain text).
 * - HiDPI-aware (sharp on Retina).
 * - Memoizes by (note.id + note.updated_at) implicitly via React; parent re-renders update it.
 *
 * Props:
 *  - note: { id, title, content_md, updated_at }
 *  - className: size wrapper (use aspect-[4/3] w-full)
 */
export default function CardThumbnail({ note, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Logical size (CSS pixels) – parent controls aspect. We'll fill it.
    const cssW = canvas.clientWidth || 320;
    const cssH = canvas.clientHeight || 240;

    // Scale for device pixel ratio to keep it sharp
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);

    // subtle grid pattern instead of dots (more Apple-like)
    const gridSize = 24;
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cssW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
      ctx.stroke();
    }
    for (let y = 0; y <= cssH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
      ctx.stroke();
    }

    // text helpers
    const pad = 16;
    let x = pad;
    let y = pad + 18;
    const wrap = (text, maxWidth, lineHeight, font, color, maxLines) => {
      ctx.font = font;
      ctx.fillStyle = color;
      const words = text.split(/\s+/);
      let line = "";
      let lines = 0;
      for (let i = 0; i < words.length; i++) {
        const test = line ? line + " " + words[i] : words[i];
        const w = ctx.measureText(test).width;
        if (w > maxWidth && line) {
          ctx.fillText(line, x, y);
          y += lineHeight;
          lines++;
          line = words[i];
          if (lines >= maxLines) return;
        } else {
          line = test;
        }
      }
      if (lines < maxLines && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
      }
    };

    // title
    const title = (note?.title || "Untitled").trim();
    wrap(title, cssW - pad * 2, 22, "700 17px -apple-system, BlinkMacSystemFont, system-ui, sans-serif", "#1d1d1f", 2);

    // body (first lines of content)
    const body = (note?.content_md || "")
      .replace(/^#+\s+/gm, "")      // strip markdown headers
      .replace(/`{1,3}/g, "")       // strip ticks
      .replace(/\*\*?|__|\*|_/g, "") // strip basic emphasis
      .trim();

    wrap(body || " ", cssW - pad * 2, 19, "400 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "#424245", 7);
  }, [note?.id, note?.title, note?.content_md, note?.updated_at]);

  // wrapper controls size & rounding; canvas fills it
  return (
    <div className={`overflow-hidden rounded-2xl bg-white ${className}`}>
      <canvas ref={ref} className="h-full w-full block" />
    </div>
  );
}

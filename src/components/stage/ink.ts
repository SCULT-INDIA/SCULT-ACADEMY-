import { getStroke } from "perfect-freehand";
import type { Stroke } from "@/lib/stage/types";

/* Pure ink helpers: rendering strokes to a 2D canvas and hit-testing.
   All coordinates are slide units (1600 × 900). */

export const INK_COLORS = [
  { name: "Ink", value: "#17130f" },
  { name: "Orange", value: "#ff6f0f" },
  { name: "Sun", value: "#f6c244" },
  { name: "Green", value: "#1f9d6f" },
  { name: "Blue", value: "#2563eb" },
  { name: "Red", value: "#e11d48" },
  { name: "White", value: "#ffffff" },
] as const;

export const INK_SIZES = [
  { name: "Fine", value: 4 },
  { name: "Medium", value: 7 },
  { name: "Bold", value: 12 },
] as const;

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const avg = (a: number, b: number) => (a + b) / 2;

function svgPathFromOutline(points: number[][]) {
  const len = points.length;
  if (len < 4) return "";
  let a = points[0];
  let b = points[1];
  const c = points[2];
  let d = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${avg(b[0], c[0]).toFixed(2)},${avg(b[1], c[1]).toFixed(2)} T`;
  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    d += `${avg(a[0], b[0]).toFixed(2)},${avg(a[1], b[1]).toFixed(2)} `;
  }
  return d + "Z";
}

function toTriples(flat: number[]) {
  const out: [number, number, number][] = [];
  for (let i = 0; i + 2 < flat.length; i += 3) out.push([flat[i], flat[i + 1], flat[i + 2]]);
  return out;
}

function drawArrowHead(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, size: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = Math.max(18, size * 4.2);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
}

/** Draws one stroke. `complete` false = still being drawn (keeps the tip responsive). */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, complete = true) {
  const pts = stroke.points;
  if (pts.length < 3) return;
  ctx.save();
  ctx.fillStyle = stroke.color;
  ctx.strokeStyle = stroke.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stroke.tool === "pen" || stroke.tool === "highlighter") {
    const highlighter = stroke.tool === "highlighter";
    const outline = getStroke(toTriples(pts), {
      size: highlighter ? stroke.size * 3.2 : stroke.size,
      thinning: highlighter ? 0 : stroke.pressure ? 0.62 : 0.5,
      smoothing: 0.62,
      streamline: highlighter ? 0.6 : 0.42,
      simulatePressure: !highlighter && !stroke.pressure,
      start: { cap: true, taper: 0 },
      end: { cap: true, taper: 0 },
      last: complete,
    });
    if (highlighter) ctx.globalAlpha = 0.34;
    const d = svgPathFromOutline(outline);
    if (d) ctx.fill(new Path2D(d));
  } else {
    const [x1, y1] = [pts[0], pts[1]];
    const [x2, y2] = [pts[pts.length - 3], pts[pts.length - 2]];
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    if (stroke.tool === "line" || stroke.tool === "arrow") {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (stroke.tool === "arrow") drawArrowHead(ctx, x1, y1, x2, y2, stroke.size);
    } else if (stroke.tool === "rect") {
      ctx.roundRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1), 10);
      ctx.stroke();
    } else if (stroke.tool === "ellipse") {
      ctx.ellipse(avg(x1, x2), avg(y1, y2), Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Prepares a canvas for slide-unit drawing at device resolution. Returns false if not sized. */
export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(w / 1600, 0, 0, h / 900, 0, 0);
  ctx.clearRect(0, 0, 1600, 900);
  return ctx;
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0;
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Whether an eraser circle at (x, y) touches the stroke. */
export function hitsStroke(stroke: Stroke, x: number, y: number, radius: number) {
  const p = stroke.points;
  const reach = radius + (stroke.tool === "highlighter" ? stroke.size * 1.6 : stroke.size / 2);
  if (stroke.tool === "rect" || stroke.tool === "ellipse") {
    const [x1, y1, , x2, y2] = [p[0], p[1], 0, p[p.length - 3], p[p.length - 2]];
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (stroke.tool === "rect") {
      return (
        distToSegment(x, y, minX, minY, maxX, minY) < reach ||
        distToSegment(x, y, maxX, minY, maxX, maxY) < reach ||
        distToSegment(x, y, maxX, maxY, minX, maxY) < reach ||
        distToSegment(x, y, minX, maxY, minX, minY) < reach
      );
    }
    const rx = Math.max(1, (maxX - minX) / 2);
    const ry = Math.max(1, (maxY - minY) / 2);
    const nx = (x - (minX + rx)) / rx;
    const ny = (y - (minY + ry)) / ry;
    return Math.abs(Math.hypot(nx, ny) - 1) * Math.min(rx, ry) < reach;
  }
  if (p.length <= 3) return Math.hypot(x - p[0], y - p[1]) < reach;
  for (let i = 0; i + 5 < p.length; i += 3) {
    if (distToSegment(x, y, p[i], p[i + 1], p[i + 3], p[i + 4]) < reach) return true;
  }
  return false;
}

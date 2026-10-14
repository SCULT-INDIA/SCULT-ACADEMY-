"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, PenLine, RotateCcw, X } from "lucide-react";
import type { Stroke } from "@/lib/stage/types";
import { drawStroke, newId } from "@/components/stage/ink";
import { saveSignature } from "./actions";

/* Sign with any pen tablet (pressure-sensitive) or a mouse. Saved as a
   tightly cropped transparent PNG straight onto the certificates. */

const PAD_W = 900;
const PAD_H = 300;
const INK = "#17130f";

function render(canvas: HTMLCanvasElement, strokes: Stroke[], live: Stroke | null) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(canvas.width / PAD_W, 0, 0, canvas.height / PAD_H, 0, 0);
  ctx.clearRect(0, 0, PAD_W, PAD_H);
  for (const s of strokes) drawStroke(ctx, s, true);
  if (live) drawStroke(ctx, live, false);
}

/** Crops the strokes to their bounds and exports a transparent PNG at 3×. */
function exportPng(strokes: Stroke[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (let i = 0; i < s.points.length; i += 3) {
      minX = Math.min(minX, s.points[i]);
      maxX = Math.max(maxX, s.points[i]);
      minY = Math.min(minY, s.points[i + 1]);
      maxY = Math.max(maxY, s.points[i + 1]);
    }
  }
  const pad = 14;
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(PAD_W, maxX + pad) - x;
  const h = Math.min(PAD_H, maxY + pad) - y;
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, -x * scale, -y * scale);
  for (const s of strokes) drawStroke(ctx, s, true);
  return canvas.toDataURL("image/png");
}

export function SignaturePad({ workshop, index, name, current }: { workshop: string; index: number; name: string; current: string | null }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const live = useRef<Stroke | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canvas.current) render(canvas.current, strokes, null);
  }, [strokes]);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - r.left) / r.width) * PAD_W,
      ((e.clientY - r.top) / r.height) * PAD_H,
      e.pointerType === "pen" ? Math.max(0.05, e.pressure || 0.5) : 0.5,
    ] as const;
  };

  const open = () => {
    setStrokes([]);
    setError(null);
    dialog.current?.showModal();
    requestAnimationFrame(() => canvas.current && render(canvas.current, [], null));
  };

  const save = async () => {
    if (!strokes.length) return;
    setSaving(true);
    setError(null);
    const result = await saveSignature(workshop, index, exportPng(strokes));
    setSaving(false);
    if (!result.ok) setError(result.error);
    else {
      dialog.current?.close();
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-night-line bg-night-2 p-4">
        <p className="font-display text-lg font-semibold tracking-tight">{name}</p>
        <div className="mt-3 grid h-24 place-items-center rounded-xl bg-white">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element -- signature preview (data URL)
            <img src={current} alt={`${name}'s signature`} className="max-h-20 max-w-[90%] object-contain" />
          ) : (
            <span className="text-sm text-ink-mute">No signature yet</span>
          )}
        </div>
        <button type="button" onClick={open} className="btn btn-ghost-dark mt-3 h-10 text-sm">
          <PenLine className="size-4" /> {current ? "Re-sign" : "Sign with pen"}
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby={`sig-${index}`}
        className="m-auto w-[min(56rem,94vw)] rounded-[2rem] border border-night-line bg-night-2 p-0 text-cream backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-night-line px-6 py-4">
          <h2 id={`sig-${index}`} className="font-display text-xl font-semibold tracking-tight">
            Signature — {name}
          </h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="grid size-10 place-items-center rounded-xl hover:bg-night-3">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-cream-mute">Sign inside the box with your XP-Pen, stylus or mouse. Pressure is captured for a natural line.</p>
          <canvas
            ref={canvas}
            className="mt-4 aspect-[3/1] w-full touch-none rounded-2xl bg-white"
            style={{ cursor: "crosshair", backgroundImage: "linear-gradient(transparent calc(75% - 1px), #e3dacb calc(75% - 1px), #e3dacb 75%, transparent 75%)" }}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" && e.button !== 0) return;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
              const [x, y, p] = point(e);
              live.current = { id: newId(), tool: "pen", color: INK, size: 7, pressure: e.pointerType === "pen", points: [x, y, p] };
            }}
            onPointerMove={(e) => {
              if (!live.current) return;
              const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
              for (const ev of events.length ? events : [e.nativeEvent]) {
                const r = e.currentTarget.getBoundingClientRect();
                live.current.points.push(
                  ((ev.clientX - r.left) / r.width) * PAD_W,
                  ((ev.clientY - r.top) / r.height) * PAD_H,
                  ev.pointerType === "pen" ? Math.max(0.05, ev.pressure || 0.5) : 0.5,
                );
              }
              render(e.currentTarget, strokes, live.current);
            }}
            onPointerUp={() => {
              const done = live.current;
              live.current = null;
              if (done) setStrokes((s) => [...s, done]);
            }}
            onPointerCancel={() => (live.current = null)}
          />
          {error && <p className="mt-3 text-sm text-ember-300">{error}</p>}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setStrokes([])} className="btn btn-ghost-dark h-11 px-5 text-sm">
              <RotateCcw className="size-4" /> Clear
            </button>
            <button type="button" onClick={save} disabled={!strokes.length || saving} className="btn btn-matte h-11 px-5 text-sm disabled:opacity-50">
              <Check className="size-4" /> {saving ? "Saving…" : "Save signature"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

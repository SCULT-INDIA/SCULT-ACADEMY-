"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { ActiveTool, InkTool, Stroke } from "@/lib/stage/types";
import { drawStroke, fitCanvas, hitsStroke, newId } from "./ink";
import type { StageApi, StageMessage } from "./use-stage";

/* ──────────────────────────────────────────────────────────────
   The drawing surface. Built on Pointer Events, so any pen tablet
   the OS exposes as a pen (XP-Pen, Wacom, Huion, Apple Pencil,
   Surface Pen) works with pressure — no drivers or plugins.

   - Pressure + full-rate samples (getCoalescedEvents)
   - Pen eraser end / barrel button → eraser while held
   - Palm rejection: touches are ignored while a pen is near
   - Live strokes stream to the other window as you draw
   ────────────────────────────────────────────────────────────── */

const ERASER_RADIUS = 16;
const LASER_FADE_MS = 650;

type Props = {
  stage: StageApi;
  inkKey: string;
  width: number;
  height: number;
  /** Whether this surface accepts input (false for previews). */
  interactive: boolean;
};

export function InkLayer({ stage, inkKey, width, height, interactive }: Props) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const laserRef = useRef<HTMLCanvasElement>(null);

  const strokes = stage.ink[inkKey];
  const drawing = useRef<{ pointerId: number; stroke: Stroke | null; mode: "ink" | "erase" | "laser" } | null>(null);
  const remoteLive = useRef<Stroke | null>(null);
  const laserTrail = useRef<{ x: number; y: number; t: number }[]>([]);
  const laserFrame = useRef(0);
  const lastPenAt = useRef(0);
  const liveFrame = useRef(0);
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  });

  /* Committed strokes. */
  useEffect(() => {
    const canvas = baseRef.current;
    if (!canvas || !width) return;
    const ctx = fitCanvas(canvas, width, height);
    if (!ctx) return;
    for (const s of strokes ?? []) drawStroke(ctx, s, true);
  }, [strokes, width, height]);

  const paintLive = () => {
    const canvas = liveRef.current;
    if (!canvas) return;
    const ctx = fitCanvas(canvas, width, height);
    if (!ctx) return;
    if (remoteLive.current) drawStroke(ctx, remoteLive.current, false);
    if (drawing.current?.stroke) drawStroke(ctx, drawing.current.stroke, false);
  };
  const paintLiveRef = useRef(paintLive);
  useEffect(() => {
    paintLiveRef.current = paintLive;
  });

  const paintLaser = () => {
    const canvas = laserRef.current;
    if (!canvas) return;
    const ctx = fitCanvas(canvas, width, height);
    if (!ctx) return;
    const now = performance.now();
    const trail = (laserTrail.current = laserTrail.current.filter((p) => now - p.t < LASER_FADE_MS));
    if (trail.length) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const life = 1 - (now - b.t) / LASER_FADE_MS;
        ctx.strokeStyle = `rgba(255, 64, 32, ${0.85 * life})`;
        ctx.lineWidth = 3 + 9 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const head = trail[trail.length - 1];
      ctx.shadowColor = "rgba(255, 60, 30, 0.9)";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "#ff3b1f";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff4ee";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      laserFrame.current = requestAnimationFrame(() => paintLaserRef.current());
    } else {
      laserFrame.current = 0;
    }
  };
  const paintLaserRef = useRef(paintLaser);
  useEffect(() => {
    paintLaserRef.current = paintLaser;
  });
  const pushLaser = (x: number, y: number) => {
    laserTrail.current.push({ x, y, t: performance.now() });
    if (!laserFrame.current) laserFrame.current = requestAnimationFrame(() => paintLaserRef.current());
  };

  /* Remote live strokes and laser from the other window. */
  useEffect(() => {
    return stage.subscribe((msg: StageMessage) => {
      if (msg.t === "ink:live" && msg.key === inkKey) {
        remoteLive.current = msg.stroke;
        paintLiveRef.current();
      } else if (msg.t === "ink:add" && msg.key === inkKey) {
        remoteLive.current = null;
        paintLiveRef.current();
      } else if (msg.t === "laser") {
        laserTrail.current.push({ x: msg.x, y: msg.y, t: performance.now() });
        if (!laserFrame.current) laserFrame.current = requestAnimationFrame(() => paintLaserRef.current());
      }
    });
  }, [stage, inkKey]);

  useEffect(() => () => cancelAnimationFrame(laserFrame.current), []);

  /* Re-fit transient layers on resize. */
  useEffect(() => {
    paintLiveRef.current();
  }, [width, height]);

  const toSlide = (e: PointerEvent | ReactPointerEvent, rect: DOMRect) => {
    const x = ((e.clientX - rect.left) / rect.width) * 1600;
    const y = ((e.clientY - rect.top) / rect.height) * 900;
    const pressure = e.pointerType === "pen" ? Math.max(0.05, e.pressure || 0.5) : 0.5;
    return [x, y, pressure] as const;
  };

  const streamLive = () => {
    if (liveFrame.current) return;
    liveFrame.current = requestAnimationFrame(() => {
      liveFrame.current = 0;
      paintLiveRef.current();
      const d = drawing.current;
      if (d?.stroke) stageRef.current.post({ t: "ink:live", key: inkKey, stroke: d.stroke });
    });
  };

  const eraseAt = (x: number, y: number) => {
    const s = stageRef.current;
    const hits = (s.ink[inkKey] ?? []).filter((st) => hitsStroke(st, x, y, ERASER_RADIUS)).map((st) => st.id);
    if (hits.length) s.eraseStrokes(inkKey, hits);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = stageRef.current;
    if (!interactive || s.tool === "pointer") return;
    if (e.pointerType === "pen") lastPenAt.current = performance.now();
    if (e.pointerType === "touch" && performance.now() - lastPenAt.current < 1200) return; // palm rejection
    if (drawing.current) return; // one pointer at a time
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const penEraser = e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) !== 0 || (e.buttons & 2) !== 0);
    const tool: ActiveTool = penEraser ? "eraser" : s.tool;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* some virtual/remote pointers can't be captured; drawing still works */
    }
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const [x, y, p] = toSlide(e, rect);
    if (tool === "eraser") {
      drawing.current = { pointerId: e.pointerId, stroke: null, mode: "erase" };
      eraseAt(x, y);
    } else if (tool === "laser") {
      drawing.current = { pointerId: e.pointerId, stroke: null, mode: "laser" };
      pushLaser(x, y);
      s.post({ t: "laser", x, y });
    } else {
      const shape = tool === "line" || tool === "arrow" || tool === "rect" || tool === "ellipse";
      drawing.current = {
        pointerId: e.pointerId,
        mode: "ink",
        stroke: {
          id: newId(),
          tool: tool as InkTool,
          color: s.color,
          size: s.size,
          pressure: e.pointerType === "pen",
          points: shape ? [x, y, p, x, y, p] : [x, y, p],
        },
      };
      streamLive();
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.pointerType === "pen") lastPenAt.current = performance.now();
    const s = stageRef.current;
    const [cx, cy] = toSlide(e, rect);

    const d = drawing.current;
    if (!d || d.pointerId !== e.pointerId) {
      // Laser follows a hovering pen too, so you can point without pressing.
      if (s.tool === "laser" && e.pointerType === "pen" && interactive) {
        pushLaser(cx, cy);
        s.post({ t: "laser", x: cx, y: cy });
      }
      return;
    }
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const [x, y, p] = toSlide(ev, rect);
      if (d.mode === "erase") eraseAt(x, y);
      else if (d.mode === "laser") {
        pushLaser(x, y);
        s.post({ t: "laser", x, y });
      } else if (d.stroke) {
        const pts = d.stroke.points;
        if (d.stroke.tool === "pen" || d.stroke.tool === "highlighter") {
          const lx = pts[pts.length - 3];
          const ly = pts[pts.length - 2];
          if (Math.hypot(x - lx, y - ly) >= 0.6) pts.push(x, y, p);
        } else {
          pts.splice(3, 3, x, y, p);
        }
      }
    }
    if (d.mode === "ink") streamLive();
  };

  const finish = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drawing.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drawing.current = null;
    const s = stageRef.current;
    if (d.mode === "erase") s.endErase();
    else if (d.mode === "laser") s.post({ t: "laser:up" });
    else if (d.stroke) {
      s.addStroke(inkKey, d.stroke);
      s.post({ t: "ink:live", key: inkKey, stroke: null });
    }
    paintLiveRef.current();
  };

  const cursor =
    !interactive || stage.tool === "pointer"
      ? "default"
      : stage.tool === "eraser"
        ? "cell"
        : stage.tool === "laser"
          ? "none"
          : "crosshair";

  return (
    <div
      className="absolute inset-0"
      style={{
        touchAction: interactive && stage.tool !== "pointer" ? "none" : "auto",
        // In pointer mode the slide stays clickable (links, scrolling code).
        pointerEvents: interactive && stage.tool !== "pointer" ? "auto" : "none",
        cursor,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onContextMenu={(e) => interactive && stage.tool !== "pointer" && e.preventDefault()}
    >
      <canvas ref={baseRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <canvas ref={liveRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <canvas ref={laserRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}

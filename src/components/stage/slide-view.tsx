"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { DeckTheme, SlideData } from "@/lib/stage/types";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { InkLayer } from "./ink-layer";
import { renderPdfPage } from "./pdf";
import type { StageApi, StageMessage } from "./use-stage";

/* ──────────────────────────────────────────────────────────────
   One 16:9 slide box, fitted to its container, with every layer:
   slide → whiteboard → ink → spotlight → blank screen.
   ────────────────────────────────────────────────────────────── */

export type SlideSource =
  | { kind: "markdown"; slides: SlideData[]; theme: DeckTheme; event: string }
  | { kind: "pdf"; doc: PDFDocumentProxy | null; pageCount: number };

export const slideKey = (source: SlideSource, index: number) =>
  source.kind === "markdown" ? (source.slides[index]?.id ?? `s${index + 1}`) : `p${index + 1}`;

export const slideCount = (source: SlideSource) => (source.kind === "markdown" ? source.slides.length : source.pageCount);

/** Tracks an element's content box size. */
export function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.width - width) < 0.5 && Math.abs(s.height - height) < 0.5 ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Largest 16:9 box that fits. */
const fit = (w: number, h: number) => {
  const width = Math.min(w, (h * 16) / 9);
  return { width, height: (width * 9) / 16 };
};

function MarkdownSlide({ slide, theme, event, index, total, scale }: { slide: SlideData; theme: DeckTheme; event: string; index: number; total: number; scale: number }) {
  const showWatermark = slide.layout === "title";
  return (
    <div
      className="slide origin-top-left"
      data-theme={theme}
      data-layout={slide.layout}
      data-bg={slide.bg}
      style={{ transform: `scale(${scale})` }}
    >
      {showWatermark && <LogoMark className="slide-brand-mark" />}
      <div className="slide-body">
        {slide.kicker && <div className="slide-kicker">{slide.kicker}</div>}
        {slide.html && <div dangerouslySetInnerHTML={{ __html: slide.html }} />}
        {slide.columns && (
          <div className="slide-columns">
            <div className="slide-col" dangerouslySetInnerHTML={{ __html: slide.columns[0] }} />
            <div className="slide-col" dangerouslySetInnerHTML={{ __html: slide.columns[1] }} />
          </div>
        )}
      </div>
      <div className="slide-chrome">
        <span className="slide-chrome-brand">
          {theme === "collab" && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size partner mark inside a scaled slide */}
              <img src="/partners/juvenileai-logo.png" alt="JuvenileAI" />
              <span aria-hidden="true">×</span>
            </>
          )}
          <LogoMark className="h-[26px]" />
          <span>SCULT ACADEMY</span>
        </span>
        <span>{event}</span>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function PdfSlide({ doc, index, width, height }: { doc: PDFDocumentProxy | null; index: number; width: number; height: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!doc || !canvas.current || !width) return;
    let cancelled = false;
    const job = renderPdfPage(doc, index, canvas.current, width, height);
    job.promise
      .then(() => !cancelled && setFailed(false))
      .catch((e: unknown) => {
        if (cancelled || (e instanceof Error && e.name === "RenderingCancelledException")) return;
        console.error("PDF page render failed", e);
        setFailed(true);
      });
    return () => {
      cancelled = true;
      job.cancel();
    };
  }, [doc, index, width, height]);

  return (
    <div className="grid h-full w-full place-items-center bg-white">
      {failed ? <p className="text-sm text-ink-mute">Couldn&apos;t render this page.</p> : <canvas ref={canvas} />}
    </div>
  );
}

export function Whiteboard() {
  return (
    <div
      className="absolute inset-0 bg-white"
      style={{
        backgroundImage: "radial-gradient(rgb(23 19 15 / 0.13) 1.2px, transparent 1.4px)",
        backgroundSize: "2.5% 4.44%",
      }}
    />
  );
}

type SlideStageProps = {
  stage?: StageApi;
  source: SlideSource;
  index: number;
  /** Accept pen/mouse input on this surface. */
  interactive?: boolean;
  /** Show board / blank / spotlight overlays (main surfaces only). */
  overlays?: boolean;
  className?: string;
  children?: ReactNode;
};

/** A fitted slide with ink. Previews pass `stage` for read-only ink, or omit it. */
export function SlideStage({ stage, source, index, interactive = false, overlays = false, className, children }: SlideStageProps) {
  const [ref, size] = useBox<HTMLDivElement>();
  const box = fit(size.width, size.height);
  const total = slideCount(source);
  const key = slideKey(source, index);
  const boardOn = overlays && !!stage?.board;
  const inkKey = boardOn ? `${key}#board` : key;

  // Spotlight follows the local pointer, or the other window's cursor.
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!stage || !overlays) return;
    return stage.subscribe((m: StageMessage) => {
      if (m.t === "cursor") setSpot({ x: m.x, y: m.y });
    });
  }, [stage, overlays]);

  const slide = source.kind === "markdown" ? source.slides[index] : null;

  return (
    <div ref={ref} className={cn("relative grid h-full w-full place-items-center", className)}>
      {box.width > 0 && (
        <div
          className="relative overflow-hidden rounded-[inherit] bg-white shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]"
          style={{ width: box.width, height: box.height }}
          onPointerMove={(e) => {
            if (!stage?.spotlight || !overlays) return;
            const r = e.currentTarget.getBoundingClientRect();
            const p = { x: ((e.clientX - r.left) / r.width) * 1600, y: ((e.clientY - r.top) / r.height) * 900 };
            setSpot(p);
            stage.post({ t: "cursor", ...p });
          }}
        >
          {source.kind === "markdown" && slide ? (
            <MarkdownSlide slide={slide} theme={source.theme} event={source.event} index={index} total={total} scale={box.width / 1600} />
          ) : source.kind === "pdf" ? (
            <PdfSlide doc={source.doc} index={index} width={box.width} height={box.height} />
          ) : null}

          {boardOn && <Whiteboard />}

          {stage && (
            <InkLayer stage={stage} inkKey={inkKey} width={box.width} height={box.height} interactive={interactive} />
          )}

          {overlays && stage?.spotlight && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${((spot?.x ?? 800) / 1600) * 100}% ${((spot?.y ?? 450) / 900) * 100}%, transparent ${box.width * 0.09}px, rgb(0 0 0 / 0.78) ${box.width * 0.1}px)`,
              }}
            />
          )}

          {overlays && stage?.blank && (
            <div aria-hidden="true" className={cn("absolute inset-0", stage.blank === "black" ? "bg-black" : "bg-white")} />
          )}
          {children}
        </div>
      )}
    </div>
  );
}

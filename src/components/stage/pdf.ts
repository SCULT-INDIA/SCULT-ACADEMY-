"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

/* pdf.js loads lazily (client only). The worker is copied to
   /public/vendor on install so it always matches the library. */

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
const loadPdfjs = () =>
  (pdfjsPromise ??= import("pdfjs-dist").then((m) => {
    m.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
    return m;
  }));

export type PdfSource = { url: string } | { data: Uint8Array };

export function usePdfDocument(source: PdfSource | null) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = source ? ("url" in source ? source.url : `bytes:${source.data.byteLength}`) : "";

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | null = null;
    loadPdfjs()
      .then((pdfjs) => {
        const loading = pdfjs.getDocument(
          "url" in source ? { url: source.url, withCredentials: true } : { data: source.data.slice() },
        );
        task = loading;
        if (cancelled) loading.destroy();
        return loading.promise;
      })
      .then((d) => !cancelled && setDoc(d))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Could not open the PDF."));
    return () => {
      cancelled = true;
      task?.destroy();
    };
    // `key` identifies the source; the object itself may be recreated on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { doc, error };
}

/**
 * Renders a page letterboxed inside width × height (CSS px) and copies it
 * into `target`. Each render uses its own offscreen canvas, so overlapping
 * renders (fast slide changes, effect re-runs) never collide.
 */
export function renderPdfPage(doc: PDFDocumentProxy, pageIndex: number, target: HTMLCanvasElement, width: number, height: number) {
  let cancelled = false;
  let task: { cancel: () => void } | null = null;
  const promise = (async () => {
    const page = await doc.getPage(pageIndex + 1);
    if (cancelled) return;
    const base = page.getViewport({ scale: 1 });
    const fit = Math.min(width / base.width, height / base.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const viewport = page.getViewport({ scale: fit * dpr });
    const off = document.createElement("canvas");
    off.width = Math.round(viewport.width);
    off.height = Math.round(viewport.height);
    const render = page.render({ canvas: off, viewport });
    task = render;
    await render.promise;
    if (cancelled) return;
    target.width = off.width;
    target.height = off.height;
    target.style.width = `${Math.round(off.width / dpr)}px`;
    target.style.height = `${Math.round(off.height / dpr)}px`;
    target.getContext("2d")?.drawImage(off, 0, 0);
  })();
  return {
    promise,
    cancel: () => {
      cancelled = true;
      task?.cancel();
    },
  };
}

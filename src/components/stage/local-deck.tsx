"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import type { ClientDeck } from "@/lib/stage/client-deck";
import { cn } from "@/lib/utils";
import { AudienceScreen } from "./audience";
import { Presenter } from "./presenter";

/* PDFs picked from this computer never leave the browser: they're kept
   in IndexedDB so the audience window (same browser) can open them too. */

type StoredPdf = { name: string; data: Uint8Array };
const pdfKey = (id: string) => `local-pdf:${id}`;

const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

export function LocalPdfPicker() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const open = async (files: File[]) => {
    setError(null);
    const pdf = files.find(isPdf);
    if (!pdf) {
      setError(
        files.some((f) => /\.pptx?$/i.test(f.name))
          ? "Browsers can't draw PowerPoint files directly. In PowerPoint use File → Export → PDF, then present the PDF."
          : "Choose a PDF file.",
      );
      return;
    }
    setBusy(true);
    try {
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      await idbSet(pdfKey(id), { name: pdf.name.replace(/\.pdf$/i, ""), data: new Uint8Array(await pdf.arrayBuffer()) } satisfies StoredPdf);
      router.push(`/stage/local/${id}`);
    } catch {
      setError("Couldn't open that file on this device.");
      setBusy(false);
    }
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void open([...e.dataTransfer.files]);
      }}
      className={cn(
        "group flex cursor-pointer flex-col justify-between rounded-[1.75rem] border border-dashed border-night-line bg-night-2/60 p-6 transition-colors hover:border-ember-500 hover:bg-night-2 sm:p-7",
        over && "border-ember-500 bg-night-2",
      )}
    >
      <span>
        <span className="grid size-12 place-items-center rounded-2xl bg-night-3 text-ember-400 transition-colors group-hover:bg-ember-600 group-hover:text-white">
          <FileUp className="size-5" />
        </span>
        <span className="mt-5 block font-display text-2xl font-semibold tracking-tight">Present a PDF</span>
        <span className="mt-2 block text-sm leading-relaxed text-cream-mute">
          Export any PowerPoint, Keynote or Canva deck as PDF and present it here with the full pen toolkit. The file stays on this
          device.
        </span>
      </span>
      <span className="mt-6 text-sm font-semibold text-ember-300">{busy ? "Opening…" : "Choose or drop a PDF →"}</span>
      {error && <span className="mt-2 text-sm text-ember-300">{error}</span>}
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) void open(files);
        }}
      />
    </label>
  );
}

function useLocalDeck(id: string) {
  const [deck, setDeck] = useState<ClientDeck | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    idbGet<StoredPdf>(pdfKey(id))
      .then((stored) => {
        if (cancelled) return;
        if (!stored) setMissing(true);
        else setDeck({ key: `local:${id}`, title: stored.name, event: "", theme: "scult", pdf: { data: stored.data } });
      })
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
    };
  }, [id]);
  return { deck, missing };
}

export function LocalPresenter({ id }: { id: string }) {
  const { deck, missing } = useLocalDeck(id);
  if (missing) return <p className="grid h-dvh place-items-center text-cream-mute">This PDF isn&apos;t on this device anymore. Open it again from the deck library.</p>;
  if (!deck) return <div className="grid h-dvh place-items-center text-cream-mute">Opening PDF…</div>;
  return <Presenter deck={deck} screenHref={`/stage/local/${id}/screen`} backHref="/stage" />;
}

export function LocalAudience({ id }: { id: string }) {
  const { deck, missing } = useLocalDeck(id);
  if (missing) return <p className="grid h-dvh place-items-center text-cream-mute">Open the PDF from the presenter first.</p>;
  if (!deck) return <div className="h-dvh bg-black" />;
  return <AudienceScreen deck={deck} />;
}

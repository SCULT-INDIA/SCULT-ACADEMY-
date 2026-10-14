"use client";

import type { ClientDeck } from "@/lib/stage/client-deck";
import { usePdfDocument } from "./pdf";
import type { SlideSource } from "./slide-view";

export type { ClientDeck };

export function useSlideSource(deck: ClientDeck): { source: SlideSource; error: string | null; ready: boolean } {
  const { doc, error } = usePdfDocument(deck.pdf ?? null);
  if (deck.markdown) {
    return { source: { kind: "markdown", slides: deck.markdown, theme: deck.theme, event: deck.event }, error: null, ready: true };
  }
  return { source: { kind: "pdf", doc, pageCount: doc?.numPages ?? 0 }, error, ready: !!doc };
}

import type { DeckData, DeckTheme, SlideData } from "./types";

/** A deck as the presenter receives it — from the content repo or a local PDF. */
export type ClientDeck = {
  key: string;
  title: string;
  event: string;
  theme: DeckTheme;
  markdown?: SlideData[];
  pdf?: { url: string } | { data: Uint8Array };
};

export function toClientDeck(deck: DeckData): ClientDeck {
  const base = { key: `deck:${deck.slug}`, title: deck.title, event: deck.event, theme: deck.theme };
  return deck.kind === "markdown" ? { ...base, markdown: deck.slides } : { ...base, pdf: { url: deck.pdfUrl } };
}

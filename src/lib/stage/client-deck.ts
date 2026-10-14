import type { DeckData, DeckTheme, SlideData } from "./types";

/** A deck as the presenter receives it — from the content repo or a local PDF. */
export type ClientDeck = {
  key: string;
  title: string;
  event: string;
  theme: DeckTheme;
  markdown?: SlideData[];
  pdf?: { url: string } | { data: Uint8Array };
  notes: string[];
};

export function toClientDeck(deck: DeckData): ClientDeck {
  if (deck.kind === "markdown") {
    return {
      key: `deck:${deck.slug}`,
      title: deck.title,
      event: deck.event,
      theme: deck.theme,
      markdown: deck.slides,
      notes: deck.slides.map((s) => s.notes),
    };
  }
  return { key: `deck:${deck.slug}`, title: deck.title, event: deck.event, theme: deck.theme, pdf: { url: deck.pdfUrl }, notes: deck.notes };
}

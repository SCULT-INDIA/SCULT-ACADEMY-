/* Shared Scult Stage types (server + client). */

export const SLIDE_W = 1600;
export const SLIDE_H = 900;

export type SlideLayout =
  | "default"
  | "title"
  | "section"
  | "statement"
  | "steps"
  | "two-column"
  | "stat"
  | "quote"
  | "image"
  | "whiteboard";

export type DeckTheme = "scult" | "collab" | "night";

export type SlideData = {
  id: string;
  layout: SlideLayout;
  kicker?: string;
  bg?: "paper" | "night" | "ember";
  /** Rendered HTML. two-column slides use `columns` instead. */
  html: string;
  columns?: [string, string];
  notes: string;
};

export type DeckMeta = {
  slug: string;
  title: string;
  subtitle: string;
  event: string;
  theme: DeckTheme;
};

export type DeckData =
  | (DeckMeta & { kind: "markdown"; slides: SlideData[] })
  | (DeckMeta & { kind: "pdf"; pdfUrl: string; notes: string[] });

export type DeckSummary = DeckMeta & { kind: "markdown" | "pdf"; slideCount: number | null };

/* ── Ink ─────────────────────────────────────────────────────── */

export type InkTool = "pen" | "highlighter" | "line" | "arrow" | "rect" | "ellipse";
export type ActiveTool = InkTool | "eraser" | "laser" | "pointer";

export type Stroke = {
  id: string;
  tool: InkTool;
  color: string;
  size: number;
  /** Flattened [x, y, pressure, x, y, pressure, …] in slide units (1600 × 900). */
  points: number[];
  /** True when real pressure data was captured (pen / stylus). */
  pressure: boolean;
};

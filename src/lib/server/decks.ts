import "server-only";
import { unstable_rethrow } from "next/navigation";
import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { DeckData, DeckMeta, DeckSummary, DeckTheme, SlideData, SlideLayout } from "@/lib/stage/types";
import { listContentDir, readContentText } from "./content";

/* ──────────────────────────────────────────────────────────────
   Markdown decks → slides. Format (see content repo README):
   slides split on `---`, directives in `<!-- layout: …; kicker: … -->`,
   speaker notes after `???`, two columns split on `|||`.
   ────────────────────────────────────────────────────────────── */

const LAYOUTS: SlideLayout[] = ["default", "title", "section", "statement", "steps", "two-column", "stat", "quote", "image", "whiteboard"];
const THEMES: DeckTheme[] = ["scult", "collab", "night"];
const LANGS = ["python", "javascript", "typescript", "tsx", "jsx", "json", "bash", "markdown", "html", "css", "sql", "yaml"] as const;
const LANG_ALIASES: Record<string, string> = { py: "python", js: "javascript", ts: "typescript", sh: "bash", shell: "bash", zsh: "bash", md: "markdown", yml: "yaml" };

let highlighter: Promise<Highlighter> | null = null;
// The JavaScript regex engine needs no WebAssembly, so it loads the same way on every serverless runtime.
const getHighlighter = () =>
  (highlighter ??= createHighlighter({ themes: ["github-dark-default"], langs: [...LANGS], engine: createJavaScriptRegexEngine() }));

const assetUrl = (slug: string, src: string) =>
  /^(https?:|data:|\/)/.test(src) ? src : `/stage/assets/decks/${slug}/${src.replace(/^\.\//, "")}`;

function markdownFor(slug: string, hl: Highlighter) {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      code({ text, lang }: Tokens.Code) {
        const raw = (lang ?? "").trim().split(/\s/)[0].toLowerCase();
        const language = LANG_ALIASES[raw] ?? raw;
        const supported = (LANGS as readonly string[]).includes(language) ? language : "text";
        return hl.codeToHtml(text, { lang: supported, theme: "github-dark-default" });
      },
      image({ href, title, text }: Tokens.Image) {
        const t = title ? ` title="${title.replaceAll('"', "&quot;")}"` : "";
        return `<img src="${assetUrl(slug, href)}" alt="${(text ?? "").replaceAll('"', "&quot;")}"${t} loading="lazy" />`;
      },
      html({ text }: Tokens.HTML | Tokens.Tag) {
        // Directive comments are consumed by the parser; drop any other raw <script>.
        return /<\s*script/i.test(text) ? "" : text;
      },
    },
  });
  return (md: string) => marked.parse(md, { async: false }) as string;
}

function parseKeyValues(block: string, sep: RegExp) {
  const out: Record<string, string> = {};
  for (const part of block.split(sep)) {
    const i = part.indexOf(":");
    if (i > 0) out[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
  }
  return out;
}

/** Split on separator lines while ignoring separators inside fenced code. */
function splitOutsideFences(text: string, isSeparator: (line: string) => boolean) {
  const chunks: string[][] = [[]];
  let fence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && isSeparator(line)) chunks.push([]);
    else chunks[chunks.length - 1].push(line);
  }
  return chunks.map((c) => c.join("\n"));
}

export function parseDeckMarkdown(slug: string, source: string, hl: Highlighter): { meta: DeckMeta; slides: SlideData[] } {
  let text = source.replace(/^﻿/, "");
  let metaRaw: Record<string, string> = {};
  const metaMatch = text.match(/^\s*<!--\s*deck\s*\n([\s\S]*?)-->/);
  if (metaMatch) {
    metaRaw = parseKeyValues(metaMatch[1].replace(/#.*$/gm, ""), /\r?\n/);
    text = text.slice(metaMatch[0].length);
  }
  const theme = THEMES.includes(metaRaw.theme as DeckTheme) ? (metaRaw.theme as DeckTheme) : "scult";
  const meta: DeckMeta = {
    slug,
    title: metaRaw.title || slug,
    subtitle: metaRaw.subtitle || "",
    event: metaRaw.event || "",
    theme,
  };

  const render = markdownFor(slug, hl);
  const slides: SlideData[] = [];
  splitOutsideFences(text, (l) => l.trim() === "---").forEach((chunk, index) => {
    if (!chunk.trim()) return;
    let body = chunk.trim();
    let directives: Record<string, string> = {};
    const d = body.match(/^<!--([\s\S]*?)-->/);
    if (d && !/^\s*deck\b/.test(d[1])) {
      directives = parseKeyValues(d[1], /;|\r?\n/);
      body = body.slice(d[0].length).trim();
    }
    const [content, ...noteParts] = splitOutsideFences(body, (l) => l.trim() === "???");
    const layout = LAYOUTS.includes(directives.layout as SlideLayout) ? (directives.layout as SlideLayout) : "default";
    const bg = ["paper", "night", "ember"].includes(directives.bg) ? (directives.bg as SlideData["bg"]) : undefined;

    const slide: SlideData = {
      id: `s${index + 1}`,
      layout,
      kicker: directives.kicker || undefined,
      bg,
      html: "",
      notes: noteParts.join("\n").trim(),
    };
    if (layout === "two-column") {
      const cols = splitOutsideFences(content, (l) => l.trim() === "|||");
      // A heading before the first column belongs to the whole slide.
      const left = cols[0] ?? "";
      const headingMatch = left.match(/^\s*(#{1,2} [^\n]+)\n?/);
      slide.html = headingMatch ? render(headingMatch[1]) : "";
      slide.columns = [render(headingMatch ? left.slice(headingMatch[0].length) : left), render(cols.slice(1).join("\n"))];
    } else {
      slide.html = render(content);
    }
    slides.push(slide);
  });
  return { meta, slides };
}

const validSlug = (slug: string) => /^[a-z0-9][a-z0-9-]*$/.test(slug);

export async function getDeck(slug: string): Promise<DeckData | null> {
  if (!validSlug(slug)) return null;
  const files = await listContentDir(`decks/${slug}`);
  const names = new Set(files.map((f) => f.name));

  if (names.has("deck.md")) {
    const source = await readContentText(`decks/${slug}/deck.md`);
    if (source === null) return null;
    const { meta, slides } = parseDeckMarkdown(slug, source, await getHighlighter());
    return { ...meta, kind: "markdown", slides };
  }
  if (names.has("deck.pdf")) {
    const info = names.has("meta.json")
      ? (JSON.parse((await readContentText(`decks/${slug}/meta.json`)) ?? "{}") as Partial<DeckMeta> & { notes?: string[] })
      : {};
    return {
      slug,
      title: info.title ?? slug,
      subtitle: info.subtitle ?? "",
      event: info.event ?? "",
      theme: info.theme && THEMES.includes(info.theme) ? info.theme : "scult",
      kind: "pdf",
      pdfUrl: `/stage/assets/decks/${slug}/deck.pdf`,
      notes: info.notes ?? [],
    };
  }
  return null;
}

export async function listDecks(): Promise<DeckSummary[]> {
  const dirs = (await listContentDir("decks")).filter((d) => d.type === "dir" && validSlug(d.name));
  const decks = await Promise.all(
    dirs.map(async (d): Promise<DeckSummary | null> => {
      try {
        const deck = await getDeck(d.name);
        if (!deck) return null;
        const { kind, slug, title, subtitle, event, theme } = deck;
        return { kind, slug, title, subtitle, event, theme, slideCount: deck.kind === "markdown" ? deck.slides.length : null };
      } catch (error) {
        unstable_rethrow(error);
        console.error(`Deck ${d.name} could not be loaded`, error);
        return null;
      }
    }),
  );
  return decks.filter((d): d is DeckSummary => !!d).sort((a, b) => a.title.localeCompare(b.title));
}

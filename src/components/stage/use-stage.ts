"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import type { ActiveTool, Stroke } from "@/lib/stage/types";
import { INK_COLORS, INK_SIZES, newId } from "./ink";

/* ──────────────────────────────────────────────────────────────
   Stage state shared by the presenter console and the audience
   screen. Windows sync over a BroadcastChannel (same browser, same
   origin — works offline). Ink and notes slides are saved per deck
   in IndexedDB.

   The deck plays as a list of pages: every slide, each followed by
   any notes slides (blank pages to write on) added after it.
   ────────────────────────────────────────────────────────────── */

export type InkMap = Record<string, Stroke[]>;
export type Blank = "black" | "white" | null;
export type LiveStroke = { key: string; stroke: Stroke | null };

/** A blank notes slide, placed after the slide whose key is `after`. */
export type NotePage = { id: string; after: string };

export type Page =
  | { kind: "slide"; slide: number; key: string }
  | { kind: "note"; id: string; after: string; key: string };

export const notePageKey = (id: string) => `note:${id}`;

/** Slides in order, each followed by its notes slides (in the order they were added). */
export function buildPages(slideKeys: string[], notes: NotePage[]): Page[] {
  const pages: Page[] = [];
  slideKeys.forEach((key, slide) => {
    pages.push({ kind: "slide", slide, key });
    for (const n of notes) if (n.after === key) pages.push({ kind: "note", id: n.id, after: n.after, key: notePageKey(n.id) });
  });
  return pages;
}

type Snapshot = { index: number; ink: InkMap; blank: Blank; spotlight: boolean; notes: NotePage[] };

export type StageMessage =
  | { t: "hello" }
  | { t: "sync"; state: Snapshot }
  | { t: "goto"; index: number }
  | { t: "notes"; notes: NotePage[] }
  | { t: "ink:add"; key: string; strokes: Stroke[] }
  | { t: "ink:remove"; key: string; ids: string[] }
  | { t: "ink:live"; key: string; stroke: Stroke | null }
  | { t: "laser"; x: number; y: number }
  | { t: "laser:up" }
  | { t: "cursor"; x: number; y: number }
  | { t: "blank"; mode: Blank }
  | { t: "spotlight"; on: boolean };

type Op = { key: string; added: Stroke[]; removed: Stroke[] };

/** Removes and returns the most recent op for one page. */
const take = (stack: Op[], key: string) => {
  const i = stack.findLastIndex((op) => op.key === key);
  return i < 0 ? null : stack.splice(i, 1)[0];
};

export type StageListener = (msg: StageMessage) => void;

export function useStage({ deckKey, slideKeys, role }: { deckKey: string; slideKeys: string[]; role: "presenter" | "screen" }) {
  const [index, setIndex] = useState(0);
  const [ink, setInk] = useState<InkMap>({});
  const [notes, setNotes] = useState<NotePage[]>([]);
  const [blank, setBlank] = useState<Blank>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [tool, setTool] = useState<ActiveTool>("pointer");
  const [color, setColor] = useState<string>(INK_COLORS[1].value);
  const [size, setSize] = useState<number>(INK_SIZES[1].value);
  const [loaded, setLoaded] = useState(false);

  const pages = useMemo(() => buildPages(slideKeys, notes), [slideKeys, notes]);
  // The page on screen (a placeholder until the slides have loaded).
  const page = useMemo<Page>(() => pages[Math.min(index, pages.length - 1)] ?? { kind: "slide", slide: 0, key: "" }, [pages, index]);

  const channel = useRef<BroadcastChannel | null>(null);
  const listeners = useRef(new Set<StageListener>());
  const undo = useRef<Op[]>([]);
  const redo = useRef<Op[]>([]);
  const inkRef = useRef(ink);
  // Updated synchronously so rapid clicker presses each advance a page.
  const indexRef = useRef(0);
  const notesRef = useRef<NotePage[]>([]);
  const keysRef = useRef(slideKeys);
  const synced = useRef(false);
  const stateRef = useRef<Snapshot>({ index, ink, blank, spotlight, notes });

  useEffect(() => {
    inkRef.current = ink;
    keysRef.current = slideKeys;
    stateRef.current = { index, ink, blank, spotlight, notes };
  }, [index, ink, blank, spotlight, notes, slideKeys]);

  const post = useCallback((msg: StageMessage) => channel.current?.postMessage(msg), []);

  /* Load saved ink and notes slides, then open the channel and ask other windows for their state. */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      idbGet<InkMap>(`stage-ink:${deckKey}`).catch(() => undefined),
      idbGet<NotePage[]>(`stage-pages:${deckKey}`).catch(() => undefined),
    ]).then(([savedInk, savedNotes]) => {
      if (cancelled) return;
      // The presenter's live state wins if it already arrived.
      if (!synced.current) {
        if (savedInk) setInk(savedInk);
        if (savedNotes) {
          notesRef.current = savedNotes;
          setNotes(savedNotes);
        }
      }
      setLoaded(true);
    });

    const bc = new BroadcastChannel(`scult-stage:${deckKey}`);
    channel.current = bc;
    bc.onmessage = (event: MessageEvent<StageMessage>) => {
      const msg = event.data;
      switch (msg.t) {
        case "hello":
          if (role === "presenter") bc.postMessage({ t: "sync", state: stateRef.current } satisfies StageMessage);
          break;
        case "sync":
          synced.current = true;
          indexRef.current = msg.state.index;
          notesRef.current = msg.state.notes;
          setIndex(msg.state.index);
          setInk(msg.state.ink);
          setNotes(msg.state.notes);
          setBlank(msg.state.blank);
          setSpotlight(msg.state.spotlight);
          break;
        case "goto":
          indexRef.current = msg.index;
          setIndex(msg.index);
          break;
        case "notes":
          notesRef.current = msg.notes;
          setNotes(msg.notes);
          break;
        case "ink:add":
          setInk((m) => ({ ...m, [msg.key]: [...(m[msg.key] ?? []).filter((s) => !msg.strokes.some((n) => n.id === s.id)), ...msg.strokes] }));
          break;
        case "ink:remove":
          setInk((m) => ({ ...m, [msg.key]: (m[msg.key] ?? []).filter((s) => !msg.ids.includes(s.id)) }));
          break;
        case "blank":
          setBlank(msg.mode);
          break;
        case "spotlight":
          setSpotlight(msg.on);
          break;
      }
      listeners.current.forEach((fn) => fn(msg));
    };
    bc.postMessage({ t: "hello" } satisfies StageMessage);
    return () => {
      cancelled = true;
      bc.close();
      channel.current = null;
    };
  }, [deckKey, role]);

  /* Persist ink and notes slides (debounced). */
  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => idbSet(`stage-ink:${deckKey}`, ink).catch(() => undefined), 400);
    return () => window.clearTimeout(id);
  }, [ink, loaded, deckKey]);
  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => idbSet(`stage-pages:${deckKey}`, notes).catch(() => undefined), 200);
    return () => window.clearTimeout(id);
  }, [notes, loaded, deckKey]);

  const show = useCallback(
    (target: number) => {
      indexRef.current = target;
      setIndex(target);
      post({ t: "goto", index: target });
    },
    [post],
  );

  const goto = useCallback(
    (next: number) => {
      const count = buildPages(keysRef.current, notesRef.current).length;
      show(Math.max(0, Math.min(count - 1, next)));
    },
    [show],
  );

  const apply = useCallback(
    (op: Op, record: boolean) => {
      setInk((m) => {
        const kept = (m[op.key] ?? []).filter((s) => !op.removed.some((r) => r.id === s.id));
        return { ...m, [op.key]: [...kept, ...op.added] };
      });
      if (op.removed.length) post({ t: "ink:remove", key: op.key, ids: op.removed.map((s) => s.id) });
      if (op.added.length) post({ t: "ink:add", key: op.key, strokes: op.added });
      if (record) {
        undo.current.push(op);
        if (undo.current.length > 200) undo.current.shift();
        redo.current = redo.current.filter((o) => o.key !== op.key);
      }
    },
    [post],
  );

  const addStroke = useCallback((key: string, stroke: Stroke) => apply({ key, added: [stroke], removed: [] }, true), [apply]);

  /** Removes strokes now; consecutive removals in one eraser gesture undo together. */
  const eraseGesture = useRef<{ key: string; op: Op } | null>(null);
  const eraseStrokes = useCallback(
    (key: string, ids: string[]) => {
      const current = inkRef.current[key] ?? [];
      const removed = current.filter((s) => ids.includes(s.id));
      if (!removed.length) return;
      apply({ key, added: [], removed }, false);
      if (eraseGesture.current?.key === key) eraseGesture.current.op.removed.push(...removed);
      else eraseGesture.current = { key, op: { key, added: [], removed } };
    },
    [apply],
  );
  const endErase = useCallback(() => {
    const op = eraseGesture.current?.op;
    if (op?.removed.length) {
      undo.current.push(op);
      redo.current = redo.current.filter((o) => o.key !== op.key);
    }
    eraseGesture.current = null;
  }, []);

  const clearKey = useCallback(
    (key: string) => {
      const strokes = inkRef.current[key] ?? [];
      if (strokes.length) apply({ key, added: [], removed: strokes }, true);
    },
    [apply],
  );

  /* Undo and redo act on the page you're looking at, never on ink hidden on another page. */
  const undoLast = useCallback(
    (key: string) => {
      const op = take(undo.current, key);
      if (!op) return;
      apply({ key: op.key, added: op.removed, removed: op.added }, false);
      redo.current.push(op);
    },
    [apply],
  );

  const redoLast = useCallback(
    (key: string) => {
      const op = take(redo.current, key);
      if (!op) return;
      apply(op, false);
      undo.current.push(op);
    },
    [apply],
  );

  const updateNotes = useCallback(
    (next: NotePage[]) => {
      notesRef.current = next;
      setNotes(next);
      post({ t: "notes", notes: next });
    },
    [post],
  );

  /** Adds a blank notes slide right after the page on screen, opens it and picks up the pen. */
  const addNotePage = useCallback(() => {
    const now = buildPages(keysRef.current, notesRef.current);
    const at = Math.min(indexRef.current, now.length - 1);
    const current = now[at];
    if (!current) return;
    const list = notesRef.current;
    const note: NotePage = { id: newId(), after: current.kind === "slide" ? current.key : current.after };
    // On a slide: before its existing notes slides. On a notes slide: right after it.
    let pos = current.kind === "slide" ? list.findIndex((n) => n.after === current.key) : list.findIndex((n) => n.id === current.id) + 1;
    if (pos < 0) pos = list.length;
    updateNotes([...list.slice(0, pos), note, ...list.slice(pos)]);
    show(at + 1);
    setTool((t) => (t === "pointer" || t === "eraser" || t === "laser" ? "pen" : t));
  }, [updateNotes, show]);

  /** Deletes a notes slide and its ink. */
  const removeNotePage = useCallback(
    (id: string) => {
      const pos = buildPages(keysRef.current, notesRef.current).findIndex((p) => p.kind === "note" && p.id === id);
      if (pos < 0) return;
      const key = notePageKey(id);
      const strokes = inkRef.current[key] ?? [];
      if (strokes.length) apply({ key, added: [], removed: strokes }, false);
      undo.current = undo.current.filter((o) => o.key !== key);
      redo.current = redo.current.filter((o) => o.key !== key);
      updateNotes(notesRef.current.filter((n) => n.id !== id));
      // Stay on the same page, or step back if the deleted one was on screen.
      if (indexRef.current >= pos) show(Math.max(0, indexRef.current - 1));
    },
    [apply, updateNotes, show],
  );

  const setBlankSync = useCallback(
    (mode: Blank) => {
      setBlank(mode);
      post({ t: "blank", mode });
    },
    [post],
  );
  const setSpotlightSync = useCallback(
    (on: boolean) => {
      setSpotlight(on);
      post({ t: "spotlight", on });
    },
    [post],
  );

  const subscribe = useCallback((fn: StageListener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  return useMemo(
    () => ({
      index,
      page,
      pages,
      goto,
      next: () => goto(indexRef.current + 1),
      prev: () => goto(indexRef.current - 1),
      ink,
      addStroke,
      eraseStrokes,
      endErase,
      clearKey,
      undo: undoLast,
      redo: redoLast,
      addNotePage,
      removeNotePage,
      blank,
      setBlank: setBlankSync,
      spotlight,
      setSpotlight: setSpotlightSync,
      tool,
      setTool,
      color,
      setColor,
      size,
      setSize,
      post,
      subscribe,
      loaded,
    }),
    [index, page, pages, goto, ink, addStroke, eraseStrokes, endErase, clearKey, undoLast, redoLast, addNotePage, removeNotePage, blank, setBlankSync, spotlight, setSpotlightSync, tool, color, size, post, subscribe, loaded],
  );
}

export type StageApi = ReturnType<typeof useStage>;

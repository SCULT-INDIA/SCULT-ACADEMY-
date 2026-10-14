"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import type { ActiveTool, Stroke } from "@/lib/stage/types";
import { INK_COLORS, INK_SIZES } from "./ink";

/* ──────────────────────────────────────────────────────────────
   Stage state shared by the presenter console and the audience
   screen. Windows sync over a BroadcastChannel (same browser, same
   origin — works offline). Ink is saved per deck in IndexedDB.
   ────────────────────────────────────────────────────────────── */

export type InkMap = Record<string, Stroke[]>;
export type Blank = "black" | "white" | null;
export type LiveStroke = { key: string; stroke: Stroke | null };

type Snapshot = { index: number; ink: InkMap; blank: Blank; board: boolean; spotlight: boolean };

export type StageMessage =
  | { t: "hello" }
  | { t: "sync"; state: Snapshot }
  | { t: "goto"; index: number }
  | { t: "ink:add"; key: string; strokes: Stroke[] }
  | { t: "ink:remove"; key: string; ids: string[] }
  | { t: "ink:live"; key: string; stroke: Stroke | null }
  | { t: "laser"; x: number; y: number }
  | { t: "laser:up" }
  | { t: "cursor"; x: number; y: number }
  | { t: "blank"; mode: Blank }
  | { t: "board"; on: boolean }
  | { t: "spotlight"; on: boolean };

type Op = { key: string; added: Stroke[]; removed: Stroke[] };

export type StageListener = (msg: StageMessage) => void;

export function useStage({ deckKey, count, role }: { deckKey: string; count: number; role: "presenter" | "screen" }) {
  const [index, setIndex] = useState(0);
  const [ink, setInk] = useState<InkMap>({});
  const [blank, setBlank] = useState<Blank>(null);
  const [board, setBoard] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [tool, setTool] = useState<ActiveTool>("pointer");
  const [color, setColor] = useState<string>(INK_COLORS[1].value);
  const [size, setSize] = useState<number>(INK_SIZES[1].value);
  const [loaded, setLoaded] = useState(false);

  const channel = useRef<BroadcastChannel | null>(null);
  const listeners = useRef(new Set<StageListener>());
  const undo = useRef<Op[]>([]);
  const redo = useRef<Op[]>([]);
  const inkRef = useRef(ink);
  // Updated synchronously so rapid clicker presses each advance a slide.
  const indexRef = useRef(0);
  const stateRef = useRef<Snapshot>({ index, ink, blank, board, spotlight });

  useEffect(() => {
    inkRef.current = ink;
    stateRef.current = { index, ink, blank, board, spotlight };
  }, [index, ink, blank, board, spotlight]);

  const post = useCallback((msg: StageMessage) => channel.current?.postMessage(msg), []);

  /* Load saved ink, then open the channel and ask other windows for their state. */
  useEffect(() => {
    let cancelled = false;
    const storageKey = `stage-ink:${deckKey}`;
    idbGet<InkMap>(storageKey)
      .catch(() => undefined)
      .then((saved) => {
        if (cancelled) return;
        if (saved) setInk(saved);
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
          indexRef.current = msg.state.index;
          setIndex(msg.state.index);
          setInk(msg.state.ink);
          setBlank(msg.state.blank);
          setBoard(msg.state.board);
          setSpotlight(msg.state.spotlight);
          break;
        case "goto":
          indexRef.current = msg.index;
          setIndex(msg.index);
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
        case "board":
          setBoard(msg.on);
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

  /* Persist ink (debounced). */
  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => idbSet(`stage-ink:${deckKey}`, ink).catch(() => undefined), 400);
    return () => window.clearTimeout(id);
  }, [ink, loaded, deckKey]);

  const goto = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      indexRef.current = clamped;
      setIndex(clamped);
      setBoard(false);
      post({ t: "goto", index: clamped });
      post({ t: "board", on: false });
    },
    [count, post],
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
        redo.current = [];
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
    if (eraseGesture.current?.op.removed.length) {
      undo.current.push(eraseGesture.current.op);
      redo.current = [];
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

  const undoLast = useCallback(() => {
    const op = undo.current.pop();
    if (!op) return;
    apply({ key: op.key, added: op.removed, removed: op.added }, false);
    redo.current.push(op);
  }, [apply]);

  const redoLast = useCallback(() => {
    const op = redo.current.pop();
    if (!op) return;
    apply(op, false);
    undo.current.push(op);
  }, [apply]);

  const setBlankSync = useCallback(
    (mode: Blank) => {
      setBlank(mode);
      post({ t: "blank", mode });
    },
    [post],
  );
  const setBoardSync = useCallback(
    (on: boolean) => {
      setBoard(on);
      post({ t: "board", on });
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
      blank,
      setBlank: setBlankSync,
      board,
      setBoard: setBoardSync,
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
    [index, goto, ink, addStroke, eraseStrokes, endErase, clearKey, undoLast, redoLast, blank, setBlankSync, board, setBoardSync, spotlight, setSpotlightSync, tool, color, size, post, subscribe, loaded],
  );
}

export type StageApi = ReturnType<typeof useStage>;

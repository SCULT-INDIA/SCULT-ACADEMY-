"use client";

import { useEffect, useRef } from "react";
import type { ActiveTool } from "@/lib/stage/types";
import { INK_COLORS, INK_SIZES } from "./ink";
import type { StageApi } from "./use-stage";

/* Keyboard map. Presentation clickers send PageUp/PageDown/B, and
   XP-Pen express keys can be bound to any of these in the driver. */

export const SHORTCUTS: { keys: string; action: string; group: "Navigate" | "Draw" | "Present" }[] = [
  { keys: "→  Space  PageDown", action: "Next slide", group: "Navigate" },
  { keys: "←  PageUp  Backspace", action: "Previous slide", group: "Navigate" },
  { keys: "Home / End", action: "First / last slide", group: "Navigate" },
  { keys: "V", action: "Pointer (no ink)", group: "Draw" },
  { keys: "P", action: "Pen", group: "Draw" },
  { keys: "H", action: "Highlighter", group: "Draw" },
  { keys: "E", action: "Eraser", group: "Draw" },
  { keys: "L", action: "Laser pointer", group: "Draw" },
  { keys: "I  A  R  O", action: "Line · Arrow · Rectangle · Ellipse", group: "Draw" },
  { keys: "1 – 7", action: "Ink colour", group: "Draw" },
  { keys: "[  ]", action: "Thinner / thicker", group: "Draw" },
  { keys: "Ctrl Z / Ctrl Shift Z", action: "Undo / redo", group: "Draw" },
  { keys: "X", action: "Clear ink on this slide", group: "Draw" },
  { keys: "G", action: "Whiteboard for this slide", group: "Present" },
  { keys: "B / W", action: "Black / white screen", group: "Present" },
  { keys: "S", action: "Spotlight", group: "Present" },
  { keys: "F", action: "Fullscreen present", group: "Present" },
  { keys: "T  /  Shift T", action: "Start-pause / reset timer", group: "Present" },
  { keys: "?", action: "Shortcuts & pen setup", group: "Present" },
  { keys: "Esc", action: "Exit blank, spotlight or tool", group: "Present" },
];

const TOOL_KEYS: Record<string, ActiveTool> = {
  v: "pointer",
  p: "pen",
  h: "highlighter",
  e: "eraser",
  l: "laser",
  i: "line",
  a: "arrow",
  r: "rect",
  o: "ellipse",
};

type Extra = {
  onFullscreen?: () => void;
  onHelp?: () => void;
  onTimer?: (reset: boolean) => void;
};

export function useStageShortcuts(stage: StageApi, inkKey: string, extra: Extra = {}) {
  const ref = useRef({ stage, inkKey, extra });
  useEffect(() => {
    ref.current = { stage, inkKey, extra };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const { stage: s, inkKey: key, extra: x } = ref.current;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();

      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && k === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod || e.altKey) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Enter":
          e.preventDefault();
          s.next();
          return;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          s.prev();
          return;
        case "Home":
          e.preventDefault();
          s.goto(0);
          return;
        case "End":
          e.preventDefault();
          s.goto(Number.MAX_SAFE_INTEGER);
          return;
        case "Escape":
          if (s.blank) s.setBlank(null);
          else if (s.spotlight) s.setSpotlight(false);
          else s.setTool("pointer");
          return;
        case "[":
        case "]": {
          const sizes = INK_SIZES.map((z) => z.value);
          const i = sizes.indexOf(s.size as (typeof sizes)[number]);
          const next = Math.max(0, Math.min(sizes.length - 1, (i < 0 ? 1 : i) + (e.key === "]" ? 1 : -1)));
          s.setSize(sizes[next]);
          return;
        }
        case "?":
        case "/":
          x.onHelp?.();
          return;
      }

      if (/^[1-7]$/.test(e.key)) {
        s.setColor(INK_COLORS[Number(e.key) - 1].value);
        if (s.tool === "pointer" || s.tool === "eraser" || s.tool === "laser") s.setTool("pen");
        return;
      }
      if (TOOL_KEYS[k]) {
        s.setTool(TOOL_KEYS[k]);
        return;
      }
      if (k === "b") s.setBlank(s.blank === "black" ? null : "black");
      else if (k === "w") s.setBlank(s.blank === "white" ? null : "white");
      else if (k === "g") s.setBoard(!s.board);
      else if (k === "s") s.setSpotlight(!s.spotlight);
      else if (k === "x") s.clearKey(s.board ? `${key}#board` : key);
      else if (k === "f") x.onFullscreen?.();
      else if (k === "t") x.onTimer?.(e.shiftKey);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

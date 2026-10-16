"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Eraser,
  Flashlight,
  Highlighter,
  Minus,
  MonitorOff,
  MousePointer2,
  MoveUpRight,
  NotebookPen,
  PenLine,
  Redo2,
  Shapes,
  Square,
  StickyNoteX,
  Sun,
  Target,
  Trash2,
  Undo2,
} from "lucide-react";
import type { ActiveTool } from "@/lib/stage/types";
import { cn } from "@/lib/utils";
import { INK_COLORS, INK_SIZES } from "./ink";
import type { Page, StageApi } from "./use-stage";

const TOOLS: { tool: ActiveTool; label: string; key: string; icon: typeof PenLine }[] = [
  { tool: "pointer", label: "Pointer", key: "V", icon: MousePointer2 },
  { tool: "pen", label: "Pen", key: "P", icon: PenLine },
  { tool: "highlighter", label: "Highlighter", key: "H", icon: Highlighter },
  { tool: "eraser", label: "Eraser", key: "E", icon: Eraser },
  { tool: "laser", label: "Laser pointer", key: "L", icon: Target },
];

const SHAPES: { tool: ActiveTool; label: string; key: string; icon: typeof PenLine }[] = [
  { tool: "line", label: "Line", key: "I", icon: Minus },
  { tool: "arrow", label: "Arrow", key: "A", icon: MoveUpRight },
  { tool: "rect", label: "Rectangle", key: "R", icon: Square },
  { tool: "ellipse", label: "Ellipse", key: "O", icon: Circle },
];

/* Clicking with a mouse or pen shouldn't move keyboard focus onto the button:
   a clicker's Space/Enter would then press that button again instead of
   changing slides. Keyboard users still tab to buttons as usual. */
const keepFocus = (e: MouseEvent) => e.preventDefault();

function ToolButton({
  active,
  expanded,
  label,
  shortcut,
  onClick,
  children,
  className,
  disabled,
}: {
  active?: boolean;
  expanded?: boolean;
  label: string;
  shortcut?: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={keepFocus}
      disabled={disabled}
      aria-pressed={expanded === undefined ? active : undefined}
      aria-expanded={expanded}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl text-cream-mute transition-colors hover:bg-night-3 hover:text-cream disabled:opacity-35 2xl:size-12",
        active && "bg-ember-600 text-white hover:bg-ember-600 hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A toolbar button that opens a small tray above it; closes on outside click or Esc. */
function ToolMenu({ label, active, icon, children }: { label: string; active?: boolean; icon: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation(); // Esc closes the tray only — it doesn't also drop the current tool
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <ToolButton active={active} expanded={open} label={label} onClick={() => setOpen((v) => !v)}>
        {icon}
      </ToolButton>
      {open && (
        <div
          role="group"
          aria-label={label}
          className="absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 gap-0.5 rounded-xl border border-night-line bg-night-2 p-1 shadow-xl"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function Divider({ vertical }: { vertical?: boolean }) {
  return <span aria-hidden="true" className={cn("shrink-0 bg-night-line", vertical ? "my-1 h-px w-7" : "mx-1 h-7 w-px")} />;
}

function Group({ label, vertical, className, children }: { label: string; vertical?: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className={cn(
        "flex max-w-full items-center justify-center gap-0.5 rounded-2xl border border-night-line bg-night-2/95 p-1.5 text-cream shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl",
        vertical ? "flex-col" : "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Page navigation, pen tools, shapes, colour and size. */
export function DrawTools({ stage, className }: { stage: StageApi; className?: string }) {
  const total = Math.max(1, stage.pages.length);
  const index = Math.min(stage.index, total - 1);
  const shapeActive = SHAPES.find((s) => s.tool === stage.tool);
  const ShapeIcon = shapeActive?.icon ?? Shapes;
  const sizeName = INK_SIZES.find((s) => s.value === stage.size)?.name ?? "Medium";

  return (
    <Group label="Drawing tools" className={className}>
      <ToolButton label="Previous slide" shortcut="←" onClick={stage.prev} disabled={index <= 0}>
        <ChevronLeft className="size-5" />
      </ToolButton>
      <span className="min-w-14 shrink-0 text-center font-mono text-xs text-cream-mute tabular-nums">
        {index + 1} / {total}
      </span>
      <ToolButton label="Next slide" shortcut="→" onClick={stage.next} disabled={index >= total - 1}>
        <ChevronRight className="size-5" />
      </ToolButton>
      <Divider />

      {TOOLS.map(({ tool, label, key, icon: Icon }) => (
        <ToolButton key={tool} active={stage.tool === tool} label={label} shortcut={key} onClick={() => stage.setTool(tool)}>
          <Icon className="size-5" />
        </ToolButton>
      ))}
      <ToolMenu label="Shapes" active={!!shapeActive} icon={<ShapeIcon className="size-5" />}>
        {(close) =>
          SHAPES.map(({ tool, label, key, icon: Icon }) => (
            <ToolButton
              key={tool}
              active={stage.tool === tool}
              label={label}
              shortcut={key}
              onClick={() => {
                stage.setTool(tool);
                close();
              }}
            >
              <Icon className="size-5" />
            </ToolButton>
          ))
        }
      </ToolMenu>
      <Divider />

      <div className="flex shrink-0 items-center gap-0.5 px-0.5" role="group" aria-label="Ink colour">
        {INK_COLORS.map((c, i) => (
          <button
            key={c.value}
            type="button"
            onMouseDown={keepFocus}
            onClick={() => {
              stage.setColor(c.value);
              if (stage.tool === "pointer" || stage.tool === "eraser" || stage.tool === "laser") stage.setTool("pen");
            }}
            aria-label={`${c.name} ink`}
            aria-pressed={stage.color === c.value}
            title={`${c.name} (${i + 1})`}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-transform hover:scale-110 2xl:size-9",
              stage.color === c.value && "ring-2 ring-cream ring-offset-2 ring-offset-night-2",
            )}
          >
            <span className="size-5 rounded-full border border-white/25" style={{ background: c.value }} />
          </button>
        ))}
      </div>
      <ToolMenu
        label={`Ink size: ${sizeName}`}
        icon={<span className="rounded-full bg-cream" style={{ width: stage.size + 2, height: stage.size + 2 }} />}
      >
        {(close) =>
          INK_SIZES.map((sz) => (
            <ToolButton
              key={sz.value}
              active={stage.size === sz.value}
              label={`${sz.name} ink`}
              shortcut="[ / ]"
              onClick={() => {
                stage.setSize(sz.value);
                close();
              }}
            >
              <span className="rounded-full bg-current" style={{ width: sz.value + 2, height: sz.value + 2 }} />
            </ToolButton>
          ))
        }
      </ToolMenu>
    </Group>
  );
}

/** Notes slides, undo, redo, clear, spotlight and blank screens: as a row, or a column beside the slide. */
export function ScreenTools({
  stage,
  page,
  vertical,
  end,
  className,
}: {
  stage: StageApi;
  page: Page;
  vertical?: boolean;
  end?: ReactNode;
  className?: string;
}) {
  const onNote = page.kind === "note";
  return (
    <Group label="Slide tools" vertical={vertical} className={className}>
      <ToolButton label="Add a notes slide after this one" shortcut="G" onClick={stage.addNotePage} className="text-ember-300">
        <NotebookPen className="size-5" />
      </ToolButton>
      {onNote && (
        <ToolButton
          label="Delete this notes slide"
          onClick={() => {
            if (window.confirm("Delete this notes slide and everything written on it?")) stage.removeNotePage(page.id);
          }}
        >
          <StickyNoteX className="size-5" />
        </ToolButton>
      )}
      <Divider vertical={vertical} />

      <ToolButton label="Undo on this slide" shortcut="Ctrl Z" onClick={() => stage.undo(page.key)}>
        <Undo2 className="size-5" />
      </ToolButton>
      <ToolButton label="Redo on this slide" shortcut="Ctrl Shift Z" onClick={() => stage.redo(page.key)}>
        <Redo2 className="size-5" />
      </ToolButton>
      <ToolButton label="Clear ink on this slide" shortcut="X" onClick={() => stage.clearKey(page.key)}>
        <Trash2 className="size-5" />
      </ToolButton>
      <Divider vertical={vertical} />

      <ToolButton active={stage.spotlight} label="Spotlight" shortcut="S" onClick={() => stage.setSpotlight(!stage.spotlight)}>
        <Flashlight className="size-5" />
      </ToolButton>
      <ToolButton
        active={stage.blank === "black"}
        label="Black screen"
        shortcut="B"
        onClick={() => stage.setBlank(stage.blank === "black" ? null : "black")}
      >
        <MonitorOff className="size-5" />
      </ToolButton>
      <ToolButton
        active={stage.blank === "white"}
        label="White screen"
        shortcut="W"
        onClick={() => stage.setBlank(stage.blank === "white" ? null : "white")}
      >
        <Sun className="size-5" />
      </ToolButton>
      {end && (
        <>
          <Divider vertical={vertical} />
          {end}
        </>
      )}
    </Group>
  );
}

/** Both groups; they wrap as whole pills when the window is narrow. */
export function StageToolbar({
  stage,
  page,
  className,
  end,
}: {
  stage: StageApi;
  page: Page;
  className?: string;
  end?: ReactNode;
}) {
  return (
    <div className={cn("flex max-w-full flex-wrap items-center justify-center gap-2", className)}>
      <DrawTools stage={stage} />
      <ScreenTools stage={stage} page={page} end={end} />
    </div>
  );
}

export { keepFocus, ToolButton };

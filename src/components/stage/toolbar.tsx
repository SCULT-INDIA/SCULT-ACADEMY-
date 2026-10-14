"use client";

import { useState, type ReactNode } from "react";
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
  Sun,
  Target,
  Trash2,
  Undo2,
} from "lucide-react";
import type { ActiveTool } from "@/lib/stage/types";
import { cn } from "@/lib/utils";
import { INK_COLORS, INK_SIZES } from "./ink";
import type { StageApi } from "./use-stage";

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

function ToolButton({
  active,
  label,
  shortcut,
  onClick,
  children,
  className,
  disabled,
}: {
  active?: boolean;
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
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl text-cream-mute transition-colors hover:bg-night-3 hover:text-cream disabled:opacity-35 2xl:size-12",
        active && "bg-ember-600 text-white hover:bg-ember-600 hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-8 w-px shrink-0 bg-night-line" />;

export function StageToolbar({
  stage,
  index,
  total,
  inkKey,
  className,
  end,
}: {
  stage: StageApi;
  index: number;
  total: number;
  inkKey: string;
  className?: string;
  end?: ReactNode;
}) {
  const [shapesOpen, setShapesOpen] = useState(false);
  const shapeActive = SHAPES.find((s) => s.tool === stage.tool);
  const ShapeIcon = shapeActive?.icon ?? Shapes;

  return (
    <div
      role="toolbar"
      aria-label="Presentation tools"
      className={cn(
        "flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-2xl border border-night-line bg-night-2/95 p-1.5 text-cream shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl",
        className,
      )}
    >
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
      <div className="relative">
        <ToolButton active={!!shapeActive} label="Shapes" onClick={() => setShapesOpen((v) => !v)}>
          <ShapeIcon className="size-5" />
        </ToolButton>
        {shapesOpen && (
          <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 gap-0.5 rounded-xl border border-night-line bg-night-2 p-1 shadow-xl">
            {SHAPES.map(({ tool, label, key, icon: Icon }) => (
              <ToolButton
                key={tool}
                active={stage.tool === tool}
                label={label}
                shortcut={key}
                onClick={() => {
                  stage.setTool(tool);
                  setShapesOpen(false);
                }}
              >
                <Icon className="size-5" />
              </ToolButton>
            ))}
          </div>
        )}
      </div>
      <Divider />

      <div className="flex shrink-0 items-center gap-1 px-1" role="group" aria-label="Ink colour">
        {INK_COLORS.map((c, i) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              stage.setColor(c.value);
              if (stage.tool === "pointer" || stage.tool === "eraser" || stage.tool === "laser") stage.setTool("pen");
            }}
            aria-label={`${c.name} ink`}
            aria-pressed={stage.color === c.value}
            title={`${c.name} (${i + 1})`}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-transform hover:scale-110",
              stage.color === c.value && "ring-2 ring-cream ring-offset-2 ring-offset-night-2",
            )}
          >
            <span className="size-5 rounded-full border border-white/25" style={{ background: c.value }} />
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 px-1" role="group" aria-label="Ink size">
        {INK_SIZES.map((sz) => (
          <button
            key={sz.value}
            type="button"
            onClick={() => stage.setSize(sz.value)}
            aria-label={`${sz.name} ink`}
            aria-pressed={stage.size === sz.value}
            title={`${sz.name} ([ / ])`}
            className={cn(
              "grid size-9 place-items-center rounded-lg transition-colors hover:bg-night-3",
              stage.size === sz.value && "bg-night-3",
            )}
          >
            <span className="rounded-full bg-cream" style={{ width: sz.value + 2, height: sz.value + 2 }} />
          </button>
        ))}
      </div>
      <Divider />

      <ToolButton label="Undo" shortcut="Ctrl Z" onClick={stage.undo}>
        <Undo2 className="size-5" />
      </ToolButton>
      <ToolButton label="Redo" shortcut="Ctrl Shift Z" onClick={stage.redo}>
        <Redo2 className="size-5" />
      </ToolButton>
      <ToolButton label="Clear ink on this slide" shortcut="X" onClick={() => stage.clearKey(inkKey)}>
        <Trash2 className="size-5" />
      </ToolButton>
      <Divider />

      <ToolButton active={stage.board} label="Whiteboard" shortcut="G" onClick={() => stage.setBoard(!stage.board)}>
        <NotebookPen className="size-5" />
      </ToolButton>
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
          <Divider />
          {end}
        </>
      )}
    </div>
  );
}

export { ToolButton };

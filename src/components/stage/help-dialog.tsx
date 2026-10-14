"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SHORTCUTS } from "./shortcuts";

const PEN_SETUP = [
  {
    title: "Pen tablets (XP-Pen, Wacom, Huion)",
    steps: [
      "Install the maker's driver (XP-Pen: “PenTablet”). Plug in the tablet before opening Scult Stage.",
      "In the driver, set Work Area / Screen to the display you draw on — your laptop for the console, or the projector if you present on it.",
      "Pressure works automatically. Keep “Windows Ink” switched on in the XP-Pen driver on Windows.",
      "Pen eraser end or the lower barrel button erases while held. Bind the upper barrel button to the key L for an instant laser.",
    ],
  },
  {
    title: "Express keys (suggested mapping)",
    steps: [
      "K1 → P (pen) · K2 → E (eraser) · K3 → H (highlighter) · K4 → L (laser)",
      "K5 → Ctrl+Z (undo) · K6 → Ctrl+Shift+Z (redo)",
      "K7 → → (next slide) · K8 → ← (previous slide)",
      "Dial or extra keys → G (whiteboard), B (black screen), X (clear slide)",
    ],
  },
  {
    title: "Pen displays, iPad & touch boards",
    steps: [
      "On a pen display (XP-Pen Artist, Wacom One), open the audience screen on it and draw directly — ink mirrors to your console.",
      "Apple Pencil and Surface Pen work in the browser with pressure. Fingers are ignored while the pen is near (palm rejection).",
      "Classroom touch boards draw with a finger when the pen tool is selected.",
    ],
  },
  {
    title: "Clickers & two screens",
    steps: [
      "Presentation clickers (PageUp / PageDown / B) work out of the box.",
      "Click “Open screen” to put the audience view on the projector; press F there to go fullscreen. Both windows stay in sync, even offline.",
    ],
  },
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const groups = ["Navigate", "Draw", "Present"] as const;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="stage-help-title"
      className="m-auto max-h-[88dvh] w-[min(64rem,94vw)] overflow-y-auto rounded-[2rem] border border-night-line bg-night-2 p-0 text-cream shadow-[0_60px_140px_-40px_rgb(0_0_0/0.95)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-night-line bg-night-2/95 px-7 py-5 backdrop-blur">
        <h2 id="stage-help-title" className="font-display text-2xl font-semibold tracking-tight">
          Shortcuts & pen setup
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-xl text-cream-mute hover:bg-night-3 hover:text-cream"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="grid gap-8 p-7 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g}>
              <h3 className="font-mono text-[0.65rem] tracking-[0.16em] text-ember-300 uppercase">{g}</h3>
              <dl className="mt-3 divide-y divide-night-line rounded-2xl border border-night-line">
                {SHORTCUTS.filter((s) => s.group === g).map((s) => (
                  <div key={s.action} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                    <dt className="text-cream-mute">{s.action}</dt>
                    <dd className="shrink-0 font-mono text-xs text-cream">{s.keys}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <div className="space-y-5">
          {PEN_SETUP.map((block) => (
            <section key={block.title} className="rounded-2xl border border-night-line bg-night/60 p-5">
              <h3 className="font-display text-lg font-semibold tracking-tight">{block.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cream-mute">
                {block.steps.map((s) => (
                  <li key={s} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ember-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}

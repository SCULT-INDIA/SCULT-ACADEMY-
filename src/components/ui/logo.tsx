import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   The Scult Academy mark: four petals turning around a centre to
   form an "S". Drawn as two petals (one horizontal lens, one
   vertical half-lens) plus their 180° rotation, on a grid
   centred at 0,0. The mark is always its original orange — only
   the lockup and container vary.
   ────────────────────────────────────────────────────────────── */

export const PETAL_H =
  "M-115 -290L38 -395C80 -424 146 -424 188 -395L350 -287C362 -279 362 -266 350 -258C290 -217 210 -162 123 -162C40 -162 -50 -210 -115 -290Z";
export const PETAL_V =
  "M-124 -255L-124 115C-124 132 -140 141 -156 134C-255 85 -375 20 -375 -115C-375 -205 -300 -297 -212 -297C-180 -297 -150 -288 -132 -273C-126 -268 -124 -262 -124 -255Z";

/** Tight bounds of the mark. */
export const MARK_VIEWBOX = "-380 -424 760 848";

/** The logo's own colour. Never recolour the mark. */
export const LOGO_ORANGE = "#ff6f0f";

/** Petal paths for embedding inside another SVG (e.g. the app icon). */
export function MarkPetals() {
  return (
    <g fill={LOGO_ORANGE}>
      <path d={PETAL_H} />
      <path d={PETAL_V} />
      <g transform="rotate(180)">
        <path d={PETAL_H} />
        <path d={PETAL_V} />
      </g>
    </g>
  );
}

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-9 w-auto shrink-0", className)}
    >
      <MarkPetals />
    </svg>
  );
}

/** Rounded-tile app icon: the orange mark on a light or dark tile. */
export function AppIcon({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <svg viewBox="-512 -512 1024 1024" aria-hidden="true" className={cn("size-10 shrink-0", className)}>
      <rect x="-512" y="-512" width="1024" height="1024" rx="232" fill={tone === "dark" ? "#17130f" : "#ffffff"} />
      <g transform="scale(0.66)">
        <MarkPetals />
      </g>
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "cream" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9" />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-bold tracking-[-0.04em]",
            tone === "ink" ? "text-ink" : "text-cream",
          )}
        >
          Scult
        </span>
        <span
          className={cn(
            "font-mono text-[0.68rem] font-medium tracking-[0.18em] uppercase",
            tone === "ink" ? "text-ink-mute" : "text-cream-mute",
          )}
        >
          Academy
        </span>
      </span>
    </span>
  );
}

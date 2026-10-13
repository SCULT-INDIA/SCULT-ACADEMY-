import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("size-9 shrink-0", className)}>
      <rect width="40" height="40" rx="12" fill="#cd4a12" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="#fff" strokeOpacity="0.16" />
      <path
        d="M26.5 13.2c-1.3-2-3.6-3.2-6.3-3.2-3.8 0-6.4 2.1-6.4 5 0 6.6 13.3 3.6 13.3 10.5 0 3.2-2.9 5.5-7 5.5-3 0-5.6-1.3-7-3.6"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle cx="31.4" cy="8.6" r="2.6" fill="#f6c244" />
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "cream" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
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
            "font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em]",
            tone === "ink" ? "text-ink-mute" : "text-cream-mute",
          )}
        >
          Academy
        </span>
      </span>
    </span>
  );
}

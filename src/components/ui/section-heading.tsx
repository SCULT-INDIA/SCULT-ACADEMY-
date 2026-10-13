import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em]",
        tone === "light"
          ? "border-line bg-white/60 text-ink-soft"
          : "border-night-line bg-night-2/80 text-cream-mute",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-ember-500" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Serif-italic accent used inside display headlines. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-serif font-normal italic tracking-[-0.01em]", className)}>{children}</span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  size = "lg",
  className,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** "md" suits headings that sit in a half-width column. */
  size?: "lg" | "md";
  className?: string;
}) {
  return (
    <div className={cn("reveal max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={cn(
          // Font size must precede leading: tailwind-merge drops a leading-* that comes before a text-* size.
          size === "lg" ? "text-[clamp(2.3rem,5.4vw,4.4rem)]" : "text-[clamp(2.2rem,4.4vw,3.6rem)]",
          "mt-6 font-display leading-[1] font-semibold tracking-[-0.04em] sm:leading-[0.98]",
          tone === "light" ? "text-ink" : "text-cream",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-6 text-lg leading-relaxed sm:text-xl",
            align === "center" && "mx-auto max-w-2xl",
            tone === "light" ? "text-ink-soft" : "text-cream-mute",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

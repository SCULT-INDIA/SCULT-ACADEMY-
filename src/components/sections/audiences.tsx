"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { audiences, type Audience } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

const toneStyles: Record<Audience["tone"], { card: string; muted: string; rule: string; badge: string }> = {
  ember: {
    card: "bg-ember-600 text-white",
    muted: "text-white/70",
    rule: "border-white/20",
    badge: "bg-white/15 text-white",
  },
  sun: {
    card: "bg-sun-400 text-ink",
    muted: "text-ink/65",
    rule: "border-ink/15",
    badge: "bg-ink text-sun-300",
  },
  ink: {
    card: "bg-night text-cream",
    muted: "text-cream-mute",
    rule: "border-night-line",
    badge: "bg-ember-600 text-white",
  },
  paper: {
    card: "border border-line-strong bg-paper-3 text-ink",
    muted: "text-ink/65",
    rule: "border-ink/15",
    badge: "bg-ink text-cream",
  },
};

export function Audiences() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = audiences[active];
  const tone = toneStyles[current.tone];
  const Icon = current.icon;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = audiences.length - 1;
    const next =
      e.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : e.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="audiences" aria-labelledby="audiences-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="audiences-title"
            eyebrow="Who it's for"
            title={
              <>
                One academy. <Accent className="text-ember-600">Every</Accent> stage of the AI curve.
              </>
            }
            description="Whether you're writing your first line of Python or leading a 10,000-person transformation, there's a path built precisely for you."
          />
        </div>

        <div
          role="tablist"
          aria-label="Choose your audience"
          onKeyDown={onKeyDown}
          className="reveal mt-12 grid grid-cols-2 gap-1 rounded-[1.6rem] border border-line bg-white/60 p-1.5 shadow-[0_8px_30px_-20px_rgb(23_19_15/0.4)] backdrop-blur sm:inline-flex sm:rounded-full"
        >
          {audiences.map((a, i) => {
            const selected = i === active;
            const TabIcon = a.icon;
            return (
              <button
                key={a.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${a.id}`}
                aria-selected={selected}
                aria-controls={`panel-${a.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  "relative rounded-[1.2rem] px-4 py-3 text-sm font-medium transition-colors sm:rounded-full sm:px-5 sm:py-2.5",
                  selected ? "text-cream" : "text-ink-soft hover:text-ink",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="audience-pill"
                    className="absolute inset-0 rounded-[inherit] bg-ink shadow-[0_8px_20px_-10px_rgb(23_19_15/0.7)]"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <TabIcon className={cn("size-4", selected && "text-ember-400")} />
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              role="tabpanel"
              id={`panel-${current.id}`}
              aria-labelledby={`tab-${current.id}`}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-4 lg:grid-cols-[1.2fr_1fr]"
            >
              <div className="rounded-[2rem] border border-line bg-white p-7 shadow-[0_30px_60px_-40px_rgb(23_19_15/0.35)] sm:p-10">
                <p className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-ember-700 uppercase">
                  {current.kicker}
                </p>
                <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
                  {current.title}
                </h3>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{current.description}</p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {current.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-[0.95rem] text-ink-2">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ember-600 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {current.formats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-ink-soft"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <ButtonLink href={current.cta.href} arrow className="mt-9">
                  {current.cta.label}
                </ButtonLink>
              </div>

              <div className={cn("matte relative overflow-hidden rounded-[2rem] p-7 sm:p-10", tone.card)}>
                <Icon
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -bottom-10 size-64 opacity-[0.09]"
                  strokeWidth={1.2}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <span className={cn("font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase", tone.muted)}>
                    Sample track
                  </span>
                  <span className={cn("rounded-full px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase", tone.badge)}>
                    {current.formats[0]}
                  </span>
                </div>
                <p className="relative mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {current.track.name}
                </p>
                <ol className="relative mt-8">
                  {current.track.modules.map((m, i) => (
                    <li
                      key={m.title}
                      className={cn("flex items-center gap-4 border-t py-4", tone.rule, i === 0 && "border-t-0 pt-0")}
                    >
                      <span className={cn("w-16 shrink-0 font-mono text-xs", tone.muted)}>{m.week}</span>
                      <span className="text-[1.02rem] font-medium">{m.title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

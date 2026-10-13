import Link from "next/link";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import { programs, type Program } from "@/lib/content";
import { bookingHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { Spotlight } from "@/components/ui/spotlight";

const layout = [
  "md:col-span-2 lg:col-span-2 lg:row-span-2",
  "md:col-span-2 lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "md:col-span-1 lg:col-span-2",
  "md:col-span-1 lg:col-span-2",
];

export function Programs() {
  const [featured, ...rest] = programs;

  return (
    <section
      id="programs"
      aria-labelledby="programs-title"
      className="relative border-y border-line bg-paper-2/60 py-24 sm:py-32"
    >
      <div aria-hidden="true" className="bg-dots mask-fade-b pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="programs-title"
            eyebrow="Programs"
            title={
              <>
                Programs engineered for the <Accent className="text-ember-600">real world.</Accent>
              </>
            }
            description="Every track is built with practitioners, refreshed every cohort, and measured by one thing: what you can build when you finish."
          />
          <p className="reveal flex shrink-0 items-center gap-2 font-mono text-xs tracking-wide text-ink-mute uppercase">
            <span className="size-2 animate-pulse-dot rounded-full bg-ember-500" />
            New cohorts start every month
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:auto-rows-[minmax(260px,auto)] lg:grid-cols-4">
          <FeaturedCard program={featured} className={layout[0]} />
          {rest.map((p, i) => (
            <ProgramCard key={p.title} program={p} className={layout[i + 1]} wide={i === 0 || i >= 3} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Meta({
  program,
  tone = "light",
  stacked = false,
}: {
  program: Program;
  tone?: "light" | "dark";
  stacked?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-x-4 gap-y-1.5 text-[0.8rem]",
        stacked ? "flex-col" : "flex-wrap items-center",
        tone === "light" ? "text-ink-mute" : "text-cream-mute",
      )}
    >
      <span className="flex items-center gap-1.5">
        <Clock className="size-3.5" /> {program.duration}
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="size-3.5" /> {program.format}
      </span>
    </div>
  );
}

function ProgramCard({ program, className, wide }: { program: Program; className?: string; wide?: boolean }) {
  const Icon = program.icon;
  return (
    <Spotlight
      className={cn(
        "reveal group flex flex-col rounded-[1.75rem] border border-line bg-white p-7 shadow-[0_20px_50px_-40px_rgb(23_19_15/0.45)] transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-ember-200 hover:shadow-[0_30px_60px_-30px_rgb(205_74_18/0.35)]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl border border-ember-100 bg-ember-50 text-ember-600 transition-colors duration-500 group-hover:border-ember-600 group-hover:bg-ember-600 group-hover:text-white">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.62rem] font-medium tracking-[0.12em] text-ink-soft uppercase">
          {program.level}
        </span>
      </div>
      <h3 className="mt-6 font-display text-[1.45rem] leading-tight font-semibold tracking-[-0.025em] text-ink">
        {program.title}
      </h3>
      <p className={cn("mt-2.5 leading-relaxed text-ink-soft", wide ? "max-w-md" : "text-[0.95rem]")}>
        {program.description}
      </p>
      <div className="mt-auto flex items-end justify-between gap-4 pt-7">
        <div className="space-y-3">
          <Meta program={program} stacked={!wide} />
          {wide && (
            <div className="flex flex-wrap gap-1.5">
              {program.tags.map((t) => (
                <span key={t} className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link
          href={bookingHref("counselling", program.slug)}
          aria-label={`Book a counselling session for ${program.title}`}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-cream"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </Spotlight>
  );
}

function FeaturedCard({ program, className }: { program: Program; className?: string }) {
  const Icon = program.icon;
  const pipeline = ["Docs", "Embed", "Retrieve", "LLM", "Answer"];
  return (
    <Spotlight
      spot="rgb(234 101 38 / 0.22)"
      className={cn(
        "reveal group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-night p-7 text-cream shadow-[0_40px_80px_-40px_rgb(23_19_15/0.8)] sm:p-9",
        className,
      )}
    >
      <div aria-hidden="true" className="bg-dots-dark mask-fade-b absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(234_101_38/0.45),transparent)] blur-xl"
      />

      <div className="flex items-start justify-between">
        <span className="matte grid size-12 place-items-center rounded-2xl bg-ember-600 text-white">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full bg-sun-400 px-3 py-1 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-ink uppercase">
          Flagship · {program.level}
        </span>
      </div>

      <h3 className="mt-7 max-w-sm font-display text-3xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">
        {program.title}
      </h3>
      <p className="mt-4 max-w-md leading-relaxed text-cream-mute">{program.description}</p>

      {/* RAG pipeline visual */}
      <div
        aria-hidden="true"
        className="relative mt-8 rounded-2xl border border-night-line bg-night-2/90 p-4 sm:p-5"
      >
        <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.16em] text-cream-mute uppercase">
          <span>Capstone · RAG pipeline</span>
          <span className="text-sun-400">● running</span>
        </div>
        <div className="relative mt-4 flex items-center justify-between gap-1">
          <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--color-night-line)_0_6px,transparent_6px_10px)]" />
          <div className="absolute top-1/2 left-4 size-2 -translate-y-1/2 animate-[travel_3.2s_ease-in-out_infinite] rounded-full bg-ember-400 shadow-[0_0_12px_2px_rgb(234_101_38/0.7)]" />
          {pipeline.map((node, i) => (
            <span
              key={node}
              className={cn(
                "relative rounded-lg border px-2 py-1.5 font-mono text-[0.62rem] sm:px-3 sm:text-[0.7rem]",
                i === pipeline.length - 1
                  ? "border-ember-600 bg-ember-600 text-white"
                  : "border-night-line bg-night-3 text-cream",
              )}
            >
              {node}
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-2 text-[0.78rem]">
          <p className="w-fit max-w-[85%] rounded-xl rounded-bl-sm bg-night-3 px-3 py-2 text-cream-mute">
            Summarise the Q3 risk report for the board.
          </p>
          <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-ember-600/15 px-3 py-2 text-cream">
            Three key risks identified, with sources <span className="text-sun-400">[1][2]</span>
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
        <div className="space-y-3">
          <Meta program={program} tone="dark" />
          <div className="flex flex-wrap gap-1.5">
            {program.tags.map((t) => (
              <span key={t} className="rounded-full border border-night-line px-2.5 py-1 text-xs text-cream-mute">
                {t}
              </span>
            ))}
          </div>
        </div>
        <ButtonLink href={bookingHref("counselling", program.slug)} arrow size="sm">
          Apply now
        </ButtonLink>
      </div>
    </Spotlight>
  );
}

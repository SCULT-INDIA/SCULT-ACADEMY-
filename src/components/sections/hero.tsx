import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { bookingHref } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { HeroStage } from "./hero-stage";

const assurances = ["Live, mentor-led cohorts", "Portfolio-grade projects", "Industry-recognised certificates"];

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Atmosphere — flat paper with a faint structural grid, no colour wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      </div>

      <div className="mx-auto max-w-6xl px-5 text-center">
        <Link
          href="/workshops/juvenile-ai-2026"
          className="group animate-rise inline-flex items-center gap-3 rounded-full border border-line bg-white/70 p-1 pr-4 text-sm shadow-[0_6px_20px_-12px_rgb(23_19_15/0.3)] backdrop-blur transition-colors hover:border-line-strong hover:bg-white"
        >
          <span className="matte rounded-full bg-ember-600 px-2.5 py-1 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-white uppercase">
            New
          </span>
          <span className="text-ink-soft">
            <span className="font-medium text-ink">AI Agents workshop with JuvenileAI</span>
            <span className="hidden sm:inline"> — 17 Oct</span>
          </span>
          <ArrowRight className="size-3.5 text-ink-soft transition-transform duration-500 group-hover:translate-x-0.5" />
        </Link>

        <h1
          id="hero-title"
          className="mx-auto mt-8 max-w-5xl font-display text-[clamp(3.3rem,9vw,8rem)] leading-[0.9] font-semibold tracking-[-0.05em] text-ink"
        >
          <span className="block animate-rise [animation-delay:90ms]">Sculpt your edge</span>
          <span className="block animate-rise [animation-delay:180ms]">
            <span className="font-serif font-normal tracking-[-0.02em] text-ink-soft italic">in the age of </span>
            <span className="relative inline-block">
              <span className="pr-[0.04em] text-ember-600">AI</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 220 24"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.06em] left-[-4%] h-[0.16em] w-[108%] overflow-visible"
              >
                <path
                  d="M3 16C48 6 120 3 217 12"
                  fill="none"
                  stroke="var(--color-sun-400)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  pathLength={1}
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] [animation:draw_1.1s_0.75s_var(--ease-out-expo)_forwards]"
                />
              </svg>
            </span>
            <span className="text-sun-400">.</span>
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl animate-rise text-[1.05rem] leading-relaxed text-ink-soft [animation-delay:280ms] sm:mt-8 sm:text-xl">
          Scult Academy is where students, professionals, industry experts and enterprise teams master AI and the
          technologies redefining work — through live, mentor-led, build-first programs.
        </p>

        <div className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 [animation-delay:360ms] sm:mt-10 sm:flex-row">
          <ButtonLink href="#programs" size="lg" arrow className="w-full sm:w-auto">
            Explore programs
          </ButtonLink>
          <ButtonLink href={bookingHref("enterprise")} size="lg" variant="outline" className="w-full sm:w-auto">
            Book a team demo
          </ButtonLink>
        </div>

        <ul className="mx-auto mt-8 flex w-fit animate-rise flex-col items-start gap-x-6 gap-y-2.5 text-sm text-ink-soft [animation-delay:440ms] sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          {assurances.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-ember-100 text-ember-700">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-14 max-w-6xl animate-rise px-3 [animation-delay:520ms] sm:mt-20 sm:px-5">
        <HeroStage />
      </div>
    </section>
  );
}

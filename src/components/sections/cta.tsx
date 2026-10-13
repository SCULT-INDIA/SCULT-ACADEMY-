import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Accent } from "@/components/ui/section-heading";

export function Cta() {
  return (
    <section id="contact" aria-labelledby="cta-title" className="px-3 py-4 sm:px-5">
      <div className="matte relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.5rem] bg-ember-600 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-56 -left-40 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(246_194_68/0.55),transparent)] blur-2xl" />
          <div className="absolute -right-40 -bottom-64 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(133_48_15/0.55),transparent)] blur-2xl" />
          <div className="bg-dots-dark mask-radial absolute inset-0 opacity-70" />
          {/* Oversized brand mark */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            className="absolute top-1/2 -right-24 hidden size-[34rem] -translate-y-1/2 opacity-[0.1] lg:block"
          >
            <path
              d="M26.5 13.2c-1.3-2-3.6-3.2-6.3-3.2-3.8 0-6.4 2.1-6.4 5 0 6.6 13.3 3.6 13.3 10.5 0 3.2-2.9 5.5-7 5.5-3 0-5.6-1.3-7-3.6"
              stroke="#fff"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-sun-300" />
            Next cohorts open now
          </span>
          <h2
            id="cta-title"
            className="reveal mt-8 font-display text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.05em]"
          >
            Stop watching AI happen. <Accent className="text-sun-200">Start building with it.</Accent>
          </h2>
          <p className="reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Take the free skills diagnostic, get a personalised path in minutes, and join a cohort of builders who
            refuse to be left behind.
          </p>
          <div className="reveal mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#programs" variant="cream" size="lg" arrow className="w-full sm:w-auto">
              Start learning today
            </ButtonLink>
            <ButtonLink href={`mailto:${site.email}`} variant="ghost-dark" size="lg" className="w-full border-white/40 text-white sm:w-auto">
              Talk to an advisor
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

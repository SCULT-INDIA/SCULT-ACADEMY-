import { Check } from "lucide-react";
import { enterpriseFeatures, stats } from "@/lib/content";
import { bookingHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { ReadinessPanel } from "./readiness-panel";

export function Enterprise() {
  return (
    <section id="enterprise" aria-labelledby="enterprise-title" className="px-3 py-4 sm:px-5">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.5rem] bg-night text-cream">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="bg-dots-dark mask-radial absolute inset-0 opacity-80" />
          <div className="absolute -top-40 -right-32 size-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(234_101_38/0.32),transparent)] blur-2xl" />
          <div className="absolute -bottom-48 -left-40 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(246_194_68/0.16),transparent)] blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          {/* Stats */}
          <dl className="grid grid-cols-2 gap-y-12 border-b border-night-line pb-16 sm:pb-20 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "reveal flex flex-col-reverse justify-end gap-3 border-night-line px-4 sm:px-8",
                  i % 2 === 1 && "border-l",
                  i === 2 && "lg:border-l",
                  i % 2 === 0 && "pl-0 sm:pl-0",
                  i === 2 && "lg:pl-8",
                )}
              >
                <dt className="font-mono text-[0.68rem] tracking-[0.16em] text-cream-mute uppercase">{s.label}</dt>
                <dd className="font-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-none font-semibold tracking-[-0.045em]">
                  <CountUp value={s.value} suffix={s.suffix} className="text-cream" />
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-14 pt-16 sm:pt-24 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
            <div>
              <SectionHeading
                id="enterprise-title"
                tone="dark"
                size="md"
                eyebrow="Scult for Enterprise"
                title={
                  <>
                    Make your whole organisation <Accent className="text-ember-400">AI-fluent.</Accent>
                  </>
                }
                description="From boardroom literacy to engineering excellence — one partner to diagnose skills, design curricula, deliver training and prove the ROI."
              />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {enterpriseFeatures.map((f) => (
                  <li key={f.title} className="reveal">
                    <p className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-cream">
                      <span className="grid size-5 place-items-center rounded-full bg-ember-600 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {f.title}
                    </p>
                    <p className="mt-2 pl-7.5 text-[0.95rem] leading-relaxed text-cream-mute">{f.description}</p>
                  </li>
                ))}
              </ul>
              <div className="reveal mt-11 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={bookingHref("enterprise")} arrow size="lg">
                  Book a strategy call
                </ButtonLink>
                <ButtonLink href="#method" variant="ghost-dark" size="lg">
                  How we deliver
                </ButtonLink>
              </div>
            </div>

            <ReadinessPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

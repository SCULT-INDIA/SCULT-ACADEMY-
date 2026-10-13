import { methodSteps } from "@/lib/content";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { TimelineProgress } from "./timeline-progress";

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="method-title"
            size="md"
            eyebrow="The Scult method"
            title={
              <>
                Learn it. <span className="whitespace-nowrap">Build it.</span>{" "}
                <Accent className="text-ember-600">Prove it.</Accent>
              </>
            }
            description="Most courses stop at watching. Ours start there. Every program runs on a four-step loop designed to turn knowledge into shipped, provable skill."
          />
          <div className="reveal mt-9 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <ButtonLink href="#formats" arrow>
              Find your format
            </ButtonLink>
            <p className="text-sm text-ink-mute">Free skills diagnostic included.</p>
          </div>
        </div>

        <TimelineProgress>
          {methodSteps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.step} className="reveal relative grid grid-cols-[2.75rem_1fr] gap-4 pb-6 last:pb-0 sm:grid-cols-[3.5rem_1fr] sm:gap-7 sm:pb-10">
                <span className="relative z-10 grid size-11 place-items-center rounded-full border border-line bg-paper font-mono text-xs font-semibold text-ink shadow-[0_8px_20px_-14px_rgb(23_19_15/0.6)] sm:size-14 sm:text-sm">
                  {s.step}
                </span>
                <div className="group rounded-[1.5rem] border border-line bg-white p-5 transition-[border-color,box-shadow] duration-500 hover:border-ember-200 hover:shadow-[0_30px_60px_-36px_rgb(205_74_18/0.45)] sm:rounded-[1.75rem] sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-ink sm:text-[1.75rem]">{s.title}</h3>
                    <span className="grid size-11 place-items-center rounded-2xl bg-paper-2 text-ember-600 transition-colors duration-500 group-hover:bg-ember-600 group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <p className="mt-3 leading-relaxed text-ink-soft">{s.description}</p>
                </div>
              </li>
            );
          })}
        </TimelineProgress>
      </div>
    </section>
  );
}

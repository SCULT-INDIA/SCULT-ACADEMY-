import { Check, Sparkles } from "lucide-react";
import { formats } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

export function Formats() {
  return (
    <section
      id="formats"
      aria-labelledby="formats-title"
      className="relative border-y border-line bg-paper-2/60 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          id="formats-title"
          align="center"
          eyebrow="Ways to learn"
          title={
            <>
              Learn <Accent className="text-ember-600">your</Accent> way.
            </>
          }
          description="Move at your own pace, learn live alongside a cohort, or bring Scult to your entire organisation."
        />

        <div className="mt-16 grid items-stretch gap-4 lg:grid-cols-3">
          {formats.map((f) => (
            <div
              key={f.name}
              className={cn(
                "reveal relative flex flex-col rounded-[2rem] p-8 sm:p-9",
                f.featured
                  ? "matte bg-ember-600 text-white shadow-[0_40px_80px_-30px_rgb(205_74_18/0.65)] lg:-my-5 lg:py-12"
                  : "border border-line bg-white shadow-[0_20px_50px_-40px_rgb(23_19_15/0.45)]",
              )}
            >
              {f.featured && (
                <span className="absolute top-8 right-8 flex items-center gap-1.5 rounded-full bg-sun-400 px-3 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.12em] text-ink uppercase">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p
                className={cn(
                  "font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase",
                  f.featured ? "text-white/75" : "text-ember-700",
                )}
              >
                {f.kicker}
              </p>
              <h3 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em]">{f.name}</h3>
              <p className={cn("mt-3 leading-relaxed", f.featured ? "text-white/80" : "text-ink-soft")}>
                {f.description}
              </p>
              <ul className={cn("mt-8 space-y-3.5 border-t pt-8", f.featured ? "border-white/20" : "border-line")}>
                {f.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[0.95rem]">
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                        f.featured ? "bg-white text-ember-700" : "bg-ink text-cream",
                      )}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className={f.featured ? "text-white" : "text-ink-2"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <ButtonLink href={f.cta.href} variant={f.featured ? "cream" : "ink"} arrow className="w-full">
                  {f.cta.label}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

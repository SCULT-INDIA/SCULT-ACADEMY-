import { Quote } from "lucide-react";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarTones = [
  "from-sun-300 to-ember-500",
  "from-ember-400 to-ember-700",
  "from-ink-soft to-ink",
  "from-sun-200 to-sun-500",
];

export function Testimonials() {
  return (
    <section id="stories" aria-labelledby="stories-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          id="stories-title"
          align="center"
          eyebrow="Learner stories"
          title={
            <>
              Learners who made <Accent className="text-ember-600">the leap.</Accent>
            </>
          }
          description="Career switches, promotions, first internships and whole teams transformed — here's what building with Scult looks like."
        />

        <div className="mt-16 columns-1 gap-4 md:columns-2 lg:columns-3">
          {testimonials.map((t, i) => {
            const featured = i === 1;
            return (
              <figure
                key={t.name}
                className={cn(
                  "reveal mb-4 break-inside-avoid rounded-[1.75rem] border p-7 sm:p-8",
                  featured
                    ? "matte border-transparent bg-ember-600 text-white shadow-[0_30px_60px_-30px_rgb(205_74_18/0.7)]"
                    : "border-line bg-white shadow-[0_20px_50px_-40px_rgb(23_19_15/0.45)]",
                )}
              >
                <div className="flex items-center justify-between">
                  <Quote
                    aria-hidden="true"
                    className={cn("size-7", featured ? "fill-white/25 text-white/60" : "fill-ember-100 text-ember-500")}
                  />
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase",
                      featured ? "bg-white/15 text-white" : "bg-paper-2 text-ink-soft",
                    )}
                  >
                    {t.outcome}
                  </span>
                </div>
                <blockquote
                  className={cn(
                    "mt-5 leading-relaxed",
                    featured ? "font-display text-[1.45rem] leading-snug font-medium tracking-tight" : "text-[1.05rem] text-ink-2",
                  )}
                >
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-10 place-items-center rounded-full bg-linear-to-br font-display text-sm font-bold text-white",
                      featured ? "from-sun-300 to-sun-500 text-ink" : avatarTones[i % avatarTones.length],
                    )}
                  >
                    {initials(t.name)}
                  </span>
                  <span>
                    <span className={cn("block text-sm font-semibold", featured ? "text-white" : "text-ink")}>
                      {t.name}
                    </span>
                    <span className={cn("block text-sm", featured ? "text-white/75" : "text-ink-mute")}>{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

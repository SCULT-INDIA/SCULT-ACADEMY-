import { Sparkle } from "lucide-react";
import { techStack } from "@/lib/content";
import { cn } from "@/lib/utils";

const half = Math.ceil(techStack.length / 2);
const rows = [techStack.slice(0, half), techStack.slice(half)];

export function TechMarquee() {
  return (
    <section aria-labelledby="stack-title" className="relative border-y border-line bg-paper-2/60 py-14">
      <h2
        id="stack-title"
        className="px-5 text-center font-mono text-[0.7rem] font-medium tracking-[0.18em] text-ink-mute uppercase"
      >
        Master the stack shaping 2026 and beyond
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map((items, row) => (
          <div
            key={row}
            className="group mask-fade-x flex gap-3 overflow-hidden [--marquee-gap:0.75rem]"
            style={{ ["--marquee-duration" as string]: row === 0 ? "55s" : "65s" }}
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 || undefined}
                className={cn(
                  "flex min-w-full shrink-0 animate-marquee items-center justify-around gap-3 group-hover:[animation-play-state:paused]",
                  row === 1 && "[animation-direction:reverse]",
                )}
              >
                {items.map((tech) => (
                  <li
                    key={tech}
                    className="flex items-center gap-2.5 rounded-full border border-line bg-white/75 px-5 py-2.5 font-display text-[1.05rem] font-medium tracking-tight whitespace-nowrap text-ink-2 shadow-[0_4px_14px_-10px_rgb(23_19_15/0.35)]"
                  >
                    <Sparkle className="size-3.5 fill-ember-500 text-ember-500" />
                    {tech}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

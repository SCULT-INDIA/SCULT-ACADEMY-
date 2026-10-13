import type { ReactNode } from "react";
import { BadgeCheck, Check, Lock, Medal, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* A composed, illustrative preview of the learning experience. Purely
   presentational — announced to assistive tech as a single image. */

const pathSteps = [
  { title: "Python & data", state: "done" },
  { title: "ML foundations", state: "done" },
  { title: "LLMs & RAG", state: "active" },
  { title: "Agents & MLOps", state: "locked" },
] as const;

const bars = [34, 46, 41, 58, 64, 72, 90];

export function HeroStage() {
  return (
    <div
      role="img"
      aria-label="Preview of Scult Academy: a personalised learning path, a live coding class on AI agents, skill-growth analytics and a verified certificate."
      className="relative rounded-[2.25rem] border border-line bg-white/50 p-2 shadow-[0_40px_100px_-40px_rgb(120_50_10/0.45)] backdrop-blur sm:p-3"
    >
      {/* Floating chips — they straddle the frame edge so they never cover card content */}
      <Chip className="-top-5 left-[7%] [animation-delay:-1s]">Prompt engineering</Chip>
      <Chip className="-top-5 right-[8%] [animation-delay:-2s]">Computer vision</Chip>
      <Chip className="-bottom-5 left-[9%] [animation-delay:-3s]">RAG pipelines</Chip>
      <Chip className="-bottom-5 left-[36%] [animation-delay:-4s]">MLOps</Chip>

      <div className="matte relative overflow-hidden rounded-[1.75rem] bg-ember-500 p-3 sm:p-6 lg:p-8">
        <div aria-hidden="true" className="bg-dots-dark absolute inset-0 -z-10 opacity-50" />

        <div className="relative grid gap-3 sm:gap-4 md:grid-cols-12">
          {/* Learning path */}
          <div className="hidden rounded-[1.4rem] bg-paper p-5 text-left shadow-[0_20px_40px_-24px_rgb(60_20_0/0.6)] md:col-span-4 md:block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">Your path</span>
              <span className="rounded-full bg-ember-100 px-2 py-0.5 font-mono text-[0.62rem] font-semibold text-ember-700">
                68%
              </span>
            </div>
            <p className="mt-2 font-display text-xl font-semibold tracking-tight">AI Engineer</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-3">
              <div className="h-full w-[68%] rounded-full bg-ember-600" />
            </div>
            <ol className="mt-5 space-y-3.5">
              {pathSteps.map((step) => (
                <li key={step.title} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full",
                      step.state === "done" && "bg-ink text-cream",
                      step.state === "active" && "bg-ember-600 text-white",
                      step.state === "locked" && "border border-line-strong text-ink-mute",
                    )}
                  >
                    {step.state === "done" && <Check className="size-3.5" strokeWidth={3} />}
                    {step.state === "active" && <span className="size-2 animate-pulse-dot rounded-full bg-white" />}
                    {step.state === "locked" && <Lock className="size-3" />}
                  </span>
                  <span className={cn("font-medium", step.state === "locked" ? "text-ink-mute" : "text-ink")}>
                    {step.title}
                  </span>
                  {step.state === "active" && (
                    <span className="ml-auto font-mono text-[0.62rem] tracking-wider text-ember-700 uppercase">Now</span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Live class */}
          <div className="overflow-hidden rounded-[1.4rem] bg-night text-left text-cream shadow-[0_30px_60px_-24px_rgb(40_12_0/0.8)] md:col-span-8 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-night-line px-4 py-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-night-line" />
                <span className="size-2.5 rounded-full bg-night-line" />
                <span className="size-2.5 rounded-full bg-night-line" />
              </div>
              <span className="flex items-center gap-2 rounded-full bg-ember-600/20 px-2.5 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.16em] text-ember-300 uppercase">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-ember-400" />
                Live now
              </span>
            </div>
            <div className="px-5 pt-4">
              <p className="font-display text-lg font-semibold tracking-tight">Building production AI agents</p>
              <p className="mt-0.5 text-xs text-cream-mute">Session 12 · Agents &amp; Automation</p>
            </div>
            <pre className="mx-3 mt-4 overflow-hidden rounded-xl border border-night-line bg-night-2 p-4 font-mono text-[0.72rem] leading-[1.75] sm:text-[0.78rem]">
              <code>
                <Line n={1}>
                  <K>from</K> scult <K>import</K> Agent
                </Line>
                <Line n={2}> </Line>
                <Line n={3}>
                  agent = <F>Agent</F>(
                </Line>
                <Line n={4}>
                  {"    "}model=<S>&quot;frontier-llm&quot;</S>,
                </Line>
                <Line n={5}>
                  {"    "}tools=[search, sql, deploy],
                </Line>
                <Line n={6}>)</Line>
                <Line n={7}> </Line>
                <Line n={8}>
                  agent.<F>run</F>(<S>&quot;Ship the analytics MVP&quot;</S>)
                  <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-blink bg-ember-400" />
                </Line>
              </code>
            </pre>
            <div className="space-y-1.5 px-5 py-4 font-mono text-[0.68rem] text-cream-mute">
              <p>
                <span className="text-sun-400">✓</span> planned 6 steps
              </p>
              <p>
                <span className="text-sun-400">✓</span> queried warehouse · 1.2s
              </p>
              <p>
                <span className="text-ember-400">→</span> deploying preview…
              </p>
            </div>
          </div>

          {/* Analytics + credential */}
          <div className="hidden gap-3 sm:gap-4 lg:col-span-3 lg:grid">
            <div className="rounded-[1.4rem] bg-paper p-5 text-left shadow-[0_20px_40px_-24px_rgb(60_20_0/0.6)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">Skill score</span>
                <TrendingUp className="size-4 text-ember-600" />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                +38<span className="text-xl text-ink-mute">%</span>
              </p>
              <div className="mt-4 flex h-20 items-end gap-1.5">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%`, animationDelay: `${0.9 + i * 0.08}s` }}
                    className={cn(
                      "flex-1 origin-bottom animate-[grow_1s_var(--ease-out-expo)_both] rounded-md",
                      i === bars.length - 1 ? "bg-ember-600" : "bg-ember-200",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] bg-sun-400 p-5 text-left text-ink shadow-[0_20px_40px_-24px_rgb(60_20_0/0.6)]">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-ink text-sun-300">
                  <Medal className="size-4" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[0.6rem] font-semibold tracking-wider uppercase">
                  <BadgeCheck className="size-3" /> Verified
                </span>
              </div>
              <p className="mt-4 font-display text-lg leading-tight font-semibold tracking-tight">GenAI Practitioner</p>
              <p className="mt-1 font-mono text-[0.62rem] text-ink/60">ID · SC-2026-0481</p>
            </div>
          </div>
        </div>

      </div>

      {/* Mentor review toast */}
      <div className="absolute -bottom-7 right-[6%] z-10 hidden animate-float items-center gap-3 rounded-2xl border border-white/30 bg-white/85 py-2.5 pr-4 pl-2.5 text-left shadow-[0_20px_40px_-20px_rgb(40_12_0/0.7)] backdrop-blur-md xl:flex">
        <span className="grid size-9 place-items-center rounded-full bg-ink font-display text-xs font-bold text-sun-300">
          AK
        </span>
        <span>
          <span className="flex items-center gap-1 text-xs font-semibold text-ink">
            Mentor review <Sparkles className="size-3 text-ember-500" />
          </span>
          <span className="block text-xs text-ink-soft">Clean retrieval logic. Ship it.</span>
        </span>
      </div>
    </div>
  );
}

function Chip({ children, className }: { children: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute z-10 hidden animate-float items-center gap-2 rounded-full border border-line bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-[0_16px_30px_-16px_rgb(23_19_15/0.4)] backdrop-blur xl:inline-flex",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-ember-500" />
      {children}
    </span>
  );
}

function Line({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="block whitespace-pre">
      <span className="mr-4 inline-block w-3 text-right text-cream-mute/50 select-none">{n}</span>
      {children}
    </span>
  );
}

const K = ({ children }: { children: ReactNode }) => <span className="text-ember-400">{children}</span>;
const F = ({ children }: { children: ReactNode }) => <span className="text-sun-300">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-[#b9d98c]">{children}</span>;

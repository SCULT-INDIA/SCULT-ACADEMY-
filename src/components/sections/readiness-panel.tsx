"use client";

import { motion, type Variants } from "motion/react";
import { ArrowUpRight, Star, Users } from "lucide-react";

/* Illustrative enterprise analytics dashboard (sample data). */
const teams = [
  { name: "Engineering", value: 86 },
  { name: "Product", value: 71 },
  { name: "Data & Analytics", value: 78 },
  { name: "Marketing", value: 58 },
  { name: "Operations", value: 44 },
];

const ease = [0.16, 1, 0.3, 1] as const;

// Bars inherit the card's in-view state: a scaleX(0) element has no area of
// its own, so it can't reliably trigger an intersection observer.
const card: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const bar: Variants = {
  hidden: { scaleX: 0 },
  show: (i: number) => ({
    scaleX: teams[i].value / 100,
    transition: { duration: 1.3, delay: 0.35 + i * 0.1, ease },
  }),
};

export function ReadinessPanel() {
  return (
    <div
      role="img"
      aria-label="Sample enterprise dashboard showing AI readiness by team, enrolment and session ratings."
      className="relative"
    >
      <motion.div
        variants={card}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="rounded-[1.6rem] border border-night-line bg-night-2/90 p-5 shadow-[0_50px_100px_-40px_rgb(0_0_0/0.8)] backdrop-blur sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.16em] whitespace-nowrap text-cream-mute uppercase">
              Team AI readiness
            </p>
            <p className="mt-2 flex items-baseline gap-2 font-display text-5xl font-semibold tracking-[-0.04em] text-cream">
              72<span className="text-xl text-cream-mute">/100</span>
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-sun-400/15 px-3 py-1.5 font-mono text-[0.68rem] font-semibold whitespace-nowrap text-sun-300">
            <ArrowUpRight className="size-3.5" /> +18 pts this quarter
          </span>
        </div>

        <ul className="mt-8 space-y-4">
          {teams.map((t, i) => (
            <li key={t.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream">{t.name}</span>
                <span className="font-mono text-xs text-cream-mute">{t.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-night-3">
                <motion.div
                  variants={bar}
                  custom={i}
                  className={`h-full w-full origin-left rounded-full ${i === 0 ? "bg-sun-400" : "bg-ember-600"}`}
                />
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="matte rounded-[1.5rem] bg-ember-600 p-5 text-white"
        >
          <Users className="size-5 opacity-80" />
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight">312</p>
          <p className="text-sm text-white/75">Employees enrolled</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="rounded-[1.5rem] bg-sun-400 p-5 text-ink"
        >
          <Star className="size-5 fill-ink" />
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight">4.8</p>
          <p className="text-sm text-ink/70">Avg. session rating</p>
        </motion.div>
      </div>
    </div>
  );
}

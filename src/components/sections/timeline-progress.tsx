"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/** Ordered list with a vertical rail that fills as the reader scrolls through it. */
export function TimelineProgress({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.75rem] w-px -translate-x-1/2 bg-line-strong" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY }}
        className="absolute top-2 bottom-2 left-[1.75rem] w-[3px] origin-top -translate-x-1/2 rounded-full bg-linear-to-b from-sun-400 via-ember-500 to-ember-600"
      />
      {children}
    </ol>
  );
}

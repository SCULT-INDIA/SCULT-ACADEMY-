"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Renders the final value on the server (so crawlers and no-JS users see
 * the real number), then counts up from zero the first time it scrolls in.
 */
export function CountUp({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || started.current) return;
    if (!inView) {
      el.textContent = `0${suffix}`;
      return;
    }
    started.current = true;
    const controls = animate(0, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${format(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, suffix, value]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
      {suffix}
    </span>
  );
}

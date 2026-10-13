"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={cn(
          "relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border py-2 pr-2 pl-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
          scrolled || open
            ? "border-line bg-paper/80 shadow-[0_10px_40px_-16px_rgb(23_19_15/0.25)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <a href="#top" aria-label="Scult Academy — back to top" className="rounded-full">
          <Logo />
        </a>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[0.9rem] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#enterprise"
            className="hidden rounded-full px-3 py-2 text-[0.9rem] font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            For teams
          </a>
          <ButtonLink href="#programs" size="sm" arrow className="hidden sm:inline-flex">
            Start learning
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full border border-line bg-white/70 text-ink transition-colors hover:bg-white lg:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 top-[4.75rem] origin-top rounded-[1.75rem] border border-line bg-paper/95 p-3 shadow-[0_30px_60px_-20px_rgb(23_19_15/0.35)] backdrop-blur-xl sm:inset-x-5 lg:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-medium tracking-tight text-ink transition-colors hover:bg-ink/5"
                  >
                    {link.label}
                    <span className="font-mono text-xs text-ink-mute">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 border-t border-line p-2 pt-4 sm:grid-cols-2">
              <ButtonLink href="#programs" arrow onClick={() => setOpen(false)}>
                Start learning
              </ButtonLink>
              <ButtonLink href="#enterprise" variant="outline" onClick={() => setOpen(false)}>
                For teams
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

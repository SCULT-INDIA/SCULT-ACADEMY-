import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { AppIcon, LogoMark } from "@/components/ui/logo";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Brand assets",
  description: "The Scult Academy logo in every size and placement, with SVG and PNG downloads.",
  alternates: { canonical: "/brand" },
};

const SVG = "/brand/svg/scult-academy-";
const PNG = "/brand/png/scult-academy-";

const sizes = [16, 24, 32, 48, 64, 96, 128];

const downloads = [
  { group: "Mark", files: ["mark.svg", "mark-square.svg", "mark-small.svg"], base: SVG },
  { group: "Lockups", files: ["logo-horizontal.svg", "logo-horizontal-on-dark.svg", "logo-stacked.svg", "logo-stacked-on-dark.svg"], base: SVG },
  { group: "App icons", files: ["app-icon.svg", "app-icon-dark.svg"], base: SVG },
  {
    group: "PNG — mark",
    files: [16, 32, 48, 64, 128, 256, 512, 1024].map((s) => `mark-${s}.png`),
    base: PNG,
  },
  {
    group: "PNG — app icon",
    files: ["app-icon-180.png", "app-icon-192.png", "app-icon-512.png", "app-icon-dark-192.png", "app-icon-dark-512.png"],
    base: PNG,
  },
];

export default function BrandPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-6xl px-5">
          <header className="max-w-3xl">
            <Eyebrow>Brand assets</Eyebrow>
            <h1 className="mt-7 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-ink">
              The Scult <Accent className="text-ember-600">mark.</Accent>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              Four petals turning around a shared centre to form an “S” — momentum, growth and many disciplines moving
              as one. The mark always appears in its original orange; only its size and placement change.
            </p>
          </header>

          {/* Hero mark with clear-space guide */}
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <Tile className="min-h-[22rem] sm:min-h-[26rem]" label="Primary mark">
              <div className="relative p-6 sm:p-10">
                <div aria-hidden="true" className="absolute inset-0 rounded-3xl border-2 border-dashed border-ember-200" />
                <LogoMark title="Scult Academy mark" className="relative h-44 sm:h-64" />
              </div>
            </Tile>
            <div className="grid gap-4">
              <Tile label="Clear space" className="items-start justify-start p-8 text-left">
                <p className="max-w-xs text-[0.95rem] leading-relaxed text-ink-soft">
                  Keep space equal to <strong className="text-ink">one quarter of the mark’s height</strong> on every
                  side. Nothing — text, edges or imagery — enters that zone.
                </p>
              </Tile>
              <Tile label="Minimum size" className="items-start justify-start p-8 text-left">
                <p className="max-w-xs text-[0.95rem] leading-relaxed text-ink-soft">
                  <strong className="text-ink">16px</strong> on screen, <strong className="text-ink">8mm</strong> in
                  print. Below 48px use the small-size cut, which opens the gaps between petals so they stay crisp.
                </p>
              </Tile>
            </div>
          </div>

          {/* Placements */}
          <Section title="Placements" lead="Horizontal for navigation and headers, stacked for centred and square layouts.">
            <div className="grid gap-4 md:grid-cols-2">
              <Tile label="Horizontal · light" className="min-h-60">
                <Lockup />
              </Tile>
              <Tile label="Horizontal · dark" dark className="min-h-60">
                <Lockup dark />
              </Tile>
              <Tile label="Stacked · light" className="min-h-80">
                <Lockup stacked />
              </Tile>
              <Tile label="Stacked · dark" dark className="min-h-80">
                <Lockup stacked dark />
              </Tile>
            </div>
          </Section>

          {/* App icons */}
          <Section title="App icons & avatars" lead="The mark centred on a rounded tile for app stores, social avatars and favicons.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Tile label="Light tile" className="min-h-72 bg-paper-2">
                <div className="flex items-end gap-4 sm:gap-6">
                  <AppIcon className="size-24 drop-shadow-[0_20px_30px_rgb(23_19_15/0.18)] sm:size-32" />
                  <AppIcon className="size-16 sm:size-20" />
                  <AppIcon className="size-10 sm:size-12" />
                </div>
              </Tile>
              <Tile label="Dark tile" className="min-h-72 bg-paper-2">
                <div className="flex items-end gap-4 sm:gap-6">
                  <AppIcon tone="dark" className="size-24 drop-shadow-[0_20px_30px_rgb(23_19_15/0.3)] sm:size-32" />
                  <AppIcon tone="dark" className="size-16 sm:size-20" />
                  <AppIcon tone="dark" className="size-10 sm:size-12" />
                </div>
              </Tile>
            </div>
          </Section>

          {/* Sizes */}
          <Section title="Size ladder" lead="Rendered at actual pixel sizes. 16–48px use the small-size cut.">
            <div className="flex flex-wrap items-end gap-x-7 gap-y-8 rounded-[2rem] border border-line bg-white p-6 sm:gap-x-10 sm:p-12">
              {sizes.map((s) => (
                <figure key={s} className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- previews the exact asset at its real size */}
                  <img src={`${SVG}${s <= 48 ? "mark-small" : "mark-square"}.svg`} alt="" width={s} height={s} />

                  <figcaption className="font-mono text-xs text-ink-mute">{s}px</figcaption>
                </figure>
              ))}
            </div>
          </Section>

          {/* Downloads */}
          <Section title="Downloads" lead="Vector files for print and design tools, PNGs for everything else.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {downloads.map((d) => (
                <div key={d.group} className="rounded-[1.75rem] border border-line bg-white p-6">
                  <p className="font-mono text-[0.65rem] tracking-[0.16em] text-ink-mute uppercase">{d.group}</p>
                  <ul className="mt-4 space-y-1">
                    {d.files.map((f) => (
                      <li key={f}>
                        <a
                          href={`${d.base}${f}`}
                          download
                          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2"
                        >
                          {f}
                          <Download className="size-4 text-ember-600 transition-transform group-hover:translate-y-0.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="mt-20">
      <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h2>
      <p className="mt-2 text-ink-soft">{lead}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Tile({
  label,
  dark,
  className,
  children,
}: {
  label: string;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-6 pt-12 sm:p-8 sm:pt-12",
        dark ? "border-night-line bg-night" : "border-line bg-white",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-5 left-6 font-mono text-[0.62rem] tracking-[0.16em] uppercase",
          dark ? "text-cream-mute" : "text-ink-mute",
        )}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Lockup({ stacked, dark }: { stacked?: boolean; dark?: boolean }) {
  return (
    <div className={cn("flex items-center", stacked ? "flex-col gap-5" : "gap-3 sm:gap-4")}>
      <LogoMark className={stacked ? "h-20 sm:h-24" : "h-10 sm:h-14"} />
      <span className={cn("flex leading-none", stacked ? "flex-col items-center gap-2.5" : "items-baseline gap-2.5")}>
        <span
          className={cn(
            "font-display font-bold tracking-[-0.045em]",
            stacked ? "text-5xl sm:text-6xl" : "text-[2.4rem] sm:text-5xl",
            dark ? "text-cream" : "text-ink",
          )}
        >
          Scult
        </span>
        <span
          className={cn(
            "font-mono font-medium tracking-[0.22em] uppercase",
            stacked ? "text-sm sm:text-base" : "text-[0.7rem] sm:text-sm",
            dark ? "text-cream-mute" : "text-ink-mute",
          )}
        >
          Academy
        </span>
      </span>
    </div>
  );
}

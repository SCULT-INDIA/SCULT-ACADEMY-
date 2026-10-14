import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Award, FileText, LogOut, MonitorUp, PenTool, Presentation } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { requireTeam } from "@/lib/server/auth";
import { listDecks } from "@/lib/server/decks";
import { LogoMark } from "@/components/ui/logo";
import { LocalPdfPicker } from "@/components/stage/local-deck";
import { logout } from "../login/actions";

export const metadata = { title: "Decks" };

export default function StageHome() {
  return (
    <main id="main" className="mx-auto min-h-dvh max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10" />
          <div>
            <p className="font-display text-xl leading-tight font-semibold tracking-tight">Scult Stage</p>
            <p className="font-mono text-[0.62rem] tracking-[0.16em] text-cream-mute uppercase">Workshop presenter</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/admin" className="btn btn-ghost-dark h-11 px-4 text-sm">
            <Award className="size-4" /> Certificates
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost-dark h-11 px-4 text-sm">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </nav>
      </header>

      <section className="mt-12">
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1] font-semibold tracking-[-0.04em]">
          Pick a deck. <span className="font-serif font-normal text-ember-400 italic">Teach it live.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-cream-mute">
          Decks come from the content repo. Draw with any pen tablet, open the audience screen on your projector, and press{" "}
          <kbd className="rounded-md border border-night-line bg-night-2 px-1.5 py-0.5 font-mono text-xs">?</kbd> inside a deck for shortcuts and
          XP-Pen setup.
        </p>
      </section>

      <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-[1.75rem] bg-night-2" />}>
        <DeckGrid />
      </Suspense>

      <ul className="mt-12 grid gap-3 text-sm text-cream-mute sm:grid-cols-3">
        {[
          { icon: PenTool, text: "Pressure-sensitive ink with XP-Pen, Wacom, Apple Pencil and touch boards." },
          { icon: MonitorUp, text: "Open screen puts the audience view on your projector; ink and laser mirror live." },
          { icon: Presentation, text: "Present (F) goes fullscreen on one screen when you mirror your display." },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 rounded-2xl border border-night-line p-4">
            <Icon className="size-5 shrink-0 text-ember-400" />
            {text}
          </li>
        ))}
      </ul>
    </main>
  );
}

async function DeckGrid() {
  await requireTeam("/stage");
  let decks: Awaited<ReturnType<typeof listDecks>> = [];
  let problem: string | null = null;
  try {
    decks = await listDecks();
  } catch (error) {
    unstable_rethrow(error);
    problem = error instanceof Error ? error.message : "Content is unavailable.";
  }

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((d) => (
        <article
          key={d.slug}
          className="flex flex-col rounded-[1.75rem] border border-night-line bg-night-2 p-6 transition-colors hover:border-ember-600/60 sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-night-3 text-ember-400">
              {d.kind === "pdf" ? <FileText className="size-5" /> : <Presentation className="size-5" />}
            </span>
            <span className="rounded-full border border-night-line px-3 py-1 font-mono text-[0.62rem] tracking-[0.12em] text-cream-mute uppercase">
              {d.kind === "pdf" ? "PDF" : `${d.slideCount} slides`}
            </span>
          </div>
          <h2 className="mt-5 font-display text-2xl leading-tight font-semibold tracking-tight">{d.title}</h2>
          {d.subtitle && <p className="mt-1.5 text-cream-mute">{d.subtitle}</p>}
          {d.event && <p className="mt-3 font-mono text-[0.65rem] tracking-[0.12em] text-ember-300 uppercase">{d.event}</p>}
          <div className="mt-auto flex flex-wrap gap-2 pt-7">
            <Link href={`/stage/${d.slug}`} className="btn btn-matte h-11 px-5 text-sm">
              Present <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      ))}
      <LocalPdfPicker />
      {problem && (
        <p className="rounded-[1.75rem] border border-ember-600/50 bg-ember-600/10 p-6 text-sm text-ember-200 md:col-span-2 lg:col-span-3">
          Couldn&apos;t load decks from the content repo: {problem}
        </p>
      )}
    </div>
  );
}

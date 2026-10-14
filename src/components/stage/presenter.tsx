"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CircleHelp, Clock3, Maximize, MonitorUp, Pause, Play, RotateCcw } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { type ClientDeck, useSlideSource } from "./deck-client";
import { HelpDialog } from "./help-dialog";
import { ImmersiveView, useFullscreen } from "./immersive";
import { useStageShortcuts } from "./shortcuts";
import { SlideStage, slideCount, slideKey } from "./slide-view";
import { StageToolbar, ToolButton } from "./toolbar";
import { useStage } from "./use-stage";

function useTimer() {
  const [running, setRunning] = useState(false);
  const [base, setBase] = useState(0); // ms accumulated before the current run
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed = base + (running && startedAt ? Math.max(0, now - startedAt) : 0);
  return {
    running,
    elapsed,
    toggle: () => {
      const t = Date.now();
      if (running) {
        setBase(elapsed);
        setStartedAt(null);
        setRunning(false);
      } else {
        setStartedAt(t);
        setNow(t);
        setRunning(true);
      }
    },
    reset: () => {
      setBase(0);
      setStartedAt(running ? Date.now() : null);
      setNow(Date.now());
    },
  };
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

/** Opens the audience window — on a second display when the browser allows it. */
async function openAudienceScreen(href: string) {
  let features = "popup,width=1280,height=720";
  try {
    const w = window as Window & {
      getScreenDetails?: () => Promise<{ screens: ScreenLike[]; currentScreen: ScreenLike }>;
    };
    type ScreenLike = { availLeft: number; availTop: number; availWidth: number; availHeight: number; isPrimary?: boolean };
    if (w.getScreenDetails) {
      const details = await w.getScreenDetails();
      const other = details.screens.find((s) => s !== details.currentScreen);
      if (other) features = `popup,left=${other.availLeft},top=${other.availTop},width=${other.availWidth},height=${other.availHeight}`;
    }
  } catch {
    /* permission denied — fall back to a normal popup the presenter can drag */
  }
  window.open(href, "scult-stage-screen", features);
}

export function Presenter({ deck, screenHref, backHref }: { deck: ClientDeck; screenHref: string; backHref: string }) {
  const { source, error, ready } = useSlideSource(deck);
  const total = Math.max(1, slideCount(source));
  const stage = useStage({ deckKey: deck.key, count: total, role: "presenter" });
  const index = Math.min(stage.index, total - 1);
  const key = slideKey(source, index);
  const inkKey = stage.board ? `${key}#board` : key;
  const [help, setHelp] = useState(false);
  const timer = useTimer();
  const fs = useFullscreen();

  useStageShortcuts(stage, key, {
    onFullscreen: fs.toggle,
    onHelp: () => setHelp(true),
    onTimer: (reset) => (reset ? timer.reset() : timer.toggle()),
  });

  const notes = deck.notes[index]?.trim();
  const hasNext = index < total - 1;

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">This deck couldn&apos;t be opened.</p>
          <p className="mt-2 text-cream-mute">{error}</p>
          <Link href={backHref} className="btn btn-matte mt-6 h-12 px-6">
            Back to decks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-night">
      {fs.active ? (
        <ImmersiveView
          stage={stage}
          source={source}
          index={index}
          total={total}
          inkKey={inkKey}
          fullscreen
          onToggleFullscreen={fs.toggle}
        />
      ) : (
        <div className="flex min-h-dvh flex-col lg:h-dvh">
          {/* Top bar */}
          <header className="flex flex-wrap items-center gap-3 border-b border-night-line px-3 py-2.5 sm:px-5">
            <Link
              href={backHref}
              className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm text-cream-mute transition-colors hover:bg-night-2 hover:text-cream"
            >
              <ChevronLeft className="size-4" /> Decks
            </Link>
            <LogoMark className="h-7" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">{deck.title}</p>
              {deck.event && <p className="truncate font-mono text-[0.62rem] tracking-[0.12em] text-cream-mute uppercase">{deck.event}</p>}
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-night-line bg-night-2 p-1">
              <span className="flex items-center gap-2 px-3 font-mono text-lg tabular-nums" aria-live="off">
                <Clock3 className={cn("size-4", timer.running ? "text-ember-400" : "text-cream-mute")} />
                {fmt(timer.elapsed)}
              </span>
              <ToolButton label={timer.running ? "Pause timer" : "Start timer"} shortcut="T" onClick={timer.toggle}>
                {timer.running ? <Pause className="size-4" /> : <Play className="size-4" />}
              </ToolButton>
              <ToolButton label="Reset timer" shortcut="Shift T" onClick={timer.reset}>
                <RotateCcw className="size-4" />
              </ToolButton>
            </div>
            <span className="hidden px-2 font-mono text-sm text-cream-mute md:inline">
              <Clock />
            </span>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => openAudienceScreen(screenHref)} className="btn btn-ghost-dark h-11 px-4 text-sm">
                <MonitorUp className="size-4" /> Open screen
              </button>
              <button type="button" onClick={fs.toggle} className="btn btn-matte h-11 px-4 text-sm">
                <Maximize className="size-4" /> Present
              </button>
              <ToolButton label="Shortcuts & pen setup" shortcut="?" onClick={() => setHelp(true)}>
                <CircleHelp className="size-5" />
              </ToolButton>
            </div>
          </header>

          {/* Main */}
          <main id="main" className="grid min-h-0 flex-1 gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="flex min-h-0 flex-col gap-3">
              {/* Tablets & phones: full-width 16:9 and the page scrolls. Laptops: fill the height. */}
              <div className="aspect-video w-full rounded-2xl lg:aspect-auto lg:min-h-[14rem] lg:flex-1">
                {ready ? (
                  <SlideStage stage={stage} source={source} index={index} interactive overlays className="rounded-2xl" />
                ) : (
                  <div className="grid h-full place-items-center rounded-2xl bg-night-2 text-cream-mute">Loading slides…</div>
                )}
              </div>
              <div className="flex justify-center">
                <StageToolbar stage={stage} index={index} total={total} inkKey={inkKey} />
              </div>
            </div>

            <aside className="flex min-h-0 flex-col gap-3">
              <section className="rounded-2xl border border-night-line bg-night-2 p-3">
                <p className="mb-2 px-1 font-mono text-[0.62rem] tracking-[0.16em] text-cream-mute uppercase">
                  {hasNext ? `Next · ${index + 2}` : "End of deck"}
                </p>
                <div className="aspect-video overflow-hidden rounded-xl">
                  {hasNext && ready ? (
                    <SlideStage stage={stage} source={source} index={index + 1} className="rounded-xl" />
                  ) : (
                    <div className="grid h-full place-items-center bg-night text-sm text-cream-mute">That&apos;s the last slide</div>
                  )}
                </div>
              </section>
              <section className="flex min-h-[10rem] flex-1 flex-col rounded-2xl border border-night-line bg-night-2">
                <p className="border-b border-night-line px-4 py-3 font-mono text-[0.62rem] tracking-[0.16em] text-cream-mute uppercase">
                  Speaker notes
                </p>
                <div className="flex-1 overflow-y-auto px-4 py-4 text-[1.05rem] leading-relaxed whitespace-pre-wrap text-cream">
                  {notes || <span className="text-cream-mute">No notes for this slide.</span>}
                </div>
              </section>
            </aside>
          </main>

          {/* Thumbnails */}
          {ready && total > 1 && (
            <nav aria-label="Slides" className="border-t border-night-line px-3 py-2.5 sm:px-4">
              <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {Array.from({ length: total }, (_, i) => (
                  <li key={i} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => stage.goto(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "relative block h-[4.5rem] w-32 overflow-hidden rounded-lg border-2 transition-colors",
                        i === index ? "border-ember-500" : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <SlideStage source={source} index={i} className="pointer-events-none" />
                      <span className="absolute bottom-1 left-1.5 rounded bg-black/60 px-1 font-mono text-[0.6rem] text-white">{i + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      )}
      <HelpDialog open={help} onClose={() => setHelp(false)} />
    </div>
  );
}

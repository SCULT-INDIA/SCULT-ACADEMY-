"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CircleHelp, Clock3, Maximize, MonitorUp, NotebookPen, Pause, Play, RotateCcw } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { type ClientDeck, useSlideSource } from "./deck-client";
import { HelpDialog } from "./help-dialog";
import { ImmersiveView, useFullscreen } from "./immersive";
import { useStageShortcuts } from "./shortcuts";
import { SlideStage, useSlideKeys } from "./slide-view";
import { DrawTools, keepFocus, ScreenTools, ToolButton } from "./toolbar";
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

type ScreenLike = { availLeft: number; availTop: number; availWidth: number; availHeight: number };

/**
 * Opens the audience window, then moves it to a second display when the browser
 * allows. The window opens first, inside the click: waiting on the screen
 * permission prompt would lose the click and pop-up blockers would stop it.
 */
function openAudienceScreen(href: string) {
  const win = window.open(href, "scult-stage-screen", "popup,width=1280,height=720");
  if (!win) return false;
  const w = window as Window & { getScreenDetails?: () => Promise<{ screens: ScreenLike[]; currentScreen: ScreenLike }> };
  w.getScreenDetails?.()
    .then((details) => {
      const other = details.screens.find((s) => s !== details.currentScreen);
      if (!other || win.closed) return;
      win.moveTo(other.availLeft, other.availTop);
      win.resizeTo(other.availWidth, other.availHeight);
    })
    .catch(() => {
      /* permission denied — the presenter can drag the window across */
    });
  return true;
}

export function Presenter({ deck, screenHref, backHref }: { deck: ClientDeck; screenHref: string; backHref: string }) {
  const { source, error, ready } = useSlideSource(deck);
  const slideKeys = useSlideKeys(source);
  const stage = useStage({ deckKey: deck.key, slideKeys, role: "presenter" });
  const { page, pages } = stage;
  const index = Math.min(stage.index, Math.max(0, pages.length - 1));
  const [help, setHelp] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const timer = useTimer();
  const fs = useFullscreen();
  const currentThumb = useRef<HTMLButtonElement>(null);

  useStageShortcuts(stage, page.key, {
    onFullscreen: fs.toggle,
    onHelp: () => setHelp(true),
    onTimer: (reset) => (reset ? timer.reset() : timer.toggle()),
  });

  useEffect(() => {
    document.title = `${deck.title} · Scult Stage`;
  }, [deck.title]);

  // Keep the page on screen visible in the thumbnail strip (new notes slides included).
  useEffect(() => {
    currentThumb.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index, pages.length]);

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
        <ImmersiveView stage={stage} source={source} page={page} fullscreen onToggleFullscreen={fs.toggle} />
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
              {popupBlocked && (
                <span role="status" className="max-w-48 text-xs leading-snug text-ember-300">
                  Pop-up blocked. Allow pop-ups for this site, then try again.
                </span>
              )}
              <button
                type="button"
                onMouseDown={keepFocus}
                onClick={() => setPopupBlocked(!openAudienceScreen(screenHref))}
                className="btn btn-ghost-dark h-11 px-4 text-sm"
              >
                <MonitorUp className="size-4" /> Open screen
              </button>
              <button type="button" onMouseDown={keepFocus} onClick={fs.toggle} className="btn btn-matte h-11 px-4 text-sm">
                <Maximize className="size-4" /> Present
              </button>
              <ToolButton label="Shortcuts & pen setup" shortcut="?" onClick={() => setHelp(true)}>
                <CircleHelp className="size-5" />
              </ToolButton>
            </div>
          </header>

          {/* Main: the slide, with the slide tools in a column beside it on laptops */}
          <main id="main" className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
            <div className="flex min-h-0 gap-3 lg:min-h-[14rem] lg:flex-1">
              <div className="aspect-video w-full min-w-0 rounded-2xl lg:aspect-auto lg:h-full lg:flex-1">
                {ready ? (
                  <SlideStage stage={stage} source={source} page={page} interactive overlays className="rounded-2xl" />
                ) : (
                  <div className="grid h-full place-items-center rounded-2xl bg-night-2 text-cream-mute">Loading slides…</div>
                )}
              </div>
              <ScreenTools stage={stage} page={page} vertical className="hidden self-center lg:flex" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <DrawTools stage={stage} />
              <ScreenTools stage={stage} page={page} className="lg:hidden" />
            </div>
          </main>

          {/* Thumbnails: every slide, each followed by its notes slides */}
          {ready && pages.length > 1 && (
            <nav aria-label="Slides" className="border-t border-night-line px-3 py-2.5 sm:px-4">
              <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {pages.map((p, i) => (
                  <li key={p.key} className="shrink-0">
                    <button
                      ref={i === index ? currentThumb : undefined}
                      type="button"
                      onMouseDown={keepFocus}
                      onClick={() => stage.goto(i)}
                      aria-label={p.kind === "note" ? `Go to the notes slide after slide ${slideKeys.indexOf(p.after) + 1}` : `Go to slide ${p.slide + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "relative block h-[4.5rem] w-32 overflow-hidden rounded-lg border-2 transition-colors",
                        i === index ? "border-ember-500" : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      {/* Thumbnails show each page's ink, so annotated slides are easy to find. */}
                      <SlideStage stage={stage} source={source} page={p} className="pointer-events-none" />
                      <span className="absolute bottom-1 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1 font-mono text-[0.6rem] text-white">
                        {p.kind === "note" ? (
                          <>
                            <NotebookPen className="size-2.5" /> Notes
                          </>
                        ) : (
                          p.slide + 1
                        )}
                      </span>
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

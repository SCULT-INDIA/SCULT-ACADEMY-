"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlideStage, type SlideSource } from "./slide-view";
import { StageToolbar, ToolButton } from "./toolbar";
import type { Page, StageApi } from "./use-stage";

/** Toggles page fullscreen; tracks state across Esc / F11. */
export function useFullscreen() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      /* fullscreen can be refused (iframe, no user gesture) — the view still works windowed */
    }
  };
  return { active, toggle };
}

/**
 * Edge-to-edge slide with an auto-hiding toolbar. Used by the audience
 * screen and by the presenter's single-screen "Present" mode.
 */
export function ImmersiveView({
  stage,
  source,
  page,
  fullscreen,
  onToggleFullscreen,
  extraTools,
  overlay,
}: {
  stage: StageApi;
  source: SlideSource;
  page: Page;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  extraTools?: ReactNode;
  overlay?: ReactNode;
}) {
  const [chrome, setChrome] = useState(true);
  const hideTimer = useRef(0);
  const overToolbar = useRef(false);

  const wake = () => {
    setChrome(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => !overToolbar.current && setChrome(false), 2600);
  };
  useEffect(() => {
    hideTimer.current = window.setTimeout(() => !overToolbar.current && setChrome(false), 2600);
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black" onPointerMove={wake} onPointerDown={wake}>
      <SlideStage stage={stage} source={source} page={page} interactive overlays className="h-full w-full" />
      {overlay}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 transition-[opacity,transform] duration-500 sm:p-5",
          chrome ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <div
          className="pointer-events-auto max-w-full"
          onPointerEnter={() => (overToolbar.current = true)}
          onPointerLeave={() => (overToolbar.current = false)}
        >
          <StageToolbar
            stage={stage}
            page={page}
            end={
              <>
                {extraTools}
                <ToolButton label={fullscreen ? "Exit fullscreen" : "Fullscreen"} shortcut="F" onClick={onToggleFullscreen}>
                  {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
                </ToolButton>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

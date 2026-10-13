"use client";

import { useSyncExternalStore } from "react";

/* Current time as a client-only external store: `null` while rendering on
   the server (keeps prerendering deterministic), then refreshed each minute. */
let now: number | null = null;

function subscribe(onChange: () => void) {
  const id = window.setInterval(() => {
    now = Date.now();
    onChange();
  }, 60_000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  if (now === null) now = Date.now();
  return now;
}

function getServerSnapshot() {
  return null;
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

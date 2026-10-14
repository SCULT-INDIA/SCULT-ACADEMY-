"use client";

import { useState } from "react";
import { Maximize } from "lucide-react";
import { type ClientDeck, useSlideSource } from "./deck-client";
import { HelpDialog } from "./help-dialog";
import { ImmersiveView, useFullscreen } from "./immersive";
import { useStageShortcuts } from "./shortcuts";
import { slideCount, slideKey } from "./slide-view";
import { useStage } from "./use-stage";

/** The projector window: slides, ink and laser, mirrored from the presenter. */
export function AudienceScreen({ deck }: { deck: ClientDeck }) {
  const { source, error, ready } = useSlideSource(deck);
  const total = Math.max(1, slideCount(source));
  const stage = useStage({ deckKey: deck.key, count: total, role: "screen" });
  const index = Math.min(stage.index, total - 1);
  const key = slideKey(source, index);
  const inkKey = stage.board ? `${key}#board` : key;
  const fs = useFullscreen();
  const [help, setHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const showPrompt = !dismissed && !fs.active;

  useStageShortcuts(stage, key, { onFullscreen: fs.toggle, onHelp: () => setHelp(true) });

  if (error) return <p className="grid h-dvh place-items-center text-cream-mute">{error}</p>;
  if (!ready) return <div className="grid h-dvh place-items-center bg-black text-cream-mute">Loading slides…</div>;

  return (
    <div>
      <ImmersiveView
        stage={stage}
        source={source}
        index={index}
        total={total}
        inkKey={inkKey}
        fullscreen={fs.active}
        onToggleFullscreen={fs.toggle}
        overlay={
          showPrompt ? (
            <div className="absolute inset-x-0 top-0 flex justify-center p-4">
              <button
                type="button"
                onClick={() => {
                  fs.toggle();
                  setDismissed(true);
                }}
                className="btn btn-matte h-12 px-6 text-sm shadow-2xl"
              >
                <Maximize className="size-4" /> Go fullscreen on this display
              </button>
            </div>
          ) : null
        }
      />
      <HelpDialog open={help} onClose={() => setHelp(false)} />
    </div>
  );
}

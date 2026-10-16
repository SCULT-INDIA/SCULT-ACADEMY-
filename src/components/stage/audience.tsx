"use client";

import { useState } from "react";
import { Maximize } from "lucide-react";
import { type ClientDeck, useSlideSource } from "./deck-client";
import { HelpDialog } from "./help-dialog";
import { ImmersiveView, useFullscreen } from "./immersive";
import { useStageShortcuts } from "./shortcuts";
import { useSlideKeys } from "./slide-view";
import { useStage } from "./use-stage";

/** The projector window: slides, notes slides, ink and laser, mirrored from the presenter. */
export function AudienceScreen({ deck }: { deck: ClientDeck }) {
  const { source, error, ready } = useSlideSource(deck);
  const slideKeys = useSlideKeys(source);
  const stage = useStage({ deckKey: deck.key, slideKeys, role: "screen" });
  const fs = useFullscreen();
  const [help, setHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const showPrompt = !dismissed && !fs.active;

  useStageShortcuts(stage, stage.page.key, { onFullscreen: fs.toggle, onHelp: () => setHelp(true) });

  if (error) return <p className="grid h-dvh place-items-center text-cream-mute">{error}</p>;
  if (!ready) return <div className="grid h-dvh place-items-center bg-black text-cream-mute">Loading slides…</div>;

  return (
    <div>
      <ImmersiveView
        stage={stage}
        source={source}
        page={stage.page}
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

import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { requireTeam } from "@/lib/server/auth";
import { LogoMark } from "@/components/ui/logo";
import "./stage.css";

export const metadata: Metadata = {
  title: { default: "Scult Stage", template: "%s · Scult Stage" },
  robots: { index: false, follow: false },
};

export default function StageLayout({ children }: { children: ReactNode }) {
  return (
    <div data-no-grain className="min-h-dvh bg-night text-cream">
      <Suspense fallback={<StageLoading />}>
        <TeamGate>{children}</TeamGate>
      </Suspense>
    </div>
  );
}

async function TeamGate({ children }: { children: ReactNode }) {
  await requireTeam();
  return children;
}

function StageLoading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LogoMark className="h-10 animate-pulse" />
    </div>
  );
}

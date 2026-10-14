import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Team login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main
      id="main"
      data-no-grain
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-night px-4 py-16 text-cream"
    >
      <div aria-hidden="true" className="bg-dots-dark mask-radial pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-night-line bg-night-2/90 p-8 shadow-[0_50px_120px_-40px_rgb(0_0_0/0.9)] backdrop-blur sm:p-10">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10" />
          <div>
            <p className="font-display text-xl leading-tight font-semibold tracking-tight">Scult Stage</p>
            <p className="font-mono text-[0.62rem] tracking-[0.16em] text-cream-mute uppercase">Team access</p>
          </div>
        </div>
        <h1 className="mt-8 font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">
          Present, annotate and run your workshops.
        </h1>
        <p className="mt-3 text-cream-mute">For the Scult Academy team only. Enter the shared passcode to continue.</p>
        <Suspense fallback={<div className="mt-8 h-44" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-sm text-cream-mute">
          Looking for your certificate?{" "}
          <Link href="/certificates" className="font-semibold text-cream underline-offset-4 hover:underline">
            Get it here
          </Link>
        </p>
      </div>
    </main>
  );
}

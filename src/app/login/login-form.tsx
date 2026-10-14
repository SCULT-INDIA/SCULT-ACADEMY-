"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/stage";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="passcode" className="block text-sm font-semibold text-cream">
        Team passcode
      </label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-cream-mute" />
        <input
          id="passcode"
          name="passcode"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={!!state.error || undefined}
          aria-describedby={state.error ? "passcode-error" : undefined}
          className="h-14 w-full rounded-2xl border border-night-line bg-night-2 pr-14 pl-12 text-base text-cream transition-[border-color,box-shadow] placeholder:text-cream-mute/60 focus:border-ember-500 focus:ring-4 focus:ring-ember-600/25 focus:outline-none"
          placeholder="Enter passcode"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide passcode" : "Show passcode"}
          className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-cream-mute transition-colors hover:bg-night-3 hover:text-cream"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {state.error && (
        <p id="passcode-error" role="alert" className="text-sm font-medium text-ember-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-matte h-14 w-full text-base disabled:opacity-70">
        {pending ? "Checking…" : "Enter Scult Stage"}
        {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}

"use server";

import { redirect } from "next/navigation";
import { isTeamAuthConfigured } from "@/lib/server/env";
import { allow, clientKey } from "@/lib/server/rate-limit";
import { clearSessionCookie, passcodeMatches, setSessionCookie } from "@/lib/server/session";

export type LoginState = { error?: string };

/** Only allow same-site relative destinations after login. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/stage";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isTeamAuthConfigured()) {
    return { error: "Team access isn't configured on this server yet (STAGE_PASSCODE / AUTH_SECRET)." };
  }
  if (!allow(await clientKey("login"), 8, 10 * 60_000)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }
  const passcode = String(formData.get("passcode") ?? "");
  if (!passcodeMatches(passcode)) {
    return { error: "That passcode isn't right." };
  }
  await setSessionCookie();
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}

import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";
import { createSessionToken, SESSION_COOKIE, SESSION_HOURS } from "./session-token";

export { SESSION_COOKIE, verifySessionToken } from "./session-token";

export async function setSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Constant-time passcode comparison (hashing first equalises lengths). */
export function passcodeMatches(input: string) {
  if (!env.passcode) return false;
  const a = createHash("sha256").update(input.trim()).digest();
  const b = createHash("sha256").update(env.passcode).digest();
  return timingSafeEqual(a, b);
}

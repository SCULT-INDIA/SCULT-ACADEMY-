import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { env } from "./env";

/* Signed team-session tokens. Kept free of request APIs so the proxy
   can verify them too. The token holds no personal data — only a role. */

export const SESSION_COOKIE = "scult_team";
export const SESSION_HOURS = 12;

const key = () => new TextEncoder().encode(env.authSecret);

export async function createSessionToken() {
  return new SignJWT({ role: "team" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

/** True when the token is a valid, unexpired team session. */
export async function verifySessionToken(token: string | undefined) {
  if (!token || env.authSecret.length < 32) return false;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.role === "team";
  } catch {
    return false;
  }
}

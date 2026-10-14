import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** Whether the current request carries a valid team session. */
export async function hasTeamSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Guard for team-only pages, Server Actions and Route Handlers.
 * Call it close to the data: the proxy redirect is only a first line of defence.
 */
export async function requireTeam(next = "/stage") {
  if (!(await hasTeamSession())) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
}

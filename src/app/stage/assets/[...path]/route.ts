import { hasTeamSession } from "@/lib/server/auth";
import { contentDownloadUrl, contentFileSize, contentMime, readContentBytes } from "@/lib/server/content";

/** Vercel functions can't return a body over 4.5 MB; bigger files go straight to GitHub. */
const DIRECT_LIMIT = 4 * 1024 * 1024;

/** Deck images and PDFs from the private content repo — team only. */
export async function GET(_request: Request, ctx: RouteContext<"/stage/assets/[...path]">) {
  if (!(await hasTeamSession())) return new Response("Unauthorized", { status: 401 });

  const { path } = await ctx.params;
  const file = path.map(decodeURIComponent).join("/");
  if (!file.startsWith("decks/") || file.includes("..")) return new Response("Not found", { status: 404 });

  const size = await contentFileSize(file);
  if (size === null) return new Response("Not found", { status: 404 });
  if (size > DIRECT_LIMIT) {
    // A short-lived signed link from GitHub; only ever handed to a signed-in team member.
    const direct = await contentDownloadUrl(file);
    if (direct) return new Response(null, { status: 302, headers: { Location: direct, "Cache-Control": "private, no-store" } });
  }

  const bytes = await readContentBytes(file);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentMime(file),
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}

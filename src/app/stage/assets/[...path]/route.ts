import { hasTeamSession } from "@/lib/server/auth";
import { contentMime, readContentBytes } from "@/lib/server/content";

/** Deck images and PDFs from the private content repo — team only. */
export async function GET(_request: Request, ctx: RouteContext<"/stage/assets/[...path]">) {
  if (!(await hasTeamSession())) return new Response("Unauthorized", { status: 401 });

  const { path } = await ctx.params;
  const file = path.map(decodeURIComponent).join("/");
  if (!file.startsWith("decks/") || file.includes("..")) return new Response("Not found", { status: 404 });

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

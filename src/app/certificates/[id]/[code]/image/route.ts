import type { NextRequest } from "next/server";
import { certificateForDownload } from "@/lib/server/certificate-access";
import { certificateFileName, renderCertificatePng } from "@/lib/server/certificate-render";

export async function GET(request: NextRequest, ctx: RouteContext<"/certificates/[id]/[code]/image">) {
  const { id, code } = await ctx.params;
  const access = await certificateForDownload(id, code);
  if (!access.ok) return new Response(access.message, { status: access.status });

  const download = request.nextUrl.searchParams.has("download");
  const scale = download ? 3 : 2;
  const png = await renderCertificatePng(access.view, scale);
  return new Response(png.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": access.preview ? "private, no-store" : "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
      ...(download ? { "Content-Disposition": `attachment; filename="${certificateFileName(access.view, "png")}"` } : {}),
    },
  });
}

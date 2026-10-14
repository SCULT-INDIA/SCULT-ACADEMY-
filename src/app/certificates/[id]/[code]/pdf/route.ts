import { certificateForDownload } from "@/lib/server/certificate-access";
import { certificateFileName, renderCertificatePdf } from "@/lib/server/certificate-render";

export async function GET(_request: Request, ctx: RouteContext<"/certificates/[id]/[code]/pdf">) {
  const { id, code } = await ctx.params;
  const access = await certificateForDownload(id, code);
  if (!access.ok) return new Response(access.message, { status: access.status });

  const pdf = await renderCertificatePdf(access.view);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificateFileName(access.view, "pdf")}"`,
      "Cache-Control": access.preview ? "private, no-store" : "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}

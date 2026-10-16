import { renderCertificatePng } from "@/lib/server/certificate-render";
import { getWorkshop } from "@/lib/server/workshops";

/** A specimen certificate for the workshop page (placeholder name, no real record). */
export async function GET(_request: Request, ctx: RouteContext<"/workshops/[slug]/certificate-sample">) {
  const { slug } = await ctx.params;
  const workshop = await getWorkshop(slug);
  const cert = workshop?.certificate;
  if (!workshop || !cert) return new Response("Not found", { status: 404 });

  const png = await renderCertificatePng(
    {
      id: `${cert.prefix}-0000`,
      code: "SAMPLE",
      name: "Your Name Here",
      workshopSlug: workshop.slug,
      title: workshop.title,
      subtitle: workshop.subtitle,
      dateLabel: workshop.dateLabel,
      kind: cert.kind,
      statement: cert.statement,
      description: cert.description,
      issuedLine: cert.issuedLine,
      organizer: workshop.organizer,
      partner: workshop.partner,
      releaseAt: cert.releaseAt,
      released: true,
      signatories: cert.signatories,
    },
    1.4,
  );
  return new Response(png.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}

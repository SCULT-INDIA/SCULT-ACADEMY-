import "server-only";
import { hasTeamSession } from "./auth";
import { findCertificate, type CertificateView } from "./certificates";

export type CertificateAccess =
  | { ok: true; view: CertificateView; preview: boolean }
  | { ok: false; status: 404 | 425; message: string };

/**
 * Resolves a certificate for download. Genuine id + code is required;
 * before the release date only the team (admin preview) may download.
 */
export async function certificateForDownload(id: string, code: string): Promise<CertificateAccess> {
  const view = await findCertificate(decodeURIComponent(id), decodeURIComponent(code));
  if (!view) return { ok: false, status: 404, message: "Certificate not found." };
  if (view.released) return { ok: true, view, preview: false };
  if (await hasTeamSession()) return { ok: true, view, preview: true };
  return { ok: false, status: 425, message: `This certificate unlocks on ${view.dateLabel}.` };
}

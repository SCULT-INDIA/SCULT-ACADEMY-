import "server-only";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { site } from "@/lib/site";
import { contentMime, readContentBytes, readContentJson } from "./content";
import { getWorkshop, listWorkshops, type Workshop } from "./workshops";

/* ──────────────────────────────────────────────────────────────
   Certificate records live in the private content repo. Lookups
   filter in plain (uncached) code, so emails and phone digits never
   become cache keys or tags.
   ────────────────────────────────────────────────────────────── */

const recordSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  email: z.string(),
  phoneLast4: z.string().default(""),
  college: z.string().default(""),
  status: z.enum(["issued", "revoked"]).default("issued"),
  nameLocked: z.boolean().optional(),
});

export type CertificateRecord = z.infer<typeof recordSchema>;

/** What is safe to show publicly about a certificate. */
export type CertificateView = {
  id: string;
  code: string;
  name: string;
  workshopSlug: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  isoDate: string;
  kind: string;
  statement: string;
  description: string;
  issuedLine: string;
  organizer: string;
  partner: string;
  releaseAt: string;
  released: boolean;
  verifyUrl: string;
  signatories: { name: string; title: string; signature?: string }[];
};

export async function getRecords(workshop: Workshop): Promise<CertificateRecord[]> {
  if (!workshop.certificate) return [];
  const raw = await readContentJson<{ records?: unknown[] }>(workshop.certificate.records);
  return z.array(recordSchema).parse(raw?.records ?? []);
}

/** Whether certificates for this release date can be downloaded by students yet. */
export const isReleased = (releaseAt: string, now = Date.now()) => now >= Date.parse(releaseAt);

export const verifyPath = (id: string, code: string) => `/verify/${encodeURIComponent(id)}/${encodeURIComponent(code)}`;

export function toView(workshop: Workshop, record: CertificateRecord, now = Date.now()): CertificateView {
  const cert = workshop.certificate!;
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    workshopSlug: workshop.slug,
    title: workshop.title,
    subtitle: workshop.subtitle,
    dateLabel: workshop.dateLabel,
    isoDate: workshop.date,
    kind: cert.kind,
    statement: cert.statement,
    description: cert.description,
    issuedLine: cert.issuedLine,
    organizer: workshop.organizer,
    partner: workshop.partner,
    releaseAt: cert.releaseAt,
    released: isReleased(cert.releaseAt, now),
    verifyUrl: `${site.url}${verifyPath(record.id, record.code)}`,
    signatories: cert.signatories,
  };
}

const sameCode = (a: string, b: string) => {
  const x = Buffer.from(a.toUpperCase());
  const y = Buffer.from(b.toUpperCase());
  return x.length === y.length && timingSafeEqual(x, y);
};

/** The certificate matching an id + verification code, if it's genuine and not revoked. */
export async function findCertificate(id: string, code: string): Promise<CertificateView | null> {
  const workshops = await listWorkshops();
  for (const workshop of workshops) {
    if (!workshop.certificate || !id.startsWith(workshop.certificate.prefix)) continue;
    const record = (await getRecords(workshop)).find((r) => r.id === id);
    if (record && record.status === "issued" && sameCode(record.code, code)) return toView(workshop, record);
    return null;
  }
  return null;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const phoneLast4 = (phone: string) => phone.replace(/\D/g, "").slice(-4);

/** Every issued certificate registered to this email + phone (last 4 digits). */
export async function findStudentCertificates(email: string, phone: string): Promise<CertificateView[]> {
  const wantEmail = normalizeEmail(email);
  const wantDigits = phoneLast4(phone);
  if (!wantEmail || wantDigits.length !== 4) return [];
  const results: CertificateView[] = [];
  for (const workshop of await listWorkshops()) {
    for (const record of await getRecords(workshop)) {
      if (record.status === "issued" && record.email === wantEmail && record.phoneLast4 === wantDigits) {
        results.push(toView(workshop, record));
      }
    }
  }
  return results;
}

/** A content image as a data URL (for embedding in rendered certificates). */
export async function contentImageDataUrl(path: string | undefined) {
  if (!path) return null;
  const bytes = await readContentBytes(path);
  if (!bytes) return null;
  return `data:${contentMime(path)};base64,${Buffer.from(bytes).toString("base64")}`;
}

export { getWorkshop };

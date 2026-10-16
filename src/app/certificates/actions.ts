"use server";

import { findStudentCertificates, normalizeEmail } from "@/lib/server/certificates";
import { allow, clientKey } from "@/lib/server/rate-limit";

export type FoundCertificate = {
  id: string;
  code: string;
  name: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  organizer: string;
  released: boolean;
};

export type LookupState = { error?: string; results?: FoundCertificate[] };

export async function lookupCertificates(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter the email address you registered with." };
  if (!allow(await clientKey("cert-lookup"), 12, 10 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const found = await findStudentCertificates(email);
  if (!found.length) {
    return {
      error: "We couldn't find a certificate for that email. Use the same email you registered with — or message us on WhatsApp and we'll help.",
    };
  }
  return {
    results: found.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      title: c.title,
      subtitle: c.subtitle,
      dateLabel: c.dateLabel,
      organizer: c.organizer,
      released: c.released,
    })),
  };
}

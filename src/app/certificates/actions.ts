"use server";

import { findStudentCertificates, normalizeEmail, phoneLast4, verifyPath } from "@/lib/server/certificates";
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
  verifyPath: string;
  verifyUrl: string;
  linkedInUrl: string;
};

export type LookupState = { error?: string; results?: FoundCertificate[] };

const linkedInAddUrl = (c: { title: string; organizer: string; isoDate: string; verifyUrl: string; id: string }) => {
  const [year, month] = c.isoDate.split("-");
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.title,
    organizationName: c.organizer,
    issueYear: year,
    issueMonth: String(Number(month)),
    certUrl: c.verifyUrl,
    certId: c.id,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
};

export async function lookupCertificates(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const phone = String(formData.get("phone") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter the email address you registered with." };
  if (phoneLast4(phone).length !== 4) return { error: "Enter your registered phone number (or at least its last 4 digits)." };
  if (!allow(await clientKey("cert-lookup"), 12, 10 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const found = await findStudentCertificates(email, phone);
  if (!found.length) {
    return {
      error:
        "We couldn't find a certificate for those details. Use the same email and phone number you registered with — or message us on WhatsApp and we'll help.",
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
      verifyPath: verifyPath(c.id, c.code),
      verifyUrl: c.verifyUrl,
      linkedInUrl: linkedInAddUrl(c),
    })),
  };
}

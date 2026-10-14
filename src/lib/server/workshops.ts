import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { listContentDir, readContentJson } from "./content";

const signatory = z.object({
  name: z.string(),
  title: z.string(),
  signature: z.string().optional(),
});

export const workshopSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
  date: z.string(),
  dateLabel: z.string(),
  organizer: z.string(),
  partner: z.string().default("Scult Academy"),
  mode: z.string().default(""),
  location: z.string().default(""),
  summary: z.string().default(""),
  audience: z.string().default(""),
  registration: z
    .object({ status: z.enum(["open", "closed"]).default("closed"), url: z.string().optional(), count: z.number().optional(), colleges: z.number().optional() })
    .default({ status: "closed" }),
  outcomes: z.array(z.string()).default([]),
  agenda: z.array(z.object({ label: z.string(), title: z.string(), detail: z.string().default("") })).default([]),
  speakers: z.array(z.object({ name: z.string(), role: z.string(), org: z.string().default("") })).default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  certificate: z
    .object({
      prefix: z.string(),
      kind: z.string().default("Certificate of Participation"),
      releaseAt: z.string(),
      statement: z.string().default("has participated in the workshop"),
      description: z.string().default(""),
      issuedLine: z.string().default(""),
      signatories: z.array(signatory).default([]),
      records: z.string(),
    })
    .optional(),
});

export type Workshop = z.infer<typeof workshopSchema>;

/** A workshop by slug, or null when missing, invalid or content is unreachable. */
export async function getWorkshop(slug: string): Promise<Workshop | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = await readContentJson<unknown>(`workshops/${slug}.json`);
    if (!raw) return null;
    const parsed = workshopSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`workshops/${slug}.json is invalid`, parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch (error) {
    unstable_rethrow(error);
    console.error(`Could not load workshop ${slug}`, error);
    return null;
  }
}

export async function listWorkshops(): Promise<Workshop[]> {
  try {
    const entries = await listContentDir("workshops");
    const slugs = entries.filter((e) => e.type === "file" && e.name.endsWith(".json")).map((e) => e.name.slice(0, -5));
    const all = await Promise.all(slugs.map(getWorkshop));
    return all.filter((w): w is Workshop => !!w).sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Could not list workshops", error);
    return [];
  }
}

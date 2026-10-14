"use server";

import { updateTag } from "next/cache";
import { requireTeam } from "@/lib/server/auth";
import { CONTENT_TAG, writeContentFile } from "@/lib/server/content";
import { getWorkshop } from "@/lib/server/workshops";

export type SignatureResult = { ok: true } | { ok: false; error: string };

/** Saves a drawn signature (PNG data URL) for a workshop signatory. */
export async function saveSignature(workshopSlug: string, signatoryIndex: number, dataUrl: string): Promise<SignatureResult> {
  await requireTeam("/admin");
  const workshop = await getWorkshop(workshopSlug);
  const signatory = workshop?.certificate?.signatories[signatoryIndex];
  if (!workshop || !signatory?.signature) return { ok: false, error: "That signatory has no signature path in the workshop file." };
  if (!/^assets\/signatures\/[a-z0-9-]+\.png$/.test(signatory.signature)) return { ok: false, error: "Signature path must be assets/signatures/<name>.png" };

  const match = dataUrl.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { ok: false, error: "Expected a PNG image." };
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length < 200 || bytes.length > 2_000_000) return { ok: false, error: "Signature image is empty or too large." };

  try {
    await writeContentFile(signatory.signature, new Uint8Array(bytes), `Update signature: ${signatory.name}`);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save the signature." };
  }
  updateTag(CONTENT_TAG);
  return { ok: true };
}

/** Drops cached content so edits in the content repo show up immediately. */
export async function refreshContent() {
  await requireTeam("/admin");
  updateTag(CONTENT_TAG);
}

import "server-only";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize, resolve, sep } from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { env } from "./env";

/* ──────────────────────────────────────────────────────────────
   Read and write the private content repo.

   - CONTENT_DIR set  → a local checkout (development).
   - otherwise        → the GitHub contents API with CONTENT_TOKEN.

   Reads are cached under the "content" tag; admin actions call
   updateTag("content") after writing so changes show immediately.
   ────────────────────────────────────────────────────────────── */

export const CONTENT_TAG = "content";

export class ContentError extends Error {}

/** Rejects absolute paths and `..` so callers can't escape the repo. */
function safePath(path: string) {
  const clean = normalize(path).replaceAll("\\", "/").replace(/^\/+/, "");
  if (!clean || clean.startsWith("..") || clean.includes("/../")) {
    throw new ContentError(`Invalid content path: ${path}`);
  }
  return clean;
}

function localPath(path: string) {
  // turbopackIgnore: this local-dev path must not pull the whole project into server bundles.
  const root = resolve(/* turbopackIgnore: true */ process.cwd(), env.contentDir);
  const full = resolve(root, safePath(path));
  if (full !== root && !full.startsWith(root + sep)) throw new ContentError(`Invalid content path: ${path}`);
  return full;
}

function githubUrl(path: string) {
  const encoded = safePath(path).split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${env.contentRepo}/contents/${encoded}?ref=${encodeURIComponent(env.contentBranch)}`;
}

function githubHeaders(accept: string): HeadersInit {
  if (!env.contentToken) {
    throw new ContentError("Content is not configured: set CONTENT_DIR (local) or CONTENT_TOKEN (GitHub).");
  }
  return {
    Accept: accept,
    Authorization: `Bearer ${env.contentToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "scult-academy-site",
  };
}

/* Cached reads never throw: an error escaping a "use cache" scope fails the
   whole prerender even when a caller catches it (a bad token would then
   break every deploy). They return a result instead, and the exported
   wrappers turn failures into ContentError outside the cache. */
type Read<T> = { ok: true; value: T } | { ok: false; error: string };

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function cachedBytes(path: string): Promise<Read<Uint8Array | null>> {
  "use cache";
  cacheTag(CONTENT_TAG);
  // Local checkouts refresh within seconds; GitHub reads are cached a little longer.
  // Both expire after ≥ 5 minutes so pages using them can still be prerendered.
  if (env.contentDir) cacheLife({ stale: 30, revalidate: 2, expire: 600 });
  else cacheLife("minutes");

  try {
    if (env.contentDir) {
      try {
        return { ok: true, value: new Uint8Array(await readFile(localPath(path))) };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ok: true, value: null };
        throw error;
      }
    }
    const res = await fetch(githubUrl(path), { headers: githubHeaders("application/vnd.github.raw+json") });
    if (res.status === 404) return { ok: true, value: null };
    if (!res.ok) return { ok: false, error: `GitHub content read failed (${res.status}) for ${path}` };
    return { ok: true, value: new Uint8Array(await res.arrayBuffer()) };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

type Entry = { name: string; type: "file" | "dir" };

async function cachedDir(path: string): Promise<Read<Entry[]>> {
  "use cache";
  cacheTag(CONTENT_TAG);
  if (env.contentDir) cacheLife({ stale: 30, revalidate: 2, expire: 600 });
  else cacheLife("minutes");

  try {
    if (env.contentDir) {
      try {
        const entries = await readdir(localPath(path), { withFileTypes: true });
        return {
          ok: true,
          value: entries
            .filter((e) => !e.name.startsWith("."))
            .map((e) => ({ name: e.name, type: e.isDirectory() ? ("dir" as const) : ("file" as const) })),
        };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ok: true, value: [] };
        throw error;
      }
    }
    const res = await fetch(githubUrl(path), { headers: githubHeaders("application/vnd.github+json") });
    if (res.status === 404) return { ok: true, value: [] };
    if (!res.ok) return { ok: false, error: `GitHub directory read failed (${res.status}) for ${path}` };
    const items = (await res.json()) as { name: string; type: string }[];
    return { ok: true, value: items.map((i) => ({ name: i.name, type: i.type === "dir" ? ("dir" as const) : ("file" as const) })) };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

/** Raw bytes of a content file, or null when it doesn't exist. Throws ContentError if unreachable. */
export async function readContentBytes(path: string): Promise<Uint8Array | null> {
  const result = await cachedBytes(path);
  if (!result.ok) throw new ContentError(result.error);
  return result.value;
}

export async function readContentText(path: string) {
  const bytes = await readContentBytes(path);
  return bytes ? new TextDecoder().decode(bytes) : null;
}

export async function readContentJson<T>(path: string): Promise<T | null> {
  const text = await readContentText(path);
  return text ? (JSON.parse(text) as T) : null;
}

/** Entries of a content directory (empty when missing). Throws ContentError if unreachable. */
export async function listContentDir(path: string): Promise<Entry[]> {
  const result = await cachedDir(path);
  if (!result.ok) throw new ContentError(result.error);
  return result.value;
}

/** Creates or replaces a file. Remote writes become a commit on the content repo. */
export async function writeContentFile(path: string, data: Uint8Array | string, message: string) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;

  if (env.contentDir) {
    const full = localPath(path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, bytes);
    return;
  }

  const url = githubUrl(path);
  const existing = await fetch(url, { headers: githubHeaders("application/vnd.github+json") });
  const sha = existing.ok ? ((await existing.json()) as { sha?: string }).sha : undefined;
  const res = await fetch(url.split("?")[0], {
    method: "PUT",
    headers: { ...githubHeaders("application/vnd.github+json"), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(bytes).toString("base64"),
      branch: env.contentBranch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new ContentError(`GitHub content write failed (${res.status}) for ${path}`);
}

export const contentMime = (path: string) => {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return (
    {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      mp4: "video/mp4",
      webm: "video/webm",
      json: "application/json",
      md: "text/markdown; charset=utf-8",
    }[ext] ?? "application/octet-stream"
  );
};

export const joinContent = (...parts: string[]) => join(...parts).replaceAll("\\", "/");

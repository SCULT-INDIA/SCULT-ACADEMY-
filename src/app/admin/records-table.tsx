"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Eye, FileArchive, Search } from "lucide-react";
import { zipSync } from "fflate";
import { cn } from "@/lib/utils";

export type AdminRecord = {
  id: string;
  code: string;
  name: string;
  email: string;
  college: string;
  status: "issued" | "revoked";
  verifyUrl: string;
};

const base = (r: AdminRecord) => `/certificates/${encodeURIComponent(r.id)}/${encodeURIComponent(r.code)}`;

export function RecordsTable({ records, workshopTitle }: { records: AdminRecord[]; workshopTitle: string }) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [zip, setZip] = useState<{ done: number; total: number; error?: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => [r.id, r.name, r.email, r.college].some((v) => v.toLowerCase().includes(q)));
  }, [records, query]);

  const downloadAll = async () => {
    const issued = records.filter((r) => r.status === "issued");
    setZip({ done: 0, total: issued.length });
    const files: Record<string, Uint8Array> = {};
    let done = 0;
    try {
      // A few at a time keeps the server responsive while rendering.
      const queue = [...issued];
      await Promise.all(
        Array.from({ length: 3 }, async () => {
          for (let r = queue.shift(); r; r = queue.shift()) {
            const res = await fetch(`${base(r)}/pdf`);
            if (!res.ok) throw new Error(`${r.id}: ${res.status}`);
            files[`${r.id}-${r.name.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`] = new Uint8Array(await res.arrayBuffer());
            setZip({ done: ++done, total: issued.length });
          }
        }),
      );
      const blob = new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `${workshopTitle.replace(/[^A-Za-z0-9]+/g, "-")}-certificates.zip` });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setZip(null);
    } catch (e) {
      setZip({ done, total: issued.length, error: e instanceof Error ? e.message : "Download failed" });
    }
  };

  const copy = async (r: AdminRecord) => {
    try {
      await navigator.clipboard.writeText(r.verifyUrl);
      setCopied(r.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="rounded-[1.75rem] border border-night-line bg-night-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-night-line p-4">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, college or number"
            aria-label="Search certificates"
            className="h-11 w-full rounded-xl border border-night-line bg-night pr-3 pl-11 text-sm text-cream placeholder:text-cream-mute/70 focus:border-ember-500 focus:outline-none"
          />
        </div>
        <button type="button" onClick={downloadAll} disabled={!!zip && !zip.error} className="btn btn-matte h-11 px-5 text-sm disabled:opacity-60">
          <FileArchive className="size-4" />
          {zip && !zip.error ? `Rendering ${zip.done}/${zip.total}…` : "Download all (ZIP of PDFs)"}
        </button>
      </div>
      {zip?.error && <p className="border-b border-night-line px-4 py-3 text-sm text-ember-300">Stopped: {zip.error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="font-mono text-[0.62rem] tracking-[0.14em] text-cream-mute uppercase">
            <tr className="border-b border-night-line">
              <th scope="col" className="px-4 py-3 font-medium">Certificate</th>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">College</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-night-line/60 last:border-0 hover:bg-night-3/40">
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-cream-mute">{r.id}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-cream">{r.name}</span>
                  <span className="block text-xs text-cream-mute">{r.email}</span>
                </td>
                <td className="hidden max-w-64 truncate px-4 py-3 text-cream-mute lg:table-cell">{r.college}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[0.62rem] uppercase",
                      r.status === "issued" ? "bg-[#37B184]/15 text-[#5fd3a6]" : "bg-ember-600/20 text-ember-300",
                    )}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`${base(r)}/image`} target="_blank" rel="noopener" aria-label={`Preview ${r.name}'s certificate`} title="Preview" className="grid size-9 place-items-center rounded-lg text-cream-mute hover:bg-night-3 hover:text-cream">
                      <Eye className="size-4" />
                    </a>
                    <a href={`${base(r)}/pdf`} aria-label={`Download ${r.name}'s certificate PDF`} title="Download PDF" className="grid size-9 place-items-center rounded-lg text-cream-mute hover:bg-night-3 hover:text-cream">
                      <Download className="size-4" />
                    </a>
                    <button type="button" onClick={() => copy(r)} aria-label={`Copy ${r.name}'s verify link`} title="Copy verify link" className="grid size-9 place-items-center rounded-lg text-cream-mute hover:bg-night-3 hover:text-cream">
                      {copied === r.id ? <Check className="size-4 text-[#5fd3a6]" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-cream-mute">
                  No certificates match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

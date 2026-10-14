"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const input =
  "h-14 w-full rounded-2xl border border-line bg-paper/60 px-5 font-mono text-base tracking-wider text-ink uppercase transition-[border-color,box-shadow,background-color] placeholder:font-sans placeholder:tracking-normal placeholder:normal-case placeholder:text-ink-mute/70 hover:border-line-strong focus:border-ember-500 focus:bg-white focus:ring-4 focus:ring-ember-100 focus:outline-none";

export function VerifyForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [code, setCode] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanId = id.trim().toUpperCase().replace(/\s+/g, "");
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");
    if (cleanId && cleanCode) router.push(`/verify/${encodeURIComponent(cleanId)}/${encodeURIComponent(cleanCode)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 rounded-[2rem] border border-line bg-white p-6 shadow-[0_40px_100px_-60px_rgb(23_19_15/0.5)] sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cert-id" className="text-sm font-semibold text-ink">
            Certificate number
          </label>
          <input id="cert-id" value={id} onChange={(e) => setId(e.target.value)} required placeholder="JAI-2026-0001" className={`mt-2 ${input}`} />
        </div>
        <div>
          <label htmlFor="cert-code" className="text-sm font-semibold text-ink">
            Verification code
          </label>
          <input id="cert-code" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="6 characters" maxLength={12} className={`mt-2 ${input}`} />
        </div>
      </div>
      <button type="submit" className="btn btn-matte mt-6 h-14 w-full text-base">
        <ShieldCheck className="size-4" /> Verify certificate
      </button>
    </form>
  );
}

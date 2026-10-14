"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, FileImage, Lock, Mail, Phone, Search, ShieldCheck } from "lucide-react";
import { site, whatsappUrl } from "@/lib/site";
import { LinkedInIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { lookupCertificates, type FoundCertificate, type LookupState } from "./actions";

const input =
  "h-14 w-full rounded-2xl border border-line bg-paper/60 pl-12 pr-4 text-base text-ink transition-[border-color,box-shadow,background-color] placeholder:text-ink-mute/70 hover:border-line-strong focus:border-ember-500 focus:bg-white focus:ring-4 focus:ring-ember-100 focus:outline-none";

export function CertificateLookup() {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookupCertificates, {});
  // Controlled so a failed lookup doesn't wipe what the student typed (forms reset after actions).
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_40px_100px_-60px_rgb(23_19_15/0.5)] sm:p-9"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Registered email
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-ink-mute" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={input}
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-ink">
              Registered phone number
            </label>
            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-ink-mute" />
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Full number or last 4 digits"
                className={input}
              />
            </div>
          </div>
        </div>
        {state.error && (
          <p role="alert" className="mt-5 rounded-2xl border border-ember-200 bg-ember-50 px-4 py-3 text-sm font-medium text-ember-800">
            {state.error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-ink-mute">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ember-600" />
            We only use these details to find your certificate.
          </p>
          <button type="submit" disabled={pending} className="btn btn-matte h-14 w-full px-7 text-base sm:w-auto">
            <Search className="size-4" />
            {pending ? "Searching…" : "Find my certificate"}
          </button>
        </div>
      </form>

      {state.results?.map((c) => <Result key={c.id} c={c} />)}

      {state.error && (
        <p className="text-center text-sm text-ink-mute">
          Still stuck?{" "}
          <a
            href={whatsappUrl("Hi Scult Academy! I need help finding my workshop certificate.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline"
          >
            <WhatsAppIcon className="size-3.5" /> WhatsApp us
          </a>{" "}
          or email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-ink underline-offset-4 hover:underline">
            {site.email}
          </a>
          .
        </p>
      )}
    </div>
  );
}

function Result({ c }: { c: FoundCertificate }) {
  const [copied, setCopied] = useState(false);
  const base = `/certificates/${encodeURIComponent(c.id)}/${encodeURIComponent(c.code)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard can be blocked; the link is also shown below */
    }
  };

  return (
    <article className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_40px_100px_-60px_rgb(23_19_15/0.5)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5 sm:px-9">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.16em] text-ember-700 uppercase">Certificate · {c.id}</p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{c.name}</h2>
          <p className="mt-1 text-ink-soft">
            {c.title} · {c.dateLabel}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#37B184]/12 px-3 py-1.5 text-sm font-semibold text-[#237a5a]">
          <ShieldCheck className="size-4" /> Verified
        </span>
      </div>

      {c.released ? (
        <>
          <div className="bg-paper-2/60 p-4 sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered certificate image */}
            <img
              src={`${base}/image`}
              alt={`Certificate of participation for ${c.name} — ${c.title}`}
              width={2000}
              height={1350}
              className="h-auto w-full rounded-xl shadow-[0_30px_60px_-30px_rgb(23_19_15/0.45)]"
            />
          </div>
          <div className="flex flex-wrap gap-3 px-6 py-6 sm:px-9">
            <a href={`${base}/pdf`} className="btn btn-matte h-12 px-6 text-[0.95rem]">
              <Download className="size-4" /> Download PDF
            </a>
            <a href={`${base}/image?download`} className="btn btn-outline h-12 px-6 text-[0.95rem]">
              <FileImage className="size-4" /> Download PNG
            </a>
            <a href={c.linkedInUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ink h-12 px-6 text-[0.95rem]">
              <LinkedInIcon className="size-4" /> Add to LinkedIn
            </a>
            <button type="button" onClick={copy} className="btn btn-outline h-12 px-6 text-[0.95rem]">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Link copied" : "Copy verify link"}
            </button>
          </div>
          <p className="px-6 pb-6 text-sm break-all text-ink-mute sm:px-9">
            Anyone can confirm this certificate at{" "}
            <Link href={c.verifyPath} className="font-medium text-ink underline-offset-4 hover:underline">
              {c.verifyUrl.replace(/^https?:\/\//, "")}
            </Link>
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center sm:px-9">
          <span className="grid size-14 place-items-center rounded-full bg-paper-2 text-ember-600">
            <Lock className="size-6" />
          </span>
          <p className="font-display text-xl font-semibold tracking-tight text-ink">Your certificate is ready and waiting</p>
          <p className="max-w-md text-ink-soft">
            It unlocks on <strong className="text-ink">{c.dateLabel}</strong>, the day of the workshop. Come back then to
            download it.
          </p>
        </div>
      )}
    </article>
  );
}

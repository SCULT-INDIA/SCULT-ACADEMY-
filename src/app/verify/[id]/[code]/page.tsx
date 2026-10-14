import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { findCertificate } from "@/lib/server/certificates";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Certificate verification",
  robots: { index: false, follow: false },
};

export default function VerifyCertificatePage({ params }: PageProps<"/verify/[id]/[code]">) {
  return (
    <>
      <Navbar />
      <main id="main" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-5">
          <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-[2rem] bg-paper-2" />}>
            <Verification params={params} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function Verification({ params }: { params: PageProps<"/verify/[id]/[code]">["params"] }) {
  const { id, code } = await params;
  // Verification (and the release-date check) must run at request time.
  await connection();
  const certId = decodeURIComponent(id);
  const view = await findCertificate(certId, decodeURIComponent(code));

  if (!view) {
    return (
      <section className="rounded-[2rem] border border-line bg-white p-8 text-center shadow-[0_40px_100px_-60px_rgb(23_19_15/0.5)] sm:p-14">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-ember-50 text-ember-700">
          <CircleAlert className="size-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">We couldn&apos;t verify this certificate</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          No certificate matches <strong className="text-ink">{certId}</strong> with that verification code. Check both
          against the printed certificate, or scan its QR code again.
        </p>
        <ButtonLink href="/verify" variant="outline" className="mt-8">
          Try again
        </ButtonLink>
      </section>
    );
  }

  const imageSrc = `/certificates/${encodeURIComponent(view.id)}/${encodeURIComponent(view.code)}/image`;
  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_40px_100px_-60px_rgb(23_19_15/0.5)]">
      <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#37B184] text-white shadow-[0_16px_30px_-14px_rgb(55_177_132/0.9)]">
            <ShieldCheck className="size-8" />
          </span>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.16em] text-[#237a5a] uppercase">Verified certificate</p>
            <h1 className="mt-1 font-display text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">{view.name}</h1>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-right">
          <div>
            <dt className="text-ink-mute">Certificate</dt>
            <dd className="font-semibold text-ink">{view.id}</dd>
          </div>
          <div>
            <dt className="text-ink-mute">Issued</dt>
            <dd className="font-semibold text-ink">{view.dateLabel}</dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-line px-7 py-6 sm:px-10">
        <p className="text-ink-soft">
          {view.kind} for <strong className="text-ink">{view.title}</strong>
          {view.subtitle ? ` — ${view.subtitle}` : ""}, issued by <strong className="text-ink">{view.organizer}</strong> in
          collaboration with <strong className="text-ink">{view.partner}</strong>.
        </p>
      </div>
      {view.released && (
        <div className="bg-paper-2/60 p-4 sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered certificate image */}
          <img
            src={imageSrc}
            alt={`Certificate of participation for ${view.name}`}
            width={2000}
            height={1350}
            className="h-auto w-full rounded-xl shadow-[0_30px_60px_-30px_rgb(23_19_15/0.45)]"
          />
        </div>
      )}
      <p className="px-7 py-5 text-sm text-ink-mute sm:px-10">
        Is this your certificate?{" "}
        <Link href="/certificates" className="font-semibold text-ink underline-offset-4 hover:underline">
          Download it here
        </Link>
        .
      </p>
    </section>
  );
}

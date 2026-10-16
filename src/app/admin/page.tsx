import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, ExternalLink, LogOut, RefreshCw, Users } from "lucide-react";
import { requireTeam } from "@/lib/server/auth";
import { contentImageDataUrl, getRecords, isReleased } from "@/lib/server/certificates";
import { listWorkshops } from "@/lib/server/workshops";
import { LogoMark } from "@/components/ui/logo";
import { logout } from "../login/actions";
import { refreshContent } from "./actions";
import { RecordsTable, type AdminRecord } from "./records-table";
import { SignaturePad } from "./signature-pad";

export const metadata: Metadata = {
  title: "Certificates admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div data-no-grain className="min-h-dvh bg-night text-cream">
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10" />
            <div>
              <p className="font-display text-xl leading-tight font-semibold tracking-tight">Certificates</p>
              <p className="font-mono text-[0.62rem] tracking-[0.16em] text-cream-mute uppercase">Team admin</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/stage" className="btn btn-ghost-dark h-11 px-4 text-sm">
              <ArrowLeft className="size-4" /> Scult Stage
            </Link>
            <form action={refreshContent}>
              <button type="submit" className="btn btn-ghost-dark h-11 px-4 text-sm" title="Reload content from the content repo">
                <RefreshCw className="size-4" /> Refresh content
              </button>
            </form>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost-dark h-11 px-4 text-sm">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </nav>
        </header>
        <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-[1.75rem] bg-night-2" />}>
          <Workshops />
        </Suspense>
      </main>
    </div>
  );
}

async function Workshops() {
  await requireTeam("/admin");
  const workshops = (await listWorkshops()).filter((w) => w.certificate);
  if (!workshops.length) {
    return <p className="mt-10 rounded-2xl border border-night-line p-6 text-cream-mute">No workshops with certificates found in the content repo.</p>;
  }

  return (
    <div className="mt-10 space-y-16">
      {await Promise.all(
        workshops.map(async (w) => {
          const cert = w.certificate!;
          const records = await getRecords(w);
          const released = isReleased(cert.releaseAt);
          const signatures = await Promise.all(cert.signatories.map((s) => contentImageDataUrl(s.signature).catch(() => null)));
          const rows: AdminRecord[] = records.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            email: r.email,
            college: r.college,
            status: r.status,
          }));
          const sample = records.find((r) => r.status === "issued");

          return (
            <section key={w.slug} aria-labelledby={`w-${w.slug}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.65rem] tracking-[0.16em] text-ember-300 uppercase">
                    {w.organizer} × {w.partner}
                  </p>
                  <h1 id={`w-${w.slug}`} className="mt-2 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                    {w.title}
                  </h1>
                  <p className="mt-1 text-cream-mute">{w.subtitle}</p>
                </div>
                <Link href={`/workshops/${w.slug}`} className="btn btn-ghost-dark h-11 px-4 text-sm" target="_blank">
                  Workshop page <ExternalLink className="size-4" />
                </Link>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-night-line bg-night-2 p-5">
                  <dt className="flex items-center gap-2 text-sm text-cream-mute">
                    <Users className="size-4" /> Certificates
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-semibold">
                    {records.filter((r) => r.status === "issued").length}
                    <span className="text-base font-normal text-cream-mute"> issued</span>
                  </dd>
                </div>
                <div className="rounded-2xl border border-night-line bg-night-2 p-5">
                  <dt className="flex items-center gap-2 text-sm text-cream-mute">
                    <CalendarClock className="size-4" /> Student downloads
                  </dt>
                  <dd className="mt-2 font-display text-xl font-semibold">
                    {released ? "Open now" : `Unlock ${w.dateLabel}`}
                  </dd>
                </div>
                <div className="rounded-2xl border border-night-line bg-night-2 p-5">
                  <dt className="text-sm text-cream-mute">Certificate prefix</dt>
                  <dd className="mt-2 font-mono text-xl">{cert.prefix}</dd>
                </div>
              </dl>

              <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">Signatures</h2>
              <p className="mt-1 text-sm text-cream-mute">Sign once — every certificate updates instantly.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {cert.signatories.map((s, i) => (
                  <SignaturePad key={s.name} workshop={w.slug} index={i} name={s.name} current={signatures[i]} />
                ))}
              </div>

              {sample && (
                <>
                  <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">Preview</h2>
                  <a href={`/certificates/${sample.id}/${sample.code}/image`} target="_blank" rel="noopener" className="mt-4 block overflow-hidden rounded-2xl border border-night-line bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered certificate */}
                    <img src={`/certificates/${sample.id}/${sample.code}/image`} alt={`Certificate preview for ${sample.name}`} width={2000} height={1350} className="h-auto w-full" />
                  </a>
                </>
              )}

              <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">All certificates</h2>
              <div className="mt-4">
                <RecordsTable records={rows} workshopTitle={w.title} />
              </div>
            </section>
          );
        }),
      )}
    </div>
  );
}

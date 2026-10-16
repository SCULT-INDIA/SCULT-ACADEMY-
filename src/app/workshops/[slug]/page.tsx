import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, CalendarDays, Check, GraduationCap, MapPin, MonitorPlay, Plus, Users } from "lucide-react";
import { whatsappUrl } from "@/lib/site";
import { getWorkshop, listWorkshops, type Workshop } from "@/lib/server/workshops";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { Accent, Eyebrow, SectionHeading } from "@/components/ui/section-heading";

const GREEN = "#37B184";

export async function generateStaticParams() {
  const workshops = await listWorkshops();
  return workshops.length ? workshops.map((w) => ({ slug: w.slug })) : [{ slug: "juvenile-ai-2026" }];
}

export async function generateMetadata({ params }: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWorkshop(slug);
  if (!w) return { title: "Workshop" };
  return {
    title: `${w.title} — ${w.organizer} × ${w.partner}`,
    description: w.summary,
    alternates: { canonical: `/workshops/${w.slug}` },
  };
}

export default function WorkshopPage({ params }: PageProps<"/workshops/[slug]">) {
  return (
    <>
      <Navbar />
      <main id="main">
        <Suspense fallback={<div className="min-h-dvh" />}>
          <WorkshopContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function WorkshopContent({ params }: { params: PageProps<"/workshops/[slug]">["params"] }) {
  const { slug } = await params;
  const w = await getWorkshop(slug);
  if (!w) notFound();
  return (
    <>
      <Hero w={w} />
      <Outcomes w={w} />
      <Agenda w={w} />
      <CertificateSection w={w} />
      <People w={w} />
      <Faqs w={w} />
    </>
  );
}

function Hero({ w }: { w: Workshop }) {
  const facts = [
    { icon: CalendarDays, label: "Date", value: w.dateLabel },
    { icon: MonitorPlay, label: "Format", value: w.mode },
    { icon: MapPin, label: "Where", value: w.location },
  ].filter((f) => f.value);

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      </div>
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex animate-rise flex-wrap items-center justify-center gap-4 rounded-full border border-line bg-white/80 px-5 py-2.5 shadow-[0_10px_30px_-18px_rgb(23_19_15/0.35)] sm:mx-auto sm:w-fit">
          <Image src="/partners/juvenileai-logo.png" alt="JuvenileAI" width={870} height={170} className="h-6 w-auto" priority />
          <span className="font-mono text-xs text-ink-mute">×</span>
          <span className="flex items-center gap-2">
            <LogoMark className="h-6" />
            <span className="font-display text-lg font-bold tracking-tight">Scult</span>
            <span className="font-mono text-[0.6rem] tracking-[0.18em] text-ink-mute uppercase">Academy</span>
          </span>
        </div>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <Eyebrow className="animate-rise [animation-delay:60ms]">Workshop · {w.dateLabel}</Eyebrow>
          <h1 className="mt-7 animate-rise font-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-ink [animation-delay:120ms]">
            {/* Keep hyphenated words (e.g. "Real-World") from breaking at the hyphen. */}
            {w.title.split(" ").map((word, i) => (
              <span key={i}>
                {i > 0 && " "}
                {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
              </span>
            ))}
          </h1>
          {w.subtitle && (
            <p className="mt-4 animate-rise font-serif text-[clamp(1.6rem,3.6vw,2.75rem)] leading-tight text-ember-600 italic [animation-delay:180ms]">
              {w.subtitle}
            </p>
          )}
          <p className="mx-auto mt-7 max-w-2xl animate-rise text-lg leading-relaxed text-ink-soft [animation-delay:240ms] sm:text-xl">
            {w.summary}
          </p>
          <div className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 [animation-delay:300ms] sm:flex-row">
            <ButtonLink href="/certificates" size="lg" arrow className="w-full sm:w-auto">
              Get your certificate
            </ButtonLink>
            <ButtonLink
              href={whatsappUrl(`Hi Scult Academy! I have a question about the "${w.title}" workshop.`)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Ask a question
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl animate-rise gap-3 [animation-delay:360ms] sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-[1.5rem] border border-line bg-white p-5">
              <Icon className="size-5 text-ember-600" />
              <p className="mt-3 font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">{label}</p>
              <p className="mt-1 font-medium text-ink">{value}</p>
            </div>
          ))}
          {w.registration.count ? (
            <div className="matte rounded-[1.5rem] bg-ember-600 p-5 text-white">
              <Users className="size-5 opacity-85" />
              <p className="mt-3 font-mono text-[0.62rem] tracking-[0.16em] text-white/75 uppercase">Registered</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
                {w.registration.count} learners
                {w.registration.colleges ? <span className="block text-sm font-medium text-white/80">from {w.registration.colleges}+ colleges</span> : null}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Outcomes({ w }: { w: Workshop }) {
  if (!w.outcomes.length) return null;
  return (
    <section className="border-y border-line bg-paper-2/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            size="md"
            eyebrow="What you'll learn"
            title={
              <>
                From roadmap to a <Accent className="text-ember-600">working product.</Accent>
              </>
            }
            description={w.audience}
          />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {w.outcomes.map((o, i) => (
            <li key={o} className="reveal flex gap-4 rounded-[1.5rem] border border-line bg-white p-5">
              <span className="font-mono text-xs font-semibold text-ember-700">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed text-ink-2">{o}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Agenda({ w }: { w: Workshop }) {
  if (!w.agenda.length) return null;
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          align="center"
          eyebrow="Agenda"
          title={
            <>
              Six parts. <Accent className="text-ember-600">One real product.</Accent>
            </>
          }
          description="From the career roadmap to a chatbot built live, the way real teams plan, build and improve."
        />
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {w.agenda.map((item, i) => (
            <li
              key={item.title}
              className="reveal group relative flex flex-col rounded-[1.75rem] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-500 hover:border-ember-200 hover:shadow-[0_30px_60px_-36px_rgb(205_74_18/0.45)] sm:p-7"
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] tracking-[0.16em] text-ember-700 uppercase">{item.label}</span>
                <span className="font-display text-4xl font-semibold text-paper-3 transition-colors duration-500 group-hover:text-ember-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-4 font-display text-[1.45rem] leading-tight font-semibold tracking-[-0.025em] text-ink">{item.title}</span>
              <span className="mt-2 leading-relaxed text-ink-soft">{item.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CertificateSection({ w }: { w: Workshop }) {
  if (!w.certificate) return null;
  return (
    <section className="px-3 py-4 sm:px-5">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.5rem] bg-night text-cream">
        <div aria-hidden="true" className="bg-dots-dark mask-radial pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              tone="dark"
              size="md"
              eyebrow="Certificate"
              title={
                <>
                  Proof you <Accent className="text-ember-400">built it.</Accent>
                </>
              }
              description={`Every participant receives a certificate co-issued by ${w.organizer} and ${w.partner}, carrying their own certificate number.`}
            />
            <ul className="mt-8 space-y-3">
              {["Your allotted certificate number on every certificate", "Print-ready PDF download", "PNG image download"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-cream">
                  <span className="grid size-5 place-items-center rounded-full" style={{ background: GREEN }}>
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/certificates" arrow size="lg" className="mt-10">
              Get your certificate
            </ButtonLink>
          </div>
          <div className="reveal relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-ember-600/20 blur-2xl" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered specimen certificate */}
            <img
              src={`/workshops/${w.slug}/certificate-sample`}
              alt={`Sample certificate for ${w.title}`}
              width={1400}
              height={945}
              loading="lazy"
              className="relative h-auto w-full rotate-[-1.5deg] rounded-xl shadow-[0_50px_100px_-40px_rgb(0_0_0/0.9)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function People({ w }: { w: Workshop }) {
  if (!w.speakers.length) return null;
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          align="center"
          eyebrow="Your hosts"
          title={
            <>
              Learn from people who <Accent className="text-ember-600">ship.</Accent>
            </>
          }
        />
        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {w.speakers.map((s, i) => (
            <li key={s.name} className="reveal flex flex-col items-center rounded-[1.75rem] border border-line bg-white p-7 text-center">
              <span
                aria-hidden="true"
                className="grid size-16 place-items-center rounded-full font-display text-xl font-bold text-white"
                style={{ background: i === 2 ? GREEN : i === 1 ? "#19304E" : "var(--color-ember-600)" }}
              >
                {s.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{s.name}</span>
              <span className="mt-1 text-sm text-ink-soft">
                {s.role}
                {s.org ? `, ${s.org}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-soft">
          <span className="flex items-center gap-2">
            <GraduationCap className="size-4 text-ember-600" /> Built for college students
          </span>
          <span className="flex items-center gap-2">
            <Award className="size-4 text-ember-600" /> Certificate for every participant
          </span>
        </div>
      </div>
    </section>
  );
}

function Faqs({ w }: { w: Workshop }) {
  if (!w.faqs.length) return null;
  return (
    <section className="border-t border-line bg-paper-2/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <SectionHeading
          size="md"
          eyebrow="FAQ"
          title={
            <>
              Good to <Accent className="text-ember-600">know.</Accent>
            </>
          }
        />
        <div className="border-t border-line">
          {w.faqs.map((f, i) => (
            <details key={f.q} name="workshop-faq" open={i === 0} className="faq-item border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-[1.15rem] leading-snug font-medium tracking-[-0.02em] text-ink transition-colors hover:text-ember-700 sm:py-6 sm:text-[1.35rem]">
                {f.q}
                <span aria-hidden="true" className="faq-icon grid size-10 shrink-0 place-items-center rounded-full border border-line transition-all duration-500">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[1.02rem] leading-relaxed text-ink-soft sm:pr-14">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

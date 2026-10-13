"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MousePointerClick,
  ShieldCheck,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  BOOKING_TZ_LABEL,
  BOOKING_WINDOW_DAYS,
  formatDate,
  formatTime,
  googleCalendarUrl,
  istNow,
  learnerRoles,
  sameDate,
  sessionTypes,
  slotsFor,
  type DateKey,
  type SessionType,
} from "@/lib/booking";
import { programs } from "@/lib/content";
import { site, whatsappUrl, type SessionTypeId } from "@/lib/site";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";
import { WhatsAppIcon } from "@/components/ui/social-icons";

type Step = "type" | "schedule" | "details" | "done";
type Fields = { name: string; email: string; phone: string; role: string; org: string; notes: string };
type FieldErrors = Partial<Record<"name" | "email" | "phone", string>>;

const STEPS = [
  { id: "type", label: "Session" },
  { id: "schedule", label: "Date & time" },
  { id: "details", label: "Your details" },
] as const;
const STEP_INDEX: Record<Step, number> = { type: 0, schedule: 1, details: 2, done: 3 };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ease = [0.16, 1, 0.3, 1] as const;

const isSessionId = (v: string | null): v is SessionTypeId => sessionTypes.some((s) => s.id === v);

export function BookingFlow() {
  const params = useSearchParams();
  const paramType = params.get("type");
  const program = programs.find((p) => p.slug === params.get("program")) ?? null;
  const now = useNow();

  // `undefined` = not chosen yet (fall back to ?type=), `null` = cleared by the user.
  const [picked, setPicked] = useState<SessionTypeId | null | undefined>(undefined);
  const typeId = picked === undefined ? (isSessionId(paramType) ? paramType : null) : picked;
  const session = sessionTypes.find((s) => s.id === typeId) ?? null;

  const [stage, setStage] = useState<Exclude<Step, "type">>("schedule");
  const [date, setDate] = useState<DateKey | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    phone: "+91 ",
    role: "",
    org: "",
    notes: program ? `Interested in ${program.title}.` : "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [waLink, setWaLink] = useState<string | null>(null);

  const step: Step = session ? stage : "type";
  const topRef = useRef<HTMLDivElement>(null);
  const focusOnMount = useRef(false);

  /** Moves between steps, keeping the card in view and focus on the new step heading. */
  const go = (update: () => void) => {
    update();
    focusOnMount.current = true;
    requestAnimationFrame(() => {
      const el = topRef.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const headingRef = (el: HTMLHeadingElement | null) => {
    if (el && focusOnMount.current) {
      focusOnMount.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const chooseSession = (id: SessionTypeId) =>
    go(() => {
      setPicked(id);
      setTime(null);
      setStage("schedule");
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !date || time === null) return;
    const next: FieldErrors = {};
    if (fields.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Please enter a valid email address.";
    if (fields.phone.replace(/\D/g, "").length < 10) next.phone = "Please enter a valid WhatsApp number.";
    setErrors(next);
    const firstInvalid = (["name", "email", "phone"] as const).find((k) => next[k]);
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    const url = whatsappUrl(bookingMessage(session, date, time, fields));
    setWaLink(url);
    window.open(url, "_blank", "noopener,noreferrer");
    go(() => setStage("done"));
  };

  const reset = () =>
    go(() => {
      setPicked(null);
      setDate(null);
      setTime(null);
      setStage("schedule");
      setWaLink(null);
    });

  return (
    <div
      ref={topRef}
      className="scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-line bg-white shadow-[0_50px_120px_-60px_rgb(23_19_15/0.45)]"
    >
      <div className="grid lg:grid-cols-[19.5rem_minmax(0,1fr)] xl:grid-cols-[22.5rem_minmax(0,1fr)]">
        <Summary session={session} date={date} time={time} />

        <div className="min-w-0 p-5 sm:p-10 lg:p-12">
          <Stepper current={STEP_INDEX[step]} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, ease }}
            >
              {step === "type" && (
                <>
                  <StepHeading
                    headingRef={headingRef}
                    title="What would you like to talk about?"
                    lead="Every session is free, one-to-one and with a real Scult advisor — no sales scripts."
                  />
                  <div className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                    {sessionTypes.map((s) => (
                      <SessionCard key={s.id} session={s} onSelect={() => chooseSession(s.id)} />
                    ))}
                  </div>
                </>
              )}

              {step === "schedule" && session && (
                <>
                  <BackButton onClick={() => go(() => setPicked(null))}>Change session</BackButton>
                  <StepHeading
                    headingRef={headingRef}
                    title="Pick a date & time"
                    lead={`All times are in ${BOOKING_TZ_LABEL}. Available days are highlighted.`}
                  />
                  <Scheduler
                    now={now}
                    session={session}
                    date={date}
                    time={time}
                    onDate={(d) => {
                      setDate(d);
                      setTime(null);
                    }}
                    onTime={setTime}
                    onNext={() => go(() => setStage("details"))}
                  />
                </>
              )}

              {step === "details" && session && date && time !== null && (
                <>
                  <BackButton onClick={() => go(() => setStage("schedule"))}>Change time</BackButton>
                  <StepHeading
                    headingRef={headingRef}
                    title="Tell us about you"
                    lead="We'll share these details with our team on WhatsApp to confirm your slot."
                  />
                  <DetailsForm
                    fields={fields}
                    errors={errors}
                    onChange={(patch) => setFields((f) => ({ ...f, ...patch }))}
                    onSubmit={onSubmit}
                  />
                </>
              )}

              {step === "done" && session && date && time !== null && (
                <Confirmation
                  headingRef={headingRef}
                  session={session}
                  date={date}
                  time={time}
                  name={fields.name}
                  waLink={waLink}
                  onReset={reset}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <DirectContact className="mt-10 lg:hidden" />
        </div>
      </div>
    </div>
  );
}

/* ── Message ─────────────────────────────────────────────────────── */

function bookingMessage(session: SessionType, date: DateKey, time: number, f: Fields) {
  const lines = [
    "Hi Scult Academy! I'd like to book a session.",
    "",
    `*Session:* ${session.title} (${session.minutes} min)`,
    `*Date:* ${formatDate(date)}`,
    `*Time:* ${formatTime(time)} – ${formatTime(time + session.minutes)} IST`,
    "",
    `*Name:* ${f.name.trim()}`,
    `*Email:* ${f.email.trim()}`,
    `*WhatsApp:* ${f.phone.trim()}`,
    f.role ? `*I am a:* ${f.role}` : null,
    f.org.trim() ? `*Organisation:* ${f.org.trim()}` : null,
    f.notes.trim() ? `*Notes:* ${f.notes.trim()}` : null,
    "",
    "Please confirm my slot. Thank you!",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/* ── Layout pieces ───────────────────────────────────────────────── */

function Summary({ session, date, time }: { session: SessionType | null; date: DateKey | null; time: number | null }) {
  return (
    <aside className="flex flex-col border-b border-line bg-paper-2/70 p-5 sm:p-8 lg:border-r lg:border-b-0 xl:p-10">
      <div className="flex items-center gap-3">
        <LogoMark className="h-9 sm:h-11" />
        <div>
          <p className="font-display text-lg leading-tight font-semibold tracking-tight">Scult Academy</p>
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">Advisor sessions</p>
        </div>
      </div>

      <p className="mt-6 font-mono text-[0.68rem] font-medium tracking-[0.16em] text-ember-700 uppercase lg:mt-9">
        {session ? "You're booking" : "Book a free session"}
      </p>
      <h2 className="mt-2 font-display text-[1.6rem] leading-[1.05] font-semibold tracking-[-0.03em] text-ink sm:mt-3 sm:text-[2.2rem]">
        {session ? session.title : "Talk to a Scult advisor"}
      </h2>

      <ul className="mt-4 flex flex-wrap gap-2 text-sm text-ink-soft lg:mt-6 lg:flex-col lg:gap-3.5 lg:text-[0.95rem]">
        <SummaryRow icon={Clock}>{session ? `${session.minutes} minutes` : "20 – 45 minutes"}</SummaryRow>
        <SummaryRow icon={Video}>
          Online call<span className="hidden lg:inline"> · link shared on WhatsApp</span>
        </SummaryRow>
        <SummaryRow icon={Globe}>
          <span className="lg:hidden">IST</span>
          <span className="hidden lg:inline">{BOOKING_TZ_LABEL}</span>
        </SummaryRow>
        {session && date && time !== null && (
          <SummaryRow icon={CalendarCheck} highlight>
            <span className="lg:hidden">
              {formatDate(date, "short")} · {formatTime(time)}
            </span>
            <span className="hidden lg:inline">
              {formatDate(date)}
              <br />
              {formatTime(time)} – {formatTime(time + session.minutes)}
            </span>
          </SummaryRow>
        )}
      </ul>

      {session && (
        <div className="mt-8 hidden border-t border-line pt-6 lg:block">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">What we&apos;ll cover</p>
          <ol className="mt-4 space-y-2.5">
            {session.agenda.map((item, i) => (
              <li key={item} className="flex gap-3 text-[0.95rem] text-ink-2">
                <span className="mt-0.5 font-mono text-xs text-ember-700">0{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      <DirectContact className="mt-10 hidden lg:mt-auto lg:block" />
    </aside>
  );
}

function DirectContact({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-1 border-t border-line pt-6", className)}>
      <p className="mb-3 flex items-start gap-3 text-sm text-ink-soft">
        <Clock className="mt-0.5 size-4 shrink-0 text-ember-600" />
        <span>
          {site.hours.map((h) => (
            <span key={h.days} className="block">
              {h.days} · {h.label} IST
            </span>
          ))}
        </span>
      </p>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl py-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ember-700"
      >
        <WhatsAppIcon className="size-4 text-ember-600" />
        {site.phone.display}
      </a>
      <a
        href={`mailto:${site.email}`}
        className="flex items-center gap-3 rounded-xl py-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ember-700"
      >
        <Mail className="size-4 text-ember-600" />
        {site.email}
      </a>
    </div>
  );
}

function SummaryRow({ icon: Icon, highlight, children }: { icon: LucideIcon; highlight?: boolean; children: ReactNode }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1.5 lg:items-start lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0",
        highlight && "border-ember-200 bg-ember-50 font-semibold text-ember-700",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0 lg:mt-0.5 lg:size-[18px]", highlight ? "text-ember-600" : "text-ink-mute")}
      />
      <span>{children}</span>
    </li>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol aria-label="Booking progress" className="flex flex-wrap items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.id} aria-current={active ? "step" : undefined} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full font-mono text-xs font-semibold transition-colors duration-500",
                done && "bg-ink text-cream",
                active && "matte bg-ember-600 text-white",
                !done && !active && "border border-line-strong text-ink-mute",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("text-sm font-medium", active ? "text-ink" : "hidden text-ink-mute sm:inline")}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-5 bg-line-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepHeading({
  headingRef,
  title,
  lead,
}: {
  headingRef: (el: HTMLHeadingElement | null) => void;
  title: string;
  lead: string;
}) {
  return (
    <div className="mt-7 sm:mt-8">
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[1.75rem] leading-[1.05] font-semibold tracking-[-0.035em] text-ink outline-none sm:text-[2.75rem] sm:leading-[1.02]"
      >
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{lead}</p>
    </div>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 -mb-2 inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
    >
      <ArrowLeft className="size-4" />
      {children}
    </button>
  );
}

/* ── Step 1 ──────────────────────────────────────────────────────── */

function SessionCard({ session, onSelect }: { session: SessionType; onSelect: () => void }) {
  const Icon = session.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col rounded-[1.5rem] border border-line bg-paper/50 p-5 text-left sm:rounded-[1.75rem] transition-[transform,background-color,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-ember-300 hover:bg-white hover:shadow-[0_30px_60px_-34px_rgb(205_74_18/0.45)] sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-2xl border border-ember-100 bg-ember-50 text-ember-600 transition-colors duration-500 group-hover:border-ember-600 group-hover:bg-ember-600 group-hover:text-white">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full bg-ink px-3 py-1 font-mono text-[0.65rem] font-semibold text-cream">
          {session.minutes} min
        </span>
      </div>
      <span className="mt-4 font-display text-[1.3rem] leading-tight font-semibold tracking-[-0.025em] text-ink sm:mt-5 sm:text-[1.45rem]">
        {session.title}
      </span>
      <span className="mt-1.5 text-sm font-medium text-ember-700">{session.audience}</span>
      <span className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{session.description}</span>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
        Choose this session
        <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

/* ── Step 2 ──────────────────────────────────────────────────────── */

function Scheduler({
  now,
  session,
  date,
  time,
  onDate,
  onTime,
  onNext,
}: {
  now: number | null;
  session: SessionType;
  date: DateKey | null;
  time: number | null;
  onDate: (d: DateKey) => void;
  onTime: (t: number) => void;
  onNext: () => void;
}) {
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  if (now === null) return <CalendarSkeleton />;

  const { today } = istNow(now);
  const view = month ?? (date ? { y: date.y, m: date.m } : { y: today.y, m: today.m });
  const first = new Date(Date.UTC(view.y, view.m, 1));
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const last = new Date(Date.UTC(today.y, today.m, today.d + BOOKING_WINDOW_DAYS));
  const canPrev = view.y > today.y || (view.y === today.y && view.m > today.m);
  const canNext = Date.UTC(view.y, view.m + 1, 1) <= last.getTime();
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(view.y, view.m + delta, 1));
    setMonth({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const monthLabel = first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
  const slots = date ? slotsFor(date, session.minutes, now) : [];

  return (
    <div className="mt-7 grid gap-8 sm:mt-8 md:grid-cols-[minmax(0,1fr)_15.5rem] md:gap-0">
      {/* Calendar */}
      <div className="md:pr-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap text-ink" aria-live="polite">
            {monthLabel}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={!canPrev}
              aria-label="Previous month"
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={!canNext}
              aria-label="Next month"
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 text-center font-mono text-[0.65rem] font-medium tracking-[0.12em] text-ink-mute uppercase">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: lead }, (_, i) => (
            <span key={`blank-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day: DateKey = { y: view.y, m: view.m, d: i + 1 };
            const available = slotsFor(day, session.minutes, now).length > 0;
            const selected = sameDate(day, date);
            const isToday = sameDate(day, today);
            return (
              <button
                key={i}
                type="button"
                disabled={!available}
                aria-pressed={selected}
                aria-label={`${formatDate(day)}${available ? "" : " — unavailable"}`}
                onClick={() => {
                  onDate(day);
                  if (window.innerWidth < 768) {
                    requestAnimationFrame(() => slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                  }
                }}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-full font-display text-base font-semibold transition-[background-color,color,transform] duration-300 sm:text-xl",
                  available
                    ? "bg-ember-50 text-ember-700 hover:scale-105 hover:bg-ember-100"
                    : "cursor-not-allowed text-ink-mute/40",
                  selected &&
                    "matte bg-ember-600 text-white shadow-[0_10px_24px_-12px_rgb(205_74_18/0.8)] hover:scale-100 hover:bg-ember-600",
                )}
              >
                {i + 1}
                {isToday && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-[16%] left-1/2 size-1 -translate-x-1/2 rounded-full",
                      selected ? "bg-white" : "bg-ember-600",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-ink-mute">
          <Globe className="size-4" /> {BOOKING_TZ_LABEL} · Mon – Sat
        </p>
      </div>

      {/* Time slots */}
      <div ref={slotsRef} className="scroll-mt-28 border-t border-line pt-7 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        {date ? (
          <>
            <p className="font-display text-xl font-semibold tracking-tight text-ink">{formatDate(date, "short")}</p>
            <p className="mt-1 text-sm text-ink-mute">
              {slots.length} {slots.length === 1 ? "slot" : "slots"} available
            </p>
            <ul className="mt-5 space-y-2.5 md:max-h-[27rem] md:overflow-y-auto md:pr-1 md:[scrollbar-width:thin]">
              {slots.map((t) => {
                const active = time === t;
                return (
                  <li key={t} className="flex gap-2">
                    <motion.button
                      layout
                      type="button"
                      onClick={() => onTime(t)}
                      aria-pressed={active}
                      transition={{ duration: 0.35, ease }}
                      className={cn(
                        "h-14 min-w-0 flex-1 rounded-2xl border font-display text-[1.05rem] font-semibold transition-colors",
                        active
                          ? "border-ink bg-ink text-cream"
                          : "border-ember-200 text-ember-700 hover:border-ember-600 hover:bg-ember-50",
                      )}
                    >
                      {formatTime(t)}
                    </motion.button>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.button
                          type="button"
                          onClick={onNext}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.35, ease }}
                          className="btn btn-matte h-14 overflow-hidden rounded-2xl px-5 text-[0.95rem]"
                        >
                          Next
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line-strong p-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-paper-2 text-ember-600">
              <MousePointerClick className="size-5" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">Select a date</p>
            <p className="mt-1 text-sm text-ink-mute">Available times will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div aria-hidden="true" className="mt-8 animate-pulse">
      <div className="h-8 w-48 rounded-full bg-paper-2" />
      <div className="mt-8 grid max-w-md grid-cols-7 gap-2">
        {Array.from({ length: 35 }, (_, i) => (
          <span key={i} className="aspect-square rounded-full bg-paper-2" />
        ))}
      </div>
    </div>
  );
}

/* ── Step 3 ──────────────────────────────────────────────────────── */

const inputClass =
  "h-14 w-full rounded-2xl border border-line bg-paper/50 px-5 text-base text-ink transition-[border-color,box-shadow,background-color] placeholder:text-ink-mute/70 hover:border-line-strong focus:border-ember-500 focus:bg-white focus:ring-4 focus:ring-ember-100 focus:outline-none aria-invalid:border-ember-600 aria-invalid:ring-4 aria-invalid:ring-ember-100";

function DetailsForm({
  fields,
  errors,
  onChange,
  onSubmit,
}: {
  fields: Fields;
  errors: FieldErrors;
  onChange: (patch: Partial<Fields>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form noValidate onSubmit={onSubmit} className="mt-7 grid gap-5 sm:mt-8 sm:grid-cols-2">
      <Field id="name" label="Full name" required error={errors.name}>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Aarav Sharma"
          value={fields.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClass}
        />
      </Field>
      <Field id="email" label="Email" required error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={(e) => onChange({ email: e.target.value })}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={inputClass}
        />
      </Field>
      <Field id="phone" label="WhatsApp number" required error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          aria-invalid={!!errors.phone || undefined}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={inputClass}
        />
      </Field>
      <Field id="org" label="College / organisation">
        <input
          id="org"
          name="org"
          autoComplete="organization"
          placeholder="Optional"
          value={fields.org}
          onChange={(e) => onChange({ org: e.target.value })}
          className={inputClass}
        />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold text-ink">I am a</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {learnerRoles.map((role) => (
            <label key={role} className="cursor-pointer">
              <input
                type="radio"
                name="role"
                value={role}
                checked={fields.role === role}
                onChange={() => onChange({ role })}
                className="peer sr-only"
              />
              <span className="inline-flex h-11 items-center rounded-full border border-line bg-paper/50 px-5 text-sm font-medium text-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-ember-200 hover:border-line-strong hover:text-ink">
                {role}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="notes" label="Anything we should know?" className="sm:col-span-2">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Your goals, current skills, team size or questions…"
          value={fields.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className={cn(inputClass, "h-auto resize-none py-4 leading-relaxed")}
        />
      </Field>

      <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-ink-mute sm:max-w-xs">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ember-600" />
          WhatsApp opens with your booking pre-filled — just hit send to confirm.
        </p>
        <button type="submit" className="btn btn-matte h-14 w-full px-7 text-base sm:w-auto">
          <WhatsAppIcon className="size-5" />
          Confirm on WhatsApp
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-ember-600"> *</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-ember-700">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Done ────────────────────────────────────────────────────────── */

function Confirmation({
  headingRef,
  session,
  date,
  time,
  name,
  waLink,
  onReset,
}: {
  headingRef: (el: HTMLHeadingElement | null) => void;
  session: SessionType;
  date: DateKey;
  time: number;
  name: string;
  waLink: string | null;
  onReset: () => void;
}) {
  const firstName = name.trim().split(/\s+/)[0];
  const calendar = googleCalendarUrl(
    session,
    date,
    time,
    `Online session with Scult Academy. Confirm on WhatsApp ${site.phone.display} · ${site.email}`,
  );

  return (
    <div className="mt-8">
      <span className="matte grid size-16 place-items-center rounded-full bg-ember-600 text-white shadow-[0_16px_30px_-14px_rgb(205_74_18/0.8)]">
        <Check className="size-8" strokeWidth={2.6} />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-7 font-display text-[1.75rem] leading-[1.05] font-semibold tracking-[-0.035em] text-ink outline-none sm:text-[2.75rem] sm:leading-[1.02]"
      >
        You&apos;re almost booked{firstName ? `, ${firstName}` : ""}!
      </h3>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
        We&apos;ve opened WhatsApp with your booking details. Send the message to lock in your slot — our team confirms
        it during working hours.
      </p>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-3">
        {[
          { label: "Session", value: session.title },
          { label: "Date", value: formatDate(date, "short") },
          { label: "Time (IST)", value: `${formatTime(time)} – ${formatTime(time + session.minutes)}` },
        ].map((item) => (
          <div key={item.label} className="bg-paper/60 p-5">
            <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-ink-mute uppercase">{item.label}</dt>
            <dd className="mt-2 font-display text-lg leading-snug font-semibold tracking-tight text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={waLink ?? whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-matte h-14 px-7 text-base"
        >
          <WhatsAppIcon className="size-5" />
          Open WhatsApp
        </a>
        <a href={calendar} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-14 px-6 text-base">
          <CalendarDays className="size-5" />
          Add to Google Calendar
        </a>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-mute">
        WhatsApp didn&apos;t open? Message us at{" "}
        <a href={`tel:${site.phone.tel}`} className="font-semibold text-ink underline-offset-4 hover:underline">
          {site.phone.display}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-ink underline-offset-4 hover:underline">
          {site.email}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 text-sm font-semibold text-ember-700 underline-offset-4 hover:underline"
      >
        Book another session
      </button>
    </div>
  );
}

import { Building, GraduationCap, Handshake, MonitorPlay, type LucideIcon } from "lucide-react";
import type { SessionTypeId } from "@/lib/site";

export type SessionType = {
  id: SessionTypeId;
  title: string;
  minutes: number;
  icon: LucideIcon;
  audience: string;
  description: string;
  agenda: string[];
};

export const sessionTypes: SessionType[] = [
  {
    id: "counselling",
    title: "Career & program counselling",
    minutes: 30,
    icon: GraduationCap,
    audience: "Students & professionals",
    description: "Find the right track for your goals, background and timeline — with a personalised learning path.",
    agenda: ["Your goals & background", "Track & format recommendation", "Fees, scholarships & next cohort"],
  },
  {
    id: "enterprise",
    title: "Enterprise strategy call",
    minutes: 45,
    icon: Building,
    audience: "L&D, HR & leadership teams",
    description: "Scope an AI upskilling program for your organisation, from leadership literacy to engineering depth.",
    agenda: ["Team skills & priorities", "Program design & delivery options", "Timelines, analytics & ROI"],
  },
  {
    id: "partnership",
    title: "Industry & campus partnership",
    minutes: 30,
    icon: Handshake,
    audience: "Colleges, institutions & industry bodies",
    description: "Explore campus programs, co-branded certifications and industry-specific AI bootcamps.",
    agenda: ["Your learners & objectives", "Partnership models", "Pilot plan & next steps"],
  },
  {
    id: "demo",
    title: "Live learning demo",
    minutes: 20,
    icon: MonitorPlay,
    audience: "Anyone curious about Scult",
    description: "See a live class, the learning platform and the real projects you'll build — before you commit.",
    agenda: ["Platform walkthrough", "Sample live class & projects", "Your questions, answered"],
  },
];

export const learnerRoles = ["Student", "Working professional", "Industry expert", "Enterprise team", "Institution"] as const;

/* Availability, in India Standard Time. Sundays are closed. */
export const BOOKING_TIMEZONE = "Asia/Kolkata";
export const BOOKING_TZ_LABEL = "India Standard Time (IST)";
export const IST_OFFSET_MINUTES = 330;
export const BOOKING_WINDOW_DAYS = 45;
const OPEN_MINUTE = 10 * 60; // 10:00
const CLOSE_MINUTE = 19 * 60; // 19:00
const SLOT_STEP = 30;
const MIN_LEAD_MINUTES = 60;

/** A calendar date with no time or zone attached. */
export type DateKey = { y: number; m: number; d: number };

export const sameDate = (a: DateKey | null, b: DateKey | null) =>
  !!a && !!b && a.y === b.y && a.m === b.m && a.d === b.d;

/** Today's date and current minute-of-day in IST, from an epoch timestamp. */
export function istNow(epochMs: number) {
  const ist = new Date(epochMs + IST_OFFSET_MINUTES * 60_000);
  return {
    today: { y: ist.getUTCFullYear(), m: ist.getUTCMonth(), d: ist.getUTCDate() } satisfies DateKey,
    minuteOfDay: ist.getUTCHours() * 60 + ist.getUTCMinutes(),
  };
}

const dayIndex = (k: DateKey) => Date.UTC(k.y, k.m, k.d) / 86_400_000;
export const weekday = (k: DateKey) => new Date(Date.UTC(k.y, k.m, k.d)).getUTCDay();

/** Slot start times (minutes from midnight IST) that are still bookable on a date. */
export function slotsFor(date: DateKey, minutes: number, nowMs: number): number[] {
  const { today, minuteOfDay } = istNow(nowMs);
  const offset = dayIndex(date) - dayIndex(today);
  if (offset < 0 || offset > BOOKING_WINDOW_DAYS || weekday(date) === 0) return [];
  const slots: number[] = [];
  for (let t = OPEN_MINUTE; t + minutes <= CLOSE_MINUTE; t += SLOT_STEP) {
    if (offset === 0 && t < minuteOfDay + MIN_LEAD_MINUTES) continue;
    slots.push(t);
  }
  return slots;
}

export function formatTime(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function formatDate(k: DateKey, style: "long" | "short" = "long") {
  return new Date(Date.UTC(k.y, k.m, k.d)).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
  });
}

/** Google Calendar "add event" link for a tentative hold. */
export function googleCalendarUrl(session: SessionType, date: DateKey, minute: number, details: string) {
  const startUtc = Date.UTC(date.y, date.m, date.d, 0, minute) - IST_OFFSET_MINUTES * 60_000;
  const endUtc = startUtc + session.minutes * 60_000;
  const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Scult Academy — ${session.title}`,
    dates: `${fmt(startUtc)}/${fmt(endUtc)}`,
    details,
    ctz: BOOKING_TIMEZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

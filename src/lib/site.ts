export const site = {
  name: "Scult Academy",
  shortName: "Scult",
  tagline: "Sculpt your edge in the age of AI.",
  description:
    "Scult Academy teaches AI and the technologies redefining work — live, mentor-led, build-first programs for students, professionals, industry experts and enterprise teams.",
  // Set NEXT_PUBLIC_SITE_URL in production; the fallback is used for local builds.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://academy.scult.in",
  email: "connect@scult.in",
  phone: {
    display: "+91 92506 80738",
    tel: "+919250680738",
    // wa.me expects the number with country code, digits only
    whatsapp: "919250680738",
  },
  socials: {
    linkedin: "https://www.linkedin.com/",
    x: "https://x.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
} as const;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${site.phone.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export type SessionTypeId = "counselling" | "enterprise" | "partnership" | "demo";

/** Booking page URL, optionally preselecting a session type and program. */
export const bookingHref = (type?: SessionTypeId, program?: string) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (program) params.set("program", program);
  const qs = params.toString();
  return `/book${qs ? `?${qs}` : ""}`;
};

// Absolute section links so the nav works from every route.
export const navLinks = [
  { label: "Programs", href: "/#programs" },
  { label: "Who it's for", href: "/#audiences" },
  { label: "Method", href: "/#method" },
  { label: "Enterprise", href: "/#enterprise" },
  { label: "Stories", href: "/#stories" },
  { label: "FAQ", href: "/#faq" },
] as const;

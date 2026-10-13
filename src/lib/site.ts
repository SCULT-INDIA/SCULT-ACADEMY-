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
  // Contact details, address, hours and socials mirror scult.in.
  address: {
    street: "Paras Tierea, Building 18, Sector 137",
    locality: "Noida",
    region: "Uttar Pradesh",
    postalCode: "201305",
    country: "IN",
    display: "Paras Tierea, Building 18, Sector 137, Noida, Uttar Pradesh 201305",
    geo: { lat: 28.507, lng: 77.402 },
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Paras+Tierea+Building+18+Sector+137+Noida+Uttar+Pradesh+201305",
  },
  hours: [
    { days: "Mon – Fri", open: "10:00", close: "19:00", label: "10 AM – 7 PM" },
    { days: "Saturday", open: "10:00", close: "14:00", label: "10 AM – 2 PM" },
  ],
  parent: { name: "Scult", url: "https://scult.in" },
  socials: {
    linkedin: "https://www.linkedin.com/company/scult-india/",
    instagram: "https://www.instagram.com/scult.in/",
    x: "https://x.com/scult_india",
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

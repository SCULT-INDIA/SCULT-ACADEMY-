import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { programs } from "@/lib/content";
import { bookingHref, site, whatsappUrl } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { InstagramIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/ui/social-icons";

const columns = [
  {
    title: "Programs",
    links: programs.slice(0, 5).map((p) => ({ label: p.title.replace(" & LLM Engineering", ""), href: "/#programs" })),
  },
  {
    title: "Learn with us",
    links: [
      { label: "For students", href: "/#audiences" },
      { label: "For professionals", href: "/#audiences" },
      { label: "For enterprises", href: "/#enterprise" },
      { label: "JuvenileAI × Scult workshop", href: "/workshops/juvenile-ai-2026" },
      { label: "Get your certificate", href: "/certificates" },
      { label: "Book a free session", href: bookingHref() },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "The Scult method", href: "/#method" },
      { label: "Learner stories", href: "/#stories" },
      { label: "Partner with us", href: bookingHref("partnership") },
      { label: "Brand assets", href: "/brand" },
      { label: "Visit scult.in", href: site.parent.url },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedInIcon },
  { label: "Instagram", href: site.socials.instagram, Icon: InstagramIcon },
  { label: "X", href: site.socials.x, Icon: XIcon },
  { label: "WhatsApp", href: whatsappUrl(), Icon: WhatsAppIcon },
];

const isExternal = (href: string) => href.startsWith("http");

export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-20 sm:pt-24">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-5 md:grid-cols-3 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="col-span-2 max-w-sm md:col-span-3 lg:col-span-1">
          <Logo />
          <p className="mt-5 leading-relaxed text-ink-soft">
            Sculpting the builders of the AI era — for students, professionals, industries and enterprises.
          </p>

          <ul className="mt-7 space-y-3 text-[0.95rem] text-ink-soft">
            <li>
              <a href={`mailto:${site.email}`} className="group flex items-center gap-3 transition-colors hover:text-ink">
                <Mail className="size-4 shrink-0 text-ember-600" />
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.tel}`} className="flex items-center gap-3 transition-colors hover:text-ink">
                <Phone className="size-4 shrink-0 text-ember-600" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a
                href={site.address.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors hover:text-ink"
              >
                <MapPin className="mt-1 size-4 shrink-0 text-ember-600" />
                <address className="not-italic">{site.address.display}</address>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-1 size-4 shrink-0 text-ember-600" />
              <span>
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.label}
                  </span>
                ))}
              </span>
            </li>
          </ul>

          <ul className="mt-7 flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Scult on ${label}`}
                  className="grid size-10 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300 hover:border-ember-600 hover:bg-ember-600 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-ink-mute uppercase">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {isExternal(link.href) ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5 opacity-60" />
                    </a>
                  ) : (
                    <Link href={link.href} className="text-[0.95rem] text-ink-soft transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-3 border-t border-line px-5 py-8 text-sm text-ink-mute sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © 2026 {site.name}. A{" "}
          <a href={site.parent.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-soft hover:text-ink">
            {site.parent.name}
          </a>{" "}
          company.
        </p>
        <p className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-ember-500" aria-hidden="true" />
          Made in Noida for the builders of tomorrow.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[3.5vw] bg-linear-to-b from-ember-500/35 via-ember-300/20 to-transparent bg-clip-text text-center font-display text-[25vw] leading-[0.8] font-bold tracking-[-0.07em] text-transparent select-none"
      >
        SCULT
      </div>
    </footer>
  );
}

import { ArrowUpRight } from "lucide-react";
import { programs } from "@/lib/content";
import { site } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/ui/social-icons";

const columns = [
  {
    title: "Programs",
    links: programs.slice(0, 5).map((p) => ({ label: p.title.replace(" & LLM Engineering", ""), href: "#programs" })),
  },
  {
    title: "Learn with us",
    links: [
      { label: "For students", href: "#audiences" },
      { label: "For professionals", href: "#audiences" },
      { label: "For industries", href: "#audiences" },
      { label: "For enterprises", href: "#enterprise" },
      { label: "Ways to learn", href: "#formats" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "The Scult method", href: "#method" },
      { label: "Learner stories", href: "#stories" },
      { label: "Partner with us", href: `mailto:${site.email}?subject=Partnership` },
      { label: "Careers", href: `mailto:${site.email}?subject=Careers` },
      { label: "Contact", href: `mailto:${site.email}` },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedInIcon },
  { label: "X", href: site.socials.x, Icon: XIcon },
  { label: "Instagram", href: site.socials.instagram, Icon: InstagramIcon },
  { label: "YouTube", href: site.socials.youtube, Icon: YouTubeIcon },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 leading-relaxed text-ink-soft">
            Sculpting the builders of the AI era — for students, professionals, industries and enterprises.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="group mt-6 inline-flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:text-ember-700"
          >
            {site.email}
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <ul className="mt-7 flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Scult Academy on ${label}`}
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
                  <a href={link.href} className="text-[0.95rem] text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-20 flex max-w-6xl flex-col gap-4 border-t border-line px-5 py-8 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 {site.name}. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-ember-500" aria-hidden="true" />
          Made for the builders of tomorrow.
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

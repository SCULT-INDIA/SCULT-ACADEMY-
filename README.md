# Scult Academy

Marketing site for **Scult Academy** — AI and modern-tech education for students, professionals, industries and enterprises.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4 and Motion.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the dev server on port 3000                         |
| `npm run build`        | Production build                                          |
| `npm run lint`         | ESLint                                                    |
| `npm run brand:assets` | Regenerate every logo size/placement into `public/brand/` |

## Routes

- `/` — landing page
- `/book` — Calendly-style booking (session → date & time → details). Bookings hand off to WhatsApp with every detail pre-filled. Deep-link with `?type=counselling|enterprise|partnership|demo` and `?program=<slug>`.
- `/brand` — logo variations and downloads

## Where things live

- `src/lib/site.ts` — contact details, address, office hours, socials, nav links
- `src/lib/content.ts` — all landing-page copy (programs, audiences, FAQs…)
- `src/lib/booking.ts` — session types, availability rules (IST office hours) and booking helpers
- `src/components/ui/logo.tsx` — the logo geometry; `scripts/brand-assets.mjs` mirrors it for exported files
- `src/app/globals.css` — design tokens (paper, ink, ember orange, sun yellow) and the matte button/grain styles

## Before launch

- Replace the sample figures in `stats` and the sample quotes in `testimonials` (`src/lib/content.ts`) with verified data.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain.

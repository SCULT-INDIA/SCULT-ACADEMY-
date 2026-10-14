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
- `/workshops/<slug>` — public workshop pages (e.g. `juvenile-ai-2026`), driven by the content repo
- `/certificates` — students find their certificate with their registered email + phone; PDF/PNG download and "Add to LinkedIn"
- `/verify/<id>/<code>` — public certificate verification (what the QR code opens); `/verify` for manual checks
- `/stage` — **Scult Stage**, the team-only presenter: Markdown/PDF decks, pressure-sensitive pen ink (XP-Pen, Wacom, Apple Pencil, touch), laser, shapes, whiteboard, spotlight, black/white screen, presenter console + synced audience screen. Press `?` in a deck for shortcuts and pen setup.
- `/admin` — team-only certificates admin: sign with a pen tablet, preview, bulk ZIP download
- `/login` — shared team passcode

## Setup for team features

Copy `.env.example` to `.env.local` and fill it in. Team pages need `STAGE_PASSCODE` and `AUTH_SECRET`.
Content (decks, workshop details, certificate records) lives in the private repo `Pranjulrathour/juvenile-ai-workshop`:

- **Local:** `git clone https://github.com/Pranjulrathour/juvenile-ai-workshop.git .content` and set `CONTENT_DIR=.content`.
- **Production:** set `CONTENT_TOKEN` to a fine-grained GitHub token with *Contents: read & write* on that repo only. Signatures saved in `/admin` become commits there.

Student records never enter this (public) repository.

## Where things live

- `src/lib/site.ts` — contact details, address, office hours, socials, nav links
- `src/lib/content.ts` — all landing-page copy (programs, audiences, FAQs…)
- `src/lib/booking.ts` — session types, availability rules (IST office hours) and booking helpers
- `src/components/ui/logo.tsx` — the logo geometry; `scripts/brand-assets.mjs` mirrors it for exported files
- `src/app/globals.css` — design tokens (paper, ink, ember orange, sun yellow) and the matte button/grain styles

## Before launch

- Replace the sample figures in `stats` and the sample quotes in `testimonials` (`src/lib/content.ts`) with verified data.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain.

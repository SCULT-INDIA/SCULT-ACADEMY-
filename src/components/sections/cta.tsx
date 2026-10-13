import { bookingHref, whatsappUrl } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Accent } from "@/components/ui/section-heading";

export function Cta() {
  return (
    <section id="contact" aria-labelledby="cta-title" className="px-3 py-4 sm:px-5">
      <div className="matte relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.5rem] bg-ember-600 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-56 -left-40 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(246_194_68/0.55),transparent)] blur-2xl" />
          <div className="absolute -right-40 -bottom-64 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(133_48_15/0.55),transparent)] blur-2xl" />
          <div className="bg-dots-dark mask-radial absolute inset-0 opacity-70" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-mono text-[0.68rem] font-medium tracking-[0.16em] uppercase">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-sun-300" />
            Next cohorts open now
          </span>
          <h2
            id="cta-title"
            className="reveal mt-8 font-display text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.05em]"
          >
            Stop watching AI happen. <Accent className="text-sun-200">Start building with it.</Accent>
          </h2>
          <p className="reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Take the free skills diagnostic, get a personalised path in minutes, and join a cohort of builders who
            refuse to be left behind.
          </p>
          <div className="reveal mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={bookingHref()} variant="cream" size="lg" arrow className="w-full sm:w-auto">
              Book a free session
            </ButtonLink>
            <ButtonLink
              href={whatsappUrl("Hi Scult Academy! I'd like to talk to an advisor.")}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost-dark"
              size="lg"
              className="w-full border-white/40 text-white sm:w-auto"
            >
              Chat on WhatsApp
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Mail, Plus } from "lucide-react";
import { faqs } from "@/lib/content";
import { bookingHref, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="faq-title"
            size="md"
            eyebrow="FAQ"
            title={
              <>
                Questions, <Accent className="text-ember-600">answered.</Accent>
              </>
            }
            description="Everything you need to know before you start. Can't find what you're looking for? Our advisors reply within one business day."
          />
          <div className="reveal mt-10 rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_20px_50px_-40px_rgb(23_19_15/0.45)]">
            <div className="flex items-center gap-4">
              <span className="matte grid size-12 shrink-0 place-items-center rounded-2xl bg-ember-600 text-white">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">Talk to an advisor</p>
                <p className="text-sm text-ink-mute">
                  {site.email} · {site.phone.display}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <ButtonLink href={bookingHref()} size="sm" arrow className="w-full">
                Book a free call
              </ButtonLink>
              <ButtonLink href={`mailto:${site.email}`} variant="outline" size="sm" className="w-full">
                Email us
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="reveal border-t border-line">
          {faqs.map((f, i) => (
            <details key={f.question} name="faq" open={i === 0} className="faq-item group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-[1.15rem] leading-snug font-medium tracking-[-0.02em] text-ink transition-colors hover:text-ember-700 sm:gap-6 sm:py-6 sm:text-[1.4rem]">
                {f.question}
                <span
                  aria-hidden="true"
                  className="faq-icon grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-500"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[1.02rem] leading-relaxed text-ink-soft sm:pr-14">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

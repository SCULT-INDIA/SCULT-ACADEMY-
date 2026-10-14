import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, QrCode, Share2 } from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { CertificateLookup } from "./lookup";

export const metadata: Metadata = {
  title: "Your certificate",
  description:
    "Download your Scult Academy workshop certificate — co-issued with JuvenileAI — using your registered email and phone number.",
  alternates: { canonical: "/certificates" },
};

const points = [
  { icon: BadgeCheck, title: "Verifiable", text: "Every certificate has a QR code and a unique verification code." },
  { icon: QrCode, title: "Print-ready", text: "High-resolution PDF for printing, PNG for sharing." },
  { icon: Share2, title: "LinkedIn-ready", text: "Add it to your profile's Licenses & certifications in one click." },
];

export default function CertificatesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem]">
          <div className="bg-grid mask-radial absolute inset-0 opacity-60" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-5">
          <header className="text-center">
            <Eyebrow className="animate-rise">Certificates</Eyebrow>
            <h1 className="mt-6 animate-rise font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-ink [animation-delay:90ms]">
              Get your <Accent className="text-ember-600">certificate.</Accent>
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-rise text-lg leading-relaxed text-ink-soft [animation-delay:180ms]">
              Enter the email and phone number you registered with to view, download and share your certificate.
            </p>
          </header>

          <div className="mt-10 animate-rise [animation-delay:260ms] sm:mt-12">
            <CertificateLookup />
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-[1.5rem] border border-line bg-white/70 p-5">
                <Icon className="size-5 text-ember-600" />
                <p className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-sm text-ink-mute">
            Checking someone else&apos;s certificate?{" "}
            <Link href="/verify" className="font-semibold text-ink underline-offset-4 hover:underline">
              Verify a certificate
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Confirm a Scult Academy workshop certificate is genuine using its certificate number and verification code.",
  alternates: { canonical: "/verify" },
};

export default function VerifyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-5">
          <header className="text-center">
            <Eyebrow>Verification</Eyebrow>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-ink">
              Verify a <Accent className="text-ember-600">certificate.</Accent>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Scan the QR code on the certificate, or enter the certificate number and verification code printed at the
              bottom.
            </p>
          </header>
          <VerifyForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

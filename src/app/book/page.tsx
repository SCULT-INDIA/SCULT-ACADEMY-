import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";

export const metadata: Metadata = {
  title: "Book a free session",
  description:
    "Book a free one-to-one session with a Scult Academy advisor — career and program counselling, enterprise AI upskilling, campus partnerships or a live learning demo. Confirmed on WhatsApp.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative pt-24 pb-16 sm:pt-28 sm:pb-24">
        <h1 className="sr-only">Book a free session with Scult Academy</h1>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]">
          <div className="bg-grid mask-radial absolute inset-0 opacity-60" />
        </div>
        <div className="mx-auto max-w-[80rem] animate-rise px-3 sm:px-5">
          <Suspense fallback={<BookingSkeleton />}>
            <BookingFlow />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

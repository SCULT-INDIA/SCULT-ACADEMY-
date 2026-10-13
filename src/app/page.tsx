import { JsonLd } from "@/components/json-ld";
import { Audiences } from "@/components/sections/audiences";
import { Cta } from "@/components/sections/cta";
import { Enterprise } from "@/components/sections/enterprise";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Formats } from "@/components/sections/formats";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Navbar } from "@/components/sections/navbar";
import { Programs } from "@/components/sections/programs";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { Testimonials } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <TechMarquee />
        <Audiences />
        <Programs />
        <Method />
        <Enterprise />
        <Testimonials />
        <Formats />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <JsonLd />
    </>
  );
}

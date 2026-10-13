import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Learn AI & the tech shaping the future`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "AI courses",
    "generative AI course",
    "LLM engineering",
    "AI agents course",
    "machine learning course",
    "data science course",
    "AI for students",
    "AI for professionals",
    "enterprise AI training",
    "corporate AI upskilling",
    "AI for leaders",
    "Scult Academy",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} — Sculpt your edge in the age of AI`,
    description: site.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Sculpt your edge in the age of AI`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="grain min-h-dvh overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}

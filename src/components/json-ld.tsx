import { faqs, programs } from "@/lib/content";
import { site } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        email: site.email,
        description: site.description,
        telephone: site.phone.tel,
        logo: `${site.url}/brand/png/scult-academy-mark-512.png`,
        image: `${site.url}/opengraph-image`,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.locality,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: site.address.geo.lat, longitude: site.address.geo.lng },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "10:00",
            closes: "19:00",
          },
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "14:00" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "admissions",
          telephone: site.phone.tel,
          email: site.email,
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
        parentOrganization: { "@type": "Organization", name: site.parent.name, url: site.parent.url },
        sameAs: Object.values(site.socials),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "ItemList",
        name: `${site.name} programs`,
        itemListElement: programs.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Course",
            name: p.title,
            description: p.description,
            educationalLevel: p.level,
            provider: { "@id": `${site.url}/#organization` },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

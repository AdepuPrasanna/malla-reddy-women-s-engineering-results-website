import { Helmet } from "react-helmet-async";
import { SITE_URL, SEO, FAQ_ITEMS } from "../lib/api";

export default function SEOHead() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MRECW Results",
    alternateName: [
      "Malla Reddy Engineering College for Women Results",
      "MRECW Exam Results Portal",
    ],
    url: SITE_URL,
    description: SEO.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    about: {
      "@type": "CollegeOrUniversity",
      name: "Malla Reddy Engineering College for Women",
      alternateName: "MRECW",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MRECW Results",
    url: SITE_URL,
    description: SEO.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?hallTicket={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <html lang="en" />
      <title>{SEO.title}</title>
      <meta name="description" content={SEO.description} />
      <meta name="keywords" content={SEO.keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content="MRECW Results" />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:title" content="MRECW Results — Check Your Academic Performance" />
      <meta property="og:description" content={SEO.description} />
      <meta property="og:site_name" content="MRECW Results" />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="MRECW Results — Exam Results Portal" />
      <meta name="twitter:description" content={SEO.description} />

      <meta name="geo.region" content="IN-TG" />
      <meta name="geo.placename" content="Hyderabad, Telangana, India" />

      <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

import { Helmet } from "react-helmet-async";
import { SEO_CONFIG } from "../seoConfig";
import { useLocation } from "react-router-dom";

interface SEOProps {
  pageKey?: string;
  title?: string;
  description?: string;
  keywords?: string;
}

export default function SEO({ pageKey, title, description, keywords }: SEOProps) {
  const location = useLocation();
  const data = pageKey ? SEO_CONFIG[pageKey] : null;

  const currentTitle = title || data?.title || "Shine Limos | Premium Black Car & Chauffeur Service in Washington DC";
  const currentDesc = description || data?.description || "Premier luxury black car, limousine, and chauffeur service in Washington DC, Northern Virginia, and Maryland.";
  const currentKeywords = keywords || data?.keywords;

  const canonicalUrl = `https://shinelimos.com${location.pathname === "/" ? "" : location.pathname}`;

  return (
    <Helmet>
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      {currentKeywords && <meta name="keywords" content={currentKeywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      {pageKey === "home" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Shine Limos",
            telephone: "(202) 951-7172",
            url: "https://shinelimos.com",
            openingHours: "Mo-Su 00:00-23:59",
            areaServed: ["Washington, DC", "Northern Virginia", "Maryland"],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5.0",
              reviewCount: "10",
            },
            sameAs: [
              "https://www.instagram.com/shinelimos/",
              "https://facebook.com/ShineLimosllc",
              "https://www.tiktok.com/@shinelim0s",
              "https://www.linkedin.com/company/110145070",
            ],
          })}
        </script>
      )}
    </Helmet>
  );
}

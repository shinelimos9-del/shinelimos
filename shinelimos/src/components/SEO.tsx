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

  const canonicalUrl = `https://shinelimosllc.com${location.pathname === "/" ? "" : location.pathname}`;

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
    </Helmet>
  );
}

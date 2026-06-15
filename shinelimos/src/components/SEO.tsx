import { Helmet } from "react-helmet-async";
import { SEO_CONFIG } from "../seoConfig";

interface SEOProps {
  pageKey: string;
}

export default function SEO({ pageKey }: SEOProps) {
  const data = SEO_CONFIG[pageKey];

  if (!data) return null;

  return (
    <Helmet>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      {data.keywords && <meta name="keywords" content={data.keywords} />}
    </Helmet>
  );
}

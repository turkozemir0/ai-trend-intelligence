import { Metadata } from "next";
import { getBaseUrl } from "@/lib/seo-utils";

const SITE_URL = getBaseUrl();
const SITE_NAME = "AI Trend Intelligence";

export function pageMeta(title: string, description: string, path: string): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function toolJsonLd(tool: {
  name: string;
  slug: string;
  short_description: string | null;
  trend_score: number;
  pricing: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.short_description,
    applicationCategory: "AI Tool",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.trend_score,
      bestRating: 10,
      worstRating: 0,
      ratingCount: 1,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Real-time AI ecosystem intelligence — tools, trends, and signals.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

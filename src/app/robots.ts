import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo-utils";

const SITE_URL = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "anthropic-ai", "Google-Extended", "YandexBot", "bingbot"],
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

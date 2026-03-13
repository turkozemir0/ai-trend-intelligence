export function getBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (
    configuredUrl &&
    !configuredUrl.includes("your-project-name") &&
    !configuredUrl.includes("your-production-domain")
  ) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return "http://localhost:3000";
}

export function generateCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

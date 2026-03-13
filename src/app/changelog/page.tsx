import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog | AI Trend Intelligence",
  description: "Product updates and new features for AI Trend Intelligence",
};

export default function ChangelogPage() {
  const updates = [
    {
      version: "v2.0.0",
      date: "March 2026",
      title: "DaaS Platform Launch",
      items: [
        "Versioned API (v1) with authentication",
        "API key management and rate limiting",
        "Usage tracking and metering",
        "Windowed metrics (24h, 7d trend scores)",
        "Tool alias system for better entity resolution",
        "Cron run logging and diagnostics",
        "Signal classification (type, sentiment, topic)",
        "Historical trends endpoint",
        "Comprehensive API documentation",
        "Pricing and monetization infrastructure",
      ],
    },
    {
      version: "v1.0.0",
      date: "February 2026",
      title: "Public MVP Launch",
      items: [
        "Real-time signal feed from GitHub and Hacker News",
        "AI tools directory with 12+ seed tools",
        "Automated trend score calculation",
        "Tool detail pages with stats and metadata",
        "Submit form for community contributions",
        "Public API endpoints for tools and signals",
        "SEO optimization with JSON-LD structured data",
        "Automated scraping every 6 hours",
        "Category-based filtering",
        "Momentum indicators (rising, stable, declining)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-zinc-400 mb-12">
          Track our progress as we build the most comprehensive AI ecosystem intelligence platform.
        </p>

        <div className="space-y-12">
          {updates.map((update) => (
            <div key={update.version} className="border-l-2 border-emerald-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-500 text-zinc-950 px-3 py-1 rounded-full text-sm font-bold">
                  {update.version}
                </span>
                <span className="text-zinc-400 text-sm">{update.date}</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">{update.title}</h2>
              <ul className="space-y-2">
                {update.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">What&apos;s Next?</h2>
          <p className="text-zinc-400 mb-6">
            We&apos;re constantly improving. Here&apos;s what&apos;s coming soon:
          </p>
          <ul className="space-y-2 text-zinc-300 text-left max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">→</span>
              <span>Product Hunt integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">→</span>
              <span>Reddit signal tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">→</span>
              <span>Webhook notifications for watchlists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">→</span>
              <span>AI-powered signal classification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">→</span>
              <span>Weekly email digest</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

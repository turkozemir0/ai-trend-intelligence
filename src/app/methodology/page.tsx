import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology | AI Trend Intelligence",
  description: "Learn how we calculate trend scores and collect AI ecosystem data",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Methodology</h1>
        <p className="text-zinc-400 mb-12">
          Transparency in how we collect, process, and score AI ecosystem intelligence.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Data Sources</h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-bold mb-2">GitHub Trending</h3>
              <p className="text-zinc-300 mb-2">
                We scrape GitHub&apos;s trending repositories weekly, filtering for AI-related
                projects using keyword matching.
              </p>
              <p className="text-sm text-zinc-400">Update frequency: Every 6 hours</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-bold mb-2">Hacker News</h3>
              <p className="text-zinc-300 mb-2">
                We monitor top stories via the official Firebase API, identifying AI tool
                mentions and discussions.
              </p>
              <p className="text-sm text-zinc-400">Update frequency: Every 6 hours</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Trend Score Calculation</h2>
          <p className="text-zinc-300 mb-4">
            Our trend score is a composite metric ranging from 0 to 10, calculated using the
            following formula:
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-4">
            <pre className="text-sm text-emerald-400 overflow-x-auto">
{`trend_score = base_score + github_component + hn_component + stars_component

Where:
  base_score = 2.0
  github_component = min(stars_weekly_delta / 100, 3.0)
  hn_component = min(hn_points / 50, 3.0)
  stars_component = min(github_stars / 10000, 2.0)

Final score is clamped between 0.0 and 10.0`}
            </pre>
          </div>

          <h3 className="font-semibold mb-2">Windowed Metrics</h3>
          <p className="text-zinc-300 mb-4">
            We also calculate time-windowed scores for more granular trend analysis:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-300 mb-4">
            <li>
              <strong>24h Trend Score:</strong> Based on signals and activity in the last 24 hours
            </li>
            <li>
              <strong>7d Trend Score:</strong> Based on signals and activity in the last 7 days
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Momentum Classification</h2>
          <p className="text-zinc-300 mb-4">
            Tools are classified into momentum categories based on trend score changes:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">Rising</span>
              <div>
                <strong className="text-emerald-400">Rising:</strong>
                <span className="text-zinc-300 ml-2">
                  Trend score increased by more than 0.3 points
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">Stable</span>
              <div>
                <strong className="text-amber-400">Stable:</strong>
                <span className="text-zinc-300 ml-2">
                  Trend score change between -0.3 and +0.3 points
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">Declining</span>
              <div>
                <strong className="text-zinc-400">Declining:</strong>
                <span className="text-zinc-300 ml-2">
                  Trend score decreased by more than 0.3 points
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Entity Resolution</h2>
          <p className="text-zinc-300 mb-4">
            We match signals to tools using a multi-tier approach:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-zinc-300">
            <li>Exact GitHub URL match (highest priority)</li>
            <li>Tool alias exact match (e.g., &quot;cursor-ai&quot; to &quot;Cursor&quot;)</li>
            <li>Normalized name match</li>
            <li>Fuzzy text matching (fallback)</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Data Quality</h2>
          <p className="text-zinc-300 mb-4">
            We implement several measures to ensure data quality:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>Duplicate detection using source plus source_id unique constraints</li>
            <li>Input validation to skip malformed or empty data</li>
            <li>URL normalization and validation</li>
            <li>Numeric field sanitization (NaN to 0)</li>
            <li>Idempotent upsert operations to prevent data duplication</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Known Limitations</h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>Trend scores are relative, not absolute measures of tool quality</li>
            <li>New tools may have artificially high momentum due to low baseline</li>
            <li>GitHub stars can be gamed and don&apos;t always reflect actual usage</li>
            <li>HN mentions are limited to top stories and may miss niche discussions</li>
            <li>Entity matching may occasionally link signals to wrong tools</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Update Frequency</h2>
          <p className="text-zinc-300 mb-4">Our data pipeline runs on the following schedule:</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>
              <strong>Scraping:</strong> Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
            </li>
            <li>
              <strong>Trend Score Calculation:</strong> After each scraping run
            </li>
            <li>
              <strong>API Cache:</strong> 5 minutes for tools, 1 minute for signals
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Questions?</h2>
          <p className="text-zinc-300">
            Have questions about our methodology? Contact us at{" "}
            <a href="mailto:data@aitrendintel.com" className="text-emerald-400 hover:underline">
              data@aitrendintel.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

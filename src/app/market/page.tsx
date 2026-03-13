import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { getMarketOverview } from "@/lib/market";

export const metadata = pageMeta(
  "AI Market Trends",
  "Category-level view of AI tool momentum, signal concentration, and market dominance.",
  "/market"
);

export default async function MarketPage() {
  const overview = await getMarketOverview();
  const topCategories = overview.categories.slice(0, 8);
  const maxSignals7d = Math.max(...topCategories.map((item) => item.signals_7d), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Market Trends</h1>
        <p className="text-lg text-zinc-400 max-w-3xl">
          Track which AI sectors are dominating by signal volume, tool momentum, and category share.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{overview.summary.active_categories}</div>
          <div className="text-sm text-zinc-400">Active Categories</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{overview.summary.total_tools}</div>
          <div className="text-sm text-zinc-400">Tracked Tools</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{overview.summary.total_signals_24h}</div>
          <div className="text-sm text-zinc-400">Signals in 24h</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{overview.summary.total_signals_7d}</div>
          <div className="text-sm text-zinc-400">Signals in 7d</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Category Dominance</h2>
            <span className="text-sm text-zinc-500">Ranked by 7d signal share</span>
          </div>
          <div className="space-y-4">
            {topCategories.map((item) => (
              <div key={item.category.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{item.category.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {item.tool_count} tools · {item.rising_tools} rising
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">{item.market_share}%</div>
                    <div className="text-xs text-zinc-500">market share</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                      style={{ width: `${Math.max((item.signals_7d / maxSignals7d) * 100, 6)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-zinc-500">Signals 24h</div>
                    <div className="font-semibold">{item.signals_24h}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Signals 7d</div>
                    <div className="font-semibold">{item.signals_7d}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Avg trend</div>
                    <div className="font-semibold">{item.avg_trend_score}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">7d trend</div>
                    <div className="font-semibold">{item.avg_trend_score_7d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-3">Leading Segment</h2>
            {overview.categories[0] ? (
              <>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {overview.categories[0].category.name}
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  {overview.categories[0].signals_7d} signals in the last 7 days across {overview.categories[0].tool_count} tracked tools.
                </p>
                <Link
                  href={`/tools?category=${overview.categories[0].category.slug}`}
                  className="inline-flex text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Explore category tools
                </Link>
              </>
            ) : (
              <p className="text-sm text-zinc-400">No category data available yet.</p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-3">How to read this</h2>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                Signal counts come from matched tool activity aggregated by category.
              </p>
              <p>
                Market share is calculated from each category&apos;s 7-day signal total relative to all tracked categories.
              </p>
              <p>
                Higher average trend scores indicate stronger momentum across the tools inside that segment.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


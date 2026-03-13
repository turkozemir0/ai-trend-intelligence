import { createServerSupabase } from "@/lib/supabase/server";
import { Signal, Tool } from "@/types";
import SignalCard from "@/components/signal-card";
import ToolCard from "@/components/tool-card";
import { pageMeta } from "@/lib/seo";
import { getMarketOverview } from "@/lib/market";
import Link from "next/link";

export const metadata = pageMeta(
  "AI Ecosystem Intelligence",
  "Real-time signals from GitHub, Hacker News & more",
  "/"
);

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const marketOverview = await getMarketOverview();
  const snapshotCategories = marketOverview.categories.slice(0, 4);

  const { data: signals } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: tools } = await supabase
    .from("tools")
    .select("*, category:categories(*)")
    .eq("is_published", true)
    .order("stars_weekly_delta", { ascending: false })
    .limit(6);

  const { count: toolsCount } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todaySignalsCount } = await supabase
    .from("signals")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI Ecosystem Intelligence
        </h1>
        <p className="text-lg text-zinc-400 mb-8">
          Real-time signals from GitHub, Hacker News & more
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{toolsCount || 0}+</div>
            <div className="text-sm text-zinc-400">AI Tools Tracked</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{todaySignalsCount || 0}</div>
            <div className="text-sm text-zinc-400">Signals Today</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">2</div>
            <div className="text-sm text-zinc-400">Data Sources</div>
          </div>
        </div>
      </div>

      <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-semibold mb-1">AI Market Snapshot</h2>
            <p className="text-sm text-zinc-400">
              Category-level view of where AI product momentum is concentrating right now.
            </p>
          </div>
          <Link href="/market" className="text-sm text-emerald-400 hover:text-emerald-300 whitespace-nowrap">
            View full market trends
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {snapshotCategories.map((item) => (
            <div key={item.category.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{item.category.name}</h3>
                <span className="text-sm font-semibold text-emerald-400">{item.market_share}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  style={{ width: `${Math.max(item.market_share, 8)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-zinc-500">Signals 7d</div>
                  <div className="font-semibold">{item.signals_7d}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Avg trend</div>
                  <div className="font-semibold">{item.avg_trend_score}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Latest Signals</h2>
          {signals && signals.length > 0 ? (
            <div className="space-y-3">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal as Signal} />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-400">
                Signals will appear after the first scraper run. Trigger /api/cron to start.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Top Movers This Week</h2>
          <div className="space-y-3">
            {tools?.map((tool) => (
              <ToolCard key={tool.id} tool={tool as Tool} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

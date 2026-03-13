import { createServerSupabase } from "@/lib/supabase/server";
import { Signal, Tool } from "@/types";
import SignalCard from "@/components/signal-card";
import ToolCard from "@/components/tool-card";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "AI Ecosystem Intelligence",
  "Real-time signals from GitHub, Hacker News & more",
  "/"
);

export default async function HomePage() {
  const supabase = await createServerSupabase();

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

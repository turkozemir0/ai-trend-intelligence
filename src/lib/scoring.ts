import { supabaseAdmin } from "@/lib/supabase/admin";

interface ToolScoreData {
  id: string;
  name: string;
  github_stars: number;
  stars_weekly_delta: number;
  hn_points: number;
  trend_score: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

async function calculateWindowedMetrics(toolId: string, toolName: string) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { count: signals24h } = await supabaseAdmin
    .from("signals")
    .select("*", { count: "exact", head: true })
    .ilike("title", `%${toolName}%`)
    .gte("created_at", twentyFourHoursAgo.toISOString());

  const { count: signals7d } = await supabaseAdmin
    .from("signals")
    .select("*", { count: "exact", head: true })
    .ilike("title", `%${toolName}%`)
    .gte("created_at", sevenDaysAgo.toISOString());

  const { data: hnSignals7d } = await supabaseAdmin
    .from("signals")
    .select("score")
    .eq("source", "hackernews")
    .ilike("title", `%${toolName}%`)
    .gte("created_at", sevenDaysAgo.toISOString());

  const hnPoints7d = hnSignals7d?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;

  return {
    signals_24h: signals24h || 0,
    signals_7d: signals7d || 0,
    hn_points_7d: hnPoints7d,
  };
}

export async function recalculateTrendScores(): Promise<number> {
  const { data: tools, error } = await supabaseAdmin
    .from("tools")
    .select("id, name, github_stars, stars_weekly_delta, hn_points, trend_score")
    .eq("is_published", true);

  if (error || !tools) {
    console.error("Error fetching tools for scoring:", error);
    return 0;
  }

  let updatedCount = 0;

  for (const tool of tools as ToolScoreData[]) {
    const windowedMetrics = await calculateWindowedMetrics(tool.id, tool.name);

    const githubComponent = Math.min((tool.stars_weekly_delta || 0) / 100, 3.0);
    const hnComponent = Math.min((tool.hn_points || 0) / 50, 3.0);
    const starsComponent = Math.min((tool.github_stars || 0) / 10000, 2.0);
    const baseScore = 2.0;

    const newTrendScore = clamp(
      baseScore + githubComponent + hnComponent + starsComponent,
      0.0,
      10.0
    );

    const signals24hComponent = Math.min(windowedMetrics.signals_24h / 5, 3.0);
    const signals7dComponent = Math.min(windowedMetrics.signals_7d / 20, 3.0);
    const hnPoints7dComponent = Math.min(windowedMetrics.hn_points_7d / 100, 2.0);

    const trendScore24h = clamp(
      baseScore + signals24hComponent + githubComponent,
      0.0,
      10.0
    );

    const trendScore7d = clamp(
      baseScore + signals7dComponent + hnPoints7dComponent + githubComponent,
      0.0,
      10.0
    );

    const oldTrendScore = tool.trend_score || 0;
    const scoreDiff = newTrendScore - oldTrendScore;

    let momentum: "rising" | "stable" | "declining" = "stable";
    if (scoreDiff > 0.3) {
      momentum = "rising";
    } else if (scoreDiff < -0.3) {
      momentum = "declining";
    }

    const { error: updateError } = await supabaseAdmin
      .from("tools")
      .update({
        trend_score: newTrendScore,
        momentum: momentum,
        signals_24h: windowedMetrics.signals_24h,
        signals_7d: windowedMetrics.signals_7d,
        github_delta_7d: tool.stars_weekly_delta,
        hn_points_7d: windowedMetrics.hn_points_7d,
        trend_score_24h: trendScore24h,
        trend_score_7d: trendScore7d,
      })
      .eq("id", tool.id);

    if (!updateError) {
      updatedCount++;
    }
  }

  return updatedCount;
}

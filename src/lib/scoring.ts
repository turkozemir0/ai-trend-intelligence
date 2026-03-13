import { supabaseAdmin } from "@/lib/supabase/admin";

interface ToolScoreData {
  id: string;
  github_stars: number;
  stars_weekly_delta: number;
  hn_points: number;
  trend_score: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function recalculateTrendScores(): Promise<number> {
  const { data: tools, error } = await supabaseAdmin
    .from("tools")
    .select("id, github_stars, stars_weekly_delta, hn_points, trend_score")
    .eq("is_published", true);

  if (error || !tools) {
    console.error("Error fetching tools for scoring:", error);
    return 0;
  }

  let updatedCount = 0;

  for (const tool of tools as ToolScoreData[]) {
    const githubComponent = Math.min((tool.stars_weekly_delta || 0) / 100, 3.0);
    const hnComponent = Math.min((tool.hn_points || 0) / 50, 3.0);
    const starsComponent = Math.min((tool.github_stars || 0) / 10000, 2.0);
    const baseScore = 2.0;

    const newTrendScore = clamp(
      baseScore + githubComponent + hnComponent + starsComponent,
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
      })
      .eq("id", tool.id);

    if (!updateError) {
      updatedCount++;
    }
  }

  return updatedCount;
}

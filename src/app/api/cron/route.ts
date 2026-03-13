import { NextRequest, NextResponse } from "next/server";
import { scrapeGithubTrending, saveGithubSignals } from "@/lib/scrapers/github";
import { scrapeHackerNews, saveHNSignals } from "@/lib/scrapers/hackernews";
import { recalculateTrendScores } from "@/lib/scoring";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  let runId: string | null = null;

  try {
    const { data: runData, error: runError } = await supabaseAdmin
      .from("cron_runs")
      .insert({
        started_at: startedAt,
        status: "running",
      })
      .select("id")
      .single();

    if (runError) {
      console.error("Failed to create cron run log:", runError);
    } else {
      runId = runData?.id;
    }
  } catch (error) {
    console.error("Cron run logging error:", error);
  }

  const errors: string[] = [];
  let githubCount = 0;
  let hnCount = 0;
  let scoredCount = 0;

  try {
    const githubRepos = await scrapeGithubTrending();
    const githubResult = await saveGithubSignals(githubRepos);
    githubCount = githubResult.count;
    errors.push(...githubResult.errors.map((error) => `GitHub: ${error}`));
  } catch (error) {
    console.error("GitHub scraper error:", error);
    errors.push(`GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    const hnStories = await scrapeHackerNews();
    const hnResult = await saveHNSignals(hnStories);
    hnCount = hnResult.count;
    errors.push(...hnResult.errors.map((error) => `HackerNews: ${error}`));
  } catch (error) {
    console.error("HN scraper error:", error);
    errors.push(`HackerNews: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    scoredCount = await recalculateTrendScores();
  } catch (error) {
    console.error("Scoring error:", error);
    errors.push(`Scoring: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  const finishedAt = new Date().toISOString();
  const status = errors.length === 0 ? "success" : 
                 (githubCount > 0 || hnCount > 0 || scoredCount > 0) ? "partial_failure" : "failed";

  if (runId) {
    try {
      await supabaseAdmin
        .from("cron_runs")
        .update({
          finished_at: finishedAt,
          status,
          github_count: githubCount,
          hackernews_count: hnCount,
          scored_count: scoredCount,
          error_count: errors.length,
          errors: errors,
        })
        .eq("id", runId);
    } catch (error) {
      console.error("Failed to update cron run log:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    github: githubCount,
    hackernews: hnCount,
    scored: scoredCount,
    errors,
    timestamp: finishedAt,
  });
}

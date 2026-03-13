import { NextRequest, NextResponse } from "next/server";
import { scrapeGithubTrending, saveGithubSignals } from "@/lib/scrapers/github";
import { scrapeHackerNews, saveHNSignals } from "@/lib/scrapers/hackernews";
import { recalculateTrendScores } from "@/lib/scoring";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  let githubCount = 0;
  let hnCount = 0;
  let scoredCount = 0;

  try {
    const githubRepos = await scrapeGithubTrending();
    githubCount = await saveGithubSignals(githubRepos);
  } catch (error) {
    console.error("GitHub scraper error:", error);
    errors.push(`GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    const hnStories = await scrapeHackerNews();
    hnCount = await saveHNSignals(hnStories);
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

  return NextResponse.json({
    ok: true,
    github: githubCount,
    hackernews: hnCount,
    scored: scoredCount,
    errors,
    timestamp: new Date().toISOString(),
  });
}

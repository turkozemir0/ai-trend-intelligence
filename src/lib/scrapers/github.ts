import * as cheerio from "cheerio";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { findToolMatch } from "@/lib/matching";
import { classifySignal, shouldAttemptToolMatch } from "@/lib/classification";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "agent", "ml", "transformer", "diffusion",
  "langchain", "openai", "anthropic", "model", "inference", "prompt",
  "copilot", "rag", "embedding", "huggingface", "neural", "chatbot", "automation"
];

interface GithubRepo {
  name: string;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  starsToday: number;
  forks: number;
}

interface SaveSignalsResult {
  count: number;
  errors: string[];
}

export async function scrapeGithubTrending(): Promise<GithubRepo[]> {
  const response = await fetch("https://github.com/trending?since=weekly", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const html = await response.text();
  const $ = cheerio.load(html);
  const repos: GithubRepo[] = [];

  $("article.Box-row").each((_, element) => {
    const $el = $(element);
    const repoLink = $el.find("h2 a").attr("href");
    if (!repoLink) return;

    const fullName = repoLink.replace("/", "");
    const name = fullName.split("/")[1] || fullName;
    const description = $el.find("p").text().trim();
    const starsText = $el.find('a[href*="/stargazers"]').text().trim();
    const starsToday = parseInt($el.find(".float-sm-right").text().replace(/[^\d]/g, "") || "0");
    const forksText = $el.find('a[href*="/forks"]').text().trim();

    const stars = parseInt(starsText.replace(/,/g, "") || "0");
    const forks = parseInt(forksText.replace(/,/g, "") || "0");

    const searchText = `${name} ${description}`.toLowerCase();
    const isAIRelated = AI_KEYWORDS.some(keyword => searchText.includes(keyword));

    if (isAIRelated) {
      repos.push({
        name,
        fullName,
        url: `https://github.com${repoLink}`,
        description,
        stars,
        starsToday,
        forks,
      });
    }
  });

  return repos;
}

export async function saveGithubSignals(repos: GithubRepo[]): Promise<SaveSignalsResult> {
  let count = 0;
  const errors: string[] = [];

  for (const repo of repos) {
    if (!repo.name || !repo.fullName) {
      errors.push(`Skipped repo with empty name or fullName`);
      continue;
    }

    const normalizedUrl = repo.url && repo.url.startsWith("http") ? repo.url : null;
    
    // Classify the signal
    const classification = classifySignal(
      repo.name,
      repo.description,
      "github",
      normalizedUrl
    );

    // Only attempt tool matching for relevant entity types
    let matchedTool = null;
    if (shouldAttemptToolMatch(classification.entity_type)) {
      matchedTool = await findToolMatch(repo.name, repo.fullName, repo.url);
    }

    const normalizedStars = isNaN(repo.stars) ? 0 : repo.stars;
    const normalizedStarsToday = isNaN(repo.starsToday) ? 0 : repo.starsToday;
    const normalizedForks = isNaN(repo.forks) ? 0 : repo.forks;

    const { error } = await supabaseAdmin.from("signals").upsert(
      {
        source: "github",
        source_id: repo.fullName,
        title: repo.name,
        url: normalizedUrl,
        description: repo.description || null,
        score: normalizedStars,
        score_delta: normalizedStarsToday,
        comments: normalizedForks,
        raw_data: repo,
        tool_id: matchedTool?.id || null,
        entity_type: classification.entity_type,
        signal_type: classification.signal_type,
        topic: classification.topic,
        sentiment: classification.sentiment,
        classification_confidence: classification.confidence,
      },
      { onConflict: "source,source_id" }
    );

    if (!error) {
      count++;
    } else {
      errors.push(`signals upsert failed for ${repo.fullName}: ${error.message}`);
      continue;
    }

    if (matchedTool) {
      const { error: toolUpdateError } = await supabaseAdmin
        .from("tools")
        .update({
          github_stars: repo.stars,
          stars_weekly_delta: repo.starsToday,
        })
        .eq("id", matchedTool.id);

      if (toolUpdateError) {
        errors.push(`tool update failed for ${matchedTool.name}: ${toolUpdateError.message}`);
      }
    }
  }

  return { count, errors };
}

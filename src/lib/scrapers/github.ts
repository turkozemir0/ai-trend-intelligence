import * as cheerio from "cheerio";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

export async function saveGithubSignals(repos: GithubRepo[]): Promise<number> {
  let count = 0;

  for (const repo of repos) {
    const { error } = await supabaseAdmin.from("signals").upsert(
      {
        source: "github",
        source_id: repo.fullName,
        title: repo.name,
        url: repo.url,
        description: repo.description,
        score: repo.stars,
        score_delta: repo.starsToday,
        comments: repo.forks,
        raw_data: repo,
      },
      { onConflict: "source,source_id" }
    );

    if (!error) count++;
  }

  return count;
}

import { supabaseAdmin } from "@/lib/supabase/admin";
import { findToolMatch } from "@/lib/matching";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "agent", "ml", "transformer", "diffusion",
  "langchain", "openai", "anthropic", "model", "inference", "prompt",
  "copilot", "rag", "embedding", "huggingface", "neural", "chatbot", "automation"
];

interface HNStory {
  id: number;
  title: string;
  url: string | null;
  score: number;
  descendants: number;
}

interface SaveSignalsResult {
  count: number;
  errors: string[];
}

export async function scrapeHackerNews(): Promise<HNStory[]> {
  const topStoriesResponse = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const topStoryIds: number[] = await topStoriesResponse.json();
  const storyIds = topStoryIds.slice(0, 50);

  const storyPromises = storyIds.map(async (id) => {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return response.json();
  });

  const stories = await Promise.all(storyPromises);
  const aiStories: HNStory[] = [];

  for (const story of stories) {
    if (!story || !story.title) continue;

    const searchText = `${story.title} ${story.url || ""}`.toLowerCase();
    const isAIRelated = AI_KEYWORDS.some(keyword => searchText.includes(keyword));

    if (isAIRelated) {
      aiStories.push({
        id: story.id,
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        score: story.score || 0,
        descendants: story.descendants || 0,
      });
    }
  }

  return aiStories;
}

export async function saveHNSignals(stories: HNStory[]): Promise<SaveSignalsResult> {
  let count = 0;
  const errors: string[] = [];

  const { data: allTools } = await supabaseAdmin
    .from("tools")
    .select("id, name, slug");

  for (const story of stories) {
    if (!story.title || !story.id) {
      errors.push(`Skipped story with empty title or id`);
      continue;
    }

    let matchedToolId: string | null = null;
    let matchedToolName: string | null = null;

    if (allTools) {
      const storyTitleLower = story.title.toLowerCase();

      for (const tool of allTools) {
        const toolNameLower = tool.name.toLowerCase();

        if (storyTitleLower.includes(toolNameLower)) {
          const matchedTool = await findToolMatch(tool.name, undefined, story.url);
          if (matchedTool) {
            matchedToolId = matchedTool.id;
            matchedToolName = matchedTool.name;
          }
          break;
        }
      }
    }

    const normalizedUrl = story.url && story.url.startsWith("http") ? story.url : null;
    const normalizedScore = isNaN(story.score) ? 0 : story.score;
    const normalizedDescendants = isNaN(story.descendants) ? 0 : story.descendants;

    const { error } = await supabaseAdmin.from("signals").upsert(
      {
        source: "hackernews",
        source_id: String(story.id),
        title: story.title,
        url: normalizedUrl,
        description: null,
        score: normalizedScore,
        score_delta: 0,
        comments: normalizedDescendants,
        raw_data: story,
        tool_id: matchedToolId,
      },
      { onConflict: "source,source_id" }
    );

    if (!error) {
      count++;
    } else {
      errors.push(`signals upsert failed for story ${story.id}: ${error.message}`);
      continue;
    }

    if (matchedToolId) {
      const { data: currentTool } = await supabaseAdmin
        .from("tools")
        .select("hn_points")
        .eq("id", matchedToolId)
        .single();

      const newHnPoints = (currentTool?.hn_points || 0) + story.score;

      const { error: toolUpdateError } = await supabaseAdmin
        .from("tools")
        .update({ hn_points: newHnPoints })
        .eq("id", matchedToolId);

      if (toolUpdateError) {
        errors.push(`tool update failed for ${matchedToolName || matchedToolId}: ${toolUpdateError.message}`);
      }
    }
  }

  return { count, errors };
}

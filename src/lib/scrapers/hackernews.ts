import { supabaseAdmin } from "@/lib/supabase/admin";

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

export async function saveHNSignals(stories: HNStory[]): Promise<number> {
  let count = 0;

  const { data: allTools } = await supabaseAdmin
    .from("tools")
    .select("id, name, slug");

  for (const story of stories) {
    const { error } = await supabaseAdmin.from("signals").upsert(
      {
        source: "hackernews",
        source_id: String(story.id),
        title: story.title,
        url: story.url,
        description: null,
        score: story.score,
        score_delta: 0,
        comments: story.descendants,
        raw_data: story,
      },
      { onConflict: "source,source_id" }
    );

    if (!error) count++;

    if (allTools) {
      const storyTitleLower = story.title.toLowerCase();
      for (const tool of allTools) {
        if (storyTitleLower.includes(tool.name.toLowerCase())) {
          const { data: currentTool } = await supabaseAdmin
            .from("tools")
            .select("hn_points")
            .eq("id", tool.id)
            .single();

          const newHnPoints = (currentTool?.hn_points || 0) + story.score;

          await supabaseAdmin
            .from("tools")
            .update({ hn_points: newHnPoints })
            .eq("id", tool.id);
        }
      }
    }
  }

  return count;
}

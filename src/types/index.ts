export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  website: string | null;
  category_id: string | null;
  pricing: "free" | "freemium" | "paid" | "enterprise" | "open-source";
  pricing_detail: string | null;
  github_url: string | null;
  github_stars: number;
  github_forks: number;
  stars_weekly_delta: number;
  producthunt_votes: number;
  hn_points: number;
  social_mentions: number;
  trend_score: number;
  momentum: "rising" | "stable" | "declining";
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  signals_24h?: number;
  signals_7d?: number;
  github_delta_7d?: number;
  hn_points_7d?: number;
  trend_score_24h?: number;
  trend_score_7d?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tool_count: number;
}

export interface CategoryMarketStats {
  category: Category;
  tool_count: number;
  avg_trend_score: number;
  avg_trend_score_24h: number;
  avg_trend_score_7d: number;
  signals_24h: number;
  signals_7d: number;
  rising_tools: number;
  stable_tools: number;
  declining_tools: number;
  market_share: number;
}

export interface MarketOverview {
  summary: {
    total_tools: number;
    active_categories: number;
    total_signals_24h: number;
    total_signals_7d: number;
    leading_category_slug: string | null;
  };
  categories: CategoryMarketStats[];
}

export interface Signal {
  id: string;
  source: "github" | "hackernews" | "producthunt" | "reddit";
  source_id: string;
  title: string;
  url: string | null;
  description: string | null;
  score: number;
  score_delta: number;
  comments: number;
  created_at: string;
  signal_type?: "release" | "discussion" | "tutorial" | "news" | "other" | null;
  topic?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
  tool_id?: string | null;
}

export interface Submission {
  name: string;
  website: string;
  description: string;
  category: string;
  submitter_email: string;
}

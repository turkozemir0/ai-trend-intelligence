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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tool_count: number;
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
}

export interface Submission {
  name: string;
  website: string;
  description: string;
  category: string;
  submitter_email: string;
}

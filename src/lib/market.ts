import { supabaseAdmin } from "@/lib/supabase/admin";
import { Category, CategoryMarketStats, MarketOverview, Tool } from "@/types";

interface AggregationTool extends Pick<
  Tool,
  | "id"
  | "category_id"
  | "trend_score"
  | "trend_score_24h"
  | "trend_score_7d"
  | "signals_24h"
  | "signals_7d"
  | "momentum"
> {}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const [{ data: categories, error: categoriesError }, { data: tools, error: toolsError }] =
    await Promise.all([
      supabaseAdmin.from("categories").select("*").order("name"),
      supabaseAdmin
        .from("tools")
        .select("id, category_id, trend_score, trend_score_24h, trend_score_7d, signals_24h, signals_7d, momentum")
        .eq("is_published", true),
    ]);

  if (categoriesError) {
    throw new Error(`Failed to load categories: ${categoriesError.message}`);
  }

  if (toolsError) {
    throw new Error(`Failed to load tools: ${toolsError.message}`);
  }

  const typedCategories = (categories || []) as Category[];
  const typedTools = (tools || []) as AggregationTool[];

  const totalSignals24h = typedTools.reduce((sum, tool) => sum + (tool.signals_24h || 0), 0);
  const totalSignals7d = typedTools.reduce((sum, tool) => sum + (tool.signals_7d || 0), 0);

  const categoryStats: CategoryMarketStats[] = typedCategories
    .map((category) => {
      const categoryTools = typedTools.filter((tool) => tool.category_id === category.id);
      const toolCount = categoryTools.length;
      const signals24h = categoryTools.reduce((sum, tool) => sum + (tool.signals_24h || 0), 0);
      const signals7d = categoryTools.reduce((sum, tool) => sum + (tool.signals_7d || 0), 0);
      const avgTrendScore =
        toolCount > 0
          ? round(categoryTools.reduce((sum, tool) => sum + (tool.trend_score || 0), 0) / toolCount)
          : 0;
      const avgTrendScore24h =
        toolCount > 0
          ? round(categoryTools.reduce((sum, tool) => sum + (tool.trend_score_24h || 0), 0) / toolCount)
          : 0;
      const avgTrendScore7d =
        toolCount > 0
          ? round(categoryTools.reduce((sum, tool) => sum + (tool.trend_score_7d || 0), 0) / toolCount)
          : 0;

      return {
        category,
        tool_count: toolCount,
        avg_trend_score: avgTrendScore,
        avg_trend_score_24h: avgTrendScore24h,
        avg_trend_score_7d: avgTrendScore7d,
        signals_24h: signals24h,
        signals_7d: signals7d,
        rising_tools: categoryTools.filter((tool) => tool.momentum === "rising").length,
        stable_tools: categoryTools.filter((tool) => tool.momentum === "stable").length,
        declining_tools: categoryTools.filter((tool) => tool.momentum === "declining").length,
        market_share: totalSignals7d > 0 ? round((signals7d / totalSignals7d) * 100) : 0,
      };
    })
    .filter((item) => item.tool_count > 0)
    .sort((a, b) => {
      if (b.signals_7d !== a.signals_7d) {
        return b.signals_7d - a.signals_7d;
      }

      return b.avg_trend_score - a.avg_trend_score;
    });

  return {
    summary: {
      total_tools: typedTools.length,
      active_categories: categoryStats.length,
      total_signals_24h: totalSignals24h,
      total_signals_7d: totalSignals7d,
      leading_category_slug: categoryStats[0]?.category.slug || null,
    },
    categories: categoryStats,
  };
}


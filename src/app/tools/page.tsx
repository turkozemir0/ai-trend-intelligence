import { createServerSupabase } from "@/lib/supabase/server";
import { Tool, Category } from "@/types";
import ToolCard from "@/components/tool-card";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta(
  "AI Tools Directory",
  "Discover AI tools ranked by real-time trend intelligence",
  "/tools"
);

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = await createServerSupabase();
  const params = await searchParams;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("tools")
    .select("*, category:categories(*)")
    .eq("is_published", true)
    .order("trend_score", { ascending: false });

  if (params.category) {
    const categoryData = categories?.find((c) => c.slug === params.category);
    if (categoryData) {
      query = query.eq("category_id", categoryData.id);
    }
  }

  const { data: tools } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          AI Tools Directory
          {tools && (
            <span className="ml-3 text-lg font-normal text-zinc-400">
              {tools.length} tools
            </span>
          )}
        </h1>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <Link
            href="/tools"
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
              !params.category
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            All
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/tools?category=${category.slug}`}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                params.category === category.slug
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {tools?.map((tool) => (
          <ToolCard key={tool.id} tool={tool as Tool} variant="full" />
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">What is AI Trend Intelligence?</h3>
            <p className="text-zinc-400 text-sm">
              A platform that tracks AI tool popularity using real-time signals from GitHub,
              Hacker News, and developer communities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">How is the trend score calculated?</h3>
            <p className="text-zinc-400 text-sm">
              Trend scores combine GitHub star velocity, Hacker News points, and social
              mentions into a weighted score from 0 to 10.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

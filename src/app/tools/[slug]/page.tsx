import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { Tool } from "@/types";
import { pageMeta, toolJsonLd } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { scoreColor, momentumEmoji, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: tools } = await supabase
    .from("tools")
    .select("slug")
    .eq("is_published", true);

  return tools?.map((tool) => ({ slug: tool.slug })) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createServerSupabase();
  const { data: tool } = await supabase
    .from("tools")
    .select("*, category:categories(*)")
    .eq("slug", resolvedParams.slug)
    .eq("is_published", true)
    .single();

  if (!tool) return {};

  return pageMeta(
    tool.name,
    tool.short_description || tool.description || `Discover ${tool.name}`,
    `/tools/${tool.slug}`
  );
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createServerSupabase();
  const { data: tool } = await supabase
    .from("tools")
    .select("*, category:categories(*)")
    .eq("slug", resolvedParams.slug)
    .eq("is_published", true)
    .single();

  if (!tool) notFound();

  const typedTool = tool as Tool;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(typedTool)) }}
      />

      <nav className="text-sm text-zinc-400 mb-6">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        {" > "}
        <Link href="/tools" className="hover:text-zinc-300">Tools</Link>
        {" > "}
        <span className="text-zinc-100">{typedTool.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{typedTool.name}</h1>
          {typedTool.description && (
            <p className="text-lg text-zinc-300 mb-6">{typedTool.description}</p>
          )}
          {typedTool.website && (
            <Link
              href={typedTool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg transition"
            >
              Visit Website
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b border-zinc-800">
              <div className="text-sm text-zinc-400 mb-1">Trend Score</div>
              <div className={cn("text-5xl font-bold", scoreColor(typedTool.trend_score))}>
                {typedTool.trend_score}
              </div>
              <div className="text-3xl mt-2">{momentumEmoji(typedTool.momentum)}</div>
            </div>

            <div>
              <div className="text-sm text-zinc-400 mb-1">Pricing</div>
              <div className="text-lg font-semibold capitalize">{typedTool.pricing}</div>
              {typedTool.pricing_detail && (
                <div className="text-sm text-zinc-400">{typedTool.pricing_detail}</div>
              )}
            </div>

            {typedTool.category && (
              <div>
                <div className="text-sm text-zinc-400 mb-1">Category</div>
                <div className="text-lg font-semibold">{typedTool.category.name}</div>
              </div>
            )}

            {typedTool.github_stars > 0 && (
              <div>
                <div className="text-sm text-zinc-400 mb-1">GitHub Stars</div>
                <div className="text-lg font-semibold">
                  ⭐ {formatNumber(typedTool.github_stars)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mt-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all tools
      </Link>
    </div>
  );
}

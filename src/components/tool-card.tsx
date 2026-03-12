import Link from "next/link";
import { Tool } from "@/types";
import { scoreColor, momentumEmoji } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  variant?: "compact" | "full";
}

export default function ToolCard({ tool, variant = "full" }: ToolCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
      >
        <span className="font-medium text-sm">{tool.name}</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", scoreColor(tool.trend_score))}>
            {tool.trend_score}
          </span>
          <span className="text-sm">{momentumEmoji(tool.momentum)}</span>
          <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">
            {tool.pricing}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{tool.name}</h3>
        <div className="flex items-center gap-1">
          <span className={cn("text-2xl font-bold", scoreColor(tool.trend_score))}>
            {tool.trend_score}
          </span>
          <span className="text-xl">{momentumEmoji(tool.momentum)}</span>
        </div>
      </div>
      {tool.short_description && (
        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
          {tool.short_description}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-300">
          {tool.pricing}
        </span>
        {tool.category && (
          <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            {tool.category.name}
          </span>
        )}
      </div>
    </Link>
  );
}

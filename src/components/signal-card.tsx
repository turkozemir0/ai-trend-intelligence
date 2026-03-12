import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Signal } from "@/types";
import { formatNumber, timeAgo } from "@/lib/utils";

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const sourceColors = {
    github: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    hackernews: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    producthunt: "bg-red-500/10 text-red-400 border-red-500/20",
    reddit: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`text-xs px-2 py-1 rounded border ${
            sourceColors[signal.source]
          }`}
        >
          {signal.source}
        </span>
        <h3 className="font-medium text-sm flex-1 line-clamp-2">
          {signal.title}
        </h3>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span>{formatNumber(signal.score)} pts</span>
        <span>{timeAgo(signal.created_at)}</span>
        {signal.url && (
          <Link
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto hover:text-zinc-300 transition"
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-zinc-950/80 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">AI Trend Intel</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/tools" className="text-zinc-300 hover:text-zinc-100 transition text-sm md:text-base">
            Tools
          </Link>
          <Link href="/docs" className="text-zinc-300 hover:text-zinc-100 transition text-sm md:text-base">
            API
          </Link>
          <Link href="/pricing" className="text-zinc-300 hover:text-zinc-100 transition text-sm md:text-base">
            Pricing
          </Link>
          <Link
            href="/submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 md:px-4 transition text-sm md:text-base"
          >
            Submit
          </Link>
        </div>
      </div>
    </nav>
  );
}

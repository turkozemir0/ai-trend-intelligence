import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-zinc-100 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-zinc-100 mb-3">Developers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  Methodology
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-zinc-100 mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/submit" className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                  Submit Tool
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-zinc-100 mb-3">Data Sources</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>GitHub Trending</li>
              <li>Hacker News</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 text-center">
          <p className="text-sm text-zinc-500">
            Real-time AI ecosystem intelligence powered by GitHub & Hacker News
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            © 2026 AI Trend Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

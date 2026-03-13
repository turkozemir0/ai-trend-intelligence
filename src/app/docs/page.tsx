import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | AI Trend Intelligence",
  description: "Complete API documentation for AI Trend Intelligence DaaS platform",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-zinc-400 mb-8">
          Access real-time AI ecosystem intelligence through our RESTful API.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Authentication</h2>
          <p className="text-zinc-300 mb-4">
            All API requests require authentication using an API key. Include your API key in the Authorization header:
          </p>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-emerald-400">
              {`Authorization: Bearer ait_your_api_key_here`}
            </code>
          </pre>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Rate Limits</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2">Plan</th>
                  <th className="text-left py-2">Daily Limit</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <td className="py-2">Free</td>
                  <td className="py-2">100 requests/day</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2">Pro</td>
                  <td className="py-2">10,000 requests/day</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2">Team</td>
                  <td className="py-2">100,000 requests/day</td>
                </tr>
                <tr>
                  <td className="py-2">Enterprise</td>
                  <td className="py-2">1,000,000 requests/day</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-zinc-400 mt-4 text-sm">
            Rate limit headers are included in all responses: <code className="text-emerald-400">X-RateLimit-Limit</code> and <code className="text-emerald-400">X-RateLimit-Remaining</code>
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Endpoints</h2>

          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="text-emerald-400">GET</span>
                <span>/api/v1/tools</span>
              </h3>
              <p className="text-zinc-400 mb-4">Retrieve AI tools with filtering and pagination.</p>
              
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <ul className="space-y-2 text-zinc-300 mb-4">
                <li><code className="text-emerald-400">category</code> - Filter by category slug</li>
                <li><code className="text-emerald-400">limit</code> - Results per page (max 100, default 20)</li>
                <li><code className="text-emerald-400">offset</code> - Pagination offset (default 0)</li>
                <li><code className="text-emerald-400">sort</code> - Sort field: trend_score, trend_score_24h, trend_score_7d, github_stars, created_at</li>
                <li><code className="text-emerald-400">order</code> - Sort order: asc or desc (default desc)</li>
              </ul>

              <h4 className="font-semibold mb-2">Example Request</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm mb-4">
                <code>{`curl -H "Authorization: Bearer ait_your_key" \\
  "https://yourdomain.com/api/v1/tools?category=coding&limit=10"`}</code>
              </pre>

              <h4 className="font-semibold mb-2">Example Response</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm">
                <code>{`{
  "data": [
    {
      "id": "uuid",
      "name": "Cursor",
      "slug": "cursor",
      "trend_score": 9.4,
      "trend_score_24h": 8.2,
      "trend_score_7d": 9.1,
      "category": { "name": "Coding", "slug": "coding" }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}`}</code>
              </pre>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="text-emerald-400">GET</span>
                <span>/api/v1/signals</span>
              </h3>
              <p className="text-zinc-400 mb-4">Retrieve real-time signals from GitHub, Hacker News, etc.</p>
              
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <ul className="space-y-2 text-zinc-300 mb-4">
                <li><code className="text-emerald-400">source</code> - Filter by source: github, hackernews, producthunt, reddit</li>
                <li><code className="text-emerald-400">type</code> - Filter by signal type: release, discussion, tutorial, news</li>
                <li><code className="text-emerald-400">tool_id</code> - Filter by tool UUID</li>
                <li><code className="text-emerald-400">limit</code> - Results per page (max 100, default 20)</li>
                <li><code className="text-emerald-400">offset</code> - Pagination offset (default 0)</li>
              </ul>

              <h4 className="font-semibold mb-2">Example Request</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm mb-4">
                <code>{`curl -H "Authorization: Bearer ait_your_key" \\
  "https://yourdomain.com/api/v1/signals?source=github&limit=20"`}</code>
              </pre>

              <h4 className="font-semibold mb-2">Example Response</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm">
                <code>{`{
  "data": [
    {
      "id": "uuid",
      "source": "github",
      "title": "cursor-ai",
      "url": "https://github.com/...",
      "score": 15234,
      "created_at": "2026-03-13T15:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20
}`}</code>
              </pre>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="text-emerald-400">GET</span>
                <span>/api/v1/trends</span>
              </h3>
              <p className="text-zinc-400 mb-4">Get historical trend data for a specific tool.</p>
              
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <ul className="space-y-2 text-zinc-300 mb-4">
                <li><code className="text-emerald-400">tool_id</code> - <strong>Required.</strong> Tool UUID</li>
                <li><code className="text-emerald-400">window</code> - Time window: 24h, 7d, 30d (default 7d)</li>
              </ul>

              <h4 className="font-semibold mb-2">Example Request</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm mb-4">
                <code>{`curl -H "Authorization: Bearer ait_your_key" \\
  "https://yourdomain.com/api/v1/trends?tool_id=uuid&window=7d"`}</code>
              </pre>

              <h4 className="font-semibold mb-2">Example Response</h4>
              <pre className="bg-zinc-950 border border-zinc-700 rounded p-3 overflow-x-auto text-sm">
                <code>{`{
  "data": [
    {
      "created_at": "2026-03-10T12:00:00Z",
      "score": 234,
      "source": "github"
    }
  ],
  "window": "7d"
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Error Codes</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <td className="py-2 font-mono text-sm">INVALID_API_KEY</td>
                  <td className="py-2">401</td>
                  <td className="py-2">Invalid or missing API key</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 font-mono text-sm">RATE_LIMIT_EXCEEDED</td>
                  <td className="py-2">429</td>
                  <td className="py-2">Daily rate limit exceeded</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 font-mono text-sm">VALIDATION_ERROR</td>
                  <td className="py-2">400</td>
                  <td className="py-2">Invalid query parameters</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 font-mono text-sm">NOT_FOUND</td>
                  <td className="py-2">404</td>
                  <td className="py-2">Resource not found</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-sm">INTERNAL_SERVER_ERROR</td>
                  <td className="py-2">500</td>
                  <td className="py-2">Server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Support</h2>
          <p className="text-zinc-300">
            Need help? Contact us at <a href="mailto:api@aitrendintel.com" className="text-emerald-400 hover:underline">api@aitrendintel.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

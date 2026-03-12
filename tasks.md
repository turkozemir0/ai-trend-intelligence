# AI Trend Intelligence — Build Tasks

Project Goal:
Build an AI ecosystem intelligence platform that aggregates signals from developer and discussion platforms and ranks AI tools by trend momentum.

Core Features (MVP):
1. Signal Feed (homepage)
2. Tools Directory (list + detail)
3. Submit Tool Form

Stack:
- Next.js 15 (App Router)
- Supabase (PostgreSQL + RLS)
- Tailwind CSS
- TypeScript
- Vercel

Data Sources (MVP):
- GitHub Trending
- Hacker News

Data Sources (Post-MVP):
- Product Hunt
- Reddit
- arXiv
- Hugging Face

---

## Task 1 — Project Bootstrap
Status: ⬜

Create base project with pnpm:
```bash
pnpm create next-app@latest ai-trend-intel --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Install dependencies:
```bash
pnpm add @supabase/supabase-js @supabase/ssr zod cheerio lucide-react clsx tailwind-merge
```

Create .env.local with:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GITHUB_TOKEN
- CRON_SECRET
- NEXT_PUBLIC_SITE_URL

Create folder structure:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tools/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── submit/page.tsx
│   ├── api/
│   │   ├── cron/route.ts
│   │   └── submit/route.ts
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── nav.tsx
│   ├── footer.tsx
│   ├── signal-card.tsx
│   └── tool-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── scrapers/
│   │   ├── github.ts
│   │   └── hackernews.ts
│   ├── seo.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Task 2 — Database Schema
Status: ⬜

Run this SQL in Supabase SQL Editor. This creates all tables, indexes, RLS policies, triggers, and seed data in one execution.

Tables:
- categories (id, name, slug, description, tool_count)
- tools (id, name, slug, description, short_description, website, category_id, pricing, pricing_detail, github_url, github_stars, github_forks, stars_weekly_delta, producthunt_votes, hn_points, social_mentions, trend_score, momentum, is_featured, is_published, created_at, updated_at)
- signals (id, source, source_id, title, url, description, score, score_delta, comments, raw_data, is_processed, created_at)
- submissions (id, name, website, description, category, submitter_email, status, ip_address, created_at)

Requirements:
- UUID primary keys
- Foreign key: tools.category_id → categories.id
- Indexes on: tools(slug), tools(trend_score DESC), tools(category_id), signals(source, source_id) UNIQUE, signals(created_at DESC)
- RLS enabled on all tables
- Public SELECT on tools (where is_published=true), categories, signals
- Public INSERT on submissions only
- Service role bypasses RLS (for scrapers)
- Trigger: auto-update tools.updated_at on change
- Trigger: auto-sync categories.tool_count on tool insert/update/delete
- Seed: 16 categories (coding, marketing, writing, design, productivity, research, video, audio, sales, support, data-analysis, automation, education, finance, legal, other)
- Seed: 12 tools (ChatGPT, Claude, Cursor, Perplexity, v0, Lovable, Midjourney, n8n, Jasper, HeyGen, Gumloop, Windsurf) with realistic trend_score and momentum values

Constraint checks:
- tools.pricing IN ('free','freemium','paid','enterprise','open-source')
- tools.momentum IN ('rising','stable','declining')
- tools.trend_score between 0.0 and 10.0
- signals.source IN ('github','hackernews','producthunt','reddit')
- submissions.status IN ('pending','approved','rejected')

---

## Task 3 — Supabase Client Setup
Status: ⬜

Create three Supabase client files:

src/lib/supabase/client.ts
- Browser client using createBrowserClient from @supabase/ssr
- Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

src/lib/supabase/server.ts
- Server component client using createServerClient from @supabase/ssr
- Async function that reads cookies via next/headers
- Handles cookie get/set with try-catch for Server Components

src/lib/supabase/admin.ts
- Admin client using createClient from @supabase/supabase-js
- Uses SUPABASE_SERVICE_ROLE_KEY (never exposed to browser)
- persistSession: false

---

## Task 4 — Type System
Status: ⬜

File: src/types/index.ts

Types to define:

Tool — all columns from tools table. category_id is string | null. Optional category?: Category for joined queries. pricing and momentum are union string literal types matching DB constraints.

Category — id, name, slug, description (string | null), tool_count.

Signal — id, source (union: "github" | "hackernews" | "producthunt" | "reddit"), source_id, title, url (string | null), description (string | null), score, score_delta, comments, created_at.

Submission — name, website, description, category, submitter_email (for form input, no id/status).

---

## Task 5 — Utility Functions
Status: ⬜

File: src/lib/utils.ts

Functions:
- cn(...inputs) — clsx + tailwind-merge for className composition
- formatNumber(n) — 1000 → "1K", 1000000 → "1M", else string
- momentumEmoji(m) — "rising" → "🔥", "declining" → "📉", "stable" → "➡️"
- scoreColor(s) — score >= 8 → "text-emerald-400", >= 6 → "text-amber-400", else "text-zinc-400"
- timeAgo(dateString) — relative time: "2h ago", "3d ago", etc.

---

## Task 6 — SEO / AEO / GEO Infrastructure
Status: ⬜

File: src/lib/seo.ts

Functions:

pageMeta(title, description, path) → returns Next.js Metadata object with:
- title formatted as "{title} | AI Trend Intelligence"
- description
- canonical URL
- openGraph (title, description, url, siteName, type)
- twitter card (summary_large_image)
- robots: index true, follow true

toolJsonLd(tool) → returns Schema.org SoftwareApplication JSON-LD:
- @type: SoftwareApplication
- name, url, description, applicationCategory
- aggregateRating with trend_score as ratingValue, bestRating 10

websiteJsonLd() → returns Schema.org WebSite JSON-LD:
- name, url, description
- SearchAction potentialAction targeting /tools?q=

Constants:
- SITE_URL from NEXT_PUBLIC_SITE_URL env var, fallback "https://aitrendintel.com"
- SITE_NAME = "AI Trend Intelligence"

---

## Task 7 — UI Components
Status: ⬜

Create reusable components BEFORE pages.

src/components/signal-card.tsx
- Props: signal (Signal type)
- Dark card: zinc-900 bg, zinc-800 border, rounded-lg, p-4
- Top row: source badge (color-coded: github=purple, hackernews=orange), title (font-medium, line-clamp-2)
- Bottom row: score (formatNumber), timeAgo(created_at), external link icon if url exists
- Hover: border-zinc-700 transition

src/components/tool-card.tsx
- Props: tool (Tool type), variant ("compact" | "full", default "full")
- Compact variant: single row with name, trend_score badge, momentum emoji, pricing chip. Used in homepage sidebar.
- Full variant: card with name (font-semibold), short_description (text-sm text-zinc-400), trend_score (large, colored via scoreColor), momentum emoji, pricing badge, category name. Used in /tools grid.
- Entire card is a Link to /tools/{slug}
- trend_score display: number with colored text (scoreColor helper)

src/components/nav.tsx
- Sticky top-0, z-50, backdrop-blur, bg-zinc-950/80, border-b border-zinc-800
- Left: "AI Trend Intel" text-lg font-bold, green pulse dot (w-2 h-2 rounded-full bg-emerald-400 animate-pulse)
- Right: "Tools" link, "Submit" link styled as button (bg-emerald-600 hover:bg-emerald-500 rounded-lg px-4 py-2)
- All links use next/link
- Responsive: horizontal padding adjusts (px-4 md:px-6 lg:px-8)

src/components/footer.tsx
- bg-zinc-900 border-t border-zinc-800 py-8 mt-auto
- Text: "Real-time signal data from GitHub & Hacker News"
- Copyright: "© 2026 AI Trend Intelligence"
- text-sm text-zinc-500, centered

---

## Task 8 — Layout System
Status: ⬜

File: src/app/layout.tsx

Requirements:
- Import and use Inter font from next/font/google (weight 400, 500, 600, 700)
- Dark theme: body className "bg-zinc-950 text-zinc-100 antialiased"
- Include <Nav /> at top
- Main content area: <main className="min-h-screen">
- Include <Footer /> at bottom
- Inject websiteJsonLd() as <script type="application/ld+json"> in head
- Root metadata: title default "AI Trend Intelligence", description "Real-time AI ecosystem intelligence — tools, trends, and signals."
- Import global tailwind css

---

## Task 9 — Homepage (Signal Feed)
Status: ⬜

File: src/app/page.tsx (Server Component)

Data fetching:
- Fetch latest 20 signals from Supabase (order by created_at DESC) using server client
- Fetch top 6 tools by trend_score DESC (where is_published=true) using server client

Layout:
- Hero section: h1 "AI Ecosystem Intelligence", p "Real-time signals from GitHub, Hacker News & more", minimal, left-aligned
- Below hero: two-column layout on lg (grid grid-cols-1 lg:grid-cols-3 gap-8)
- Left column (lg:col-span-2): "Latest Signals" heading + list of SignalCard components
- Right column (lg:col-span-1): "Trending Tools" heading + list of ToolCard variant="compact"
- If signals empty: show message "Signals will appear after the first scraper run. Trigger /api/cron to start."
- Container: max-w-7xl mx-auto px-4 py-8

SEO:
- Use pageMeta for metadata: title "AI Ecosystem Intelligence", path "/"

---

## Task 10 — Tools Directory
Status: ⬜

File: src/app/tools/page.tsx (Server Component)

Data fetching:
- Fetch all published tools ordered by trend_score DESC, join categories
- Fetch all categories
- Read searchParams.category for filtering (optional)
- If category param exists, filter tools by category slug

Layout:
- h1: "AI Tools Directory" + badge showing total tool count
- Category filter: horizontal scrollable row of buttons/chips, one per category. Active category highlighted (bg-zinc-700). "All" button to clear filter. Links to /tools?category={slug}
- Tool grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Each tool rendered as ToolCard variant="full"
- Container: max-w-7xl mx-auto px-4 py-8

SEO:
- pageMeta: title "AI Tools Directory — Discover {count}+ AI Tools", path "/tools"
- JSON-LD: Schema.org CollectionPage with name, description, numberOfItems
- FAQ section at bottom (for SEO):
  - "What is AI Trend Intelligence?" → "A platform that tracks AI tool popularity using real-time signals from GitHub, Hacker News, and developer communities."
  - "How is the trend score calculated?" → "Trend scores combine GitHub star velocity, Hacker News points, and social mentions into a weighted score from 0 to 10."
- FAQ JSON-LD schema

---

## Task 11 — Tool Detail Page
Status: ⬜

File: src/app/tools/[slug]/page.tsx (Server Component)

Data fetching:
- generateStaticParams: fetch all tool slugs for static generation
- generateMetadata: fetch tool by slug, return pageMeta with tool name and description
- Page: fetch tool by slug with category join. If not found, call notFound().

Layout:
- Breadcrumb: Home > Tools > {tool name} (with links)
- Two column on lg: left (wide) = tool info, right (narrow) = stats sidebar
- Left: h1 tool name, description paragraph, website external link button (target _blank, rel noopener noreferrer)
- Right sidebar: trend_score (large number, colored), momentum with emoji, pricing badge, github_stars if > 0 (with formatNumber), category name
- Back link: "← Back to all tools"
- revalidate = 3600

SEO:
- generateMetadata with tool-specific title and description
- toolJsonLd in script tag
- Breadcrumb JSON-LD

---

## Task 12 — Submit Tool Feature
Status: ⬜

Create two files:

src/app/submit/page.tsx (Client Component — "use client")
- h1: "Submit Your AI Tool"
- Subtitle: "Get listed and reach developers, founders, and marketers."
- Form fields: name (text), website (url), description (textarea, max 500), category (select dropdown with category options), email (email)
- Hidden honeypot: <input name="company_fax" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
- Submit button: "Submit Tool" emerald styled, disabled while loading
- States: idle, loading (spinner), success (green message), error (red message)
- On submit: POST to /api/submit with JSON body
- Client-side check: all required fields filled before allowing submit
- Card container: max-w-xl mx-auto, zinc-900 bg, rounded-xl, p-6

src/app/api/submit/route.ts
- POST handler
- Parse JSON body
- Honeypot check: if company_fax has value, return 200 silently (bot trap)
- Zod validation schema: name (min 2, max 100), website (url), description (min 10, max 500), category (min 2), submitter_email (email)
- Duplicate check: query submissions where website matches and status is pending. If exists return 409.
- Insert into submissions using supabaseAdmin
- Success: return { ok: true, message: "Submitted! We will review within 48 hours." }
- ZodError: return 400 with validation details
- Other errors: return 500

---

## Task 13 — Signal Scrapers
Status: ⬜

src/lib/scrapers/github.ts

Function: scrapeGithubTrending()
- Fetch https://github.com/trending?since=weekly
- Parse HTML with cheerio
- Extract from each article.Box-row: repo full name (from h2 a href), description (p text), stars (stargazers link text), starsToday (float-sm-right text), forks
- Filter for AI-related repos using keyword list: ai, llm, gpt, agent, ml, transformer, diffusion, langchain, openai, anthropic, model, inference, prompt, copilot, rag, embedding, huggingface, neural, chatbot, automation
- Match keywords against lowercase (name + description)
- Return array of { name, fullName, url, description, stars, starsToday, forks }

Function: saveGithubSignals(repos)
- For each repo: upsert into signals table via supabaseAdmin
- source: "github", source_id: fullName
- Use onConflict: "source,source_id" to prevent duplicates

src/lib/scrapers/hackernews.ts

Function: scrapeHackerNews()
- Fetch https://hacker-news.firebaseio.com/v0/topstories.json
- Take first 50 IDs
- Fetch each story detail from /v0/item/{id}.json (use Promise.all)
- Filter for AI-related stories using same keyword list
- Return array of { id, title, url, score, descendants }

Function: saveHNSignals(stories)
- For each story: upsert into signals table via supabaseAdmin
- source: "hackernews", source_id: String(id)
- comments field: descendants value

Both files import supabaseAdmin from @/lib/supabase/admin

---

## Task 14 — Cron Pipeline
Status: ⬜

File: src/app/api/cron/route.ts

GET handler:
- Check Authorization header: must equal "Bearer {CRON_SECRET}". If not, return 401.
- Run scrapeGithubTrending() → saveGithubSignals() in try-catch
- Run scrapeHackerNews() → saveHNSignals() in try-catch
- Each scraper independent (one failing does not block the other)
- Return JSON: { ok: true, github: count, hackernews: count, errors: string[], timestamp: ISO string }
- Export runtime = "nodejs"
- Export maxDuration = 60

File: vercel.json (project root)
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 */6 * * *"
  }]
}
```

---

## Task 15 — Sitemap + Robots
Status: ⬜

src/app/robots.ts
- Return MetadataRoute.Robots
- Allow / for all user agents: *, GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, anthropic-ai, Google-Extended, YandexBot, bingbot
- Disallow: /api/, /admin/
- Sitemap URL: {SITE_URL}/sitemap.xml

src/app/sitemap.ts
- Return MetadataRoute.Sitemap
- Static pages: / (priority 1.0, daily), /tools (0.9, daily), /submit (0.5, monthly)
- Dynamic pages: fetch all published tool slugs from Supabase → /tools/{slug} (priority 0.7, weekly)
- Use createClient from @supabase/supabase-js with anon key (read-only)

---

## Task 16 — Security Middleware
Status: ⬜

File: src/middleware.ts

Add security headers to all responses via NextResponse.next():

Content-Security-Policy:
- default-src 'self'
- script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com
- style-src 'self' 'unsafe-inline'
- img-src 'self' data: https:
- connect-src 'self' https://*.supabase.co wss://*.supabase.co
- frame-ancestors 'none'

Other headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Permissions-Policy: camera=(), microphone=(), geolocation=()

Cron protection:
- If pathname starts with /api/cron, check Authorization header matches "Bearer {CRON_SECRET}". Return 401 if not.

Matcher config:
- Match all routes except _next/static, _next/image, favicon.ico

---

## Task 17 — Deployment
Status: ⬜

Steps:
1. git init, commit all files
2. Create GitHub repository, push
3. Connect to Vercel via `vercel link`
4. Add all environment variables in Vercel Dashboard (Production + Preview)
5. Deploy with `vercel --prod`
6. Trigger first scrape: curl -H "Authorization: Bearer {CRON_SECRET}" {SITE_URL}/api/cron
7. Connect custom domain in Vercel Dashboard
8. Submit sitemap.xml to Google Search Console
9. Submit sitemap.xml to Bing Webmaster Tools

---

## Post-MVP Tasks (Week 2+)

These are NOT part of the initial build. The architecture supports adding them later:

- Agents Directory (/agents, /agents/[slug])
- Programmatic SEO pages (/tools/for-[usecase])
- Trends Dashboard (/trends)
- LLM-powered signal categorization
- Product Hunt scraper
- Reddit scraper
- arXiv scraper
- Newsletter integration (Beehiiv)
- Featured listings (monetization)
- Social media auto-posting

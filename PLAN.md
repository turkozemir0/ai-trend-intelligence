# AI Trend Intelligence — MVP Build Plan
# Cursor'da PLAN.md olarak kaydet, her adımda referans ver

> 3 Feature: Signal Feed + Tools Directory + Submit Form
> Veri: GitHub + HN scraper
> Süre: 5-6 saat
> Stack: Next.js 15 App Router, Supabase, Tailwind, TypeScript, Vercel

---

## ZAMAN ÇİZELGESİ

```
Saat 0-0.5  → Proje setup + paketler
Saat 0.5-1  → Supabase schema (tek SQL)
Saat 1-2    → Supabase client + types + utils
Saat 2-3.5  → 3 sayfa: Homepage, /tools, /tools/[slug]
Saat 3.5-4  → Submit form (sayfa + API)
Saat 4-5    → Scraper (GitHub + HN) + cron
Saat 5-5.5  → SEO (robots, sitemap, JSON-LD, meta)
Saat 5.5-6  → Security middleware + Vercel deploy
```

---

## ADIM 0: PROJE SETUP (30dk)

```bash
pnpm create next-app@latest ai-trend-intel \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd ai-trend-intel

pnpm add @supabase/supabase-js @supabase/ssr zod cheerio lucide-react clsx tailwind-merge

pnpm add -D @types/node
```

**.env.local** oluştur:
```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GITHUB_TOKEN=ghp_XXXX
CRON_SECRET=rastgele-32-karakter-string
NEXT_PUBLIC_SITE_URL=https://aitrendintel.com
```

Dosya yapısı:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              ← Signal Feed (homepage)
│   ├── tools/
│   │   ├── page.tsx          ← Tools Directory
│   │   └── [slug]/page.tsx   ← Tool detay
│   ├── submit/page.tsx       ← Submit form
│   ├── api/
│   │   ├── cron/route.ts     ← Scraper endpoint
│   │   └── submit/route.ts   ← Submit API
│   ├── robots.ts
│   └── sitemap.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← Browser client
│   │   ├── server.ts         ← Server component client
│   │   └── admin.ts          ← Service role (scraper)
│   ├── scrapers/
│   │   ├── github.ts
│   │   └── hackernews.ts
│   ├── seo.ts                ← metadata + jsonld tek dosya
│   └── utils.ts
├── components/
│   ├── signal-card.tsx
│   ├── tool-card.tsx
│   ├── nav.tsx
│   └── footer.tsx
├── types/index.ts
└── middleware.ts              ← Security headers
```

---

## ADIM 1: SUPABASE SCHEMA (30dk)

Supabase Dashboard → SQL Editor → bu tek SQL'i çalıştır:

```sql
-- =============================================
-- AI TREND INTEL — LEAN MVP SCHEMA
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. KATEGORİLER
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tool_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (name, slug, description) VALUES
  ('Coding', 'coding', 'AI coding assistants and development tools'),
  ('Marketing', 'marketing', 'AI marketing automation and analytics'),
  ('Writing', 'writing', 'AI writing and content creation'),
  ('Design', 'design', 'AI design and image generation'),
  ('Productivity', 'productivity', 'AI productivity and workflow tools'),
  ('Research', 'research', 'AI research and search tools'),
  ('Video', 'video', 'AI video creation and editing'),
  ('Audio', 'audio', 'AI audio and music tools'),
  ('Sales', 'sales', 'AI sales automation and outreach'),
  ('Customer Support', 'support', 'AI customer service solutions'),
  ('Data Analysis', 'data-analysis', 'AI analytics and BI tools'),
  ('Automation', 'automation', 'AI workflow automation'),
  ('Education', 'education', 'AI learning and education'),
  ('Finance', 'finance', 'AI finance and accounting'),
  ('Legal', 'legal', 'AI tools for legal professionals'),
  ('Other', 'other', 'Other AI tools');

-- 2. TOOLS
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  website TEXT,
  category_id UUID REFERENCES categories(id),
  pricing TEXT CHECK (pricing IN ('free','freemium','paid','enterprise','open-source')),
  pricing_detail TEXT,

  -- Sinyal verileri
  github_url TEXT,
  github_stars INT DEFAULT 0,
  github_forks INT DEFAULT 0,
  stars_weekly_delta INT DEFAULT 0,
  producthunt_votes INT DEFAULT 0,
  hn_points INT DEFAULT 0,
  social_mentions INT DEFAULT 0,

  -- Trend
  trend_score NUMERIC(3,1) DEFAULT 0 CHECK (trend_score >= 0 AND trend_score <= 10),
  momentum TEXT DEFAULT 'stable' CHECK (momentum IN ('rising','stable','declining')),

  -- Durum
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_trend ON tools(trend_score DESC);
CREATE INDEX idx_tools_category ON tools(category_id);

-- 3. SİNYALLER (scraper çıktısı)
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL CHECK (source IN ('github','hackernews','producthunt','reddit')),
  source_id TEXT,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  score INT DEFAULT 0,
  score_delta INT DEFAULT 0,
  comments INT DEFAULT 0,
  raw_data JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_signals_dedup ON signals(source, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX idx_signals_recent ON signals(created_at DESC);

-- 4. SUBMISSIONS
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT,
  category TEXT,
  submitter_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS (Row Level Security)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_tools" ON tools FOR SELECT USING (is_published = true);
CREATE POLICY "read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "read_signals" ON signals FOR SELECT USING (true);
CREATE POLICY "insert_submissions" ON submissions FOR INSERT WITH CHECK (true);

-- 6. Auto-update timestamp
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_updated BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Kategori sayacı
CREATE OR REPLACE FUNCTION sync_category_counts() RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories c SET tool_count = (
    SELECT count(*) FROM tools WHERE category_id = c.id AND is_published = true
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_count_sync AFTER INSERT OR UPDATE OR DELETE ON tools
  FOR EACH STATEMENT EXECUTE FUNCTION sync_category_counts();

-- 8. SEED DATA (başlangıç tools)
INSERT INTO tools (name, slug, short_description, website, category_id, pricing, pricing_detail, github_stars, trend_score, momentum) VALUES
  ('ChatGPT', 'chatgpt', 'OpenAI AI assistant for writing, coding, and analysis', 'https://chat.openai.com', (SELECT id FROM categories WHERE slug='productivity'), 'freemium', 'Free + $20/mo Plus', 0, 9.5, 'stable'),
  ('Claude', 'claude', 'Anthropic AI for documents, coding, and analysis', 'https://claude.ai', (SELECT id FROM categories WHERE slug='productivity'), 'freemium', 'Free + $20/mo Pro', 0, 9.2, 'rising'),
  ('Cursor', 'cursor', 'AI-native code editor with codebase intelligence', 'https://cursor.com', (SELECT id FROM categories WHERE slug='coding'), 'freemium', 'Free + $20/mo Pro', 42000, 9.4, 'rising'),
  ('Perplexity', 'perplexity', 'AI search engine with cited sources', 'https://perplexity.ai', (SELECT id FROM categories WHERE slug='research'), 'freemium', 'Free + $20/mo Pro', 0, 9.0, 'rising'),
  ('v0', 'v0', 'AI UI generator by Vercel', 'https://v0.dev', (SELECT id FROM categories WHERE slug='coding'), 'freemium', 'Free tier', 0, 8.5, 'rising'),
  ('Lovable', 'lovable', 'Build full-stack apps with AI', 'https://lovable.dev', (SELECT id FROM categories WHERE slug='coding'), 'freemium', 'Free + $20/mo', 0, 8.7, 'rising'),
  ('Midjourney', 'midjourney', 'Best-in-class AI image generation', 'https://midjourney.com', (SELECT id FROM categories WHERE slug='design'), 'paid', '$10/mo Basic', 0, 8.8, 'stable'),
  ('n8n', 'n8n', 'Open-source AI workflow automation', 'https://n8n.io', (SELECT id FROM categories WHERE slug='automation'), 'freemium', 'Free self-hosted', 52000, 8.9, 'rising'),
  ('Jasper', 'jasper', 'Enterprise AI content platform', 'https://jasper.ai', (SELECT id FROM categories WHERE slug='marketing'), 'paid', '$49/mo Creator', 0, 7.2, 'stable'),
  ('HeyGen', 'heygen', 'AI avatar video generation', 'https://heygen.com', (SELECT id FROM categories WHERE slug='video'), 'freemium', 'Free + $29/mo', 0, 8.0, 'rising'),
  ('Gumloop', 'gumloop', 'Connect AI models to tools without code', 'https://gumloop.com', (SELECT id FROM categories WHERE slug='automation'), 'freemium', 'Free tier', 0, 8.2, 'rising'),
  ('Windsurf', 'windsurf', 'Agentic IDE with multi-file reasoning', 'https://windsurf.com', (SELECT id FROM categories WHERE slug='coding'), 'freemium', 'Free + Pro', 0, 8.3, 'rising');
```

---

## ADIM 2: LIB DOSYALARI (30dk)

### src/lib/supabase/client.ts
```typescript
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### src/lib/supabase/server.ts
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
}
```

### src/lib/supabase/admin.ts
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

### src/types/index.ts
```typescript
export interface Tool {
  id: string; name: string; slug: string;
  description: string | null; short_description: string | null;
  website: string | null; category_id: string | null;
  pricing: "free" | "freemium" | "paid" | "enterprise" | "open-source";
  pricing_detail: string | null;
  github_url: string | null; github_stars: number;
  github_forks: number; stars_weekly_delta: number;
  producthunt_votes: number; hn_points: number; social_mentions: number;
  trend_score: number;
  momentum: "rising" | "stable" | "declining";
  is_featured: boolean;
  created_at: string; updated_at: string;
  category?: Category;
}

export interface Category {
  id: string; name: string; slug: string;
  description: string | null; tool_count: number;
}

export interface Signal {
  id: string;
  source: "github" | "hackernews" | "producthunt" | "reddit";
  title: string; url: string | null;
  description: string | null;
  score: number; score_delta: number;
  created_at: string;
}
```

### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatNumber = (n: number) =>
  n >= 1_000_000 ? `${(n/1e6).toFixed(1)}M` :
  n >= 1_000 ? `${(n/1e3).toFixed(1)}K` : String(n);

export const momentumEmoji = (m: string) =>
  m === "rising" ? "🔥" : m === "declining" ? "📉" : "➡️";

export const scoreColor = (s: number) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-amber-400" : "text-zinc-400";
```

### src/lib/seo.ts
```typescript
import { Metadata } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aitrendintel.com";
const NAME = "AI Trend Intelligence";

export function pageMeta(title: string, description: string, path: string): Metadata {
  const url = `${SITE}${path}`;
  return {
    title: `${title} | ${NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: NAME, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export function toolJsonLd(t: { name: string; slug: string; short_description: string | null; trend_score: number; pricing: string }) {
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: t.name, url: `${SITE}/tools/${t.slug}`,
    description: t.short_description,
    applicationCategory: "AI Tool",
    aggregateRating: { "@type": "AggregateRating", ratingValue: t.trend_score, bestRating: 10, worstRating: 0, ratingCount: 1 },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org", "@type": "WebSite",
    name: NAME, url: SITE,
    description: "Real-time AI ecosystem intelligence — tools, trends, and signals.",
    potentialAction: { "@type": "SearchAction", target: `${SITE}/tools?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
}
```

---

## ADIM 3: SAYFALAR — CURSOR'A VERECEĞİN PROMPTLAR (2 saat)

Her sayfayı Cursor'da oluştururken aşağıdaki promptları kullan. Cursor Composer (Ctrl+I) ile birden fazla dosya tek seferde oluşturulabilir.

### Prompt 1 — Layout + Nav + Footer

```
@PLAN.md referans al.

src/app/layout.tsx oluştur:
- Koyu tema (zinc-950 bg, zinc-100 text)
- Google Font: "Inter" body, "JetBrains Mono" monospace
- <nav> component import et
- <footer> component import et  
- JSON-LD websiteJsonLd() ekle <script type="application/ld+json">
- Metadata: title "AI Trend Intelligence", description "Real-time AI ecosystem intelligence"

src/components/nav.tsx oluştur:
- Sticky top, blur backdrop, border-b zinc-800
- Sol: Logo text "AI Trend Intel" bold, yanında yeşil pulse dot (canlı veri göstergesi)
- Sağ: Link'ler → Tools, Submit (buton stil, emerald)
- Mobile hamburger menü gerekli değil şimdilik, sadece responsive padding

src/components/footer.tsx oluştur:
- Minimal, zinc-900 bg
- "Built with signal data from GitHub, Hacker News, Product Hunt"
- © 2026 AI Trend Intelligence

@types/index.ts tipleri kullan.
Tailwind utility class kullan, ayrı CSS dosyası yok.
```

### Prompt 2 — Homepage (Signal Feed)

```
@PLAN.md referans al.

src/app/page.tsx oluştur (SERVER COMPONENT):
- Supabase server client ile son 20 signal çek (signals tablosu, created_at DESC)
- Supabase server client ile top 6 tool çek (trend_score DESC, is_published=true) 
- Hero section: Başlık "AI Ecosystem Intelligence", altında "Real-time signals from GitHub, Hacker News & more"
- 2 kolon layout (lg): Sol kolon = Signal Feed, Sağ kolon = Trending Tools
- Signal Feed: signal-card component listesi
- Trending Tools: tool-card component listesi (kompakt versiyon)
- Eğer signals boşsa "Signals loading... Scraper will populate data shortly." göster

src/components/signal-card.tsx oluştur:
- Props: Signal type
- Kart: zinc-900 bg, zinc-800 border, rounded-lg, p-4
- Üst satır: source badge (github=mor, hackernews=turuncu), title (bold, truncate)
- Alt satır: score (formatNumber), zaman (relative: "2h ago"), url varsa external link ikon
- Hover: border-zinc-700 transition

src/components/tool-card.tsx oluştur:
- Props: Tool type, variant: "compact" | "full" (default "full")
- compact: tek satır — name, trend_score badge, momentum emoji, pricing badge
- full: kart — name, short_description, trend_score (büyük), momentum, pricing, category, website link
- trend_score gösterimi: sayı + renk (≥8 emerald, ≥6 amber, rest zinc)
- Link: /tools/[slug]

@lib/supabase/server.ts kullan.
@lib/utils.ts helper'ları kullan.
@types/index.ts tipleri kullan.
```

### Prompt 3 — Tools Directory

```
@PLAN.md referans al.

src/app/tools/page.tsx oluştur (SERVER COMPONENT):
- Metadata: pageMeta("AI Tools Directory", "Discover AI tools ranked by real-time trend intelligence", "/tools")
- Supabase'den tüm published tools çek, trend_score DESC sırala
- Supabase'den categories çek
- Sayfa başlığı: "AI Tools Directory" + tool sayısı badge
- Filtre: kategori butonları (horizontal scroll, her kategori bir chip)
- URL param ?category=coding ile filtreleme (searchParams kullan)
- Tool grid: 1 kolon mobile, 2 kolon md, 3 kolon lg
- Her tool: tool-card variant="full"
- JSON-LD: CollectionPage schema ekle
- Sayfa altı: FAQ bölümü (SEO için)
  - "What is an AI tool?" → kısa cevap
  - "How is the trend score calculated?" → kısa cevap
  - FAQ JSON-LD ekle

@lib/seo.ts pageMeta ve toolJsonLd kullan.
@lib/supabase/server.ts kullan.
Tailwind grid kullan.
```

### Prompt 4 — Tool Detail Page

```
@PLAN.md referans al.

src/app/tools/[slug]/page.tsx oluştur (SERVER COMPONENT):
- generateStaticParams: tüm tool sluglarını çek
- generateMetadata: tool name + description ile pageMeta
- Supabase'den slug ile tool çek (categories join)
- Bulunamazsa notFound()
- Layout: sol taraf geniş (tool detay), sağ sidebar (quick stats)
- Tool detay: name (h1), description, website link (external, noopener noreferrer)
- Quick stats sidebar: trend_score (büyük daire), momentum, pricing, github_stars, category
- JSON-LD: toolJsonLd ekle
- Breadcrumb: Home > Tools > [Tool Name] — breadcrumb JSON-LD ekle
- Alt kısım: "Back to all tools" link

Tool bulunamazsa → notFound() çağır (Next.js 404).
revalidate = 3600 (1 saat cache).
```

### Prompt 5 — Submit Form

```
@PLAN.md referans al.

src/app/submit/page.tsx oluştur (CLIENT COMPONENT - "use client"):
- Metadata export edemez (client), layout'tan veya generateMetadata ile parent'tan al
- Form state: useState ile
- Alanlar: name, website (url), description (textarea), category (select — kategorilerden), email
- Gizli honeypot alan: <input name="company_fax" className="hidden" tabIndex={-1} autoComplete="off" />
- Submit: fetch("/api/submit", POST, JSON body)
- Loading state, success state, error state göster
- Validation: client-side basit check (boş alan), asıl validation API'da
- Tasarım: zinc-900 kart, tek kolon form, emerald submit butonu
- Başlık: "Submit Your AI Tool" + açıklama "Get listed and reach developers, founders, and marketers."

src/app/api/submit/route.ts oluştur:
- Zod validation: name (2-100), website (url), description (10-500), category, submitter_email (email)
- Honeypot: company_fax doluysa sessizce 200 dön
- Duplicate check: aynı website + pending var mı?
- supabaseAdmin ile submissions'a insert
- Response: { ok: true, message: "..." }
- Error handling: ZodError → 400, duplicate → 409, diğer → 500

@lib/supabase/admin.ts kullan (server-side).
```

---

## ADIM 4: SCRAPERS (1 saat)

### Prompt 6 — Scrapers + Cron

```
@PLAN.md referans al.

src/lib/scrapers/github.ts oluştur:
- scrapeGithubTrending() fonksiyonu
- fetch("https://github.com/trending?since=weekly") + cheerio parse
- AI keyword filtresi: ai, llm, gpt, agent, ml, transformer, diffusion, langchain, openai, anthropic, model, inference, prompt, copilot, rag
- Return: { name, fullName, url, description, stars, starsToday, forks }[]
- saveGithubSignals(repos): supabaseAdmin ile signals tablosuna upsert (source='github', source_id=fullName)

src/lib/scrapers/hackernews.ts oluştur:
- scrapeHackerNews() fonksiyonu  
- HN Firebase API: /v0/topstories.json → ilk 50 story detayını çek
- AI keyword filtresi (aynı liste)
- Return: { id, title, url, score, descendants }[]
- saveHNSignals(stories): supabaseAdmin ile signals tablosuna upsert (source='hackernews', source_id=string id)

src/app/api/cron/route.ts oluştur:
- GET handler
- Authorization header check: Bearer ${CRON_SECRET} — eşleşmezse 401
- scrapeGithubTrending → saveGithubSignals
- scrapeHackerNews → saveHNSignals  
- try/catch her scraper ayrı (biri fail olursa diğeri çalışsın)
- Response: { ok, github: count, hackernews: count, errors: [] }
- export const runtime = "nodejs"
- export const maxDuration = 60

@lib/supabase/admin.ts kullan.
cheerio import et.
```

Proje root'una **vercel.json** ekle:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 */6 * * *"
  }]
}
```

---

## ADIM 5: SEO + GÜVENLİK (1 saat)

### Prompt 7 — SEO

```
@PLAN.md referans al.

src/app/robots.ts oluştur:
- MetadataRoute.Robots return et
- Tüm botlara / izin ver: *, GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, anthropic-ai, YandexBot, bingbot, Google-Extended
- /api/ ve /admin/ disallow
- sitemap: ${SITE_URL}/sitemap.xml

src/app/sitemap.ts oluştur:
- MetadataRoute.Sitemap return et
- Static: / (priority 1, daily), /tools (0.9, daily), /submit (0.5, monthly)
- Dynamic: Supabase'den tüm published tools → /tools/[slug] (0.7, weekly)
- createClient kullan (anon key yeterli, sadece SELECT)
```

### Prompt 8 — Security Middleware

```
src/middleware.ts oluştur:

Security headers ekle (NextResponse.next().headers.set):
- Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/cron path'i için:
- Authorization header check → Bearer CRON_SECRET eşleşmezse 401 dön

Matcher: /((?!_next/static|_next/image|favicon.ico).*)
```

---

## ADIM 6: DEPLOY (30dk)

```bash
# 1. Git init + commit
git init && git add . && git commit -m "MVP: signal feed + tools + submit"

# 2. GitHub repo oluştur, push et
gh repo create ai-trend-intel --private --push

# 3. Vercel'e bağla
vercel link

# 4. Vercel Dashboard → Settings → Environment Variables
# .env.local'daki tüm değişkenleri ekle (Production + Preview)

# 5. Deploy
vercel --prod

# 6. İlk scrape'i tetikle (cron beklemeden)
curl -H "Authorization: Bearer SENIN_CRON_SECRET" https://senin-site.vercel.app/api/cron

# 7. Domain bağla → Vercel Dashboard → Domains

# 8. Search Console → sitemap.xml submit
# 9. Bing Webmaster → sitemap.xml submit
```

---

## ÖLÇEKLENDİRME YOLU (sonraki adımlar)

```
MVP tamamlandıktan sonra eklenecekler (öncelik sırasıyla):

Hafta 2: Agents Directory (/agents, /agents/[slug])
Hafta 2: Programmatic SEO (/tools/for-[usecase] sayfaları)
Hafta 3: Trend Dashboard (/trends)
Hafta 3: Newsletter entegrasyonu (Beehiiv)
Hafta 4: LLM kategorize (signal → AI ile category + summary)
Hafta 4: Product Hunt scraper
Hafta 5: Featured listing (monetization v1)
Hafta 6: Reddit scraper + sosyal dağıtım otomasyonu
```

---

## CURSOR İPUÇLARI

1. **PLAN.md'yi @ ile referans ver** — Her prompt'ta `@PLAN.md` yaz, Cursor context olarak kullanır
2. **Composer (Ctrl+I)** — Birden fazla dosya oluşturmak için kullan
3. **Tab completion** — Cursor'ın öneri tamamlamasını kabul et, hızlanır
4. **Hata alırsan** — Hata mesajını Cursor Chat'e yapıştır, düzeltmesini iste
5. **pnpm dev** sürekli açık tut — değişiklikleri anında gör

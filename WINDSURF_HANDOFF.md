# Windsurf Handoff

## Repo State

- Branch status: `main` is clean and synced with `origin/main`
- Latest commit: `96fc2ba`
- Production URL: `https://ai-trend-intelligence.vercel.app`

## What Is Live Now

Core platform:
- public website is live
- Vercel production deploy is healthy
- cron scraping works
- cron run logging works
- GitHub push -> Vercel deploy flow works

API surface:
- `/api/v1/tools`
- `/api/v1/signals`
- `/api/v1/trends`
- `/api/v1/market/overview`

Operational/admin surface:
- `/api/admin/health`
- `/api/keys/generate`

Content/product pages:
- `/docs`
- `/pricing`
- `/methodology`
- `/changelog`
- `/market`

Homepage additions:
- `AI Market Snapshot` block is live on home

## Major Changes Completed

### 1. V2 DaaS foundation

Added:
- versioned API routes
- API key auth
- rate limiting
- usage metering hooks
- pricing/docs/methodology/changelog pages

Key files:
- `src/app/api/v1/*`
- `src/lib/api-auth.ts`
- `src/lib/rate-limit.ts`

### 2. Admin auth hardening

Added:
- `src/lib/admin-auth.ts`

Behavior:
- admin routes use `ADMIN_SECRET`
- fallback to `CRON_SECRET` remains temporarily for compatibility

Updated:
- `src/app/api/keys/generate/route.ts`
- `src/app/api/admin/health/route.ts`

Production status:
- `ADMIN_SECRET` is now configured in Vercel

### 3. Cron observability

Implemented:
- cron run logging to `cron_runs`
- admin health endpoint shows latest cron run

Key files:
- `src/app/api/cron/route.ts`
- `src/app/api/admin/health/route.ts`
- `supabase/migrations/002_cron_runs.sql`

### 4. Signal -> tool enrichment

Implemented:
- new signals persist `tool_id` when matching succeeds
- matching logic improved using:
  - github URL
  - alias
  - slug
  - website/domain
  - fallback text matching

Key files:
- `src/lib/matching.ts`
- `src/lib/scrapers/github.ts`
- `src/lib/scrapers/hackernews.ts`

### 5. Historical backfill tooling

Added:
- `scripts/backfill-signal-tool-ids.mjs`
- npm command: `npm run backfill:tool-ids`

Purpose:
- update old `signals` rows where `tool_id IS NULL`

### 6. Production URL handling

Improved:
- if `NEXT_PUBLIC_SITE_URL` is missing or placeholder-like, app falls back to Vercel production URL

Key files:
- `src/lib/seo-utils.ts`
- `src/lib/seo.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/api/admin/health/route.ts`

### 7. Market / category intelligence V1

Added:
- category aggregation helper
- market overview API
- market page
- homepage market snapshot
- nav link to market

Key files:
- `src/lib/market.ts`
- `src/app/api/v1/market/overview/route.ts`
- `src/app/market/page.tsx`
- `src/app/page.tsx`
- `src/components/nav.tsx`
- `src/types/index.ts`

Current aggregation model:
- derived from `tools` category assignments
- uses `signals_24h`, `signals_7d`, `trend_score`, `trend_score_24h`, `trend_score_7d`
- computes category-level:
  - tool count
  - average trend
  - average 24h/7d trend
  - rising/stable/declining tool counts
  - 7d signal share

## Production Validation Summary

Validated:
- unauthorized `POST /api/keys/generate` -> `401`
- `GET /api/admin/health` works with admin auth
- health shows correct production site URL
- cron runs create `cron_runs` records
- `/api/v1/tools` works with API key
- `/api/v1/signals` works with API key
- `/api/v1/trends` works with API key and returns summary
- `/api/v1/market/overview` is live
- `/market` page is live

## Backfill Result

Backfill was executed against production.

Observed:
- first pass: scanned `30`, matched `1`
- second pass: scanned `29`, matched `1`, skipped `28`

Interpretation:
- script is working
- low match rate is mostly because recent signals do not map to the seeded tracked tool catalog
- this is now mainly a catalog coverage / entity resolution problem

This is not a runtime bug.

## Environment Variables Expected

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Reference:
- `.env.local.example`

## Recommended Next Steps

### Highest-leverage next move

Do **not** add many new raw data sources immediately.

Reason:
- the current bottleneck is not scraping capacity
- the bottleneck is that incoming signals are too broad relative to the tracked tool catalog
- more sources will increase noise before classification and aggregation are mature

### Suggested roadmap

#### P0 - Catalog expansion

Goal:
- increase tracked tool coverage from current seed set to something materially larger

Do:
- add 20-50 more real tracked tools
- expand alias coverage for each
- include repo names, domains, company names, alternate spellings

Expected impact:
- higher `tool_id` match rate
- more useful trends
- better category intelligence

#### P1 - Category intelligence depth

Goal:
- move from current snapshot view to time-series market intelligence

Do:
- create a `category_daily_metrics` style table or snapshot pipeline
- persist daily category aggregates
- build category trend charts over time
- expose category trend endpoints, e.g.:
  - `/api/v1/categories/overview`
  - `/api/v1/categories/[slug]/trends`

Expected impact:
- `/market` becomes a real intelligence dashboard
- homepage snapshot becomes more credible
- API product becomes more differentiated

#### P2 - Classification model

Goal:
- split noisy ecosystem signals from tool-specific signals

Recommended direction:
- classify signals into something like:
  - `tool`
  - `ecosystem`
  - `company`
  - `research`
- improve `signal_type`, `topic`, `sentiment`
- avoid forcing every AI story into a tool match

Expected impact:
- less noisy analytics
- clearer product story
- better aggregation quality

#### P3 - Then add sources

Only after catalog + classification + aggregation improve:
- Product Hunt
- Reddit
- Hugging Face
- arXiv

## Strategic Recommendation

Best current product direction:
- position the product less as a raw signal feed
- position it more as category / market intelligence

Why:
- raw signals are noisy
- category dominance, sector momentum, and market share are easier to understand
- this also maps better to a DaaS/API story

Practical next product surface:
- stronger `/market` page
- category charts on homepage
- category overview API
- category trend history API

## Recent Updates (March 13, 2026)

### Classification System Implemented

**Problem Addressed:**
- Data noise and signal dağınıklığı
- Low tool match rate (30 signals → 2 matches)
- Every AI signal forced into tool matching

**Solution:**
Added comprehensive signal classification system:

1. **New Classification Fields:**
   - `entity_type`: tool | framework | model | company | research | ecosystem | tutorial | unknown
   - `signal_type`: release | discussion | tutorial | news | showcase | other
   - `topic`: llm | coding | image | video | audio | agents | rag | automation | infrastructure | research | general
   - `sentiment`: positive | neutral | negative
   - `classification_confidence`: 0.0-1.0

2. **Smart Matching:**
   - Only attempts tool matching for relevant entity types (tool, framework, model)
   - Ecosystem/company/research signals no longer force-matched
   - Reduces false positives and noise

3. **Files Added/Modified:**
   - `src/lib/classification.ts` - Classification logic
   - `src/lib/scrapers/github.ts` - Updated with classification
   - `src/lib/scrapers/hackernews.ts` - Updated with classification
   - `supabase/migrations/009_enhanced_classification.sql` - DB schema
   - `scripts/backfill-signal-classification.mjs` - Backfill existing signals
   - `src/types/index.ts` - Updated Signal interface

### Tool Catalog Expansion

**Problem Addressed:**
- Tool catalog too narrow (low coverage)
- Missing popular AI tools
- Insufficient aliases for entity resolution

**Solution:**
Expanded catalog with 30+ tools and comprehensive aliases:

1. **New Tools Added:**
   - LLMs: Gemini, Llama, Mistral, Grok, Pi
   - Coding: Codeium, Tabnine, Replit, Bolt, Aider
   - Image: DALL-E, Flux, Leonardo, Ideogram
   - Video: Sora, Runway, Pika, Luma
   - Audio: Suno, Udio, ElevenLabs
   - Agents: AutoGPT, CrewAI, LangGraph, Zapier, Make
   - Frameworks: LangChain, LlamaIndex, Haystack, Semantic Kernel
   - Vector DBs: Pinecone, Weaviate, Chroma, Qdrant

2. **Comprehensive Aliases:**
   - Product variations (e.g., "gpt-4", "gpt4", "chatgpt-4")
   - Company names (e.g., "anthropic" → Claude)
   - Domain names (e.g., "cursor.com" → Cursor)
   - GitHub repos (e.g., "langchain-ai/langchain" → LangChain)
   - Common misspellings and variations

3. **Files Added:**
   - `supabase/migrations/010_expand_tool_catalog.sql` - 30+ tools + 100+ aliases

### Expected Impact

**Match Rate Improvement:**
- Before: ~6% match rate (2/30)
- Expected: 40-60% match rate for tool/framework/model signals
- Ecosystem signals intentionally not matched (reduces noise)

**Data Quality:**
- Cleaner signal categorization
- Better filtering capabilities
- More accurate trend analysis
- Reduced false positives

**API Enhancement:**
- Can filter by entity_type, topic, sentiment
- Better category intelligence
- More valuable data for DaaS customers

### Deployment Steps

1. **Run Migrations:**
   ```bash
   # Apply classification schema
   supabase migration up 009_enhanced_classification.sql
   
   # Expand tool catalog
   supabase migration up 010_expand_tool_catalog.sql
   ```

2. **Backfill Existing Signals:**
   ```bash
   npm run backfill:classification
   ```

3. **Deploy Code:**
   - Push to main → Vercel auto-deploys
   - New scrapers will automatically classify incoming signals

4. **Verify:**
   - Check `/api/admin/health` for cron status
   - Monitor signal classification distribution
   - Validate improved match rates

### Next Priorities (Post-Deployment)

1. **P1 - Category Time-Series:**
   - Create `category_daily_metrics` table
   - Snapshot daily aggregates
   - Build trend charts

2. **P2 - API Enhancements:**
   - Add filtering by entity_type, topic
   - `/api/v1/signals?entity_type=tool&topic=coding`
   - Category trend endpoints

3. **P3 - Quality Monitoring:**
   - Dashboard for classification accuracy
   - Low-confidence signal review
   - Alias expansion based on misses

## Notes For Windsurf

- current market aggregation is a V1 derived layer, not a persisted analytics model
- classification system addresses the data noise problem systematically
- tool catalog now covers major AI ecosystem players
- matching logic already uses aliases efficiently
- next technical move: category time-series aggregation + persistence


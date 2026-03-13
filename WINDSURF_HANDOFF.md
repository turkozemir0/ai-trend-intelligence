# Windsurf Handoff

## Current Status

Project is live and production deploy is healthy.

Working:
- Vercel production deploy
- cron scraping
- public website
- `/api/v1/tools`
- `/api/v1/signals`
- `/api/v1/trends`
- API key validation
- cron run logging

Recently fixed:
- unauthorized API key generation was blocked
- production base URL fallback now resolves correctly
- cron run records now show in admin health
- trends endpoint now returns summary even when no direct signal rows match

## Changes Implemented In This Pass

### 1. Admin auth split

Added:
- `src/lib/admin-auth.ts`

Behavior:
- admin-only routes now use `ADMIN_SECRET`
- fallback to `CRON_SECRET` remains for compatibility if `ADMIN_SECRET` is not set yet

Updated routes:
- `src/app/api/keys/generate/route.ts`
- `src/app/api/admin/health/route.ts`

Important:
- production should set `ADMIN_SECRET`
- once confirmed, fallback to `CRON_SECRET` can be removed in a future cleanup

### 2. Rate limit + usage logging hardening

Previously:
- `/api/v1/tools` had rate limit + usage logging
- `/api/v1/signals` and `/api/v1/trends` did not

Now:
- all V1 API routes enforce plan limits
- all V1 API routes log usage
- rate limit headers are returned consistently

Updated:
- `src/app/api/v1/signals/route.ts`
- `src/app/api/v1/trends/route.ts`

### 3. `tool_id` enrichment for new signals

Updated scrapers:
- `src/lib/scrapers/github.ts`
- `src/lib/scrapers/hackernews.ts`

Behavior:
- when a tool match is found, inserted/upserted signals now persist `tool_id`

This improves:
- trends queries
- future analytics
- entity resolution consistency

### 4. Backfill script for old signals

Added:
- `scripts/backfill-signal-tool-ids.mjs`
- npm script: `npm run backfill:tool-ids`

Purpose:
- backfill historical signal rows where `tool_id IS NULL`

Requirements:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 5. Production URL handling

Updated:
- `src/lib/seo-utils.ts`
- `src/lib/seo.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/api/admin/health/route.ts`

Behavior:
- if `NEXT_PUBLIC_SITE_URL` is missing or still placeholder-like, app falls back to Vercel production URL

## Environment Variables

Expected:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Updated example file:
- `.env.local.example`

## Production Validation Summary

Validated recently:
- unauthorized `POST /api/keys/generate` -> `401`
- `GET /api/admin/health` works with admin auth
- cron runs create `cron_runs` records
- health endpoint shows correct production site URL
- `/api/v1/tools` works with API key
- `/api/v1/signals` works with API key
- `/api/v1/trends` works with API key and returns summary

## Backfill Status

Backfill was executed against production data.

Observed result:
- scanned: 30 first pass, then 29 remaining
- matched: 1
- skipped: 28 to 29

Interpretation:
- the script is functioning
- the low match rate is mostly due to current signals not referencing tracked tools
- many recent HN/GitHub signals are general AI stories or repos outside the seeded 12-tool catalog

This is primarily a catalog coverage / entity resolution issue, not a runtime failure.

## Recommended Next Steps

### P0
- set `ADMIN_SECRET` in Vercel production
- run `npm run backfill:tool-ids` with production env
- verify `api_usage` rows are being written after real traffic

### P1
- remove fallback from `ADMIN_SECRET` -> `CRON_SECRET` after env rollout
- add account/user ownership model for API keys
- add admin UI or internal page for key issuance

### P2
- improve historical trends model beyond title matching fallback
- add stronger alias management and manual review workflow
- add billing and plan upgrades

## Notes

- `trends` endpoint may still return empty `data` for tools with no matched historical signals. That is currently data-state, not endpoint failure.
- backfill script is intentionally conservative: GitHub URL match first, then title includes tool name.

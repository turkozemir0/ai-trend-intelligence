# V2 DaaS Quick Start Guide

## 🎯 What Changed from V1 to V2?

V1 was a **working product** - public website with signal feed and tools directory.

V2 is a **sellable data service** - production-grade DaaS platform with:
- ✅ Versioned, authenticated API
- ✅ Rate limiting and usage metering
- ✅ Pricing and monetization infrastructure
- ✅ Improved data quality and reliability
- ✅ Windowed metrics (24h, 7d trend scores)
- ✅ Comprehensive documentation

---

## 🚀 Quick Deploy (5 Minutes)

### 1. Run Database Migrations
Copy and paste into Supabase SQL Editor (one at a time):

```bash
# Navigate to migrations folder
cd supabase/migrations

# Run in Supabase Dashboard → SQL Editor:
002_cron_runs.sql
003_tool_aliases.sql
004_windowed_metrics.sql
005_signal_classification.sql
006_api_keys.sql
007_api_usage.sql
008_watchlists.sql
```

### 2. Update Environment Variables
```env
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 3. Deploy
```bash
git add .
git commit -m "V2 DaaS complete"
git push origin main
```

Vercel will auto-deploy.

---

## 🔑 Generate Your First API Key

### Option 1: Via API
```bash
curl -X POST https://your-domain.com/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "your@email.com",
    "name": "My First Key",
    "plan": "free"
  }'
```

### Option 2: Direct Database Insert
```sql
-- In Supabase SQL Editor
INSERT INTO api_keys (user_email, name, key_hash, key_prefix, plan, is_active)
VALUES (
  'your@email.com',
  'Test Key',
  encode(digest('ait_test_key_12345', 'sha256'), 'hex'),
  'ait_test_ke',
  'free',
  true
);
```

Then use `ait_test_key_12345` as your API key.

---

## 📡 Test Your API

### Get AI Tools
```bash
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/tools?limit=5&sort=trend_score_24h"
```

### Get Recent Signals
```bash
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/signals?source=github&limit=10"
```

### Get Tool Trends
```bash
# First, get a tool ID from /api/v1/tools
# Then use it here:
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/trends?tool_id=TOOL_UUID&window=7d"
```

---

## 📊 Key Features

### 1. Windowed Metrics
Tools now have time-based trend scores:
- `trend_score_24h` - Last 24 hours activity
- `trend_score_7d` - Last 7 days activity
- `signals_24h` - Signal count in 24h
- `signals_7d` - Signal count in 7d

### 2. Better Entity Resolution
Tool matching now uses:
1. Exact GitHub URL match
2. Alias matching (e.g., "cursor-ai" → "Cursor")
3. Normalized name match
4. Fuzzy text matching

### 3. Rate Limiting
Plan-based limits:
- **Free**: 100 requests/day
- **Pro**: 10,000 requests/day
- **Team**: 100,000 requests/day
- **Enterprise**: 1,000,000 requests/day

Check headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

### 4. Usage Tracking
Every API call is logged in `api_usage` table:
- Endpoint
- Status code
- Response time
- User agent
- IP address

### 5. Cron Logging
Every scraper run is tracked in `cron_runs` table:
- Start/finish time
- Status (success/partial_failure/failed)
- Counts (GitHub, HN, scored tools)
- Errors array

---

## 🔍 Admin Tools

### Health Check
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/admin/health
```

Returns:
- Last cron run status
- Recent signals
- Signal count today
- Tools count
- Environment check

### Manual Cron Trigger
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron
```

---

## 📚 Documentation Pages

Visit these pages on your deployed site:
- `/docs` - Complete API documentation
- `/pricing` - Pricing plans
- `/methodology` - How we calculate scores
- `/changelog` - Version history

---

## 🎨 New UI Components

### Navigation
Now includes:
- Tools
- API (→ /docs)
- Pricing
- Submit

### Footer
Organized sections:
- Product (Tools, Pricing, Changelog)
- Developers (API Docs, Methodology)
- Company (Submit Tool)
- Data Sources

---

## 🔧 Common Tasks

### Add a Tool Alias
```sql
INSERT INTO tool_aliases (tool_id, alias, source)
VALUES (
  (SELECT id FROM tools WHERE slug='cursor'),
  'cursor-editor',
  'manual'
);
```

### Check API Usage for a Key
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as requests,
  AVG(response_time_ms) as avg_ms
FROM api_usage
WHERE api_key_id = 'YOUR_KEY_ID'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### View Cron History
```sql
SELECT 
  started_at,
  status,
  github_count,
  hackernews_count,
  scored_count,
  error_count
FROM cron_runs
ORDER BY started_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check API key format: `Bearer ait_...`
- Verify key exists in `api_keys` table
- Check `is_active = true`

### "Rate Limit Exceeded"
- Check daily usage in `api_usage` table
- Upgrade plan or wait for reset (midnight UTC)

### No Data in Windowed Metrics
- Run cron manually to populate
- Check `cron_runs` for errors
- Verify scoring function ran

### Scraper Not Finding Tools
- Check `tool_aliases` table
- Add more aliases for better matching
- Review `matching.ts` logic

---

## 📈 Monitoring Queries

### Daily API Usage by Plan
```sql
SELECT 
  ak.plan,
  COUNT(DISTINCT au.api_key_id) as active_keys,
  COUNT(*) as total_requests,
  AVG(au.response_time_ms) as avg_response_time
FROM api_usage au
JOIN api_keys ak ON au.api_key_id = ak.id
WHERE au.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY ak.plan;
```

### Top Tools by 24h Activity
```sql
SELECT 
  name,
  trend_score_24h,
  signals_24h,
  momentum
FROM tools
WHERE is_published = true
ORDER BY trend_score_24h DESC
LIMIT 10;
```

### Cron Success Rate (Last 7 Days)
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM cron_runs
WHERE started_at >= NOW() - INTERVAL '7 days'
GROUP BY status;
```

---

## ✨ What's Next?

### Immediate (Do Now)
1. ✅ Run all migrations
2. ✅ Deploy to production
3. ✅ Generate test API key
4. ✅ Test all endpoints
5. ✅ Trigger initial cron run

### Short Term (This Week)
1. Monitor cron runs for errors
2. Check data quality in signals
3. Add more tool aliases
4. Test rate limiting
5. Review API usage patterns

### Medium Term (This Month)
1. Stripe integration for billing
2. Email digest setup
3. Webhook notifications
4. Product Hunt scraper
5. Custom dashboards

---

## 🎯 Success Metrics

Track these KPIs:
- **Cron Success Rate**: >95%
- **API Uptime**: >99.9%
- **Average Response Time**: <500ms
- **Data Quality**: <1% malformed signals
- **Tool Match Accuracy**: >90%

---

## 📞 Support

Questions? Check:
1. `/docs` - API documentation
2. `/methodology` - How it works
3. `V2_IMPLEMENTATION.md` - Full implementation details
4. `DEPLOYMENT_V2.md` - Deployment checklist

---

**V2 Status**: ✅ Production Ready

Built with ❤️ using Next.js 15, Supabase, and TypeScript.

# V2 DaaS Deployment Checklist

## 🚀 Pre-Deployment Steps

### 1. Database Migrations
Run all V2 migrations in Supabase Dashboard → SQL Editor (in order):

```sql
-- ✅ Run these in sequence:
1. supabase/migrations/002_cron_runs.sql
2. supabase/migrations/003_tool_aliases.sql
3. supabase/migrations/004_windowed_metrics.sql
4. supabase/migrations/005_signal_classification.sql
5. supabase/migrations/006_api_keys.sql
6. supabase/migrations/007_api_usage.sql
7. supabase/migrations/008_watchlists.sql
```

### 2. Environment Variables
Update your `.env.local` and Vercel environment variables:

```env
# Required (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=ghp_your-token
CRON_SECRET=your-random-32-char-string
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Optional (for Stripe billing)
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
```

### 3. Build Test
```bash
pnpm install
pnpm build
```

Verify no TypeScript or build errors.

---

## 📦 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "V2 DaaS implementation complete"
git push origin main
```

2. **Vercel Dashboard**
- Go to your project settings
- Add/update environment variables (Production + Preview)
- Ensure `NEXT_PUBLIC_SITE_URL` points to production domain
- Deploy

3. **Verify Deployment**
- Check `/api/admin/health` (with Bearer token)
- Check `/docs` page loads
- Check `/pricing` page loads
- Check `/api/v1/tools` returns 401 (auth required)

---

## 🔑 Post-Deployment Setup

### 1. Generate Test API Key
```bash
curl -X POST https://your-domain.com/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "name": "Test Key",
    "plan": "free"
  }'
```

Save the returned API key securely.

### 2. Test API Endpoints
```bash
# Test tools endpoint
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/tools?limit=5"

# Test signals endpoint
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/signals?source=github&limit=5"

# Test trends endpoint (replace TOOL_ID)
curl -H "Authorization: Bearer ait_your_key" \
  "https://your-domain.com/api/v1/trends?tool_id=TOOL_ID&window=7d"
```

### 3. Trigger Initial Cron Run
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron
```

Check response for successful scraping and scoring.

### 4. Verify Cron Logging
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/admin/health
```

Should show last cron run with counts and status.

---

## ✅ Verification Checklist

### Database
- [ ] All 7 migrations executed successfully
- [ ] `cron_runs` table exists and has data after cron trigger
- [ ] `api_keys` table exists
- [ ] `api_usage` table exists
- [ ] `tool_aliases` table has seed data
- [ ] `tools` table has new columns (signals_24h, signals_7d, etc.)
- [ ] `signals` table has new columns (signal_type, sentiment, etc.)

### API Endpoints
- [ ] `/api/v1/tools` requires auth and returns data
- [ ] `/api/v1/signals` requires auth and returns data
- [ ] `/api/v1/trends` requires auth and returns data
- [ ] Rate limiting works (429 after limit exceeded)
- [ ] Usage logging works (check `api_usage` table)
- [ ] Error responses follow standard format

### Pages
- [ ] `/docs` loads and displays API documentation
- [ ] `/pricing` loads with all 4 plans
- [ ] `/methodology` loads with methodology details
- [ ] `/changelog` loads with version history
- [ ] Navigation includes new links (API, Pricing)
- [ ] Footer includes new links

### Functionality
- [ ] Cron runs successfully every 6 hours
- [ ] Trend scores update after cron run
- [ ] Windowed metrics (24h, 7d) populate correctly
- [ ] Tool matching uses alias system
- [ ] Signal validation prevents bad data
- [ ] Admin health endpoint shows system status

---

## 🔧 Troubleshooting

### Migration Errors
If a migration fails:
1. Check Supabase logs for specific error
2. Verify previous migrations completed
3. Check for duplicate column/table names
4. Run migrations one at a time

### API Key Not Working
1. Verify key was generated correctly
2. Check `api_keys` table for `is_active = true`
3. Ensure Authorization header format: `Bearer ait_...`
4. Check key hasn't expired (`expires_at` field)

### Rate Limit Issues
1. Check `api_usage` table for request count
2. Verify plan limits in `rate-limit.ts`
3. Test with different API keys
4. Check rate limit headers in response

### Cron Not Running
1. Verify `vercel.json` has correct schedule
2. Check Vercel Dashboard → Cron Jobs
3. Test manual trigger with curl
4. Check `cron_runs` table for errors

### Build Errors
1. Run `pnpm build` locally first
2. Check TypeScript errors
3. Verify all imports are correct
4. Check for missing dependencies

---

## 📊 Monitoring

### Key Metrics to Watch
1. **Cron Success Rate**: Check `cron_runs` table for failures
2. **API Usage**: Monitor `api_usage` table for abuse
3. **Rate Limit Hits**: Track 429 responses
4. **Signal Quality**: Check for empty/malformed signals
5. **Tool Matching Accuracy**: Review matched tools in logs

### Recommended Alerts
- Cron failure (status = 'failed')
- High error rate (>10% 500 responses)
- Rate limit abuse (same key hitting limit repeatedly)
- Low signal count (scraper may be broken)

---

## 🎯 Next Steps (Optional)

### Stripe Integration
1. Create Stripe account
2. Add webhook endpoint: `/api/webhooks/stripe`
3. Configure webhook events: `customer.subscription.*`
4. Test subscription flow
5. Update API key plan on payment

### Email Notifications
1. Set up email service (SendGrid, Resend, etc.)
2. Create email templates
3. Add digest cron job
4. Implement watchlist alerts

### Additional Data Sources
1. Product Hunt scraper
2. Reddit scraper
3. Twitter/X mentions
4. Custom RSS feeds

---

## 📝 Rollback Plan

If V2 deployment fails:

1. **Database**: Migrations are additive, safe to keep
2. **Code**: Revert to previous commit
3. **API Keys**: Existing keys remain valid
4. **Data**: No data loss, only new features disabled

```bash
# Rollback code
git revert HEAD
git push origin main
```

---

## ✨ Success Criteria

V2 deployment is successful when:
- ✅ All migrations completed
- ✅ API endpoints return data with auth
- ✅ Rate limiting enforces plan limits
- ✅ Usage tracking logs all requests
- ✅ Cron runs successfully and logs
- ✅ New pages load correctly
- ✅ No build or runtime errors

**Status**: Ready for Production 🚀

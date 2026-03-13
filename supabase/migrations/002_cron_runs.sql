-- =============================================
-- CRON RUNS LOGGING TABLE
-- =============================================

CREATE TABLE cron_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial_failure', 'failed')),
  github_count INT DEFAULT 0,
  hackernews_count INT DEFAULT 0,
  scored_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cron_runs_status ON cron_runs(status);
CREATE INDEX idx_cron_runs_started ON cron_runs(started_at DESC);

-- RLS
ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_cron_runs" ON cron_runs FOR SELECT USING (true);

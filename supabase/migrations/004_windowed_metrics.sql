-- =============================================
-- WINDOWED METRICS FOR TIME-BASED SCORING
-- =============================================

ALTER TABLE tools ADD COLUMN IF NOT EXISTS signals_24h INT DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS signals_7d INT DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS github_delta_7d INT DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS hn_points_7d INT DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS trend_score_24h NUMERIC(3,1) DEFAULT 0 CHECK (trend_score_24h >= 0 AND trend_score_24h <= 10);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS trend_score_7d NUMERIC(3,1) DEFAULT 0 CHECK (trend_score_7d >= 0 AND trend_score_7d <= 10);

CREATE INDEX IF NOT EXISTS idx_tools_trend_24h ON tools(trend_score_24h DESC);
CREATE INDEX IF NOT EXISTS idx_tools_trend_7d ON tools(trend_score_7d DESC);

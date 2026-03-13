-- =============================================
-- SIGNAL CLASSIFICATION
-- =============================================

ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_type TEXT CHECK (signal_type IN ('release', 'discussion', 'tutorial', 'news', 'other'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS tool_id UUID REFERENCES tools(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_tool ON signals(tool_id);
CREATE INDEX IF NOT EXISTS idx_signals_sentiment ON signals(sentiment);

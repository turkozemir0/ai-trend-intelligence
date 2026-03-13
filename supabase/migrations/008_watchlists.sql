-- =============================================
-- WATCHLISTS FOR USER SAVED FILTERS
-- =============================================

CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE watchlist_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(watchlist_id, tool_id)
);

CREATE INDEX idx_watchlists_user ON watchlists(user_email);
CREATE INDEX idx_watchlist_tools_watchlist ON watchlist_tools(watchlist_id);
CREATE INDEX idx_watchlist_tools_tool ON watchlist_tools(tool_id);

-- RLS
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_watchlists" ON watchlists FOR SELECT USING (true);
CREATE POLICY "read_watchlist_tools" ON watchlist_tools FOR SELECT USING (true);

-- Auto-update timestamp
CREATE TRIGGER watchlists_updated BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

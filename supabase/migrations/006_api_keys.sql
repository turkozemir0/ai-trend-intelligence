-- =============================================
-- API KEYS FOR DAAS ACCESS
-- =============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  account_id TEXT,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_email ON api_keys(user_email);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_api_keys" ON api_keys FOR SELECT USING (true);

-- Plan limits reference
COMMENT ON COLUMN api_keys.plan IS 'free: 100 req/day, pro: 10k req/day, team: 100k req/day, enterprise: unlimited';

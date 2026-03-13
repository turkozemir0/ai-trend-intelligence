-- =============================================
-- API USAGE TRACKING AND METERING
-- =============================================

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT,
  response_time_ms INT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX idx_api_usage_created ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- Daily usage summary view
CREATE OR REPLACE VIEW api_usage_daily AS
SELECT 
  api_key_id,
  DATE(created_at) as usage_date,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
FROM api_usage
GROUP BY api_key_id, DATE(created_at);

-- RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_usage" ON api_usage FOR SELECT USING (true);

-- =============================================
-- TOOL ALIASES FOR BETTER ENTITY RESOLUTION
-- =============================================

CREATE TABLE tool_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  source TEXT CHECK (source IN ('github', 'hackernews', 'manual', 'auto')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tool_aliases_tool ON tool_aliases(tool_id);
CREATE INDEX idx_tool_aliases_alias ON tool_aliases(alias);
CREATE UNIQUE INDEX idx_tool_aliases_unique ON tool_aliases(tool_id, alias);

-- RLS
ALTER TABLE tool_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_tool_aliases" ON tool_aliases FOR SELECT USING (true);

-- Seed common aliases for existing tools
INSERT INTO tool_aliases (tool_id, alias, source) VALUES
  ((SELECT id FROM tools WHERE slug='cursor'), 'cursor-ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='cursor'), 'cursor.sh', 'manual'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'chat-gpt', 'manual'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'openai', 'manual'),
  ((SELECT id FROM tools WHERE slug='claude'), 'claude-ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='claude'), 'anthropic', 'manual'),
  ((SELECT id FROM tools WHERE slug='perplexity'), 'perplexity-ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='midjourney'), 'mid-journey', 'manual'),
  ((SELECT id FROM tools WHERE slug='n8n'), 'n8n.io', 'manual'),
  ((SELECT id FROM tools WHERE slug='windsurf'), 'windsurf-editor', 'manual'),
  ((SELECT id FROM tools WHERE slug='lovable'), 'lovable.dev', 'manual'),
  ((SELECT id FROM tools WHERE slug='v0'), 'v0.dev', 'manual'),
  ((SELECT id FROM tools WHERE slug='v0'), 'vercel-v0', 'manual');

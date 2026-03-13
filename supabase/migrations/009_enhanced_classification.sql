-- =============================================
-- ENHANCED SIGNAL CLASSIFICATION
-- =============================================

-- Add entity_type to distinguish between different kinds of signals
ALTER TABLE signals ADD COLUMN IF NOT EXISTS entity_type TEXT 
  CHECK (entity_type IN ('tool', 'framework', 'model', 'company', 'research', 'ecosystem', 'tutorial', 'unknown'));

-- Add confidence score for classification quality
ALTER TABLE signals ADD COLUMN IF NOT EXISTS classification_confidence DECIMAL(3,2) DEFAULT 0.5;

-- Update existing signal_type constraint to include 'showcase'
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_signal_type_check;
ALTER TABLE signals ADD CONSTRAINT signals_signal_type_check 
  CHECK (signal_type IN ('release', 'discussion', 'tutorial', 'news', 'showcase', 'other'));

-- Update topic to use new taxonomy
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_topic_check;
ALTER TABLE signals ADD CONSTRAINT signals_topic_check 
  CHECK (topic IN ('llm', 'coding', 'image', 'video', 'audio', 'agents', 'rag', 'automation', 'infrastructure', 'research', 'general'));

-- Create indexes for new classification fields
CREATE INDEX IF NOT EXISTS idx_signals_entity_type ON signals(entity_type);
CREATE INDEX IF NOT EXISTS idx_signals_topic ON signals(topic);
CREATE INDEX IF NOT EXISTS idx_signals_confidence ON signals(classification_confidence);

-- Create composite index for filtering high-quality tool signals
CREATE INDEX IF NOT EXISTS idx_signals_quality_filter ON signals(entity_type, classification_confidence, tool_id);

-- Add comment for documentation
COMMENT ON COLUMN signals.entity_type IS 'Type of entity this signal is about: tool, framework, model, company, research, ecosystem, tutorial, unknown';
COMMENT ON COLUMN signals.classification_confidence IS 'Confidence score (0-1) for the classification accuracy';

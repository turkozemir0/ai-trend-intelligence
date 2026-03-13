ALTER TABLE signals
ALTER COLUMN source_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_signals_source_source_id
ON signals (source, source_id);


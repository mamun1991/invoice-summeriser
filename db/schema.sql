-- Table to manage background alert tasks for Agent 4
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  invoice_id TEXT,
  alert_message TEXT NOT NULL,
  trigger_at INTEGER NOT NULL, -- Unix timestamp of when to send
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Index to optimize querying pending alerts by time
CREATE INDEX IF NOT EXISTS idx_alerts_pending 
ON alerts (status, trigger_at);
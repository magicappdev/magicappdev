-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  label TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);

-- Create index on provider for filtering
CREATE INDEX IF NOT EXISTS api_keys_provider_idx ON api_keys(provider);

-- Create unique index on (user_id, provider) - one key per provider per user
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_user_provider_idx ON api_keys(user_id, provider);
